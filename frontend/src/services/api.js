import axios from 'axios'

// Base API URL - can be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
  withCredentials: false
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log network errors for debugging
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: apiClient.defaults.baseURL,
        url: error.config?.url,
        fullURL: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown'
      })
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Authentication APIs
export const authAPI = {
  login: (username, password) => 
    apiClient.post('/login', { username, password }),
  
  getMe: () => 
    apiClient.get('/me'),
  
  logout: () => 
    apiClient.post('/logout')
}

// Classroom APIs
export const classroomAPI = {
  getAll: () => 
    apiClient.get('/classrooms'),
  
  getById: (id) => 
    apiClient.get(`/classrooms/${id}`),
  
  create: (data) => 
    apiClient.post('/classrooms', data),
  
  update: (id, data) => 
    apiClient.put(`/classrooms/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/classrooms/${id}`)
}

// Batch APIs
export const batchAPI = {
  getAll: () => 
    apiClient.get('/batches'),
  
  getById: (id) => 
    apiClient.get(`/batches/${id}`),
  
  create: (data) => 
    apiClient.post('/batches', data),
  
  update: (id, data) => 
    apiClient.put(`/batches/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/batches/${id}`)
}

// Subject APIs
export const subjectAPI = {
  getAll: () => 
    apiClient.get('/subjects'),
  
  getById: (id) => 
    apiClient.get(`/subjects/${id}`),
  
  create: (data) => 
    apiClient.post('/subjects', data),
  
  update: (id, data) => 
    apiClient.put(`/subjects/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/subjects/${id}`)
}

// Faculty APIs
export const facultyAPI = {
  getAll: () => 
    apiClient.get('/faculty'),
  
  getById: (id) => 
    apiClient.get(`/faculty/${id}`),
  
  create: (data) => 
    apiClient.post('/faculty', data),
  
  update: (id, data) => 
    apiClient.put(`/faculty/${id}`, data),
  
  delete: (id) => 
    apiClient.delete(`/faculty/${id}`)
}

// Constraints APIs
export const constraintsAPI = {
  get: () => 
    apiClient.get('/constraints'),
  
  update: (data) => 
    apiClient.post('/constraints', data)
}

// Timetable APIs
export const timetableAPI = {
  generate: (data) => 
    apiClient.post('/generate', data),
  
  getAll: () => 
    apiClient.get('/timetables'),
  
  getById: (id) => 
    apiClient.get(`/timetables/${id}`),
  
  approve: (id, comments) => 
    apiClient.post(`/timetables/${id}/approve`, { comments }),
  
  reject: (id, comments) => 
    apiClient.post(`/timetables/${id}/reject`, { comments }),
  
  delete: (id) => 
    apiClient.delete(`/timetables/${id}`),
  
  export: (id, format) => 
    apiClient.get(`/timetables/${id}/export/${format}`, { responseType: 'blob' })
}

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => 
    apiClient.get('/dashboard/stats'),
  
  getActivity: () => 
    apiClient.get('/dashboard/activity')
}

// System APIs
export const systemAPI = {
  getDateTime: () => 
    apiClient.get('/datetime'),
  
  getHealth: () => 
    apiClient.get('/health')
}

export default apiClient
