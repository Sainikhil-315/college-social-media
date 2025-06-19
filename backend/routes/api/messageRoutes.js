const express = require('express');
const router = express.Router();
const {
    sendMessage,
    getConversationMessages,
    markAsRead,
    markAllMessagesAsRead,
    deleteMessage,
    editMessage,
    getUnreadMessagesCount
} = require('../../controllers/messageController');
const { protect } = require('../../middleware/authMiddleware');

// Route to send a new message
router.post('/send', protect, sendMessage);

// Route to get messages for a specific conversation
router.get('/conversation/:conversationId', protect, getConversationMessages);

// Route to mark a specific message as read
router.put('/markAsRead/:messageId', protect, markAsRead);

// Route to mark a specific message as read
router.put('/markAllAsRead/:messageId', protect, markAllMessagesAsRead);

// Edit a message
router.put('/editMessage/:messageId', protect, editMessage);

router.get('/unreadMessageCount/:conversationId', protect, getUnreadMessagesCount);

// Route to delete a specific message
router.delete('/delete/:messageId', protect, deleteMessage);

module.exports = router;
