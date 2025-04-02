const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
    const { conversationId, content } = req.body;
    const sender = req.user.userId; // Get sender from authenticated user

    try {
        // Validate conversationId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        // Check if conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Create a new message
        const newMessage = new Message({
            conversationId,
            sender,
            content,
            status: 'unread',
        });

        await newMessage.save();

        // Update the conversation's last message reference and updatedAt time
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        // Emit message to all participants in the conversation
        if (req.io) {
            req.io.to(conversationId).emit('receiveMessage', {
                ...newMessage.toObject(),
                sender: req.user // Include sender details
            });
        }

        res.status(201).json({
            message: 'Message sent successfully!',
            newMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!', error: error.message });
    }
};

exports.getConversationMessages = async (req, res) => {
    const { conversationId } = req.params;

    try {
        // Validate conversationId
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            return res.status(400).json({ message: 'Invalid conversation ID format' });
        }

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name email profilePic')
            .sort({ createdAt: 1 }); // Oldest messages first

        res.status(200).json({ 
            messages,
            count: messages.length
        });
    } catch (error) {
        console.error(error);
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

        // Only mark as read if user is a recipient
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation.participants.includes(req.user.userId) && 
            message.sender.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this message' });
        }

        message.status = 'read';
        await message.save();

        // Notify sender that message was read
        if (req.io) {
            req.io.to(message.conversationId.toString()).emit('messageRead', {
                messageId: message._id,
                readBy: req.user.userId
            });
        }

        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};

exports.deleteMessage = async (req, res) => {
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

        // Only allow deletion by the sender
        if (message.sender.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        // Check if this message is the last message in the conversation
        const conversation = await Conversation.findById(message.conversationId);
        if (conversation && conversation.lastMessage && 
            conversation.lastMessage.toString() === messageId) {
            // Find the previous message
            const previousMessage = await Message.findOne({
                conversationId: message.conversationId,
                _id: { $ne: messageId }
            }).sort({ createdAt: -1 });

            // Update conversation's last message
            conversation.lastMessage = previousMessage ? previousMessage._id : null;
            await conversation.save();
        }

        await Message.findByIdAndDelete(messageId);

        // Notify conversation participants about deletion
        if (req.io) {
            req.io.to(message.conversationId.toString()).emit('messageDeleted', {
                messageId: message._id,
                deletedBy: req.user.userId
            });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error!' });
    }
};