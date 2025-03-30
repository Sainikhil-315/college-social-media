const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const transporter = require('../utils/emailService');

require("dotenv").config();

// Generate JWT Token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET);
};

// User Registration
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate college email
        if (!email.endsWith("@srkrec.ac.in")) {
            return res.status(400).json({ message: "Only college email addresses are allowed" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({email});

        const regd_no = email.split("@")[0];
        
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, otpSalt);

        // Create new user
        const newUser = new User({
            name,
            email,
            regd_no,
            password: hashedPassword,
            otp: {
                code: hashedOTP,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                attempts: 0
            },
            lastOTPGenerated: new Date()
        });

        await newUser.save();

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Verification OTP",
            html: `<p>Your verification OTP is: <strong>${otp}</strong>. 
                   This OTP will expire in 15 minutes.</p>`
        });

        res.status(201).json({ 
            message: "Registration successful. OTP sent to your email.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            message: "Registration failed", 
            error: error.message 
        });
    }
};

// OTP Verification
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check OTP attempts
        if (user.otp.attempts >= 3) {
            return res.status(400).json({ message: "Max OTP attempts reached. Please regenerate OTP." });
        }

        // Check OTP expiration
        if (!user.otp.code || user.otp.expiresAt < new Date()) {
            return res.status(400).json({ message: "OTP expired. Please regenerate." });
        }

        // Verify OTP
        const isOTPValid = await bcrypt.compare(otp, user.otp.code);
        if (!isOTPValid) {
            // Increment attempts
            user.otp.attempts += 1;
            await user.save();

            return res.status(400).json({ 
                message: "Invalid OTP", 
                remainingAttempts: 3 - user.otp.attempts 
            });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = { code: null, expiresAt: null, attempts: 0 };
        await user.save();

        // Generate login token
        const token = generateToken({ 
            email: user.email, 
            regd_no: user.regd_no,
            userId: user._id
        });

        res.status(200).json({ 
            message: "Account verified successfully", 
            token,
            user: { 
                email: user.email, 
                regd_no: user.regd_no,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Verification failed", 
            error: error.message 
        });
    }
};

// Regenerate OTP
exports.regenerateOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if can regenerate OTP (cooldown)
        const cooldownPeriod = 2 * 60 * 1000; // 2 minutes
        if (user.lastOTPGenerated && 
            Date.now() - user.lastOTPGenerated.getTime() < cooldownPeriod) {
            return res.status(429).json({ 
                message: "Please wait before requesting a new OTP" 
            });
        }

        // Generate new OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpSalt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, otpSalt);

        // Update user with new OTP
        user.otp = {
            code: hashedOTP,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            attempts: 0
        };
        user.lastOTPGenerated = new Date();
        await user.save();

        // Send new OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your New Verification OTP",
            html: `<p>Your new verification OTP is: <strong>${otp}</strong>. 
                   This OTP will expire in 15 minutes.</p>`
        });

        res.status(200).json({ 
            message: "New OTP sent to your email"
        });
    } catch (error) {
        res.status(500).json({ 
            message: "OTP regeneration failed", 
            error: error.message 
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { regd_no, password } = req.body;

        // Find user
        const user = await User.findOne({ regd_no });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(403).json({ 
                message: "Please verify your account",
                requiresVerification: true 
            });
        }

        // Generate token
        const token = generateToken({ 
            email: user.email, 
            regd_no: user.regd_no,
            userId: user._id
        });

        res.status(200).json({ 
            message: "Login successful", 
            token,
            user: {
                email: user.email,
                regd_no: user.regd_no,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Login failed", 
            error: error.message 
        });
    }
};

// logout user
// must be protected route from middleware
exports.logout = async(req, res) => {
    res.status(200).json({message: `Logout Successful`});
}

// verify the token
exports.checkAuthStatus = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Token not provided" });
        }
  
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Use userId from the payload
        const user = await User.findById(decoded.userId).select('-password -otp');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Additional checks
        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "User account is not verified" });
        }
  
        return res.status(200).json({ 
            success: true, 
            user: {
                email: user.email,
                regd_no: user.regd_no,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Error verifying token:", error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
  