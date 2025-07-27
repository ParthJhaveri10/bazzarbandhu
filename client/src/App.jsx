import { Routes, Route, Navigate } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Import Pages
import RoleSelection from './pages/RoleSelection'
import VendorAuth from './pages/VendorAuth'
import SupplierAuth from './pages/SupplierAuth'
import Home from './pages/Home'
import VendorDashboard from './pages/VendorDashboard'
import SupplierDashboard from './pages/SupplierDashboard'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user?.type !== requiredRole) {
    // Redirect to user's appropriate dashboard
    if (user?.type === 'vendor') {
      return <Navigate to="/home" replace />
    } else if (user?.type === 'supplier') {
      return <Navigate to="/supplier-dashboard" replace />
    } else {
      return <Navigate to="/home" replace />
    }
  }

  return children
}

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth()

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on user type
    if (user.type === 'vendor') {
      return <Navigate to="/home" replace />
    } else if (user.type === 'supplier') {
      return <Navigate to="/supplier-dashboard" replace />
    } else {
      return <Navigate to="/home" replace />
    }
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Landing Page - Role Selection (only for unauthenticated users) */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <RoleSelection />
                </PublicRoute>
              }
            />

            {/* Authentication Routes (only for unauthenticated users) */}
            <Route
              path="/auth/vendor"
              element={
                <PublicRoute>
                  <VendorAuth />
                </PublicRoute>
              }
            />

            <Route
              path="/auth/supplier"
              element={
                <PublicRoute>
                  <SupplierAuth />
                </PublicRoute>
              }
            />

            {/* Home Page - Vendor Voice Ordering (vendor-only) */}
            <Route
              path="/home"
              element={
                <ProtectedRoute requiredRole="vendor">
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Voice Ordering - Alias for home */}
            <Route
              path="/voice-order"
              element={<Navigate to="/home" replace />}
            />

            {/* Protected Vendor Dashboard */}
            <Route
              path="/vendor-dashboard"
              element={
                <ProtectedRoute requiredRole="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Supplier Dashboard */}
            <Route
              path="/supplier-dashboard"
              element={
                <ProtectedRoute requiredRole="supplier">
                  <SupplierDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legacy Auth Routes - Redirect to new routes */}
            <Route
              path="/vendor-auth"
              element={<Navigate to="/auth/vendor" replace />}
            />

            <Route
              path="/supplier-auth"
              element={<Navigate to="/auth/supplier" replace />}
            />

            {/* Legacy Routes - Redirect to role selection */}
            <Route
              path="/vendor"
              element={<Navigate to="/auth/vendor" replace />}
            />

            <Route
              path="/supplier"
              element={<Navigate to="/auth/supplier" replace />}
            />

            {/* Fallback Route - Redirect to role selection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App