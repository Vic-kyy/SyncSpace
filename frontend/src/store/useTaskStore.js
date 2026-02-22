import { create } from 'zustand';
import api from '../api/axios';
import { getSocket } from '../socket';

export const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    currentRoomId: null, // so we only apply socket task updates for this room

    fetchTasks: async (roomId) => {
        if (!roomId) return;
        set({ loading: true, currentRoomId: roomId });
        try {
            const { data } = await api.get(`/rooms/${roomId}/tasks`);
            set({ tasks: data, loading: false });
        } catch (error) {
            console.error('Fetch tasks error:', error);
            set({ loading: false });
        }
    },

    createTask: async (roomId, taskData) => {
        try {
            const { data } = await api.post(`/rooms/${roomId}/tasks`, taskData);
            set({ tasks: [data, ...get().tasks] });

            const s = getSocket();
            if (s.connected) {
                s.emit('task_updated', { roomId, task: data });
            }
            return { success: true };
        } catch (error) {
            console.error('Create task error:', error);
            return { success: false };
        }
    },

    updateTask: async (taskId, updateData) => {
        try {
            const { data } = await api.patch(`/tasks/${taskId}`, updateData);
            set({ tasks: get().tasks.map(t => t._id === taskId ? data : t) });

            const s = getSocket();
            if (s.connected) {
                s.emit('task_updated', { roomId: data.roomId, task: data });
            }
            return { success: true };
        } catch (error) {
            console.error('Update task error:', error);
            return { success: false };
        }
    },

    deleteTask: async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            set({ tasks: get().tasks.filter(t => t._id !== taskId) });
            return { success: true };
        } catch (error) {
            console.error('Delete task error:', error);
            return { success: false, error: error.response?.data?.message };
        }
    },

    convertMessageToTask: async (payload) => {
        try {
            const { data } = await api.post('/tasks/from-message', payload);
            // If we are currently viewing this room's tasks, add it
            set({ tasks: [data, ...get().tasks] });

            const s = getSocket();
            if (s.connected) {
                s.emit('task_updated', { roomId: payload.roomId, task: data });
            }
            return { success: true };
        } catch (error) {
            console.error('Convert message to task error:', error);
            return { success: false };
        }
    },

    // Handler for socket updates (only apply if task belongs to currently viewed room)
    receiveTaskUpdate: (task) => {
        const { tasks, currentRoomId } = get();
        const taskRoomId = (task.roomId?._id ?? task.roomId)?.toString?.() ?? task.roomId;
        const currentId = (currentRoomId?._id ?? currentRoomId)?.toString?.() ?? currentRoomId;
        if (currentId && taskRoomId !== currentId) return;

        const existing = tasks.find(t => t._id === task._id);
        if (existing) {
            set({ tasks: get().tasks.map(t => t._id === task._id ? task : t) });
        } else {
            set({ tasks: [task, ...get().tasks] });
        }
    },
}));
