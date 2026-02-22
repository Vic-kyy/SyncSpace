import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = API_URL.replace('/api', '');

let socket = null;

/**
 * Get the singleton socket instance.
 * Creates it lazily if it doesn't exist yet.
 */
export function getSocket() {
    if (!socket) {
        const token = localStorage.getItem('token');
        socket = io(SOCKET_URL, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            auth: token ? { token } : {},
        });

        // Debug listeners — registered exactly once
        socket.on('connect', () => {
            console.log(`[socket.js] ✓ Connected: ${socket.id}`);
        });
        socket.on('disconnect', (reason) => {
            console.log(`[socket.js] ✗ Disconnected: ${reason}`);
        });
        socket.on('connect_error', (err) => {
            console.error(`[socket.js] ✗ Connection error: ${err.message}`);
        });
    }
    return socket;
}

/**
 * Connect the socket and emit setup with the user identity.
 */
export function connectSocket(user) {
    const s = getSocket();
    if (!s.connected) {
        // Update auth token before connecting
        const token = localStorage.getItem('token');
        if (token) {
            s.auth = { token };
        }
        s.connect();
    }
    // Emit 'setup' so the server knows who this socket belongs to
    s.emit('setup', user);
}

/**
 * Disconnect the socket (e.g., on logout).
 */
export function disconnectSocket() {
    if (socket?.connected) {
        socket.disconnect();
    }
    socket = null;
}
