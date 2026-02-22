import { create } from 'zustand';
import api from '../api/axios';

export const useFocusStore = create((set, get) => ({
    isFocusMode: false,
    activeSession: null,
    timer: 0,
    intervalId: null,

    toggleFocusMode: async () => {
        const { isFocusMode, intervalId } = get();

        if (!isFocusMode) {
            // Start focus mode
            try {
                const { data } = await api.post('/focus/start');
                const id = setInterval(() => {
                    set((state) => ({ timer: state.timer + 1 }));
                }, 1000);
                set({ isFocusMode: true, activeSession: data, timer: 0, intervalId: id });
            } catch (error) {
                console.error('Error starting focus mode:', error);
            }
        } else {
            // Stop focus mode
            try {
                await api.post('/focus/stop');
                if (intervalId) clearInterval(intervalId);
                set({ isFocusMode: false, activeSession: null, intervalId: null });
            } catch (error) {
                console.error('Error stopping focus mode:', error);
            }
        }
    }
}));
