import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Production API URL
const API_URL = 'https://bazzarbandhu.vercel.app/api'

const useOrderStore = create(
  persist(
    (set, get) => ({
      // State
      orders: [],
      currentOrder: null,
      orderHistory: [],
      isLoading: false,
      error: null,
      orderStatus: 'idle', // 'idle', 'recording', 'processing', 'completed', 'error'

      // Actions
      setOrders: (orders) => set({ orders }),
      
      setCurrentOrder: (order) => set({ currentOrder: order }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      setOrderStatus: (status) => set({ orderStatus: status }),
      
      clearError: () => set({ error: null }),

      // Order Management
      addOrder: (order) => {
        const orders = get().orders
        const newOrder = {
          id: `order-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'pending',
          ...order
        }
        set({ 
          orders: [newOrder, ...orders],
          currentOrder: newOrder
        })
        return newOrder
      },

      updateOrder: (orderId, updates) => {
        const orders = get().orders
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, ...updates } : order
        )
        set({ orders: updatedOrders })
        
        // Update current order if it's the one being updated
        const currentOrder = get().currentOrder
        if (currentOrder && currentOrder.id === orderId) {
          set({ currentOrder: { ...currentOrder, ...updates } })
        }
      },

      deleteOrder: (orderId) => {
        const orders = get().orders
        const filteredOrders = orders.filter(order => order.id !== orderId)
        set({ orders: filteredOrders })
        
        // Clear current order if it's the one being deleted
        const currentOrder = get().currentOrder
        if (currentOrder && currentOrder.id === orderId) {
          set({ currentOrder: null })
        }
      },

      // Voice Order Processing
      processVoiceOrder: async (audioData, language = 'auto') => {
        try {
          set({ isLoading: true, error: null, orderStatus: 'processing' })

          const formData = new FormData()
          formData.append('audio', audioData)
          formData.append('language', language)

          const API_URL = import.meta.env.VITE_API_URL || 'https://bazzarbandhu.vercel.app/api'
          const response = await fetch(`${API_URL}/voice/process`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
          }

          const result = await response.json()
          
          // Add the processed order
          const newOrder = get().addOrder({
            type: 'voice',
            originalAudio: audioData,
            transcription: result.transcription,
            processedOrder: result.order,
            language: result.detectedLanguage || language,
            confidence: result.confidence,
            status: 'completed'
          })

          set({ 
            isLoading: false, 
            orderStatus: 'completed',
            error: null
          })

          return { success: true, order: newOrder, result }
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false, 
            orderStatus: 'error' 
          })
          return { success: false, error: error.message }
        }
      },

      // Manual Order Creation
      createManualOrder: (orderData) => {
        const newOrder = get().addOrder({
          type: 'manual',
          ...orderData,
          status: 'pending'
        })
        return newOrder
      },

      // Fetch orders from API
      fetchOrders: async (vendorPhone) => {
        if (!vendorPhone) return

        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/voice/orders/${vendorPhone}`)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status}`)
          }
          
          const result = await response.json()
          
          if (result.success && result.data) {
            // Transform backend order format to match frontend
            const transformedOrders = result.data.map(order => ({
              id: order.id,
              orderId: order.id,
              vendorPhone: order.vendor_phone,
              items: order.items,
              transcript: order.transcript,
              confidence: order.confidence,
              totalEstimate: order.estimated_value,
              estimatedValue: order.estimated_value, // Add both for compatibility
              status: order.status,
              timestamp: order.created_at, // Use timestamp for dashboard compatibility
              createdAt: order.created_at,
              location: order.location || null, // Keep the location object as-is from database
              type: 'voice'
            }))
            
            console.log('📊 Transformed orders:', transformedOrders)
            
            set({ 
              orders: transformedOrders,
              isLoading: false,
              error: null
            })
          }
        } catch (error) {
          console.error('Error fetching orders:', error)
          set({ 
            error: error.message,
            isLoading: false
          })
        }
      },

      // Fetch orders for suppliers (all pending orders in the system)
      fetchSupplierOrders: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/voice/orders/supplier/pending`)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch supplier orders: ${response.status}`)
          }
          
          const result = await response.json()
          
          if (result.success && result.data) {
            // Transform backend order format to match frontend
            const transformedOrders = result.data.map(order => ({
              _id: order.id, // Use _id for compatibility with supplier dashboard
              id: order.id,
              orderId: order.id,
              vendorPhone: order.vendor_phone,
              items: order.items,
              transcript: order.transcript,
              confidence: order.confidence,
              total: order.estimated_value,
              estimatedValue: order.estimated_value,
              status: order.status,
              timestamp: order.created_at,
              createdAt: order.created_at,
              location: order.location || null,
              currency: '₹',
              type: 'voice'
            }))
            
            console.log('📊 Transformed supplier orders:', transformedOrders)
            
            set({ 
              orders: transformedOrders,
              isLoading: false,
              error: null
            })
          }
        } catch (error) {
          console.error('Error fetching supplier orders:', error)
          set({ 
            error: error.message,
            isLoading: false
          })
        }
      },

      // Order History
      moveToHistory: (orderId) => {
        const orders = get().orders
        const orderHistory = get().orderHistory
        
        const orderToMove = orders.find(order => order.id === orderId)
        if (orderToMove) {
          const updatedOrders = orders.filter(order => order.id !== orderId)
          const updatedHistory = [
            { ...orderToMove, completedAt: new Date().toISOString() },
            ...orderHistory
          ]
          
          set({ 
            orders: updatedOrders, 
            orderHistory: updatedHistory 
          })
        }
      },

      // Search and Filter
      searchOrders: (query) => {
        const orders = get().orders
        if (!query) return orders
        
        return orders.filter(order => 
          order.transcription?.toLowerCase().includes(query.toLowerCase()) ||
          order.processedOrder?.toLowerCase().includes(query.toLowerCase()) ||
          order.id.toLowerCase().includes(query.toLowerCase())
        )
      },

      filterOrdersByStatus: (status) => {
        const orders = get().orders
        return orders.filter(order => order.status === status)
      },

      // Get orders by vendor phone
      getOrdersByVendor: (vendorPhone) => {
        const orders = get().orders
        if (!vendorPhone) return []
        
        return orders.filter(order => 
          order.vendorPhone === vendorPhone || 
          order.vendor_phone === vendorPhone
        )
      },

      // Update order status
      updateOrderStatus: async (orderId, status, supplierNotes = null) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/voice/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              status, 
              supplier_notes: supplierNotes 
            })
          })
          
          if (!response.ok) {
            throw new Error(`Failed to update order: ${response.status}`)
          }
          
          const result = await response.json()
          
          if (result.success) {
            // Update the order in local state with the returned data
            const orders = get().orders
            const updatedOrders = orders.map(order => 
              order.id === orderId || order._id === orderId
                ? { 
                    ...order, 
                    status: result.data.status, // Use the status from response
                    supplier_notes: result.data.supplier_notes, 
                    updated_at: result.data.updated_at 
                  }
                : order
            )
            
            set({ 
              orders: updatedOrders,
              isLoading: false,
              error: null
            })
            
            return { success: true, data: result.data }
          } else {
            throw new Error(result.error || 'Failed to update order')
          }
        } catch (error) {
          console.error('Error updating order status:', error)
          set({ 
            error: error.message, 
            isLoading: false 
          })
          return { success: false, error: error.message }
        }
      },

      // Statistics
      getOrderStats: () => {
        const orders = get().orders
        const orderHistory = get().orderHistory
        
        return {
          total: orders.length + orderHistory.length,
          pending: orders.filter(o => o.status === 'pending').length,
          completed: orders.filter(o => o.status === 'completed').length + orderHistory.length,
          voice: orders.filter(o => o.type === 'voice').length,
          manual: orders.filter(o => o.type === 'manual').length,
        }
      },

      // Clear all data
      clearAllOrders: () => {
        set({
          orders: [],
          currentOrder: null,
          orderHistory: [],
          error: null,
          orderStatus: 'idle'
        })
      },

      // Reset state
      resetOrderState: () => {
        set({
          currentOrder: null,
          isLoading: false,
          error: null,
          orderStatus: 'idle'
        })
      }
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders,
        orderHistory: state.orderHistory,
      }),
    }
  )
)

export { useOrderStore }
