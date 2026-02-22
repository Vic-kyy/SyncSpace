const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending',
    },
    deadline: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true,
    },
    sourceMessageId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Message',
    },
}, { timestamps: true });

// Indexes for fast lookup
taskSchema.index({ roomId: 1, status: 1 });
taskSchema.index({ roomId: 1, deadline: 1 });
taskSchema.index({ assignedTo: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
