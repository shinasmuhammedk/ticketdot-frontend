import api from './axiosInstance';

export const createBus = (payload) => {
  return api.post('/operator/buses', payload);
};

export const createRoute = (payload) => {
  return api.post('/operator/routes', payload);
};

export const createSchedule = (payload) => {
  return api.post('/operator/schedules', payload);
};

export const getOperatorBookings = () => {
  return api.get('/operator/bookings');
};

export const getBuses = () => {
  return api.get('/operator/buses');
};

export const getRoutes = () => {
  return api.get('/operator/routes');
};

export const getSchedules = () => {
  return api.get('/operator/schedules');
};

export const getDashboardStats = () => {
  return api.get('/operator/dashboard');
};

export const getAnalytics = (period = '7d') => {
  return api.get(`/operator/analytics?period=${period}`);
};


export const getCities = () => {
  return api.get('/cities');
};

export const updateBus = (busId, payload) => {
  return api.put(`/operator/buses/${busId}`, payload);
};

export const deleteBus = (busId) => {
  return api.delete(`/operator/buses/${busId}`);
};

export const getBusLayout = (busId) => {
  return api.get(`/operator/buses/${busId}/layout`);
};

export const cancelSchedule = (scheduleId) => {
  return api.post(`/operator/schedules/${scheduleId}/cancel`);
};