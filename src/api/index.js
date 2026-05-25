import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vvce_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Routes that handle their own error display — interceptor stays silent for these
const SILENT_PATHS = ['/auth/verify-email', '/auth/reset-password', '/dean/verify', '/principal/verify']

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg    = err.response?.data?.message || 'Something went wrong'
    const url    = err.config?.url || ''
    const isSilent = SILENT_PATHS.some(p => url.includes(p))

    if (err.response?.status === 401) {
      // Don't redirect on auth-check calls (verify-email, etc.)
      if (!isSilent) {
        localStorage.removeItem('vvce_token')
        localStorage.removeItem('vvce_user')
        window.location.href = '/login'
      }
    } else if (!isSilent && err.response?.status !== 422) {
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

export default api

// ── Auth
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  verifyEmail:    (token) => api.post('/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => api.post('/auth/reset-password', data),
  me:             ()      => api.get('/auth/me'),
}

// ── Events
export const eventsAPI = {
  list:       (params) => api.get('/events', { params }),
  getById:    (id)     => api.get(`/events/${id}`),
  create:     (data)   => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:     (id, d)  => api.patch(`/events/${id}`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve:    (id, d)  => api.patch(`/events/${id}/approve`, d),
  delete:     (id)     => api.delete(`/events/${id}`),
  clashCheck: (params) => api.get('/events/clash-check', { params }),
  analytics:  (id)     => api.get(`/events/${id}/analytics`),
}

// ── Registrations
export const registrationsAPI = {
  register:        (data) => api.post('/registrations', data),
  teamApprove:     (data) => api.post('/registrations/team-approve', data),
  myRegistrations: ()     => api.get('/registrations/my'),
  eventRegs:       (id)   => api.get(`/registrations/event/${id}`),
  cancel:          (id)   => api.delete(`/registrations/${id}`),
}

// ── Payments
export const paymentsAPI = {
  initiate:   (data) => api.post('/payments/initiate', data),
  verify:     (data) => api.post('/payments/verify', data),
  myPayments: ()     => api.get('/payments/my'),
  revenue:    (id)   => api.get(`/payments/event/${id}/revenue`),
}

// ── Certificates
export const certificatesAPI = {
  upload:      (data) => api.post('/certificates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  bulkUpload:  (data) => api.post('/certificates/bulk', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  myCerts:     ()     => api.get('/certificates/my'),
  myPoints:    ()     => api.get('/certificates/activity-points'),
  eventCerts:  (id)   => api.get(`/certificates/event/${id}`),
  studentCerts:(id)   => api.get(`/certificates/student/${id}`),
}

// ── Attendance
export const attendanceAPI = {
  mark:         (data) => api.post('/attendance/mark', data),
  toggle:       (id, d) => api.patch(`/attendance/${id}`, d),
  myAttendance: ()     => api.get('/attendance/my'),
  eventSheet:   (id)   => api.get(`/attendance/event/${id}`),
  byDate:       (date) => api.get(`/attendance/date/${date}`),
}

// ── Notifications
export const notificationsAPI = {
  list:        () => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  send:        (data) => api.post('/notifications/send', data),
  delete:      (id) => api.delete(`/notifications/${id}`),
}

// ── Users / Dashboards
export const usersAPI = {
  profile:            () => api.get('/users/profile'),
  updateProfile:      (data) => api.patch('/users/profile', data),
  changePassword:     (data) => api.patch('/users/change-password', data),
  studentDashboard:   () => api.get('/users/dashboard/student'),
  adminDashboard:     () => api.get('/users/dashboard/admin'),
  authorityDashboard: () => api.get('/users/dashboard/authority'),
  clubs:              () => api.get('/users/clubs'),
  allUsers:           (params) => api.get('/users/all', { params }),
}

// ── Student Profiles (extended)
export const studentAPI = {
  getProfile:    ()     => api.get('/students/profile'),
  updateProfile: (data) => api.patch('/students/profile', data),
  uploadPhoto:   (data) => api.post('/students/upload-photo', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadResume:  (data) => api.post('/students/upload-resume', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Clubs
export const clubsAPI = {
  register:  (data) => api.post('/clubs/register', data),
  getAll:    ()     => api.get('/clubs/all'),
  getPending:()     => api.get('/clubs/pending'),
  approve:   (id)   => api.patch(`/clubs/${id}/approve`),
  reject:    (id, data) => api.patch(`/clubs/${id}/reject`, data),
}

// ── Dean Portal
export const deanAPI = {
  verify:       (password) => api.post('/dean/verify', { password }),
  getStats:     ()         => api.get('/dean/stats'),
  getEvents:    (params)   => api.get('/dean/events', { params }),
  detectClashes:()         => api.get('/dean/clash-check'),
  getLogs:      ()         => api.get('/dean/logs'),
}

// ── Principal Portal
export const principalAPI = {
  verify:             (password)   => api.post('/principal/verify', { password }),
  getAvailability:    ()           => api.get('/principal/availability'),
  updateAvailability: (data)       => api.patch('/principal/availability', data),
  getSchedule:        (params)     => api.get('/principal/schedule', { params }),
  addSchedule:        (data)       => api.post('/principal/schedule', data),
  updateSchedule:     (id, data)   => api.patch(`/principal/schedule/${id}`, data),
  deleteSchedule:     (id)         => api.delete(`/principal/schedule/${id}`),
}

// ── Extended Certificates (V2)
export const certV2API = {
  uploadExternal: (data) => api.post('/certificates/upload-external', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  verify:         (id, data) => api.patch(`/certificates/${id}/verify`, data),
  delete:         (id) => api.delete(`/certificates/${id}`),
}
