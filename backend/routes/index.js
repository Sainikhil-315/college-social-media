const express = require('express');
const router = express.Router();
const authRoutes = require('./api/authRoutes.js');
const userRoutes = require('./api/userRoutes.js');
const postRoutes = require('./api/postRoutes.js');

router.use('/api/auth',authRoutes);
router.use('/api/user',userRoutes);
router.use('/api/post', postRoutes);

module.exports = router;