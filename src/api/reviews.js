import api from './axiosInstance';

// Submit verified passenger review for a booking
export const submitReview = (data) => {
  return api.post('/reviews', data);
};

// Check if a booking already has a submitted review
export const getBookingReview = (bookingRef) => {
  return api.get(`/reviews/booking/${bookingRef}`);
};

// Get reviews and ratings summary for a bus
export const getBusReviews = (busId, page = 1, limit = 10) => {
  return api.get(`/buses/${busId}/reviews?page=${page}&limit=${limit}`);
};

// Get all reviews for the authenticated operator
export const getOperatorReviews = (page = 1, limit = 25) => {
  return api.get(`/operator/reviews?page=${page}&limit=${limit}`);
};

// Post an official operator response to feedback
export const replyToReview = (reviewId, reply) => {
  return api.post(`/operator/reviews/${reviewId}/reply`, { reply });
};
