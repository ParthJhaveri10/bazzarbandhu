import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            // Real API login
            login: async (credentials) => {
                set({ loading: true, error: null })
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                            type: credentials.type || 'vendor'
                        })
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.message || 'Login failed')
                    }

                    // Store token in localStorage
                    localStorage.setItem('authToken', data.token)

                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                        error: null
                    })

                    return data
                } catch (error) {
                    console.error('Login error:', error)
                    set({
                        loading: false,
                        error: error.message
                    })
                    throw error
                }
            },

            // Real API signup
            signup: async (userData) => {
                set({ loading: true, error: null })
                try {
                    const response = await fetch('/api/auth/signup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            password: userData.password,
                            businessName: userData.businessName,
                            address: userData.address,
                            type: userData.type || 'vendor'
                        })
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        throw new Error(data.message || 'Registration failed')
                    }

                    // Store token in localStorage
                    localStorage.setItem('authToken', data.token)

                    set({
                        user: data.user,
                        isAuthenticated: true,
                        loading: false,
                        error: null
                    })

                    return data
                } catch (error) {
                    console.error('Signup error:', error)
                    set({
                        loading: false,
                        error: error.message
                    })
                    throw error
                }
            },

            // Enhanced logout function
            logout: () => {
                // Clear token from localStorage
                localStorage.removeItem('authToken')
                
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null
                })
            },

            // Verify token and restore session
            verifyToken: async () => {
                const token = localStorage.getItem('authToken')
                if (!token) return false

                try {
                    const response = await fetch('/api/auth/verify', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        set({
                            user: data.user,
                            isAuthenticated: true,
                            error: null
                        })
                        return true
                    } else {
                        // Token is invalid, clear it
                        localStorage.removeItem('authToken')
                        set({
                            user: null,
                            isAuthenticated: false,
                            error: null
                        })
                        return false
                    }
                } catch (error) {
                    console.error('Token verification failed:', error)
                    localStorage.removeItem('authToken')
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null
                    })
                    return false
                }
            },

            // Clear error
            clearError: () => {
                set({ error: null })
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

export { useAuthStore }