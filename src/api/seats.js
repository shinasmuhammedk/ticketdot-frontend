import api from './axiosInstance';

export const getSeats = (scheduleId) => {
  return api.get(`/buses/${scheduleId}/seats`);
};