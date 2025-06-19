const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const mongoose = require('mongoose');

exports.createConversation = async (req, res) => {
    const { participants: rawParticipants, isGroup, initialMessage, title } = req.body;
    
    try {
        // Validate participants array
        if (!Array.isArray(rawParticipants) || rawParticipants.length < 2) {
            return res.status(400).json({ 
                message: 'A conversation requires at least 2 participants.' 
            });
        }

        // Validate and convert participant IDs
        let participants;
        try {
            participants = rawParticipants.map((id) => {
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    throw new Error(`Invalid participant ID: ${id}`);
                }
                return new mongoose.Types.ObjectId(id);
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // Ensure current user is included in participants
        const currentUserId = new mongoose.Types.ObjectId(req.user.userId);
        if (!participants.some(p => p.equals(currentUserId))) {
            participants.push(currentUserId);
        }

        // Check for existing conversation (for non-group chats)
        if (!isGroup && participants.length === 2) {
            const existingConversation = await Conversation.findOne({
                participants: { $all: participants, $size: participants.length },
                isGroup: false
            }).populate('participants', 'name email profilePic')
              .populate('lastMessage');

            if (existingConversation) {
                return res.status(200).json({ 
                    message: 'Conversation already exists!',
                    conversation: existingConversation 
                });
            }
        }

        // Create new conversation
        const conversationData = {
            participants,
            isGroup: isGroup || false
        };

        // Add title for group conversations
        if (isGroup && title) {
            conversationData.title = title;
        }

        const newConversation = new Conversation(conversationData);
        await newConversation.save();

        // If initial message is provided, create it
        if (initialMessage && initialMessage.trim()) {
            const message = new Message({
                conversationId: newConversation._id,
                sender: currentUserId,
                content: initialMessage.trim(),
                status: 'unread'
            });

            await message.save();

            // Update conversation with last message
            newConversation.lastMessage = message._id;
            await newConversation.save();

            // Join all participants to the conversation room
            if (req.io) {
                participants.forEach(participantId => {
                    req.io.to(participantId.toString()).emit('joinRoom', {
                        conversationId: newConversation._id.toString()
                    });
                });

                // Emit new message to conversation room
                req.io.to(newConversation._id.toString()).emit('receiveMessage', {
                    ...message.toObject(),
                    sender: req.user
                });
            }
        } else {
            // Still join participants to room even without initial message
            if (req.io) {
                participants.forEach(participantId => {
                    req.io.to(participantId.toString()).emit('joinRoom', {
                        conversationId: newConversation._id.toString()
                    });
                });
            }
        }

        // Populate the conversation before sending response
        const populatedConversation = await Conversation.findById(newConversation._id)
            .populate('participants', 'name email profilePic')
            .populate('lastMessage');

        res.status(201).json({
            message: 'Conversation created successfully',
            conversation: populatedConversation
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ 
            message: 'Internal server error!', 
            error: error.message 
        });
    }
};

exports.getConversationBetweenUsers = async (req, res) => {
    const { userId, otherUserId } = req.params;

    try {
        // Validate both user IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || 
            !mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Ensure the requesting user is one of the participants
        if (userId !== req.user.userId && otherUserId !== req.user.userId) {
            return res.status(403).json({ 
                message: 'Not authorized to access this conversation' 
            });
        }

        const conversation = await Conversation.findOne({
            participants: { 
                $all: [userId, otherUserId],
                $size: 2 // Ensure it's only these two participants
            },
            isGroup: false
        }).populate('participants', 'name email profilePic')
          .populate('lastMessage');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.status(200).json({ conversation });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.getConversationDetails = async (req, res) => {
    const { conversationId } = req.params;

    try {
        // Validate conversationId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        const conversation = await Conversation.findById(conversationId)
            .populate('lastMessage')
            .populate('participants', 'name email profilePic');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found!' });
        }

        // Check if user is a participant
        const isParticipant = conversation.participants.some(
            participant => participant._id.toString() === req.user.userId
        );

        if (!isParticipant) {
            return res.status(403).json({ 
                message: 'Not authorized to access this conversation' 
            });
        }

        const response = {
            conversationId: conversation._id,
            participants: conversation.participants,
            isGroup: conversation.isGroup,
            title: conversation.title,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
        };

        if (conversation.lastMessage) {
            response.lastMessage = conversation.lastMessage;
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Get conversation details error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.getUserConversations = async (req, res) => {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    try {
        const skip = (page - 1) * limit;

        // Find all conversations where the user is a participant
        const conversations = await Conversation.find({ participants: userId })
            .populate('lastMessage')
            .populate('participants', 'name email profilePic')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        if (!conversations || conversations.length === 0) {
            return res.status(200).json({ 
                message: 'No conversations found.', 
                conversations: [],
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: 0,
                    totalConversations: 0
                }
            });
        }

        // Get total count for pagination
        const totalConversations = await Conversation.countDocuments({ 
            participants: userId 
        });

        // Prepare the response with necessary details
        const conversationDetails = conversations.map((conversation) => {
            // Get other participants (exclude current user for display)
            const otherParticipants = conversation.participants.filter(
                participant => participant._id.toString() !== userId
            );

            return {
                conversationId: conversation._id,
                participants: conversation.participants,
                otherParticipants: otherParticipants,
                lastMessage: conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet',
                lastMessageTimestamp: conversation.lastMessage ? conversation.lastMessage.createdAt : null,
                lastMessageSender: conversation.lastMessage ? conversation.lastMessage.sender : null,
                isGroup: conversation.isGroup,
                title: conversation.title,
                updatedAt: conversation.updatedAt
            };
        });

        res.status(200).json({ 
            conversations: conversationDetails,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalConversations / limit),
                totalConversations: totalConversations,
                hasNextPage: skip + conversations.length < totalConversations,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get user conversations error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.addParticipantToGroup = async (req, res) => {
    const { conversationId } = req.params;
    const { participantId } = req.body;

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(conversationId) || 
            !mongoose.Types.ObjectId.isValid(participantId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if it's a group conversation
        if (!conversation.isGroup) {
            return res.status(400).json({ 
                message: 'Cannot add participants to non-group conversations' 
            });
        }

        // Check if user is a participant (only participants can add others)
        if (!conversation.participants.includes(req.user.userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to add participants' 
            });
        }

        // Check if participant is already in the conversation
        if (conversation.participants.includes(participantId)) {
            return res.status(400).json({ 
                message: 'User is already a participant' 
            });
        }

        // Add participant
        conversation.participants.push(participantId);
        await conversation.save();

        // Join new participant to conversation room
        if (req.io) {
            req.io.to(participantId).emit('joinRoom', {
                conversationId: conversationId
            });

            // Notify all participants about new addition
            req.io.to(conversationId).emit('participantAdded', {
                conversationId: conversationId,
                newParticipantId: participantId,
                addedBy: req.user.userId
            });
        }

        res.status(200).json({ 
            message: 'Participant added successfully',
            conversationId: conversationId
        });
    } catch (error) {
        console.error('Add participant error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.removeParticipantFromGroup = async (req, res) => {
    const { conversationId } = req.params;
    const { participantId } = req.body;

    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(conversationId) || 
            !mongoose.Types.ObjectId.isValid(participantId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Check if it's a group conversation
        if (!conversation.isGroup) {
            return res.status(400).json({ 
                message: 'Cannot remove participants from non-group conversations' 
            });
        }

        // Check if user is a participant
        if (!conversation.participants.includes(req.user.userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to remove participants' 
            });
        }

        // Check if participant exists in conversation
        if (!conversation.participants.includes(participantId)) {
            return res.status(400).json({ 
                message: 'User is not a participant' 
            });
        }

        // Remove participant
        conversation.participants = conversation.participants.filter(
            p => p.toString() !== participantId
        );
        await conversation.save();

        // Remove participant from conversation room
        if (req.io) {
            req.io.to(participantId).emit('leaveRoom', {
                conversationId: conversationId
            });

            // Notify remaining participants about removal
            req.io.to(conversationId).emit('participantRemoved', {
                conversationId: conversationId,
                removedParticipantId: participantId,
                removedBy: req.user.userId
            });
        }

        res.status(200).json({ 
            message: 'Participant removed successfully',
            conversationId: conversationId
        });
    } catch (error) {
        console.error('Remove participant error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};