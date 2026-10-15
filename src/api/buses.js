import api from './axiosInstance';

export const searchBuses = ({ from, to, date }) => {
  return api.get('/buses/search', {
    params: { from, to, date },
  });
};

export const getSeats = (scheduleID) => {
  return api.get(`/buses/${scheduleID}/seats`);
};

export const getBusDetails = (scheduleID) => {
  return api.get(`/buses/${scheduleID}`);
};

export const getCities = () => {
  return api.get('/cities');
};