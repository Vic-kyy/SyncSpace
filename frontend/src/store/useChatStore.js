import { create } from 'zustand';
import api from '../api/axios';
import { getSocket, connectSocket } from '../socket';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    loading: false,

    // ── Socket lifecycle ──────────────────────────────
    initSocket: (user) => {
        if (!user?._id) return;

        const s = getSocket();

        // If already has listeners for 'connected', skip re-binding
        if (s.listeners('connected').length > 0) {
            console.log('[ChatStore] Socket listeners already bound, skipping');
            return;
        }

        // Bind store-level listeners ONCE
        s.on('connected', (fullUser) => {
            console.log('[ChatStore] ✓ Identity confirmed:', fullUser?.username);
        });

        s.on('message_received', (newMessage) => {
            console.log('[ChatStore] ✉ Incoming message:', newMessage?.text?.substring(0, 30));
            const { activeConversation, messages } = get();

            // Match by conversation id (DM) or room id (room message)
            const incomingRefId = (newMessage.roomId || newMessage.conversationId?._id || newMessage.conversationId)?.toString?.() ?? newMessage.roomId ?? newMessage.conversationId;
            const currentRefId = (activeConversation?._id)?.toString?.() ?? activeConversation?._id;

            if (currentRefId && incomingRefId && currentRefId === incomingRefId) {
                set({ messages: [...messages, newMessage] });
            }
            get().fetchConversations();
        });

        s.on('task_received', (task) => {
            // This will be handled by useTaskStore but we listen here to potentially show a notification
            console.log('[ChatStore] 📋 Task updated via socket:', task.title);
        });

        s.on('user_online', (userId) => {
            console.log('[ChatStore] 🟢 User online:', userId);
            // Refresh conversations to show online status
            get().fetchConversations();
        });
        s.on('user_offline', (userId) => {
            console.log('[ChatStore] ⚫ User offline:', userId);
            get().fetchConversations();
        });

        // Now connect with the authenticated user identity
        connectSocket(user);
    },

    // ── Data fetching ─────────────────────────────────
    fetchConversations: async () => {
        try {
            const { data } = await api.get('/chat/conversations');
            set({ conversations: data });
        } catch (error) {
            console.error('[ChatStore] Fetch conversations error:', error.message);
        }
    },

    fetchMessages: async (id, type = 'chat') => {
        set({ loading: true });
        try {
            const url = type === 'room' ? `/rooms/${id}/messages` : `/chat/messages/${id}`;
            const { data } = await api.get(url);
            set({ messages: data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.error('[ChatStore] Fetch messages error:', error.message);
        }
    },

    // ── Sending ───────────────────────────────────────
    sendMessage: async (content, refId, type = 'chat') => {
        try {
            const payload = { content };
            if (type === 'room') payload.roomId = refId;
            else payload.conversationId = refId;

            const { data } = await api.post('/chat/messages', payload);
            const s = getSocket();
            if (s.connected) {
                console.log('[ChatStore] ✉ Emitting new_message');
                s.emit('new_message', data);
            }
            set({ messages: [...get().messages, data] });
            if (type !== 'room') get().fetchConversations();
        } catch (error) {
            console.error('[ChatStore] Send message error:', error.message);
        }
    },

    // ── Active item ───────────────────────────
    setActiveConversation: (conversation) => {
        set({ activeConversation: conversation });
        if (conversation) {
            get().fetchMessages(conversation._id, 'chat');
            const s = getSocket();
            if (s.connected) {
                console.log('[ChatStore] Joining DM room:', conversation._id);
                s.emit('join_chat', conversation._id);
            }
        }
    },

    setActiveRoom: (room) => {
        if (room) {
            set({ activeConversation: room });
            get().fetchMessages(room._id, 'room');
            const s = getSocket();
            if (s.connected) {
                console.log('[ChatStore] Joining Project room:', room._id);
                s.emit('join_chat', room._id);
            }
        } else {
            set({ activeConversation: null, messages: [] });
        }
    }
}));
