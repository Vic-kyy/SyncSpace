// ──────────────────────────────────────────────
// Socket.IO Server — MongoDB-backed, role-based room access
// ──────────────────────────────────────────────

const User = require('./models/User');
const Room = require('./models/Room');

const userSockets = new Map(); // userId -> socketId

// Allow if user.role === 'ADMIN' OR userId is in room.participants (do not restrict admin)
async function canJoinRoom(userId, roomId) {
    const [user, room] = await Promise.all([
        User.findById(userId).select('role'),
        Room.findById(roomId),
    ]);
    if (!user || !room) return false;
    if (user.role === 'ADMIN') return true;
    const uid = (userId && userId.toString && userId.toString()) || String(userId);
    const participantIds = (room.participants || []).map((p) => (p && p.toString && p.toString()) || String(p));
    return participantIds.includes(uid);
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] ✓ New connection: ${socket.id}`);

        // ── Setup: client identifies itself; store userId for room validation ──────────────
        socket.on('setup', async (userData) => {
            try {
                let userId = userData?._id;

                if (!userId) {
                    console.error('[Socket] ✗ Setup failed — no userId');
                    return;
                }

                socket.userId = userId;

                // Mark user online in DB
                await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

                const room = userId.toString();
                socket.join(room);
                userSockets.set(room, socket.id);
                console.log(`[Socket] ✓ User "${userData?.username || userId}" joined personal room`);

                socket.broadcast.emit('user_online', userId);
                socket.emit('connected', userData);
            } catch (err) {
                console.error('[Socket] ✗ Setup error:', err.message);
            }
        });

        // ── Join: conversation (DM) always allowed; project room validated server-side ─────────
        const handleJoinRoom = async (roomId, eventLabel) => {
            if (!roomId) return;
            const roomKey = (roomId && roomId.toString && roomId.toString()) || String(roomId);

            const isProjectRoom = roomId.length === 24 && /^[a-f0-9]+$/i.test(roomKey);
            if (isProjectRoom && socket.userId) {
                const allowed = await canJoinRoom(socket.userId, roomKey);
                if (!allowed) {
                    socket.emit('join_room_error', { roomId: roomKey, message: 'Access restricted' });
                    console.log(`[Socket] ✗ ${socket.id} denied join to room ${roomKey}`);
                    return;
                }
            }

            socket.join(roomKey);
            console.log(`[Socket] ✓ ${socket.id} joined ${eventLabel}: ${roomKey}`);
        };

        socket.on('join_chat', async (room) => {
            if (!room) return console.error('[Socket] ✗ join_chat — no room');
            await handleJoinRoom(room, 'chat');
        });
        socket.on('join_room', async (roomId) => {
            await handleJoinRoom(roomId, 'room');
        });

        // ── New message relay (Conversation/Room) — room_message / new_message ────────
        const emitToRoom = (room, event, payload) => {
            const key = (room && room.toString && room.toString()) || String(room);
            socket.in(key).emit(event, payload);
        };
        socket.on('new_message', (msg) => {
            const room = msg.roomId || msg.conversationId?._id || msg.conversationId;
            if (!room) return console.error('[Socket] ✗ new_message — no room/conv ID');
            console.log(`[Socket] ✉ msg in ${room} from ${msg.sender?._id || 'unknown'}`);
            emitToRoom(room, 'message_received', msg);
        });
        socket.on('room_message', (msg) => {
            const room = msg.roomId || msg.room;
            if (!room) return;
            emitToRoom(room, 'message_received', msg);
        });

        // ── Task updates ─────────────────────────────────
        socket.on('task_updated', (data) => {
            const { roomId, task } = data;
            if (!roomId) return;
            console.log(`[Socket] 📋 task updated in ${roomId}`);
            socket.in(roomId.toString()).emit('task_received', task);
        });

        // ── Disconnect ───────────────────────────────────
        socket.on('disconnect', async () => {
            console.log(`[Socket] ✗ Disconnected: ${socket.id}`);
            for (const [userId, sid] of userSockets.entries()) {
                if (sid === socket.id) {
                    userSockets.delete(userId);
                    // Mark user offline in DB
                    try {
                        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
                    } catch (err) {
                        console.error('[Socket] DB offline update error:', err.message);
                    }
                    socket.broadcast.emit('user_offline', userId);
                    console.log(`[Socket] ✗ User ${userId} marked offline`);
                    break;
                }
            }
        });

        socket.on('error', (err) => {
            console.error(`[Socket] Error ${socket.id}:`, err);
        });
    });
};
