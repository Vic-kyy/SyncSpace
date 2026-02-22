const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    conversationId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Conversation',
        default: null,
    },
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        default: null,
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    encrypted: {
        type: Boolean,
        default: false,
    },
    isSystem: {
        type: Boolean,
        default: false,
    },
    readBy: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

// Indexes for fast message retrieval
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ roomId: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
