const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversationMessages,
    markAsRead,
    deleteMessage
} = require('../../controllers/messageController');
const { protect } = require('../../middleware/authMiddleware');

// Route to send a new message
router.post('/send', protect, sendMessage);

// Route to get messages for a specific conversation
router.get('/conversation/:conversationId', protect, getConversationMessages);

// Route to mark a specific message as read
router.put('/markAsRead/:messageId', protect, markAsRead);

// Route to delete a specific message
router.delete('/delete/:messageId', protect, deleteMessage);

module.exports = router;
