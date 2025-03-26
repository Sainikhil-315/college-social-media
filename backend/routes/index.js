const express = require('express');
const router = express.Router();
const authRoutes = require('./api/authRoutes');
const userRoutes = require('./api/UserRoutes');

router.use('/api/auth',authRoutes);
router.use('/api/user',userRoutes);

module.exports = router;