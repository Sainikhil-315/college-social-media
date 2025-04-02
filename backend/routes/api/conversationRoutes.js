const express = require('express');
const router = express.Router();
const {
    createConversation,
    getConversations,
    getConversationDetails,
    getUserConversations
} = require('../../controllers/conversationController');
const { protect } = require('../../middleware/authMiddleware');

// Route to get all conversations for a user (with their last message)
// This route must come before routes with parameters to avoid conflicts
router.get('/user/conversations', protect, getUserConversations);

// Route to create a new conversation
router.post('/create', protect, createConversation);

// Route to get a specific conversation and its details (e.g., participants, last message)
router.get('/:conversationId', protect, getConversationDetails);

// Route to get a specific conversation between two users
router.get('/:userId/:otherUserId', protect, getConversations);

module.exports = router;