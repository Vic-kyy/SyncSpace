const Room = require('../models/Room');
const Message = require('../models/Message');
const Task = require('../models/Task');
const { canAccessRoom } = require('../helpers/roomAccess');

exports.createRoom = async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only admins can create rooms' });
        }

        const { name, description, participants: rawParticipants } = req.body;
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        if (!trimmedName) {
            return res.status(400).json({ message: 'Room name is required' });
        }

        const participants = Array.isArray(rawParticipants) ? [...rawParticipants] : [];
        const creatorId = req.user._id.toString();
        if (!participants.some(p => (p && p.toString && p.toString()) === creatorId)) {
            participants.push(req.user._id);
        }

        const room = await Room.create({
            name: trimmedName,
            description: (typeof description === 'string' ? description.trim() : '') || undefined,
            createdBy: req.user._id,
            participants,
            status: 'Active',
            isActive: true,
        });

        const populatedRoom = await room.populate('participants', 'username avatar isOnline');
        res.status(201).json(populatedRoom);
    } catch (error) {
        const message = error.name === 'ValidationError' && error.message
            ? error.message
            : (error.message || 'Could not create room');
        res.status(400).json({ message });
    }
};

// All users see all room names; hasAccess = participant OR ADMIN
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({})
            .populate('participants', 'username avatar isOnline')
            .sort({ updatedAt: -1 });

        const list = rooms.map((room) => {
            const hasAccess = canAccessRoom(req.user, room);
            return { ...room.toObject(), hasAccess };
        });

        res.status(200).json(list);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('participants', 'username avatar isOnline');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) {
            return res.status(403).json({ message: 'Access restricted to room participants' });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Enter room: allowed only if already participant or ADMIN (no adding self to participants)
exports.joinRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('participants', 'username avatar isOnline');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) {
            return res.status(403).json({ message: 'Access restricted. You must be assigned to this room.' });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getRoomMessages = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (!canAccessRoom(req.user, room)) {
            return res.status(403).json({ message: 'Not a room member' });
        }

        const messages = await Message.find({ roomId: req.params.id })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ADMIN only: set participants (reassign team members)
exports.updateParticipants = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only admins can modify room participants' });
        }

        const { participantIds } = req.body;
        if (!Array.isArray(participantIds)) {
            return res.status(400).json({ message: 'participantIds array is required' });
        }

        room.participants = participantIds;
        await room.save();
        const populated = await room.populate('participants', 'username avatar isOnline');
        res.status(200).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ADMIN only: archive room
exports.archiveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only admins can archive rooms' });
        }

        room.status = 'Archived';
        room.isActive = false;
        await room.save();
        const populated = await room.populate('participants', 'username avatar isOnline');
        res.status(200).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ADMIN only: delete room, cascade messages & tasks, emit room_deleted
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            console.log('[Room] Delete: room not found', req.params.id);
            return res.status(404).json({ message: 'Room not found' });
        }
        if (req.user.role !== 'ADMIN') {
            console.log('[Room] Delete: forbidden (not ADMIN)', req.user._id);
            return res.status(403).json({ message: 'Only admins can delete rooms' });
        }

        const roomId = room._id.toString();
        const roomName = room.name;

        const msgResult = await Message.deleteMany({ roomId: room._id });
        const taskResult = await Task.deleteMany({ roomId: room._id });
        await Room.findByIdAndDelete(req.params.id);

        console.log('[Room] Deleted', roomId, roomName, '| messages:', msgResult.deletedCount, '| tasks:', taskResult.deletedCount);

        const io = req.app.get('io');
        if (io) {
            io.emit('room_deleted', { roomId });
            console.log('[Room] Emitted room_deleted to all clients');
        }

        res.status(204).send();
    } catch (error) {
        console.error('[Room] Delete error:', error.message);
        res.status(500).json({ message: error.message || 'Failed to delete room' });
    }
};
