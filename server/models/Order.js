import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  vendorPhone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  items: [{
    item: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      default: 'kg'
    },
    estimatedPrice: {
      type: Number,
      default: 0
    }
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
    city: String,
    area: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'pooled', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  poolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pool',
    default: null
  },
  
  transcript: {
    type: String,
    trim: true
  },
  
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  
  estimatedValue: {
    type: Number,
    default: 0
  },
  
  actualValue: {
    type: Number,
    default: 0
  },
  
  supplierNotes: {
    type: String,
    trim: true
  },
  
  deliveryNotes: {
    type: String,
    trim: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  metadata: {
    userAgent: String,
    ipAddress: String,
    audioFileUrl: String,
    processingTime: Number
  }
}, {
  timestamps: true
})

// Indexes for better query performance
orderSchema.index({ vendorPhone: 1, status: 1 })
orderSchema.index({ poolId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ 'location.city': 1, 'location.area': 1 })
orderSchema.index({ createdAt: -1 })

// Virtual for formatted phone number
orderSchema.virtual('formattedPhone').get(function() {
  return this.vendorPhone.replace(/(\+91)?(\d{5})(\d{5})/, '+91 $2 $3')
})

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    const quantity = parseFloat(item.quantity) || 0
    return total + quantity
  }, 0)
})

// Method to calculate estimated value
orderSchema.methods.calculateEstimatedValue = function() {
  const priceMap = {
    'rice': 80, 'dal': 120, 'oil': 150, 'wheat': 60, 'sugar': 45,
    'onion': 40, 'potato': 30, 'tomato': 50, 'garlic': 200, 'ginger': 180
  }
  
  let total = 0
  this.items.forEach(item => {
    const quantity = parseFloat(item.quantity) || 0
    const basePrice = priceMap[item.item.toLowerCase()] || 50 // default price
    total += quantity * basePrice
  })
  
  this.estimatedValue = total
  return total
}

// Pre-save middleware
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.calculateEstimatedValue()
  }
  next()
})

// Static method to find orders by location
orderSchema.statics.findByLocation = function(city, area) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.area': new RegExp(area, 'i')
  })
}

// Static method to get orders statistics
orderSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$estimatedValue' }
      }
    }
  ])
}

const Order = mongoose.model('Order', orderSchema)

export default Order
