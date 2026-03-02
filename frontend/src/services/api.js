import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Response interceptor - handle 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            try {
                const refresh = localStorage.getItem('refresh_token')
                if (!refresh) throw new Error('No refresh token')
                const { data } = await axios.post('/api/auth/refresh', { refresh_token: refresh })
                localStorage.setItem('access_token', data.access_token)
                localStorage.setItem('refresh_token', data.refresh_token)
                original.headers.Authorization = `Bearer ${data.access_token}`
                return api(original)
            } catch {
                localStorage.clear()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api

// API service functions
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
}

export const userApi = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    submitKYC: (data) => api.post('/users/kyc', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getNotifications: () => api.get('/users/notifications'),
    markReadNotif: (id) => api.put(`/users/notifications/${id}/read`),
    getEarnings: () => api.get('/users/earnings'),
}

export const vehicleApi = {
    search: (params) => api.get('/vehicles', { params }),
    create: (data) => api.post('/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getById: (id) => api.get(`/vehicles/${id}`),
    update: (id, d) => api.put(`/vehicles/${id}`, d),
    uploadImages: (id, d) => api.post(`/vehicles/${id}/images`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
    toggleAvail: (id) => api.put(`/vehicles/${id}/availability`),
    myVehicles: () => api.get('/vehicles/my-vehicles'),
}

export const bookingApi = {
    create: (data) => api.post('/bookings', data),
    myBookings: () => api.get('/bookings'),
    ownerBookings: () => api.get('/bookings/owner-bookings'),
    getById: (id) => api.get(`/bookings/${id}`),
    pickup: (id) => api.put(`/bookings/${id}/pickup`),
    returnVehicle: (id) => api.put(`/bookings/${id}/return`),
    cancel: (id) => api.put(`/bookings/${id}/cancel`),
}

export const paymentApi = {
    createOrder: (data) => api.post('/payments/create-order', data),
    verify: (data) => api.post('/payments/verify', data),
    history: () => api.get('/payments/history'),
}

export const adminApi = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    reviewKYC: (id, data) => api.put(`/admin/users/${id}/kyc`, data),
    getVehicles: (params) => api.get('/admin/vehicles', { params }),
    reviewVehicle: (id, data) => api.put(`/admin/vehicles/${id}/status`, data),
    getBookings: (params) => api.get('/admin/bookings', { params }),
    getEarnings: () => api.get('/admin/earnings'),
}
