const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { canAccessRoom } = require('../helpers/roomAccess');

// ── Get all conversations for the logged-in user ──
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate('participants', 'username avatar isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username' },
            })
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── Get messages for a conversation ──
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId,
        })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── Send a message in a conversation or room ──
exports.sendMessage = async (req, res) => {
    const { content, conversationId, roomId } = req.body;
    if (!content) {
        return res.status(400).json({ message: 'content is required' });
    }
    if (!conversationId && !roomId) {
        return res.status(400).json({ message: 'conversationId or roomId is required' });
    }
    if (conversationId && roomId) {
        return res.status(400).json({ message: 'Provide either conversationId or roomId, not both' });
    }

    try {
        if (roomId) {
            const room = await Room.findById(roomId);
            if (!room) return res.status(404).json({ message: 'Room not found' });
            if (!canAccessRoom(req.user, room)) return res.status(403).json({ message: 'Not a member of this room' });

            let message = await Message.create({
                sender: req.user._id,
                text: content,
                roomId,
            });
            message = await message.populate('sender', 'username avatar');
            return res.status(200).json(message);
        }

        // DM: conversation message
        let message = await Message.create({
            sender: req.user._id,
            text: content,
            conversationId,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            updatedAt: Date.now(),
        });

        message = await message.populate('sender', 'username avatar');
        res.status(200).json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── Access or create a 1-on-1 conversation ──
exports.accessConversation = async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).send('userId is required');

    try {
        // Find existing conversation between these two users
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, userId], $size: 2 },
        })
            .populate('participants', 'username avatar isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username' },
            });

        if (!conversation) {
            // Verify the other user exists
            const otherUser = await User.findById(userId);
            if (!otherUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            conversation = await Conversation.create({
                participants: [req.user._id, userId],
            });

            conversation = await conversation.populate('participants', 'username avatar isOnline lastSeen');
        }

        res.status(200).json(conversation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ── Search users ──
exports.searchUsers = async (req, res) => {
    try {
        const search = req.query.search || '';
        const users = await User.find({
            _id: { $ne: req.user._id },
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ],
        }).select('username email avatar isOnline');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── List members (role === MEMBER) for room creation participant picker ──
exports.getMembers = async (req, res) => {
    try {
        const members = await User.find({ role: 'MEMBER' })
            .select('username email avatar')
            .sort({ username: 1 });
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
