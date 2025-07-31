// Generate unique ID for users
export const generateUserId = (type, email) => {
    const prefix = type === 'vendor' ? 'VND' : 'SUP'
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    const emailHash = email.split('@')[0].substring(0, 3).toUpperCase()

    return `${prefix}-${emailHash}-${timestamp}-${random}`.toUpperCase()
}

// Role-based access control
export const hasRole = (requiredRole, userRole) => {
    return userRole === requiredRole
}

// Check if user can access vendor features
export const canAccessVendor = (user) => {
    return user && user.role === 'vendor'
}

// Check if user can access supplier features
export const canAccessSupplier = (user) => {
    return user && user.role === 'supplier'
}