import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'

const RouteDebugger = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">🔍 Route Debug</h4>
      <div className="space-y-1">
        <div><strong>Path:</strong> {location.pathname}</div>
        <div><strong>Auth:</strong> {isAuthenticated ? '✅' : '❌'}</div>
        <div><strong>User:</strong> {user ? '✅' : '❌'}</div>
        {user && (
          <>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </>
        )}
      </div>
    </div>
  )
}

export default RouteDebugger
