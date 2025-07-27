import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore } from '../store/orderStore'
import { useAuthStore } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import {
  Package,
  CheckCircle,
  MapPin,
  Phone,
  Home,
  LogOut,
  User,
  Truck
} from 'lucide-react'

const SupplierDashboard = () => {
  const { orders, fetchSupplierOrders, updateOrderStatus } = useOrderStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')

  // Filter orders based on active tab
  const filteredOrders = orders?.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending'
    if (activeTab === 'accepted') return order.status === 'accepted' || order.status === 'processing'
    if (activeTab === 'completed') return order.status === 'completed'
    return true
  }) || []

  // Handle order status update
  const handleAcceptOrder = async (orderId) => {
    try {
      const result = await updateOrderStatus(orderId, 'accepted', 'Order accepted by supplier')
      if (result.success) {
        // Refresh orders to get latest data
        fetchSupplierOrders()
      }
    } catch (error) {
      console.error('Error accepting order:', error)
    }
  }

  const handleCompleteOrder = async (orderId) => {
    try {
      const result = await updateOrderStatus(orderId, 'completed', 'Order completed and delivered')
      if (result.success) {
        fetchSupplierOrders()
      }
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  // Navigation functions
  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleGoHome = () => {
    navigate('/home')
  }

  useEffect(() => {
    // Redirect to login if not authenticated or not a supplier
    if (!isAuthenticated || !user) {
      navigate('/supplier-auth', { replace: true })
      return
    }

    if (user.type !== 'supplier') {
      navigate('/', { replace: true })
      return
    }

    // Fetch supplier orders
    fetchSupplierOrders()
  }, [isAuthenticated, user, navigate, fetchSupplierOrders])

  // Loading state while checking authentication
  if (!isAuthenticated || !user || user.type !== 'supplier') {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Loading...
          </h2>
          <p className="text-gray-600 text-center">
            Checking authentication status
          </p>
        </div>
      </div>
    )
  }

  // For suppliers, we show orders from vendors in their pincode area
  const availableOrders = (orders || []).filter(order =>
    order.status === 'pending' || order.status === 'processing'
  )

  const completedOrders = (orders || []).filter(order =>
    order.status === 'completed' || order.status === 'delivered'
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">BazzarBandhu</span>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Supplier
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoHome}
                className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </button>

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mb-4">
            Here are the orders from vendors in your pincode area ({user.pincode || 'N/A'})
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.filter(o => o.status === 'pending').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.filter(o => o.status === 'accepted' || o.status === 'processing').length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders?.filter(o => o.status === 'completed').length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'pending', label: 'Pending Orders', count: orders?.filter(o => o.status === 'pending').length || 0 },
                { id: 'accepted', label: 'Accepted Orders', count: orders?.filter(o => o.status === 'accepted' || o.status === 'processing').length || 0 },
                { id: 'completed', label: 'Completed Orders', count: orders?.filter(o => o.status === 'completed').length || 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Your Pincode</p>
                <p className="text-2xl font-bold text-gray-900">{user?.pincode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Orders from Vendors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Orders from Your Area</h2>

          {(orders?.length || 0) === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders available</h3>
              <p className="text-gray-600">Orders from vendors in your pincode area will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(orders || []).map((order) => {
                return (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id?.slice(-6) || 'N/A'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>Vendor: {order.vendorPhone || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>Status: {order.status || 'pending'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {order.currency || '₹'}{order.total || 0}
                        </div>
                        <div className={`text-sm px-2 py-1 rounded-full inline-block ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {order.status || 'pending'}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium">{String(item.quantity || '')} {String(item.unit || '')} {String(item.item || '')}</span>
                              {item.price_per_unit && (
                                <span className="text-gray-600 ml-2">@ ₹{String(item.price_per_unit)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Transcript */}
                    {order.transcript && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Original Request:</h4>
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded">
                          "{order.transcript}"
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1 text-sm flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept Order
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierDashboard
