import { useEffect, useState } from 'react'
import { useOrderStore } from '../store/orderStore'
import { Users, Package, Clock, CheckCircle } from 'lucide-react'

const OrderPool = () => {
  const { orders, pools, fetchPools } = useOrderStore()
  const [selectedPool, setSelectedPool] = useState(null)

  useEffect(() => {
    fetchPools()
  }, [])

  const getPoolStats = (pool) => {
    const poolOrders = orders.filter(order => order.poolId === pool._id)
    return {
      orderCount: poolOrders.length,
      totalValue: poolOrders.reduce((sum, order) => sum + (order.estimatedValue || 0), 0),
      vendors: new Set(poolOrders.map(order => order.vendorPhone)).size
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'collecting': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'dispatched': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'collecting': return <Clock className="w-4 h-4" />
      case 'ready': return <CheckCircle className="w-4 h-4" />
      case 'dispatched': return <Package className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order Pools</h1>
        <div className="text-sm text-gray-600">
          Real-time order pooling for efficient delivery
        </div>
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Pools</p>
              <p className="text-2xl font-bold text-gray-900">{pools.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ready Pools</p>
              <p className="text-2xl font-bold text-gray-900">
                {pools.filter(pool => pool.status === 'ready').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pool List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pools.map((pool) => {
          const stats = getPoolStats(pool)
          return (
            <div
              key={pool._id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPool(pool)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pool #{pool._id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600">{pool.location}</p>
                </div>
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pool.status)}`}>
                  {getStatusIcon(pool.status)}
                  <span>{pool.status}</span>
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

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Progress to minimum</span>
                  <span>{stats.orderCount}/{pool.threshold?.minOrders || 5}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (stats.orderCount / (pool.threshold?.minOrders || 5)) * 100)}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Last updated: {new Date(pool.updatedAt || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          )
        })}
      </div>

      {pools.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active pools</h3>
          <p className="text-gray-600">Order pools will appear here as vendors place orders</p>
        </div>
      )}

      {/* Selected Pool Modal - You can expand this */}
      {selectedPool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Pool Details</h2>
                <button
                  onClick={() => setSelectedPool(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pool Information</h3>
                  <p><strong>ID:</strong> {selectedPool._id}</p>
                  <p><strong>Location:</strong> {selectedPool.location}</p>
                  <p><strong>Status:</strong> {selectedPool.status}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Orders in this Pool</h3>
                  <div className="space-y-2">
                    {orders
                      .filter(order => order.poolId === selectedPool._id)
                      .map((order, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p><strong>Vendor:</strong> {order.vendorPhone}</p>
                          <p><strong>Items:</strong> {order.items?.map(item => `${item.quantity} ${item.item}`).join(', ')}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderPool
