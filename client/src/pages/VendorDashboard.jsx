import { useState, useEffect } from 'react'
import { useOrderStore } from '../store/orderStore'
import { useSocket } from '../hooks/useSocket'
import { useLanguage } from '../context/LanguageContext'
import VoiceRecorder from '../components/VoiceRecorder'
import { Package, Clock, CheckCircle, Phone, MapPin, Calendar } from 'lucide-react'

const VendorDashboard = () => {
  const [vendorPhone, setVendorPhone] = useState('')
  const [showOrderForm, setShowOrderForm] = useState(false)
  const { orders, getOrdersByVendor } = useOrderStore()
  const { joinVendorRoom, leaveVendorRoom } = useSocket()
  const { t } = useLanguage()

  const vendorOrders = vendorPhone ? getOrdersByVendor(vendorPhone) : []

  useEffect(() => {
    // Load saved vendor phone from localStorage
    const savedPhone = localStorage.getItem('vendorPhone')
    if (savedPhone) {
      setVendorPhone(savedPhone)
    }
  }, [])

  useEffect(() => {
    if (vendorPhone) {
      // Save to localStorage
      localStorage.setItem('vendorPhone', vendorPhone)
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

  if (!vendorPhone) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('welcomeVendor')}
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            {t('enterPhoneNumber')}
          </p>
          
          <div className="space-y-4">
            <input
              type="tel"
              value={vendorPhone}
              onChange={(e) => setVendorPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="input w-full"
              required
            />
            
            <button
              onClick={() => vendorPhone && setShowOrderForm(true)}
              disabled={!vendorPhone.trim()}
              className="btn btn-primary w-full"
            >
              {t('continueToDashboard')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('vendorDashboard')}</h1>
          <div className="flex items-center text-gray-600 mt-2">
            <Phone className="w-4 h-4 mr-2" />
            <span>{vendorPhone}</span>
          </div>
        </div>
        
        <button
          onClick={() => setShowOrderForm(true)}
          className="btn btn-primary"
        >
          {t('newOrder')}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalOrders')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('pooled')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('delivered')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {vendorOrders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('recentOrders')}</h2>
        
        {vendorOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrdersYet')}</h3>
            <p className="text-gray-600 mb-6">{t('startFirstOrder')}</p>
            <button
              onClick={() => setShowOrderForm(true)}
              className="btn btn-primary"
            >
              {t('placeFirstOrder')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vendorOrders
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
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
    </div>
  )
}

export default VendorDashboard
