import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 15000,
});

// Attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's an unauthorized API call (not login/register itself)
    if (error.response?.status === 401 && !error.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/updateprofile', data),
};

// Equipment
export const equipmentAPI = {
  getAll: (params) => API.get('/equipment', { params }),
  getById: (id) => API.get(`/equipment/${id}`),
  create: (data) => API.post('/equipment', data),
  update: (id, data) => API.put(`/equipment/${id}`, data),
  delete: (id) => API.delete(`/equipment/${id}`),
  getMyEquipment: () => API.get('/equipment/owner/listings'),
  getCategories: () => API.get('/equipment/meta/categories'),
};

// Specialists
export const specialistAPI = {
  getAll: (params) => API.get('/specialists', { params }),
  getById: (id) => API.get(`/specialists/${id}`),
  create: (data) => API.post('/specialists', data),
  update: (id, data) => API.put(`/specialists/${id}`, data),
  getMyProfile: () => API.get('/specialists/me/profile'),
};

// Bookings
export const bookingAPI = {
  create: (data) => API.post('/bookings', data),
  getMyBookings: (params) => API.get('/bookings/my', { params }),
  getProviderBookings: () => API.get('/bookings/provider'),
  getById: (id) => API.get(`/bookings/${id}`),
  updateStatus: (id, status) => API.put(`/bookings/${id}/status`, { status }),
};

// Requirements
export const requirementAPI = {
  getAll: (params) => API.get('/requirements', { params }),
  create: (data) => API.post('/requirements', data),
  respond: (id, data) => API.post(`/requirements/${id}/respond`, data),
  delete: (id) => API.delete(`/requirements/${id}`),
};

// Ratings
export const ratingAPI = {
  create: (data) => API.post('/ratings', data),
  getEquipmentRatings: (id) => API.get(`/ratings/equipment/${id}`),
  getSpecialistRatings: (id) => API.get(`/ratings/specialist/${id}`),
};

// Seasonal
export const seasonalAPI = {
  getCurrent: () => API.get('/seasonal/current'),
  getCalendar: () => API.get('/seasonal/all'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => API.get('/users/dashboard'),
};

// Admin RBAC & Management
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  getUserById: (id) => API.get(`/admin/users/${id}`),
  createUser: (data) => API.post('/admin/users', data),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  updateStatus: (id, data) => API.patch(`/admin/users/${id}/status`, data),
  updateRole: (id, role) => API.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

