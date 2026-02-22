const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const focusRoutes = require('./routes/focusRoutes');
const roomRoutes = require('./routes/roomRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tasks', taskRoutes);

// Health Check
app.get('/health', (req, res) => res.send('API is running...'));

// Socket.IO (attach so controllers can emit e.g. room_deleted)
app.set('io', io);
require('./socket')(io);

// ── Start: connect to MongoDB FIRST, then listen ──
const PORT = process.env.PORT || 5001;

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');

        server.listen(PORT, () => {
            console.log(`✓ Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('✗ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
})();
