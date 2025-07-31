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
            processVoiceOrder: async (audioData, language = 'auto', vendorPhone = null, location = null) => {
                try {
                    set({ isLoading: true, error: null, orderStatus: 'processing' })

                    console.log('🎤 Processing voice order locally...')
                    
                    // Mock processing for demo (replace with actual processing later)
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    
                    // Create mock order data
                    const mockOrder = {
                        id: `order-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        status: 'pending',
                        vendorPhone: vendorPhone || '+919876543210',
                        location: location || 'Mumbai, Maharashtra',
                        items: [
                            { name: 'Rice', quantity: '2 kg', price: 120 },
                            { name: 'Dal', quantity: '1 kg', price: 80 }
                        ],
                        total: 200,
                        transcript: 'I need 2 kg rice and 1 kg dal'
                    }
                    
                    console.log('✅ Voice order processed successfully:', mockOrder)
                    
                    set({ 
                        isLoading: false, 
                        orderStatus: 'completed',
                        currentOrder: mockOrder,
                        error: null
                    })
                    
                    return {
                        success: true,
                        transcript: mockOrder.transcript,
                        orderData: mockOrder
                    }
                } catch (error) {
                    console.error('❌ Voice order processing failed:', error)
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

            // Fetch orders (mock data - no CORS issues)
            fetchOrders: async (vendorPhone) => {
                if (!vendorPhone) return

                set({ isLoading: true, error: null })

                try {
                    // Mock delay
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                    // Mock orders data
                    const mockOrders = [
                        {
                            id: 'order-1',
                            timestamp: new Date().toISOString(),
                            status: 'pending',
                            vendorPhone: vendorPhone,
                            items: [
                                { name: 'Rice', quantity: '2 kg', price: 120 },
                                { name: 'Dal', quantity: '1 kg', price: 80 }
                            ],
                            total: 200,
                            transcript: 'I need 2 kg rice and 1 kg dal'
                        }
                    ]

                    set({ 
                        orders: mockOrders,
                        isLoading: false,
                        error: null
                    })
                } catch (error) {
                    console.error('Error fetching orders:', error)
                    set({
                        error: error.message,
                        isLoading: false
                    })
                }
            },

            // Fetch orders for suppliers (mock data - no CORS issues)
            fetchSupplierOrders: async () => {
                set({ isLoading: true, error: null })

                try {
                    // Mock delay
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    
                    // Mock supplier orders data
                    const mockSupplierOrders = [
                        {
                            id: 'order-1',
                            vendorPhone: '+919876543210',
                            items: [
                                { name: 'Rice', quantity: '2 kg', price: 120 },
                                { name: 'Dal', quantity: '1 kg', price: 80 }
                            ],
                            total: 200,
                            status: 'pending',
                            timestamp: new Date().toISOString()
                        }
                    ]

                    set({ 
                        orders: mockSupplierOrders,
                        isLoading: false,
                        error: null
                    })
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

            // Update order status (local update - no CORS issues)
            updateOrderStatus: async (orderId, status, supplierNotes = null) => {
                set({ isLoading: true, error: null })

                try {
                    // Mock delay
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    // Update the order in local state
                    const orders = get().orders
                    const updatedOrders = orders.map(order =>
                        order.id === orderId || order._id === orderId
                            ? {
                                ...order,
                                status: status,
                                supplier_notes: supplierNotes,
                                updated_at: new Date().toISOString()
                            }
                            : order
                    )

                    set({
                        orders: updatedOrders,
                        isLoading: false,
                        error: null
                    })

                    return { success: true, data: { status, supplier_notes: supplierNotes } }
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
