const express = require('express');
const router = express.Router();
const {
    createConversation,
    getConversationBetweenUsers,
    getConversationDetails,
    getUserConversations,
    addParticipantToGroup,
    removeParticipantFromGroup
} = require('../../controllers/conversationController');
const { protect } = require('../../middleware/authMiddleware');

// Route to get all conversations for a user (with their last message)
// This route must come before routes with parameters to avoid conflicts
router.get('/user/conversations', protect, getUserConversations);

// Route to create a new conversation
router.post('/create', protect, createConversation);

// Route to add participant to group conversation
router.post('/:conversationId/participants/add', protect, addParticipantToGroup);

// Route to remove participant from group conversation
router.post('/:conversationId/participants/remove', protect, removeParticipantFromGroup);

// Route to get a specific conversation and its details (e.g., participants, last message)
router.get('/:conversationId', protect, getConversationDetails);

// Route to get a specific conversation between two users
router.get('/:userId/:otherUserId', protect, getConversationBetweenUsers);

module.exports = router;