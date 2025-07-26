import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useOrderStore } from '../store/orderStore'
import toast from 'react-hot-toast'

export const useSocket = () => {
  const socketRef = useRef(null)
  const { handleRealtimeUpdate } = useOrderStore()

  const initializeSocket = () => {
    // Don't initialize if already connected
    if (socketRef.current?.connected) {
      return socketRef.current
    }

    try {
      socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        autoConnect: true,
      })

      socketRef.current.on('connect', () => {
        console.log('Connected to server')
        toast.success('Connected to real-time updates')
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason)
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect
          socketRef.current.connect()
        }
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error)
        toast.error('Failed to connect to server')
      })

      // Real-time order updates
      socketRef.current.on('orderUpdate', (data) => {
        console.log('Order update received:', data)
        handleRealtimeUpdate({
          type: 'ORDER_CREATED',
          payload: data
        })
      })

      // Real-time pool updates
      socketRef.current.on('poolUpdate', (data) => {
        console.log('Pool update received:', data)
        handleRealtimeUpdate({
          type: 'POOL_UPDATED',
          payload: data
        })
      })

      // Order pooled notification
      socketRef.current.on('orderPooled', (data) => {
        console.log('Order pooled:', data)
        handleRealtimeUpdate({
          type: 'ORDER_POOLED',
          payload: data
        })
      })

      // Supplier notifications
      socketRef.current.on('supplierNotification', (data) => {
        console.log('Supplier notification:', data)
        toast.success(data.message)
      })

      // Pool ready notification
      socketRef.current.on('poolReady', (data) => {
        console.log('Pool ready for delivery:', data)
        toast.success(`Pool ${data.poolId} is ready for delivery!`)
        handleRealtimeUpdate({
          type: 'POOL_UPDATED',
          payload: { ...data.pool, status: 'ready' }
        })
      })

      // Vendor notifications
      socketRef.current.on('vendorNotification', (data) => {
        console.log('Vendor notification:', data)
        toast.info(data.message)
      })

    } catch (error) {
      console.error('Socket initialization error:', error)
      toast.error('Failed to initialize real-time connection')
    }

    return socketRef.current
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  const emitEvent = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  // Join specific rooms
  const joinVendorRoom = (vendorPhone) => {
    emitEvent('joinVendor', { vendorPhone })
  }

  const joinSupplierRoom = (supplierId) => {
    emitEvent('joinSupplier', { supplierId })
  }

  const joinLocationRoom = (location) => {
    emitEvent('joinLocation', { location })
  }

  // Leave rooms
  const leaveVendorRoom = (vendorPhone) => {
    emitEvent('leaveVendor', { vendorPhone })
  }

  const leaveSupplierRoom = (supplierId) => {
    emitEvent('leaveSupplier', { supplierId })
  }

  const leaveLocationRoom = (location) => {
    emitEvent('leaveLocation', { location })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket()
    }
  }, [])

  return {
    socket: socketRef.current,
    initializeSocket,
    disconnectSocket,
    emitEvent,
    joinVendorRoom,
    joinSupplierRoom,
    joinLocationRoom,
    leaveVendorRoom,
    leaveSupplierRoom,
    leaveLocationRoom,
    isConnected: socketRef.current?.connected || false
  }
}
