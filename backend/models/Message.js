const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['unread', 'read'], // Allowed statuses for the message
        default: 'unread',
    },
},
    { timestamps: true }
);

const Notification = mongoose.model("Message", MessageSchema);

module.exports = Notification;