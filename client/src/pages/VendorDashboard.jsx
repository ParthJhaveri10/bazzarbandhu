import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore } from '../store/orderStore'
import { useSocket } from '../hooks/useSocket'
import { useLanguage } from '../context/LanguageContext'
import { useAuthStore } from '../store/authStore'
import VoiceRecorder from '../components/VoiceRecorder'
import {
  Package,
  Clock,
  CheckCircle,
  Phone,
  MapPin,
  Calendar,
  User,
  Store,
  Mail,
  Star,
  Edit,
  Settings,
  LogOut
} from 'lucide-react'

const VendorDashboard = () => {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const { orders, getOrdersByVendor } = useOrderStore()
  const { joinVendorRoom, leaveVendorRoom } = useSocket()
  const { t } = useLanguage()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Use authenticated vendor's phone from user object
  const vendorPhone = user?.phone || ''
  const vendorOrders = vendorPhone ? getOrdersByVendor(vendorPhone) : []

  useEffect(() => {
    if (vendorPhone) {
      // Join vendor room for real-time updates
      joinVendorRoom(vendorPhone)

      return () => {
        leaveVendorRoom(vendorPhone)
      }
    }
  }, [vendorPhone, joinVendorRoom, leaveVendorRoom])

  const handleOrderCreated = (orderData) => {
    setShowOrderForm(false)
    // Refresh orders or handle success
  }

  const handleLogout = () => {
    logout()
    // Navigation will be handled by the ProtectedRoute component
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'pooled':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'pooled':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // If no user is authenticated, this shouldn't happen due to ProtectedRoute
  // but keeping as fallback
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Vendor Profile Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary-600" />
              )}
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {user.status}
                </span>
                {user.isVerified && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Store className="w-4 h-4 mr-2" />
                  <span>{user.businessName}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Vendor ID: {user.vendorId}</span>
                </div>
                {user.address && (
                  <div className="flex items-start md:col-span-2">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                )}
                <div className="flex items-center md:col-span-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Member since {formatDate(user.createdAt)}</span>
                  {user.lastLogin && (
                    <span className="ml-4">
                      • Last login: {formatDate(user.lastLogin)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              {user.rating > 0 && (
                <div className="flex items-center mt-3">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.rating.toFixed(1)} rating
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({user.totalOrders} orders completed)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowProfileEdit(true)}
              className="btn btn-secondary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/home')}
              className="btn btn-primary flex items-center"
            >
              <Package className="w-4 h-4 mr-2" />
              + New Order
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{vendorOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorOrders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pooled</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorOrders.filter(o => o.status === 'pooled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorOrders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <span className="text-sm text-gray-500">
            Showing orders for {user.businessName}
          </span>
        </div>

        {vendorOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start by placing your first order</p>
            <button
              onClick={() => navigate('/home')}
              className="btn btn-primary"
            >
              Place Your First Order
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vendorOrders
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 10) // Show only recent 10 orders
              .map((order, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(order.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.estimatedValue)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-gray-900 mb-2">Items Ordered:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items?.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-gray-50 p-2 rounded">
                          <span className="font-medium">{item.quantity} {item.unit}</span>
                          <span className="ml-2">{item.item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.location?.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{order.location.address}</span>
                    </div>
                  )}

                  {order.poolId && (
                    <div className="mt-2 text-sm text-blue-600">
                      Pooled with order ID: {order.poolId.slice(-6)}
                    </div>
                  )}
                </div>
              ))}

            {vendorOrders.length > 10 && (
              <div className="text-center pt-4">
                <button className="btn btn-secondary">
                  View All Orders ({vendorOrders.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Place New Order</h2>
              <button
                onClick={() => setShowOrderForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <VoiceRecorder
                onOrderCreated={handleOrderCreated}
                defaultPhone={vendorPhone}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowProfileEdit(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="text-center text-gray-500">
                Profile editing functionality coming soon...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorDashboard