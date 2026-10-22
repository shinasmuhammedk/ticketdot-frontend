import api from './axiosInstance';

export const createPaymentOrder = (payload) => {
  return api.post('/payments/orders', payload);
};

export const verifyPayment = (payload) => {
  return api.post('/payments/verify', payload);
};

export const getPaymentStatus = (orderId) => {
  return api.get(`/payments/${orderId}`);
};

export const getTestSignature = (orderId, paymentId) => {
  if (import.meta.env.PROD) {
    return Promise.reject(new Error('Test signature helper is disabled in production builds'));
  }
  return api.post('/payments/test-signature', {
    order_id: orderId,
    payment_id: paymentId,
  });
};
