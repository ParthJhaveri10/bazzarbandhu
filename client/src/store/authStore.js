import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Auth Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Login failed')
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { success: true, data }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
          })
          return { success: false, error: error.message }
        }
      },

      signup: async (userData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || `Server error: ${response.status}`)
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          return { success: true, data }
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            isAuthenticated: false,
          })
          return { success: false, error: error.message }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Initialize auth state (check for existing token)
      initializeAuth: () => {
        const { token, user } = get()
        if (token && user) {
          set({ isAuthenticated: true })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export { useAuthStore }
