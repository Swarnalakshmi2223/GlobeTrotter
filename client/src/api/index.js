import axiosInstance from './axiosConfig';

// Auth APIs
export const authAPI = {
  signup: (data) => axiosInstance.post('/api/auth/signup', data),
  login: (data) => axiosInstance.post('/api/auth/login', data),
  getMe: () => axiosInstance.get('/api/auth/me'),
};

// Profile APIs
export const profileAPI = {
  update: (data) => axiosInstance.put('/api/profile', data),
  changePassword: (data) => axiosInstance.put('/api/profile/password', data),
};

// Trip APIs
export const tripAPI = {
  getAll: () => axiosInstance.get('/api/trips'),
  getById: (id) => axiosInstance.get(`/api/trips/${id}`),
  create: (data) => axiosInstance.post('/api/trips', data),
  update: (id, data) => axiosInstance.put(`/api/trips/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/trips/${id}`),
};

// City APIs
export const cityAPI = {
  getByTrip: (tripId) => axiosInstance.get(`/api/cities?tripId=${tripId}`),
  add: (data) => axiosInstance.post('/api/cities/stops', data),
  update: (id, data) => axiosInstance.put(`/api/cities/stops/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/cities/stops/${id}`),
};

// Activity APIs
export const activityAPI = {
  getByTrip: (tripId, cityId) =>
    axiosInstance.get(`/api/activities?tripId=${tripId}${cityId ? `&cityId=${cityId}` : ''}`),
  create: (data) => axiosInstance.post('/api/activities', data),
  update: (id, data) => axiosInstance.put(`/api/activities/${id}`, data),
  delete: (id) => axiosInstance.delete(`/api/activities/${id}`),
  getBudget: (tripId) => axiosInstance.get(`/api/activities/budget/${tripId}`),
};
