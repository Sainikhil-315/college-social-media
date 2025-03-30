const express = require('express');
const router = express.Router();
const { protect } = require("../../middleware/authMiddleware");
const {
    updateProfile,
    updatePhoto,
    deleteAccount,
    followUser,
    unFollowUser,
    getFollowersList,
    getFollowingList,
    searchUser,
    myNotifications
} = require("../../controllers/userController");
// Profile updates (name, password, bio, etc.)
router.put('/profile/update', protect, updateProfile);
router.put('/profile/photo', protect, updatePhoto);
router.delete('/profile/delete', protect, deleteAccount);

// Follow system
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unFollowUser);
router.get('/:id/followers', protect, getFollowersList);
router.get('/:id/following', protect, getFollowingList);

// Other user functionalities
router.get('/search', protect, searchUser);
router.get('/notifications', protect, myNotifications);

module.exports = router;
