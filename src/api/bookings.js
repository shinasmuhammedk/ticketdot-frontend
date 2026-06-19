import api from './axiosInstance';

export const lockSeat = (scheduleId, seat) => {
  return api.post('/bookings/lock', {
    schedule_id: scheduleId,
    seat,
  });
};

export const confirmBooking = (scheduleId, seat) => {
  return api.post('/bookings/confirm', {
    schedule_id: scheduleId,
    seat,
  });
};



export const getMyBookings = () => {
  return api.get('/bookings/my-bookings');
};


export const cancelBooking = (bookingRef) => {
  return api.post(`/bookings/${bookingRef}/cancel`);
};