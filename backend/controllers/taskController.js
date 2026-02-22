const Task = require('../models/Task');
const Room = require('../models/Room');
const { canAccessRoom } = require('../helpers/roomAccess');

exports.createTask = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { title, description, assignedTo, deadline } = req.body;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) return res.status(403).json({ message: 'Not a member of this room' });

        const task = await Task.create({
            title,
            description,
            assignedTo,
            deadline,
            roomId,
            createdBy: req.user._id,
        });

        const populatedTask = await task.populate('assignedTo createdBy', 'username avatar');
        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) return res.status(403).json({ message: 'Not a member of this room' });

        const tasks = await Task.find({ roomId })
            .populate('assignedTo createdBy', 'username avatar')
            .sort({ deadline: 1, createdAt: -1 });

        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, title, description, assignedTo, deadline } = req.body;

        let task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const room = await Room.findById(task.roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) return res.status(403).json({ message: 'Not a member of this room' });

        const updateData = { title, description, assignedTo, deadline, status };
        if (status === 'Completed' && task.status !== 'Completed') {
            updateData.completedAt = new Date();
        }

        task = await Task.findByIdAndUpdate(id, updateData, { new: true })
            .populate('assignedTo createdBy', 'username avatar');

        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.convertMessageToTask = async (req, res) => {
    try {
        const { messageId, roomId, title, deadline } = req.body;
        const Message = require('../models/Message');

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) return res.status(403).json({ message: 'Not a member of this room' });

        let taskTitle = title;
        if (!taskTitle?.trim() && messageId) {
            const msg = await Message.findById(messageId).select('text');
            taskTitle = msg?.text?.substring(0, 100)?.trim() || 'New task';
        }
        if (!taskTitle?.trim()) taskTitle = 'New task';

        const task = await Task.create({
            title: taskTitle,
            roomId,
            sourceMessageId: messageId || undefined,
            createdBy: req.user._id,
            deadline: deadline || undefined,
        });

        const populatedTask = await task.populate('assignedTo createdBy', 'username avatar');
        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const room = await Room.findById(task.roomId);
        if (room && !canAccessRoom(req.user, room)) return res.status(403).json({ message: 'Not a member of this room' });
        const isAdmin = req.user.role === 'ADMIN';
        const isCreator = task.createdBy.toString() === req.user._id.toString();
        if (!isAdmin && !isCreator) {
            return res.status(403).json({ message: 'Only creator or admin can delete task' });
        }

        await Task.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
