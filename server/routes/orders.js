import express from 'express'
import Order from '../models/Order.js'
import Pool from '../models/Pool.js'

const router = express.Router()

// Get all orders
router.get('/', async (req, res) => {
  try {
    const {
      status,
      vendorPhone,
      limit = 50,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (vendorPhone) query.vendorPhone = vendorPhone

    // Execute query with pagination
    const orders = await Order.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('poolId')

    const total = await Order.countDocuments(query)

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('poolId')
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create new order
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body)
    await order.save()

    // Emit real-time update
    if (req.app.locals.io) {
      req.app.locals.io.emitOrderUpdate(order)
    }

    res.status(201).json({
      success: true,
      data: order
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const { status, supplierNotes, deliveryNotes } = req.body
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        supplierNotes, 
        deliveryNotes,
        ...(status === 'delivered' && { 'metadata.deliveredAt': new Date() })
      },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Emit real-time update
    if (req.app.locals.io) {
      req.app.locals.io.emitOrderUpdate(order)
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // If order is pooled, remove from pool
    if (order.poolId) {
      await Pool.findByIdAndUpdate(order.poolId, {
        $pull: { orders: order._id },
        $inc: { totalValue: -order.estimatedValue }
      })
    }

    await order.deleteOne()

    res.json({
      success: true,
      message: 'Order deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get orders by vendor
router.get('/vendor/:phone', async (req, res) => {
  try {
    const { phone } = req.params
    const { status, limit = 20 } = req.query

    const query = { vendorPhone: phone }
    if (status) query.status = status

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('poolId')

    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get order statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Order.getStats()
    
    const totalOrders = await Order.countDocuments()
    const totalValue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
    ])

    res.json({
      success: true,
      data: {
        totalOrders,
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

export default router
