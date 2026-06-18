import api from './axiosInstance';

// POST /auth/signup
export const signup = (payload) => api.post('/auth/signup', payload);

// POST /auth/login
export const login = (payload) => api.post('/auth/login', payload);

// GET /auth/me  – requires JWT in Authorization header
export const getCurrentUser = () => api.get('/auth/me');
