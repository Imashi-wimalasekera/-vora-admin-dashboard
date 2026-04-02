import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({ baseURL: BASE_URL })

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/admin/dashboard/summary'),
  getSalesReport: (year, month) => api.get(`/admin/dashboard/sales-report?year=${year}&month=${month}`),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (page = 0, size = 10, sort = 'createdAt') =>
    api.get(`/admin/products?page=${page}&size=${size}&sort=${sort}`),
  search: (q, page = 0) => api.get(`/admin/products/search?q=${q}&page=${page}`),
  getById: (id) => api.get(`/admin/products/${id}`),
  create: (formData) => api.post('/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  updateStock: (id, stockQty) => api.patch(`/admin/products/${id}/stock`, { stockQty }),
  getLowStock: (threshold = 10) => api.get(`/admin/products/low-stock?threshold=${threshold}`),
  addImages: (id, formData) => api.post(`/admin/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll: () => api.get('/admin/categories'),
  getById: (id) => api.get(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  getAll: (page = 0, size = 10) => api.get(`/admin/orders?page=${page}&size=${size}`),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getStatusSummary: () => api.get('/admin/orders/status-summary'),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: (page = 0, size = 10) => api.get(`/admin/users?page=${page}&size=${size}`),
  getById: (id) => api.get(`/admin/users/${id}`),
  delete: (id) => api.delete(`/admin/users/${id}`),
  toggleActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role?role=${role}`),
}

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentAPI = {
  getAll: () => api.get('/admin/payments'),
  getByOrderId: (orderId) => api.get(`/admin/payments/order/${orderId}`),
  refund: (paymentId) => api.post(`/admin/payments/${paymentId}/refund`),
  createIntent: (data) => api.post('/payments/create-intent', data),
}

// ── Coupons ───────────────────────────────────────────────────────────────────
export const couponAPI = {
  getAll: () => api.get('/admin/coupons'),
  create: (data) => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id) => api.delete(`/admin/coupons/${id}`),
  validate: (code, amount) => api.post('/coupons/validate', { code, orderAmount: amount }),
}

// ── Notifications ────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/admin/notifications'),
  getUnreadCount: () => api.get('/admin/notifications/unread-count'),
  markRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markAllRead: () => api.patch('/admin/notifications/read-all'),
  delete: (id) => api.delete(`/admin/notifications/${id}`),
  clearAll: () => api.delete('/admin/notifications'),
}

// ── Settings ─────────────────────────────────────────────────────────────────
export const settingsAPI = {
  get: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
}

export default api
