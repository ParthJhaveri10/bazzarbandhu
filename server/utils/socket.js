import { supabase } from '../config/supabase.js'

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join vendor room for personalized updates
    socket.on('joinVendor', ({ vendorPhone }) => {
      socket.join(`vendor_${vendorPhone}`)
      console.log(`Vendor ${vendorPhone} joined room`)
    })

    // Join supplier room
    socket.on('joinSupplier', ({ supplierId }) => {
      socket.join(`supplier_${supplierId}`)
      console.log(`Supplier ${supplierId} joined room`)
    })

    // Join location room for area-specific updates
    socket.on('joinLocation', ({ location }) => {
      const locationRoom = `location_${location.replace(/\s+/g, '_').toLowerCase()}`
      socket.join(locationRoom)
      console.log(`Joined location room: ${locationRoom}`)
    })

    // Leave rooms
    socket.on('leaveVendor', ({ vendorPhone }) => {
      socket.leave(`vendor_${vendorPhone}`)
    })

    socket.on('leaveSupplier', ({ supplierId }) => {
      socket.leave(`supplier_${supplierId}`)
    })

    socket.on('leaveLocation', ({ location }) => {
      const locationRoom = `location_${location.replace(/\s+/g, '_').toLowerCase()}`
      socket.leave(locationRoom)
    })

    // Handle pool dispatch
    socket.on('poolDispatched', async ({ poolId, supplierId, orders }) => {
      try {
        // Update pool status
        await Pool.findByIdAndUpdate(poolId, { 
          status: 'dispatched',
          'dispatchDetails.dispatchedAt': new Date()
        })

        // Notify all vendors in the pool
        orders.forEach(order => {
          socket.to(`vendor_${order.vendorPhone}`).emit('vendorNotification', {
            type: 'dispatched',
            message: `Your order has been dispatched! Pool #${poolId.slice(-6)}`,
            orderId: order._id,
            poolId
          })
        })

        // Notify location room
        const locationRoom = `location_${orders[0]?.location?.address?.replace(/\s+/g, '_').toLowerCase()}`
        socket.to(locationRoom).emit('poolUpdate', {
          poolId,
          status: 'dispatched',
          dispatchedAt: new Date()
        })

        console.log(`Pool ${poolId} dispatched by supplier ${supplierId}`)
      } catch (error) {
        console.error('Error handling pool dispatch:', error)
      }
    })

    // Handle delivery completion
    socket.on('poolDelivered', async ({ poolId, supplierId, orders }) => {
      try {
        // Update pool status
        await Pool.findByIdAndUpdate(poolId, { 
          status: 'delivered',
          'dispatchDetails.actualDelivery': new Date()
        })

        // Notify all vendors in the pool
        orders.forEach(order => {
          socket.to(`vendor_${order.vendorPhone}`).emit('vendorNotification', {
            type: 'delivered',
            message: `Your order has been delivered! Pool #${poolId.slice(-6)}`,
            orderId: order._id,
            poolId
          })
        })

        console.log(`Pool ${poolId} delivered by supplier ${supplierId}`)
      } catch (error) {
        console.error('Error handling delivery completion:', error)
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })

  // Helper functions to emit events from route handlers
  io.emitOrderUpdate = (order) => {
    // Emit to vendor
    io.to(`vendor_${order.vendorPhone}`).emit('orderUpdate', order)
    
    // Emit to location room
    if (order.location?.address) {
      const locationRoom = `location_${order.location.address.replace(/\s+/g, '_').toLowerCase()}`
      io.to(locationRoom).emit('orderUpdate', order)
    }
  }

  io.emitPoolUpdate = (pool) => {
    // Emit to all connected clients
    io.emit('poolUpdate', pool)
    
    // Emit to location room
    if (pool.location?.address) {
      const locationRoom = `location_${pool.location.address.replace(/\s+/g, '_').toLowerCase()}`
      io.to(locationRoom).emit('poolUpdate', pool)
    }
  }

  io.emitOrderPooled = (order, poolId) => {
    // Notify vendor
    io.to(`vendor_${order.vendorPhone}`).emit('orderPooled', {
      orderId: order._id,
      poolId,
      message: `Your order has been pooled for efficient delivery!`
    })
  }

  io.emitPoolReady = (pool) => {
    // Notify suppliers in the area
    io.emit('poolReady', {
      poolId: pool._id,
      pool,
      message: `Pool ${pool._id.slice(-6)} is ready for dispatch!`
    })
  }

  return io
}
