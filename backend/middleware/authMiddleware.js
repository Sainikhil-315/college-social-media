const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed

exports.protect = async (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'fallback_secret'
        );

        // Attach user info from token to request
        req.user = decoded;
        
        // Optionally fetch full user from database if needed
        // Uncomment this block if you need full user details in your controllers
        /*
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        */
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

exports.setCacheHeaders = (req, res, next) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    next();
};