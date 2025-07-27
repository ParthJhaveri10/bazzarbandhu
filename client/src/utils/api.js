import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds for voice processing
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken')
          // You might want to redirect to login page here
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          console.error('Resource not found')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error(`API Error ${status}:`, data?.message || error.message)
      }
      
      // Return a more structured error
      return Promise.reject({
        status,
        message: data?.message || error.message,
        data: data
      })
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request)
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        data: null
      })
    } else {
      // Something else happened
      console.error('Request error:', error.message)
      return Promise.reject({
        status: 0,
        message: error.message,
        data: null
      })
    }
  }
)

// Helper functions for common API patterns
export const apiHelpers = {
  // Generic CRUD operations
  get: (endpoint, params = {}) => api.get(endpoint, { params }),
  post: (endpoint, data = {}) => api.post(endpoint, data),
  put: (endpoint, data = {}) => api.put(endpoint, data),
  patch: (endpoint, data = {}) => api.patch(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
  
  // File upload
  uploadFile: (endpoint, file, additionalData = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })
    
    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  // Download file
  downloadFile: async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob',
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error) {
      console.error('Download error:', error)
      throw error
    }
  }
}

export default api
