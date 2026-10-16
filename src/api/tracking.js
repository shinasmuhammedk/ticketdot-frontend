import api from './axiosInstance';

// Fetch live GPS tracking telemetry, waypoints, stops, and ETA
export const getTripTracking = (identifier) => {
  return api.get(`/trips/${identifier}/tracking`);
};

// Driver telemetry update
export const updateTripLocation = (scheduleId, data) => {
  return api.post(`/operator/trips/${scheduleId}/location`, data);
};

// Interactive trip simulator for testing and live demonstrations
export const simulateTripAction = (scheduleId, action, delayMinutes = 0) => {
  return api.post(`/trips/${scheduleId}/simulate`, {
    action,
    delay_minutes: delayMinutes,
  });
};
