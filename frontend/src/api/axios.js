import axios from 'axios';

// Use relative /api in dev (Vite proxies to backend); full URL when set (e.g. production)
const baseURL = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? '/api' : 'http://localhost:5001/api');

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401, clear token and redirect to login (session expired / invalid)
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            const path = window.location.pathname || '';
            if (!path.startsWith('/login') && !path.startsWith('/signup')) {
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
