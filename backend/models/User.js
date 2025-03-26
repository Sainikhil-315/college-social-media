const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    regd_no: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: {
            type: String,
            default: null
        },
        expiresAt: {
            type: Date,
            default: null
        },
        attempts: {
            type: Number,
            default: 0,
            max: 3 // Limit OTP verification attempts
        }
    },
    lastOTPGenerated: {
        type: Date,
        default: null
    },
    bio: {
        type: String,
        default: "Studying at SRKR Engineering College"
    },
    profilePic: {
        type: String,
        default: "https://avatars.githubusercontent.com/u/87025751?v=4?s=400" 
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: 0
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: 0
    }],
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Add an index to help with unique constraints and query performance
UserSchema.index({ email: 1, regd_no: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);