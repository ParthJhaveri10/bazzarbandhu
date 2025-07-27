import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Get all pools
router.get('/', async (req, res) => {
  try {
    const { data: pools, error } = await supabase
      .from('pools')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      data: pools
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get pool by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
      .populate('orders')
      .populate('supplierId')
    
    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      })
    }

    res.json({
      success: true,
      data: pool
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create new pool
router.post('/', async (req, res) => {
  try {
    const pool = new Pool(req.body)
    await pool.save()

    // Emit real-time update
    if (req.app.locals.io) {
      req.app.locals.io.emitPoolUpdate(pool)
    }

    res.status(201).json({
      success: true,
      data: pool
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update pool
router.put('/:id', async (req, res) => {
  try {
    const pool = await Pool.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('orders').populate('supplierId')

    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      })
    }

    // Emit real-time update
    if (req.app.locals.io) {
      req.app.locals.io.emitPoolUpdate(pool)
    }

    res.json({
      success: true,
      data: pool
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update pool status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    
    if (!['collecting', 'ready', 'dispatched', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const updateData = { status }
    
    // Add timestamp for specific status changes
    if (status === 'dispatched') {
      updateData['dispatchDetails.dispatchedAt'] = new Date()
    } else if (status === 'delivered') {
      updateData['dispatchDetails.actualDelivery'] = new Date()
    }

    const pool = await Pool.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('orders')

    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      })
    }

    // Update all orders in the pool with the same status
    if (status === 'dispatched' || status === 'delivered') {
      await Order.updateMany(
        { poolId: pool._id },
        { status }
      )
    }

    // Emit real-time update
    if (req.app.locals.io) {
      req.app.locals.io.emitPoolUpdate(pool)
      
      // Notify vendors
      const orders = await Order.find({ poolId: pool._id })
      orders.forEach(order => {
        req.app.locals.io.to(`vendor_${order.vendorPhone}`).emit('vendorNotification', {
          type: status,
          message: `Your order status updated to: ${status}`,
          poolId: pool._id,
          orderId: order._id
        })
      })
    }

    res.json({
      success: true,
      data: pool
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Add order to pool
router.post('/:id/orders', async (req, res) => {
  try {
    const { orderId } = req.body
    
    const pool = await Pool.findById(req.params.id)
    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Add order to pool
    await pool.addOrder(orderId, order.estimatedValue)
    
    // Update order with pool ID
    order.poolId = pool._id
    order.status = 'pooled'
    await order.save()

    // Emit real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emitPoolUpdate(pool)
      req.app.locals.io.emitOrderPooled(order, pool._id)
    }

    res.json({
      success: true,
      data: { pool, order }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Remove order from pool
router.delete('/:id/orders/:orderId', async (req, res) => {
  try {
    const { id: poolId, orderId } = req.params
    
    const pool = await Pool.findById(poolId)
    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Remove order from pool
    await pool.removeOrder(orderId, order.estimatedValue)
    
    // Update order
    order.poolId = null
    order.status = 'pending'
    await order.save()

    // Emit real-time updates
    if (req.app.locals.io) {
      req.app.locals.io.emitPoolUpdate(pool)
      req.app.locals.io.emitOrderUpdate(order)
    }

    res.json({
      success: true,
      data: { pool, order }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Get ready pools (for suppliers)
router.get('/status/ready', async (req, res) => {
  try {
    const pools = await Pool.findReadyPools()
    
    res.json({
      success: true,
      data: pools
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get pools by location
router.get('/location/:city/:area?', async (req, res) => {
  try {
    const { city, area } = req.params
    const pools = await Pool.findByLocation(city, area)
      .populate('orders')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: pools
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get pool statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Pool.getStats()
    
    const totalPools = await Pool.countDocuments()
    const totalValue = await Pool.aggregate([
      { $group: { _id: null, total: { $sum: '$totalValue' } } }
    ])

    const readyPools = await Pool.countDocuments({ status: 'ready' })

    res.json({
      success: true,
      data: {
        totalPools,
        readyPools,
        totalValue: totalValue[0]?.total || 0,
        statusBreakdown: stats
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Delete pool
router.delete('/:id', async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
    
    if (!pool) {
      return res.status(404).json({
        success: false,
        error: 'Pool not found'
      })
    }

    // Update all orders in the pool to remove pool reference
    await Order.updateMany(
      { poolId: pool._id },
      { $unset: { poolId: 1 }, status: 'pending' }
    )

    await pool.deleteOne()

    res.json({
      success: true,
      message: 'Pool deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
