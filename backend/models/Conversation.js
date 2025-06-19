const mongoose = require('mongoose');

const ConversationSchema = mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null,
    },
    isGroup: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        required: function() { 
            return this.isGroup; 
        },
        trim: true
    },
    description: {
        type: String,
        default: null,
        trim: true
    },
    // Group admin (only for group conversations)
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function() { 
            return this.isGroup; 
        }
    },
    // Group settings
    settings: {
        canParticipantsAddMembers: {
            type: Boolean,
            default: true
        },
        canParticipantsEditInfo: {
            type: Boolean,
            default: false
        }
    },
    // Archive status for each participant
    archivedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        archivedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Mute status for each participant
    mutedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        mutedUntil: {
            type: Date,
            default: null // null means muted indefinitely
        }
    }]
}, {
    timestamps: true
});

// Indexes for better performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ isGroup: 1 });

// Virtual for participant count
ConversationSchema.virtual('participantCount').get(function() {
    return this.participants.length;
});

// Method to check if user is admin (for group chats)
ConversationSchema.methods.isAdmin = function(userId) {
    if (!this.isGroup) return false;
    return this.admin && this.admin.toString() === userId.toString();
};

// Method to check if user is participant
ConversationSchema.methods.isParticipant = function(userId) {
    return this.participants.some(participant => 
        participant.toString() === userId.toString()
    );
};

// Method to check if conversation is muted for user
ConversationSchema.methods.isMutedForUser = function(userId) {
    const mutedEntry = this.mutedBy.find(entry => 
        entry.user.toString() === userId.toString()
    );
    
    if (!mutedEntry) return false;
    
    // If mutedUntil is null, it's muted indefinitely
    if (!mutedEntry.mutedUntil) return true;
    
    // Check if mute period has expired
    return new Date() < mutedEntry.mutedUntil;
};

// Method to check if conversation is archived for user
ConversationSchema.methods.isArchivedForUser = function(userId) {
    return this.archivedBy.some(entry => 
        entry.user.toString() === userId.toString()
    );
};

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;