import express from 'express'
import Supplier from '../models/Supplier.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const {
      status = 'active',
      city,
      limit = 50,
      page = 1,
      sortBy = 'ratings.average',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (city) query['address.city'] = new RegExp(city, 'i')

    // Execute query with pagination
    const suppliers = await Supplier.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-paymentDetails.bankAccount') // Exclude sensitive data

    const total = await Supplier.countDocuments(query)

    res.json({
      success: true,
      data: suppliers,
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

// Get orders from vendors in the same pincode area
router.get('/orders', auth, async (req, res) => {
  try {
    console.log('🔍 Supplier orders request - User from token:', req.user)

    const userId = req.user?.id
    const userType = req.user?.type

    if (!userId || userType !== 'supplier') {
      return res.status(401).json({
        success: false,
        error: 'Supplier authentication required'
      })
    }

    // Get supplier details including pincode using the user ID
    const supplier = await Supplier.findById(userId)
    console.log('🔍 Found supplier:', supplier ? 'YES' : 'NO')

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    console.log('🔍 Supplier pincode:', supplier.pincode)

    // Import Order and Vendor models
    const Order = (await import('../models/Order.js')).default
    const Vendor = (await import('../models/Vendor.js')).default

    // Find vendors in the same pincode area
    const vendorsInArea = await Vendor.find({ pincode: supplier.pincode })
    console.log('🔍 Vendors in pincode area:', vendorsInArea.length)
    const vendorPhones = vendorsInArea.map(vendor => vendor.phone)

    // Find orders from these vendors
    const orders = await Order.find({
      vendorPhone: { $in: vendorPhones }
    }).sort({ createdAt: -1 })

    console.log('🔍 Found orders:', orders.length)

    res.json({
      success: true,
      data: orders,
      message: `Found ${orders.length} orders from your pincode area (${supplier.pincode})`
    })
  } catch (error) {
    console.error('Error fetching supplier orders:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .select('-paymentDetails.bankAccount') // Exclude sensitive data

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    res.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body)
    await supplier.save()

    // Remove sensitive data from response
    const supplierResponse = supplier.toObject()
    delete supplierResponse.paymentDetails?.bankAccount

    res.status(201).json({
      success: true,
      data: supplierResponse
    })
  } catch (error) {
    // Handle duplicate phone number
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Phone number already registered'
      })
    }

    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-paymentDetails.bankAccount')

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    res.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update supplier status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    if (!['active', 'inactive', 'suspended', 'pending_verification'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { status, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select('-paymentDetails.bankAccount')

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    res.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update supplier inventory
router.put('/:id/inventory', async (req, res) => {
  try {
    const { inventory } = req.body

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { inventory },
      { new: true, runValidators: true }
    ).select('-paymentDetails.bankAccount')

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    res.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Add item to inventory
router.post('/:id/inventory', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    supplier.inventory.push(req.body)
    await supplier.save()

    res.json({
      success: true,
      data: supplier.inventory
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Update inventory item availability
router.patch('/:id/inventory/:itemId', async (req, res) => {
  try {
    const { availability, price } = req.body

    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    const item = supplier.inventory.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      })
    }

    if (availability !== undefined) item.availability = availability
    if (price !== undefined) item.price = price

    await supplier.save()

    res.json({
      success: true,
      data: item
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Get suppliers by location
router.get('/location/:city/:area?', async (req, res) => {
  try {
    const { city, area } = req.params
    const suppliers = await Supplier.findByLocation(city, area)
      .select('-paymentDetails.bankAccount')

    res.json({
      success: true,
      data: suppliers
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get suppliers by items
router.post('/search/items', async (req, res) => {
  try {
    const { items } = req.body

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      })
    }

    const suppliers = await Supplier.findByItems(items)
      .select('-paymentDetails.bankAccount')

    res.json({
      success: true,
      data: suppliers
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Update supplier statistics
router.post('/:id/stats', async (req, res) => {
  try {
    const { orderValue, deliveryTime } = req.body

    const supplier = await Supplier.findById(req.params.id)
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    await supplier.updateStatistics(orderValue, deliveryTime)

    res.json({
      success: true,
      data: supplier.statistics
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Get supplier dashboard data
router.get('/:id/dashboard', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .select('-paymentDetails.bankAccount')

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    // Get additional dashboard data
    const Pool = (await import('../models/Pool.js')).default
    const Order = (await import('../models/Order.js')).default

    const activePools = await Pool.countDocuments({
      supplierId: supplier._id,
      status: { $in: ['collecting', 'ready'] }
    })

    const readyPools = await Pool.countDocuments({
      supplierId: supplier._id,
      status: 'ready'
    })

    const recentOrders = await Order.find({
      'location.city': supplier.address.city
    })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      success: true,
      data: {
        supplier,
        activePools,
        readyPools,
        recentOrders,
        isCurrentlyOpen: supplier.isCurrentlyOpen
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Verify supplier
router.post('/:id/verify', async (req, res) => {
  try {
    const { gstNumber, licenseNumber, verifiedBy } = req.body

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        'verificationStatus.isVerified': true,
        'verificationStatus.gstNumber': gstNumber,
        'verificationStatus.licenseNumber': licenseNumber,
        'verificationStatus.verifiedAt': new Date(),
        'verificationStatus.verifiedBy': verifiedBy,
        status: 'active'
      },
      { new: true, runValidators: true }
    ).select('-paymentDetails.bankAccount')

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    res.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
})

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)

    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Supplier not found'
      })
    }

    await supplier.deleteOne()

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
