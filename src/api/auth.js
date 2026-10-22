import api from './axiosInstance';

// POST /auth/signup
export const signup = (payload) => api.post('/auth/signup', payload);

// POST /auth/login
export const login = (payload) => api.post('/auth/login', payload);

// POST /auth/refresh
export const refresh = (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken });

// POST /auth/logout
export const logout = (refreshToken) => api.post('/auth/logout', { refresh_token: refreshToken });

// GET /auth/me  – requires JWT in Authorization header
export const getCurrentUser = () => api.get('/auth/me');

// POST /auth/forgot-password
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// POST /auth/reset-password
export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, new_password: newPassword });
