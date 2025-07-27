import mongoose from 'mongoose'

const poolSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    default: null
  },
  
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: String,
      trim: true
    },
    radius: {
      type: Number,
      default: 2 // km radius for pooling
    }
  },
  
  status: {
    type: String,
    enum: ['collecting', 'ready', 'dispatched', 'delivered', 'cancelled'],
    default: 'collecting'
  },
  
  threshold: {
    minOrders: {
      type: Number,
      default: 5
    },
    minValue: {
      type: Number,
      default: 1000
    },
    maxWaitTime: {
      type: Number,
      default: 120 // minutes
    }
  },
  
  totalValue: {
    type: Number,
    default: 0
  },
  
  deliverySlot: {
    preferredTime: Date,
    actualTime: Date,
    estimatedDuration: Number // minutes
  },
  
  vendorNotifications: [{
    vendorPhone: String,
    notificationSent: Boolean,
    sentAt: Date,
    type: String // 'pooled', 'dispatched', 'delivered'
  }],
  
  supplierNotes: {
    type: String,
    trim: true
  },
  
  dispatchDetails: {
    dispatchedAt: Date,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryPersonName: String,
    deliveryPersonPhone: String,
    vehicleNumber: String
  },
  
  paymentDetails: {
    totalAmount: Number,
    paymentMethod: {
      type: String,
      enum: ['cash', 'digital', 'credit'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'failed'],
      default: 'pending'
    }
  },
  
  metadata: {
    createdBy: String, // system or supplier ID
    autoCreated: Boolean,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }
}, {
  timestamps: true
})

// Indexes
poolSchema.index({ status: 1 })
poolSchema.index({ 'location.city': 1, 'location.area': 1 })
poolSchema.index({ supplierId: 1 })
poolSchema.index({ createdAt: -1 })
poolSchema.index({ 'threshold.minOrders': 1, 'threshold.minValue': 1 })

// Virtual for vendor count
poolSchema.virtual('vendorCount').get(function() {
  return this.orders.length
})

// Virtual for average order value
poolSchema.virtual('averageOrderValue').get(function() {
  return this.orders.length > 0 ? this.totalValue / this.orders.length : 0
})

// Method to check if pool is ready for dispatch
poolSchema.methods.isReadyForDispatch = function() {
  return (
    this.orders.length >= this.threshold.minOrders ||
    this.totalValue >= this.threshold.minValue ||
    this.isMaxWaitTimeReached()
  )
}

// Method to check if max wait time is reached
poolSchema.methods.isMaxWaitTimeReached = function() {
  const waitTime = Date.now() - this.createdAt.getTime()
  const maxWaitMs = this.threshold.maxWaitTime * 60 * 1000
  return waitTime >= maxWaitMs
}

// Method to add order to pool
poolSchema.methods.addOrder = function(orderId, orderValue = 0) {
  if (!this.orders.includes(orderId)) {
    this.orders.push(orderId)
    this.totalValue += orderValue
    
    // Check if pool is ready for dispatch
    if (this.isReadyForDispatch() && this.status === 'collecting') {
      this.status = 'ready'
    }
  }
  return this.save()
}

// Method to remove order from pool
poolSchema.methods.removeOrder = function(orderId, orderValue = 0) {
  const index = this.orders.indexOf(orderId)
  if (index > -1) {
    this.orders.splice(index, 1)
    this.totalValue = Math.max(0, this.totalValue - orderValue)
    
    // If pool becomes empty, mark as cancelled
    if (this.orders.length === 0) {
      this.status = 'cancelled'
    }
  }
  return this.save()
}

// Static method to find pools by location
poolSchema.statics.findByLocation = function(city, area, radius = 2) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.area': new RegExp(area, 'i'),
    'location.radius': { $gte: radius },
    status: { $in: ['collecting', 'ready'] }
  })
}

// Static method to find ready pools
poolSchema.statics.findReadyPools = function() {
  return this.find({
    status: 'ready'
  }).populate('orders')
}

// Static method to get pool statistics
poolSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalValue' },
        avgOrderCount: { $avg: { $size: '$orders' } }
      }
    }
  ])
}

// Pre-save middleware to update status based on thresholds
poolSchema.pre('save', function(next) {
  if (this.isModified('orders') || this.isModified('totalValue')) {
    if (this.status === 'collecting' && this.isReadyForDispatch()) {
      this.status = 'ready'
    }
  }
  next()
})

const Pool = mongoose.model('Pool', poolSchema)

export default Pool
