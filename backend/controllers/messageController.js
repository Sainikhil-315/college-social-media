const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    const { conversationId, content, messageType = 'text' } = req.body;
    const sender = req.user.userId;

    try {
        // Validate input
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        // Check if conversation exists and user is a participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Verify user is a participant
        if (!conversation.participants.includes(sender)) {
            return res.status(403).json({ 
                message: 'Not authorized to send messages to this conversation' 
            });
        }

        // Create new message
        const newMessage = new Message({
            conversationId,
            sender,
            content: content.trim(),
            messageType,
            status: 'unread'
        });

        await newMessage.save();

        // Update conversation's last message and timestamp
        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        // Populate sender details for the response
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('sender', 'name email profilePic');

        // Emit message to all participants in the conversation
        if (req.io) {
            req.io.to(conversationId).emit('receiveMessage', {
                ...populatedMessage.toObject(),
                conversationId: conversationId
            });

            // Emit notification to offline users (you can implement push notifications here)
            const offlineParticipants = conversation.participants.filter(
                participantId => participantId.toString() !== sender
            );
            
            offlineParticipants.forEach(participantId => {
                req.io.to(participantId.toString()).emit('newMessageNotification', {
                    conversationId: conversationId,
                    messageId: newMessage._id,
                    senderName: req.user.name,
                    preview: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                    timestamp: newMessage.createdAt
                });
            });
        }

        res.status(201).json({
            message: 'Message sent successfully!',
            newMessage: populatedMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ 
            message: 'Internal server error!', 
            error: error.message 
        });
    }
};

exports.getConversationMessages = async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    try {
        // Validate conversationId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        // Check if user is a participant in the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(req.user.userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to access messages from this conversation' 
            });
        }

        const skip = (page - 1) * limit;

        // Get messages with pagination
        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email profilePic')
            .sort({ createdAt: -1 }) // Most recent first for pagination
            .skip(skip)
            .limit(parseInt(limit));

        // Reverse to show oldest first in the response
        const orderedMessages = messages.reverse();

        // Get total count for pagination
        const totalMessages = await Message.countDocuments({ conversationId });

        res.status(200).json({ 
            messages: orderedMessages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages: totalMessages,
                hasNextPage: skip + messages.length < totalMessages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.markAsRead = async (req, res) => {
    const { messageId } = req.params;

    try {
        // Validate messageId
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found!' });
        }

        // Check if user is authorized to mark this message as read
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation.participants.includes(req.user.userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to modify this message' 
            });
        }

        // Don't allow sender to mark their own message as read
        if (message.sender.toString() === req.user.userId) {
            return res.status(400).json({ 
                message: 'Cannot mark your own message as read' 
            });
        }

        // Only mark as read if it's currently unread
        if (message.status === 'read') {
            return res.status(200).json({ 
                message: 'Message already marked as read' 
            });
        }

        message.status = 'read';
        message.readAt = new Date();
        await message.save();

        // Notify sender that message was read
        if (req.io) {
            req.io.to(message.conversationId.toString()).emit('messageRead', {
                messageId: message._id,
                readBy: req.user.userId,
                readAt: message.readAt
            });
        }

        res.status(200).json({ 
            message: 'Message marked as read',
            messageId: message._id,
            readAt: message.readAt
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.markAllMessagesAsRead = async (req, res) => {
    const { conversationId } = req.params;

    try {
        // Validate conversationId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        // Check if user is a participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.participants.includes(req.user.userId)) {
            return res.status(403).json({ 
                message: 'Not authorized to modify messages in this conversation' 
            });
        }

        // Mark all unread messages (not sent by current user) as read
        const result = await Message.updateMany(
            {
                conversationId: conversationId,
                sender: { $ne: req.user.userId },
                status: 'unread'
            },
            {
                status: 'read',
                readAt: new Date()
            }
        );

        // Notify other participants
        if (req.io && result.modifiedCount > 0) {
            req.io.to(conversationId).emit('allMessagesRead', {
                conversationId: conversationId,
                readBy: req.user.userId,
                readAt: new Date(),
                messagesCount: result.modifiedCount
            });
        }

        res.status(200).json({ 
            message: `${result.modifiedCount} messages marked as read`,
            messagesUpdated: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;

    try {
        // Validate messageId
        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found!' });
        }

        // Only allow deletion by the sender
        if (message.sender.toString() !== req.user.userId) {
            return res.status(403).json({ 
                message: 'Not authorized to delete this message' 
            });
        }

        // Check time limit for "delete for everyone" (e.g., 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (deleteForEveryone && message.createdAt < oneHourAgo) {
            return res.status(400).json({ 
                message: 'Cannot delete for everyone after 1 hour' 
            });
        }

        let deletionType;
        if (deleteForEveryone) {
            // Delete the message completely
            await Message.findByIdAndDelete(messageId);
            deletionType = 'everyone';
        } else {
            // Mark as deleted for sender only
            message.isDeletedBySender = true;
            message.deletedAt = new Date();
            await message.save();
            deletionType = 'sender';
        }

        // Update conversation's last message if this was the last message
        const conversation = await Conversation.findById(message.conversationId);
        if (conversation && conversation.lastMessage && 
            conversation.lastMessage.toString() === messageId) {
            
            // Find the previous message
            const previousMessage = await Message.findOne({
                conversationId: message.conversationId,
                _id: { $ne: messageId },
                ...(deleteForEveryone ? {} : { isDeletedBySender: { $ne: true } })
            }).sort({ createdAt: -1 });

            // Update conversation's last message
            conversation.lastMessage = previousMessage ? previousMessage._id : null;
            await conversation.save();
        }

        // Notify conversation participants about deletion
        if (req.io) {
            const eventName = deleteForEveryone ? 'messageDeletedForEveryone' : 'messageDeleted';
            req.io.to(message.conversationId.toString()).emit(eventName, {
                messageId: message._id,
                deletedBy: req.user.userId,
                deletedAt: new Date(),
                conversationId: message.conversationId
            });
        }

        res.status(200).json({ 
            message: `Message deleted ${deleteForEveryone ? 'for everyone' : 'for you'}`,
            deletionType: deletionType
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.editMessage = async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    try {
        // Validate input
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }

        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found!' });
        }

        // Only allow editing by the sender
        if (message.sender.toString() !== req.user.userId) {
            return res.status(403).json({ 
                message: 'Not authorized to edit this message' 
            });
        }

        // Check time limit for editing (e.g., 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (message.createdAt < fifteenMinutesAgo) {
            return res.status(400).json({ 
                message: 'Cannot edit message after 15 minutes' 
            });
        }

        // Update message
        message.content = content.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        // Populate sender details
        const populatedMessage = await Message.findById(messageId)
            .populate('sender', 'name email profilePic');

        // Notify conversation participants about edit
        if (req.io) {
            req.io.to(message.conversationId.toString()).emit('messageEdited', {
                ...populatedMessage.toObject(),
                editedBy: req.user.userId,
                editedAt: message.editedAt
            });
        }

        res.status(200).json({ 
            message: 'Message edited successfully',
            editedMessage: populatedMessage
        });
    } catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.getUnreadMessagesCount = async (req, res) => {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    try {
        let query = {
            sender: { $ne: userId },
            status: 'unread'
        };

        // If conversationId is provided, get count for specific conversation
        if (conversationId) {
            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                return res.status(400).json({ message: 'Invalid conversation ID format' });
            }
            query.conversationId = conversationId;
        } else {
            // Get count for all conversations user participates in
            const userConversations = await Conversation.find({ 
                participants: userId 
            }).select('_id');
            
            query.conversationId = { 
                $in: userConversations.map(conv => conv._id) 
            };
        }

        const unreadCount = await Message.countDocuments(query);

        res.status(200).json({ 
            unreadCount: unreadCount,
            conversationId: conversationId || 'all'
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};