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