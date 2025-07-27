import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const login = async (credentials) => {
        console.log('Login called with:', credentials)
        setLoading(true)
        setError(null)
        
        // Simulate login
        setTimeout(() => {
            setUser({ email: credentials.email, type: credentials.type })
            setIsAuthenticated(true)
            setLoading(false)
        }, 1000)
    }

    const signup = async (userData) => {
        console.log('Signup called with:', userData)
        setLoading(true)
        setError(null)
        
        // Simulate signup
        setTimeout(() => {
            setUser({ email: userData.email, type: userData.type })
            setIsAuthenticated(true)
            setLoading(false)
        }, 1000)
    }

    const logout = () => {
        setUser(null)
        setIsAuthenticated(false)
        setError(null)
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
    return context
}
