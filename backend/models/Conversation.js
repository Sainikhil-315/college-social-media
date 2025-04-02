const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({
    participants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },
    isGroup: {
        type: Boolean,
        required: true,
        default: false,
    },
},
    { timestamps: true } // Automatically generates createdAt and updatedAt fields
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;