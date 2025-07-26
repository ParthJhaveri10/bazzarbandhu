import { useState, useEffect } from 'react'
import { useOrderStore } from '../store/orderStore'
import { useSocket } from '../hooks/useSocket'
import { useLanguage } from '../context/LanguageContext'
import { 
  Package, 
  Users, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Send,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const SupplierDashboard = () => {
  const [supplierId, setSupplierId] = useState('')
  const [selectedPool, setSelectedPool] = useState(null)
  const [deliveryStatus, setDeliveryStatus] = useState({})
  
  const { pools, orders, fetchPools, updateOrderStatus } = useOrderStore()
  const { joinSupplierRoom, leaveSupplierRoom, emitEvent } = useSocket()
  const { t } = useLanguage()

  useEffect(() => {
    // Load saved supplier ID from localStorage
    const savedSupplierId = localStorage.getItem('supplierId')
    if (savedSupplierId) {
      setSupplierId(savedSupplierId)
    }
    
    fetchPools()
  }, [])

  useEffect(() => {
    if (supplierId) {
      // Save to localStorage
      localStorage.setItem('supplierId', supplierId)
      // Join supplier room for real-time updates
      joinSupplierRoom(supplierId)
      
      return () => {
        leaveSupplierRoom(supplierId)
      }
    }
  }, [supplierId, joinSupplierRoom, leaveSupplierRoom])

  const getPoolOrders = (poolId) => {
    return orders.filter(order => order.poolId === poolId)
  }

  const getPoolStats = (pool) => {
    const poolOrders = getPoolOrders(pool._id)
    return {
      orderCount: poolOrders.length,
      totalValue: poolOrders.reduce((sum, order) => sum + (order.estimatedValue || 0), 0),
      vendors: new Set(poolOrders.map(order => order.vendorPhone)).size,
      readyForDispatch: pool.status === 'ready' || poolOrders.length >= (pool.threshold?.minOrders || 5)
    }
  }

  const handleDispatchPool = async (pool) => {
    try {
      const poolOrders = getPoolOrders(pool._id)
      
      // Update all orders in the pool to 'dispatched'
      for (const order of poolOrders) {
        await updateOrderStatus(order._id, 'dispatched')
      }
      
      // Emit real-time event
      emitEvent('poolDispatched', {
        poolId: pool._id,
        supplierId,
        orders: poolOrders
      })
      
      toast.success(`Pool ${pool._id.slice(-6)} dispatched successfully!`)
      
      // Update local delivery status
      setDeliveryStatus(prev => ({
        ...prev,
        [pool._id]: 'dispatched'
      }))
      
    } catch (error) {
      toast.error('Failed to dispatch pool')
      console.error('Dispatch error:', error)
    }
  }

  const handleCompleteDelivery = async (pool) => {
    try {
      const poolOrders = getPoolOrders(pool._id)
      
      // Update all orders in the pool to 'delivered'
      for (const order of poolOrders) {
        await updateOrderStatus(order._id, 'delivered')
      }
      
      // Emit real-time event
      emitEvent('poolDelivered', {
        poolId: pool._id,
        supplierId,
        orders: poolOrders
      })
      
      toast.success(`Delivery completed for pool ${pool._id.slice(-6)}!`)
      
      // Update local delivery status
      setDeliveryStatus(prev => ({
        ...prev,
        [pool._id]: 'delivered'
      }))
      
    } catch (error) {
      toast.error('Failed to complete delivery')
      console.error('Delivery completion error:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'collecting': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'dispatched': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'collecting': return <Clock className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'dispatched': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (!supplierId) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Welcome, Supplier!
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            Enter your supplier ID to access your delivery dashboard
          </p>
          
          <div className="space-y-4">
            <input
              type="text"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="Enter Supplier ID"
              className="input w-full"
              required
            />
            
            <button
              onClick={() => supplierId && fetchPools()}
              disabled={!supplierId.trim()}
              className="btn btn-primary w-full"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const readyPools = pools.filter(pool => {
    const stats = getPoolStats(pool)
    return stats.readyForDispatch
  })

  const dispatchedPools = pools.filter(pool => 
    deliveryStatus[pool._id] === 'dispatched' || pool.status === 'dispatched'
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-gray-600 mt-2">Supplier ID: {supplierId}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Ready for Dispatch</p>
            <p className="text-2xl font-bold text-green-600">{readyPools.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Total Pools</p>
              <p className="text-2xl font-bold text-gray-900">{pools.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready</p>
              <p className="text-2xl font-bold text-gray-900">{readyPools.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dispatched</p>
              <p className="text-2xl font-bold text-gray-900">{dispatchedPools.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">
                {pools.reduce((sum, pool) => sum + getPoolStats(pool).vendors, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ready for Dispatch Section */}
      {readyPools.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ready for Dispatch</h2>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {readyPools.length} pools ready
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {readyPools.map((pool) => {
              const stats = getPoolStats(pool)
              const poolOrders = getPoolOrders(pool._id)
              
              return (
                <div key={pool._id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pool #{pool._id.slice(-6)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{pool.location}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('ready')}`}>
                      <CheckCircle className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600">{stats.orderCount}</p>
                      <p className="text-xs text-gray-500">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent-600">{stats.vendors}</p>
                      <p className="text-xs text-gray-500">Vendors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(stats.totalValue)}
                      </p>
                      <p className="text-xs text-gray-500">Value</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900">Vendor Contacts:</h4>
                    {poolOrders.slice(0, 3).map((order, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{order.vendorPhone}</span>
                        </div>
                        <span className="text-gray-500">
                          {order.items?.length} items
                        </span>
                      </div>
                    ))}
                    {poolOrders.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{poolOrders.length - 3} more vendors
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPool(pool)}
                      className="btn btn-secondary flex-1 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDispatchPool(pool)}
                      className="btn btn-primary flex-1 text-sm"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Dispatch
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Pools */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Pools</h2>
        
        {pools.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pools available</h3>
            <p className="text-gray-600">Pools will appear here as vendors place orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pools.map((pool) => {
              const stats = getPoolStats(pool)
              const currentStatus = deliveryStatus[pool._id] || pool.status
              
              return (
                <div key={pool._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pool #{pool._id.slice(-6)}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{pool.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                        {getStatusIcon(currentStatus)}
                        <span>{currentStatus}</span>
                      </span>
                      
                      {stats.readyForDispatch && currentStatus === 'collecting' && (
                        <AlertCircle className="w-5 h-5 text-green-600" title="Ready for dispatch" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary-600">{stats.orderCount}</p>
                      <p className="text-xs text-gray-500">Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-accent-600">{stats.vendors}</p>
                      <p className="text-xs text-gray-500">Vendors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(stats.totalValue)}
                      </p>
                      <p className="text-xs text-gray-500">Value</p>
                    </div>
                    <div className="text-center">
                      <div className="flex justify-end space-x-2">
                        {currentStatus === 'collecting' && stats.readyForDispatch && (
                          <button
                            onClick={() => handleDispatchPool(pool)}
                            className="btn btn-primary text-xs px-2 py-1"
                          >
                            Dispatch
                          </button>
                        )}
                        
                        {currentStatus === 'dispatched' && (
                          <button
                            onClick={() => handleCompleteDelivery(pool)}
                            className="btn btn-accent text-xs px-2 py-1"
                          >
                            Complete
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedPool(pool)}
                          className="btn btn-secondary text-xs px-2 py-1"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pool Details Modal */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Pool #{selectedPool._id.slice(-6)} Details</h2>
              <button
                onClick={() => setSelectedPool(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Pool Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Pool ID</p>
                    <p className="font-medium">{selectedPool._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{selectedPool.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{deliveryStatus[selectedPool._id] || selectedPool.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="font-medium">{formatCurrency(getPoolStats(selectedPool).totalValue)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Orders in this Pool</h3>
                <div className="space-y-3">
                  {getPoolOrders(selectedPool._id).map((order, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{order.vendorPhone}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(order.estimatedValue)}</p>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 mb-1">Items:</p>
                        <div className="grid grid-cols-2 gap-1">
                          {order.items?.map((item, itemIndex) => (
                            <span key={itemIndex} className="text-sm bg-white p-1 rounded">
                              {item.quantity} {item.unit} {item.item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplierDashboard
