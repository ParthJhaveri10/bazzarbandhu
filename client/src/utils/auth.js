// import { useAuthStore } from '../store/authStore'

// Generate unique ID for users
export const generateUserId = (type, email) => {
    const prefix = type === 'vendor' ? 'VND' : 'SUP'
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    const emailHash = email.split('@')[0].substring(0, 3).toUpperCase()

    return `${prefix}-${emailHash}-${timestamp}-${random}`.toUpperCase()
}

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('authToken')
    return !!token
}

// Get authentication token
export const getAuthToken = () => {
    return localStorage.getItem('authToken')
}

// Create authorization header
export const getAuthHeaders = () => {
    const token = getAuthToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
}

// Protected API call helper
export const apiCall = async (url, options = {}) => {
    const token = getAuthToken()

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
        // Token expired or invalid
        useAuthStore.getState().logout()
        window.location.href = '/vendor-auth'
        throw new Error('Authentication required')
    }

    return response
}

// Role-based access control
export const hasRole = (requiredRole, userRole) => {
    return userRole === requiredRole
}

// Check if user can access vendor features
export const canAccessVendor = (user) => {
    return user && user.type === 'vendor'
}

// Check if user can access supplier features
export const canAccessSupplier = (user) => {
    return user && user.type === 'supplier'
}