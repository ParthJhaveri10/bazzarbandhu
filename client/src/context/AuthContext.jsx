import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Clear any old auth data on component mount and restore valid auth
    useEffect(() => {
        // Clear old Zustand persisted data
        localStorage.removeItem('auth-storage')
        // Clear any other old auth keys
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
            if (key.includes('auth') || key.includes('user') || key.includes('token')) {
                if (key !== 'voicecart-user' && key !== 'voicecart-auth') {
                    localStorage.removeItem(key)
                }
            }
        })
        console.log('🧹 Cleared old authentication data')
        
        // Try to restore valid auth state
        try {
            const savedUser = localStorage.getItem('voicecart-user')
            const savedAuth = localStorage.getItem('voicecart-auth')
            
            if (savedUser && savedAuth === 'true') {
                const userData = JSON.parse(savedUser)
                console.log('🔄 Restoring user session:', userData)
                setUser(userData)
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.error('❌ Error restoring auth state:', error)
            localStorage.clear()
        }
    }, [])

    const login = async (email, password, userType) => {
        console.log('🔑 Login called with:', { email, userType })
        setLoading(true)
        setError(null)
        
        try {
            const API_URL = 'https://bazzarbandhu.vercel.app/api'
            
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            // Check if response is JSON
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned invalid response. Please try again.')
            }

            const result = await response.json()

            if (response.ok && result.success) {
                const userData = result.user
                console.log('✅ Login successful:', userData)
                
                setUser(userData)
                setIsAuthenticated(true)
                
                // Store in localStorage for persistence
                localStorage.setItem('voicecart-user', JSON.stringify(userData))
                localStorage.setItem('voicecart-auth', 'true')
                localStorage.setItem('voicecart-token', result.token)
                
                return { success: true, user: userData }
            } else {
                throw new Error(result.message || 'Login failed')
            }
        } catch (error) {
            console.error('❌ Login error:', error)
            setError(error.message)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const signup = async (userData) => {
        console.log('📝 Signup called with:', userData)
        setLoading(true)
        setError(null)
        
        try {
            const API_URL = 'https://bazzarbandhu.vercel.app/api'
            
            const signupData = {
                email: userData.email,
                password: userData.password,
                type: userData.type || 'vendor',
                name: userData.name || userData.businessName || userData.email.split('@')[0],
                phone: userData.phone,
                businessName: userData.businessName,
                address: userData.address,
                pincode: userData.pincode
            }

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            })

            // Check if response is JSON
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned invalid response. Please try again.')
            }

            const result = await response.json()

            if (response.ok && result.success) {
                const newUser = result.user
                console.log('✅ Signup successful:', newUser)
                
                setUser(newUser)
                setIsAuthenticated(true)
                
                // Store in localStorage for persistence
                localStorage.setItem('voicecart-user', JSON.stringify(newUser))
                localStorage.setItem('voicecart-auth', 'true')
                
                return { success: true, user: newUser }
            } else {
                throw new Error(result.message || 'Signup failed')
            }
        } catch (error) {
            console.error('❌ Signup error:', error)
            setError(error.message)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        console.log('🚪 Logging out user')
        setUser(null)
        setIsAuthenticated(false)
        setError(null)
        
        // Clear all auth data from localStorage
        localStorage.removeItem('voicecart-user')
        localStorage.removeItem('voicecart-auth')
        localStorage.clear() // Complete clear to remove any old data
    }

    const clearError = () => {
        setError(null)
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
        clearError
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    
    // Debug logging
    console.log('🔐 Auth Context - Current state:', {
        user: context.user,
        isAuthenticated: context.isAuthenticated,
        loading: context.loading
    })
    
    return context
}

// Export with the old name for backward compatibility
export const useAuthStore = useAuth
