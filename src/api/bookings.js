import api from './axiosInstance';

export const lockSeat = (scheduleId, seats) => {
  const seatList = Array.isArray(seats) ? seats : [seats];
  return api.post('/bookings/lock', {
    schedule_id: scheduleId,
    seats: seatList,
  });
};

export const confirmBooking = (scheduleId, seats) => {
  const seatList = Array.isArray(seats) ? seats : [seats];
  return api.post('/bookings/confirm', {
    schedule_id: scheduleId,
    seats: seatList,
  });
};

export const releaseSeats = (scheduleId, seats) => {
  const seatList = Array.isArray(seats) ? seats : [seats];
  return api.post('/bookings/release', {
    schedule_id: scheduleId,
    seats: seatList,
  });
};

export const getMyBookings = () => {
  return api.get('/bookings/my-bookings');
};

export const cancelBooking = (bookingRef) => {
  return api.post(`/bookings/${bookingRef}/cancel`);
};

export const getBookingDetails = (bookingRef) => {
  return api.get(`/bookings/${bookingRef}`);
};