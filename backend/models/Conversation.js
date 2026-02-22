const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    lastMessage: {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
    },
    summary: {
        type: String,
        default: '',
    },
}, { timestamps: true });

// Index for finding conversations by participant
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
