import { create } from 'zustand';
import api from '../api/axios';
import { getSocket } from '../socket';

export const useRoomStore = create((set, get) => ({
    rooms: [],
    activeRoom: null,
    loading: false,
    showCreateRoomForm: false,

    setShowCreateRoomForm: (value) => set({ showCreateRoomForm: value }),

    fetchRooms: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/rooms');
            set({ rooms: data, loading: false });
        } catch (error) {
            console.error('Fetch rooms error:', error);
            set({ loading: false });
        }
    },

    createRoom: async (roomData) => {
        try {
            const { data } = await api.post('/rooms', roomData);
            set({ rooms: [data, ...get().rooms] });
            return { success: true, room: data };
        } catch (error) {
            console.error('Create room error:', error?.response?.data || error);
            const msg = error.response?.data?.message
                || error.response?.data?.error
                || (typeof error.response?.data === 'string' ? error.response.data : null)
                || error.message
                || 'Failed to create room';
            return { success: false, error: msg };
        }
    },

    setActiveRoom: (room) => {
        set({ activeRoom: room });
        if (room && room.hasAccess !== false) {
            const s = getSocket();
            if (s.connected) {
                s.emit('join_chat', room._id);
            }
        }
    },

    // Listen for room_deleted: remove room from state and redirect if user was inside it
    subscribeToRoomDeleted: (onDeleted) => {
        const s = getSocket();
        if (!s) return () => {};
        const handler = (data) => {
            const { roomId } = data || {};
            if (!roomId) return;
            const idStr = String(roomId);
            const { activeRoom, rooms } = get();
            set({
                rooms: rooms.filter((r) => r._id !== idStr && r._id?.toString() !== idStr),
                activeRoom: activeRoom && (activeRoom._id === idStr || activeRoom._id?.toString() === idStr) ? null : activeRoom,
            });
            if (activeRoom && (activeRoom._id === idStr || activeRoom._id?.toString() === idStr)) {
                onDeleted?.(roomId);
            }
        };
        s.on('room_deleted', handler);
        return () => s.off('room_deleted', handler);
    },

    joinRoom: async (roomId) => {
        try {
            const { data } = await api.post(`/rooms/${roomId}/join`);
            set({ rooms: get().rooms.map(r => r._id === roomId ? data : r) });
            return { success: true };
        } catch (error) {
            console.error('Join room error:', error);
            return { success: false };
        }
    },

    deleteRoom: async (roomId) => {
        try {
            await api.delete(`/rooms/${roomId}`);
            const idStr = String(roomId);
            const { activeRoom, rooms } = get();
            set({
                rooms: rooms.filter((r) => r._id !== idStr && r._id?.toString() !== idStr),
                activeRoom: activeRoom && (activeRoom._id === idStr || activeRoom._id?.toString() === idStr) ? null : activeRoom,
            });
            return { success: true };
        } catch (error) {
            console.error('[RoomStore] Delete room error:', error?.response?.data || error);
            return { success: false, error: error.response?.data?.message || 'Failed to delete room' };
        }
    },
}));
