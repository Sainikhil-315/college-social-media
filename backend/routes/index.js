const express = require('express');
const router = express.Router();
const authRoutes = require('./api/authRoutes.js');
const userRoutes = require('./api/userRoutes.js');
const postRoutes = require('./api/postRoutes.js');
const notificationRoutes = require('./api/notificationRoutes.js');
const messageRoutes = require('./api/messageRoutes.js');
const conversationRoutes = require('./api/conversationRoutes.js');

router.use('/api/auth', authRoutes);
router.use('/api/user', userRoutes);
router.use('/api/post', postRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/messages', messageRoutes);
router.use('/api/conversations', conversationRoutes);


module.exports = router;