import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

          const response = await fetch('/api/voice/process', {
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
