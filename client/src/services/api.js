import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data.data || response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    
    return Promise.reject({ message, status: error.response?.status });
  }
);

// API methods
const api = {
  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  // Generic methods
  get: (url, config = {}) => axiosInstance.get(url, config),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config),
  delete: (url, config = {}) => axiosInstance.delete(url, config),
  patch: (url, data, config = {}) => axiosInstance.patch(url, data, config),

  // Auth
  login: (identifier, password) => axiosInstance.post('/auth/login', { identifier, password }),
  signup: (userData) => axiosInstance.post('/auth/signup', userData),
  adminLogin: (email, password) => axiosInstance.post('/auth/admin/login', { email, password }),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => axiosInstance.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) => axiosInstance.post('/auth/change-password', { currentPassword, newPassword }),

  // User
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (data) => axiosInstance.put('/user/profile', data),
  getNotifications: () => axiosInstance.get('/user/notifications'),
  markNotificationRead: (id) => axiosInstance.put(`/user/notifications/${id}/read`),

  // Plans
  getPlans: () => axiosInstance.get('/plans'),
  getPlan: (id) => axiosInstance.get(`/plans/${id}`),

  // Seats
  getSeats: (params) => axiosInstance.get('/seats', { params }),
  
  // Bookings
  getBookings: () => axiosInstance.get('/bookings'),
  createBooking: (data) => axiosInstance.post('/bookings', data),

  // Payments
  processPayment: (data) => axiosInstance.post('/payments/process', data),

  // Coupons
  validateCoupon: (code, amount) => axiosInstance.post('/coupons/validate', { code, amount }),

  // Wallet
  getWallet: () => axiosInstance.get('/wallet'),
  rechargeWallet: (amount, paymentMethod, transactionId) => axiosInstance.post('/wallet/recharge', { amount, payment_method: paymentMethod, transaction_id: transactionId }),

  // Facilities
  getFacilities: () => axiosInstance.get('/facilities'),

  // Banners
  getBanners: () => axiosInstance.get('/banners'),

  // Support
  createTicket: (data) => axiosInstance.post('/support/tickets', data),
  getTickets: () => axiosInstance.get('/support/tickets'),
  getTicketMessages: (id) => axiosInstance.get(`/support/tickets/${id}/messages`),
  sendMessage: (id, message) => axiosInstance.post(`/support/tickets/${id}/messages`, { message }),

  // Offers
  getOffers: () => axiosInstance.get('/offers'),
  getOfferByCode: (code) => axiosInstance.get(`/offers/code/${code}`),

  // Advance Bookings
  getAdvanceBookings: () => axiosInstance.get('/advance-bookings/my-bookings'),
  createAdvanceBooking: (data) => axiosInstance.post('/advance-bookings', data),
  cancelAdvanceBooking: (id) => axiosInstance.put(`/advance-bookings/${id}/cancel`),

  // Admin - Dashboard
  getDashboard: () => axiosInstance.get('/admin/dashboard'),

  // Admin - Members
  getMembers: (params) => axiosInstance.get('/admin/members', { params }),
  blockMember: (id, is_blocked) => axiosInstance.put(`/admin/members/${id}/block`, { is_blocked }),

  // Admin - Seats
  createSeat: (data) => axiosInstance.post('/seats', data),
  updateSeat: (id, data) => axiosInstance.put(`/seats/${id}`, data),
  deleteSeat: (id) => axiosInstance.delete(`/seats/${id}`),

  // Admin - Plans
  createPlan: (data) => axiosInstance.post('/plans', data),
  updatePlan: (id, data) => axiosInstance.put(`/plans/${id}`, data),
  deletePlan: (id) => axiosInstance.delete(`/plans/${id}`),

  // Admin - Payments
  getPayments: () => axiosInstance.get('/payments'),
  processRefund: (id, data) => axiosInstance.post(`/payments/${id}/refund`, data),

  // Admin - Facilities
  createFacility: (data) => axiosInstance.post('/facilities', data),
  updateFacility: (id, data) => axiosInstance.put(`/facilities/${id}`, data),
  deleteFacility: (id) => axiosInstance.delete(`/facilities/${id}`),

  // Admin - Banners
  createBanner: (data) => axiosInstance.post('/banners', data),
  updateBanner: (id, data) => axiosInstance.put(`/banners/${id}`, data),
  deleteBanner: (id) => axiosInstance.delete(`/banners/${id}`),
  getAllBanners: () => axiosInstance.get('/banners/admin/all'),

  // Admin - Coupons
  getCoupons: () => axiosInstance.get('/coupons'),
  createCoupon: (data) => axiosInstance.post('/coupons', data),
  updateCoupon: (id, data) => axiosInstance.put(`/coupons/${id}`, data),

  // Admin - Notifications
  sendNotification: (data) => axiosInstance.post('/notifications', data),
  getAllNotifications: () => axiosInstance.get('/notifications'),

  // Admin - Offers
  getAllOffers: () => axiosInstance.get('/offers/admin/all'),
  createOffer: (data) => axiosInstance.post('/offers', data),
  updateOffer: (id, data) => axiosInstance.put(`/offers/${id}`, data),
  deleteOffer: (id) => axiosInstance.delete(`/offers/${id}`),

  // Admin - Advance Bookings
  getAllAdvanceBookings: () => axiosInstance.get('/advance-bookings/admin/all'),
  updateAdvanceBookingStatus: (id, data) => axiosInstance.put(`/advance-bookings/admin/${id}/status`, data),
  deleteAdvanceBooking: (id) => axiosInstance.delete(`/advance-bookings/admin/${id}`),

  // Admin - Support
  getAdminTickets: () => axiosInstance.get('/support/admin/tickets'),
  updateTicketStatus: (id, status) => axiosInstance.put(`/support/admin/tickets/${id}/status`, { status }),
  replyToTicket: (id, message) => axiosInstance.post(`/support/admin/tickets/${id}/reply`, { message }),
  
  // Admin - Admin Notifications
  getAdminNotifications: () => axiosInstance.get('/admin/admin-notifications'),
  getAdminUnreadCount: () => axiosInstance.get('/admin/admin-notifications/unread-count'),
  markAdminNotificationRead: (id) => axiosInstance.put(`/admin/admin-notifications/${id}/read`),
  markAllAdminNotificationsRead: () => axiosInstance.put('/admin/admin-notifications/mark-all-read'),
  deleteAdminNotification: (id) => axiosInstance.delete(`/admin/admin-notifications/${id}`),

  // Admin - Refunds
  getRefunds: (params) => axiosInstance.get('/admin/refunds', { params }),
  getRefundStats: () => axiosInstance.get('/admin/refunds/stats/summary'),
  processRefundManual: (data) => axiosInstance.post('/admin/refunds/process', data),
  processAutoRefund: (bookingId) => axiosInstance.post(`/admin/refunds/auto-refund/${bookingId}`),

  // Admin - User Control
  getUserWallet: (userId) => axiosInstance.get(`/admin/user-control/${userId}/wallet`),
  creditUserWallet: (userId, data) => axiosInstance.post(`/admin/user-control/${userId}/wallet/credit`, data),
  debitUserWallet: (userId, data) => axiosInstance.post(`/admin/user-control/${userId}/wallet/debit`, data),
  getUserBookings: (userId) => axiosInstance.get(`/admin/user-control/${userId}/bookings`),
  extendBooking: (userId, bookingId, data) => axiosInstance.post(`/admin/user-control/${userId}/bookings/${bookingId}/extend`, data),
  changeBookingSeat: (userId, bookingId, data) => axiosInstance.post(`/admin/user-control/${userId}/bookings/${bookingId}/change-seat`, data),
  cancelBooking: (userId, bookingId, data) => axiosInstance.post(`/admin/user-control/${userId}/bookings/${bookingId}/cancel`, data),

  // Admin - Impersonation
  impersonateUser: (userId) => axiosInstance.post(`/admin/impersonation/impersonate/${userId}`),
  exitImpersonation: (sessionId) => axiosInstance.post(`/admin/impersonation/exit-impersonation/${sessionId}`),
  getActiveSessions: () => axiosInstance.get('/admin/impersonation/active-sessions'),
  getSessionHistory: (params) => axiosInstance.get('/admin/impersonation/session-history', { params }),

  // Admin - Audit Logs
  getAuditLogs: (params) => axiosInstance.get('/admin/audit-logs', { params }),
  getAuditStats: (params) => axiosInstance.get('/admin/audit-logs/stats', { params }),
  exportAuditLogs: (params) => axiosInstance.get('/admin/audit-logs/export/csv', { params, responseType: 'blob' }),

  // User - Refund Requests
  createRefundRequest: (data) => axiosInstance.post('/user-refund-requests', data),
  getMyRefundRequests: (params) => axiosInstance.get('/user-refund-requests', { params }),
  getRefundRequestDetails: (id) => axiosInstance.get(`/user-refund-requests/${id}`),
  cancelRefundRequest: (id) => axiosInstance.delete(`/user-refund-requests/${id}`),

  // Admin - User Refund Requests
  getUserRefundRequests: (params) => axiosInstance.get('/admin/refunds/user-requests', { params }),
  getUserRefundRequestStats: () => axiosInstance.get('/admin/refunds/user-requests/stats'),
  reviewRefundRequest: (id, data) => axiosInstance.put(`/admin/refunds/user-requests/${id}/review`, data)
};

export default api;
