const express = require('express');
const router = express.Router();
const { register, verifyOTP, regenerateOTP, login, logout, checkAuthStatus } = require('../../controllers/authController');
const { setCacheHeaders, protect} = require('../../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/regenerate-otp', regenerateOTP);
router.post('/login', login);
router.get('/logout',protect, logout);
router.get('/verify-token', setCacheHeaders, checkAuthStatus)


module.exports = router;