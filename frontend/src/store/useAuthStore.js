import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,

    signup: async (username, email, password, role = 'MEMBER') => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/signup', { username, email, password, role });
            const user = data.data?.user || data.user;
            const userWithRole = user ? { ...user, role: user.role || 'MEMBER' } : user;
            if (userWithRole) console.log('[Auth] Signup: user.role =', userWithRole.role);
            localStorage.setItem('token', data.token);
            set({ user: userWithRole, token: data.token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, error: error.response?.data?.message || 'Signup failed' };
        }
    },

    login: async (email, password) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            const user = data.data?.user || data.user;
            const userWithRole = user ? { ...user, role: user.role || 'MEMBER' } : user;
            if (userWithRole) console.log('[Auth] Login: user.role =', userWithRole.role);
            localStorage.setItem('token', data.token);
            set({ user: userWithRole, token: data.token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isAuthenticated: false, loading: false });
            return;
        }

        try {
            const { data } = await api.get('/auth/me');
            const user = data.data?.user || data.user;
            const userWithRole = user ? { ...user, role: user.role || 'MEMBER' } : user;
            if (userWithRole) console.log('[Auth] checkAuth (/me): user.role =', userWithRole.role);
            set({ user: userWithRole, isAuthenticated: true, loading: false });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, loading: false });
        }
    },
}));
