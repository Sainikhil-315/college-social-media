const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const mongoose = require('mongoose');

exports.createConversation = async (req, res) => {
    const { participants: rawParticipants, isGroup, initialMessage } = req.body;
    try {
        if (!Array.isArray(rawParticipants) || rawParticipants.length < 2) {
            return res.status(400).json({ message: 'A conversation requires at least 2 participants.' });
        }

        const participants = rawParticipants.map((id) => {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error(`Invalid participant ID: ${id}`);
            }
            return new mongoose.Types.ObjectId(id);
        });

        // Check for existing conversation (for non-group chats)
        if (!isGroup) {
            const existingConversation = await Conversation.findOne({
                participants: { $all: participants, $size: participants.length },
                isGroup: false
            });

            if (existingConversation) {
                return res.status(200).json({ 
                    message: 'Conversation already exists!',
                    conversation: existingConversation 
                });
            }
        }

        // Create new conversation without content (assuming content isn't required)
        const newConversation = new Conversation({
            participants,
            isGroup: isGroup || false
        });

        await newConversation.save();

        // If initial message is provided, create it
        if (initialMessage) {
            const message = new Message({
                conversationId: newConversation._id,
                sender: req.user.userId, // Get sender from authenticated user
                content: initialMessage,
                status: 'unread'
            });

            await message.save();

            // Update conversation with last message
            newConversation.lastMessage = message._id;
            await newConversation.save();

            // Emit new message to all participants
            if (req.io) {
                req.io.to(newConversation._id.toString()).emit('receiveMessage', message);
            }
        }

        res.status(201).json({
            message: 'Conversation created successfully',
            conversation: newConversation
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!', error: error.message });
    }
};

exports.getConversations = async (req, res) => {
    const { userId, otherUserId } = req.params;

    try {
        // Validate both user IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const conversation = await Conversation.findOne({
            participants: { 
                $all: [userId, otherUserId],
                $size: 2 // Ensure it's only these two participants (not a group)
            },
            isGroup: false
        }).populate('participants', 'name email regd_no profilePic')
          .populate('lastMessage');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        return res.status(200).json({ conversation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.getConversationDetails = async (req, res) => {
    const { conversationId } = req.params;

    try {
        // Validate if conversationId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        const conversation = await Conversation.findById(conversationId)
            .populate('lastMessage')
            .populate('participants', 'name regd_no email profilePic');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found!' });
        }

        const response = {
            conversationId: conversation._id,
            participants: conversation.participants,
            isGroup: conversation.isGroup,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
        };

        if (conversation.lastMessage) {
            response.lastMessage = conversation.lastMessage;
            response.content = conversation.lastMessage.content;
            response.timestamp = conversation.lastMessage.createdAt;
        } else {
            response.message = 'No messages in this conversation yet.';
        }

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.getUserConversations = async (req, res) => {
    const userId = req.user.userId; // Assuming you're using some form of user authentication

    try {
        // Find all conversations where the user is a participant
        const conversations = await Conversation.find({ participants: userId })
            .populate('lastMessage')
            .populate('participants', 'name email regd_no profilePic')
            .sort({ updatedAt: -1 });  // Sort by last updated

        if (!conversations || conversations.length === 0) {
            return res.status(200).json({ message: 'No conversations found.', conversations: [] });
        }

        // Prepare the response with necessary details
        const conversationDetails = conversations.map((conversation) => ({
            conversationId: conversation._id,
            participants: conversation.participants,
            lastMessage: conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet',
            lastMessageTimestamp: conversation.lastMessage ? conversation.lastMessage.createdAt : null,
            isGroup: conversation.isGroup,
        }));

        res.status(200).json({ conversations: conversationDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};