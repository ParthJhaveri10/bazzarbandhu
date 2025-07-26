import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useOrderStore = create(devtools((set, get) => ({
  // State
  orders: [],
  pools: [],
  suppliers: [],
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Orders
  addOrder: async (orderData) => {
    try {
      set({ loading: true })
      const response = await api.post('/orders', orderData)
      const newOrder = response.data
      
      set((state) => ({
        orders: [...state.orders, newOrder],
        loading: false
      }))
      
      toast.success('Order added successfully!')
      return newOrder
    } catch (error) {
      set({ error: error.message, loading: false })
      toast.error('Failed to add order')
      throw error
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true })
      const response = await api.get('/orders')
      set({ orders: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      console.error('Failed to fetch orders:', error)
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, { status })
      const updatedOrder = response.data
      
      set((state) => ({
        orders: state.orders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      }))
      
      toast.success('Order status updated')
      return updatedOrder
    } catch (error) {
      set({ error: error.message })
      toast.error('Failed to update order status')
      throw error
    }
  },

  // Pools
  fetchPools: async () => {
    try {
      set({ loading: true })
      const response = await api.get('/pools')
      set({ pools: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      console.error('Failed to fetch pools:', error)
    }
  },

  updatePool: (poolData) => {
    set((state) => ({
      pools: state.pools.map(pool => 
        pool._id === poolData._id ? { ...pool, ...poolData } : pool
      )
    }))
  },

  // Suppliers
  fetchSuppliers: async () => {
    try {
      const response = await api.get('/suppliers')
      set({ suppliers: response.data })
    } catch (error) {
      set({ error: error.message })
      console.error('Failed to fetch suppliers:', error)
    }
  },

  addSupplier: async (supplierData) => {
    try {
      const response = await api.post('/suppliers', supplierData)
      const newSupplier = response.data
      
      set((state) => ({
        suppliers: [...state.suppliers, newSupplier]
      }))
      
      toast.success('Supplier added successfully!')
      return newSupplier
    } catch (error) {
      set({ error: error.message })
      toast.error('Failed to add supplier')
      throw error
    }
  },

  // Real-time updates
  handleRealtimeUpdate: (data) => {
    const { type, payload } = data
    
    switch (type) {
      case 'ORDER_CREATED':
        set((state) => ({
          orders: [...state.orders, payload]
        }))
        toast.success('New order received!')
        break
        
      case 'POOL_UPDATED':
        set((state) => ({
          pools: state.pools.map(pool => 
            pool._id === payload._id ? { ...pool, ...payload } : pool
          )
        }))
        break
        
      case 'ORDER_POOLED':
        set((state) => ({
          orders: state.orders.map(order => 
            order._id === payload.orderId 
              ? { ...order, poolId: payload.poolId, status: 'pooled' }
              : order
          )
        }))
        toast.success('Order has been pooled for delivery!')
        break
        
      default:
        console.log('Unknown real-time update type:', type)
    }
  },

  // Utility functions
  getOrdersByStatus: (status) => {
    const { orders } = get()
    return orders.filter(order => order.status === status)
  },

  getOrdersByVendor: (vendorPhone) => {
    const { orders } = get()
    return orders.filter(order => order.vendorPhone === vendorPhone)
  },

  getPoolsByStatus: (status) => {
    const { pools } = get()
    return pools.filter(pool => pool.status === status)
  },

  // Clear functions
  clearOrders: () => set({ orders: [] }),
  clearPools: () => set({ pools: [] }),
  clearError: () => set({ error: null }),
})))

export { useOrderStore }
