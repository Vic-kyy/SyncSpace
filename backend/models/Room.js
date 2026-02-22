const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Room name is required'],
        trim: true,
        maxlength: [100, 'Room name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Archived'],
        default: 'Active',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Indexes
roomSchema.index({ createdBy: 1 });
roomSchema.index({ participants: 1 });
roomSchema.index({ status: 1, isActive: 1 });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
