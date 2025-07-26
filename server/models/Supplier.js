import mongoose from 'mongoose'

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  businessName: {
    type: String,
    trim: true
  },
  
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  address: {
    street: String,
    area: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  serviceAreas: [{
    city: String,
    areas: [String],
    radius: Number, // km
    deliveryFee: Number
  }],
  
  inventory: [{
    item: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['grains', 'pulses', 'spices', 'vegetables', 'oils', 'dairy', 'other'],
      default: 'other'
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      default: 'kg'
    },
    availability: {
      type: Boolean,
      default: true
    },
    minimumOrder: {
      type: Number,
      default: 1
    },
    maximumOrder: {
      type: Number,
      default: 1000
    }
  }],
  
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  
  deliverySettings: {
    minimumOrderValue: {
      type: Number,
      default: 500
    },
    deliveryFee: {
      type: Number,
      default: 50
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 2000
    },
    maxDeliveryRadius: {
      type: Number,
      default: 10 // km
    },
    estimatedDeliveryTime: {
      type: Number,
      default: 120 // minutes
    }
  },
  
  poolingSettings: {
    participateInPooling: {
      type: Boolean,
      default: true
    },
    minimumPoolSize: {
      type: Number,
      default: 3
    },
    maximumPoolSize: {
      type: Number,
      default: 20
    },
    maxWaitTime: {
      type: Number,
      default: 120 // minutes
    }
  },
  
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    qualityRating: Number,
    timelinessRating: Number,
    serviceRating: Number
  },
  
  statistics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    activePoolsCount: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: {
      type: Number,
      default: 0
    }
  },
  
  verificationStatus: {
    isVerified: {
      type: Boolean,
      default: false
    },
    gstNumber: String,
    licenseNumber: String,
    verifiedAt: Date,
    verifiedBy: String
  },
  
  paymentDetails: {
    preferredMethod: {
      type: String,
      enum: ['cash', 'upi', 'bank_transfer', 'wallet'],
      default: 'cash'
    },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String
    },
    upiId: String
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification'
  },
  
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes
supplierSchema.index({ phone: 1 })
supplierSchema.index({ 'address.city': 1 })
supplierSchema.index({ status: 1 })
supplierSchema.index({ 'ratings.average': -1 })
supplierSchema.index({ 'serviceAreas.city': 1, 'serviceAreas.areas': 1 })

// Virtual for formatted phone number
supplierSchema.virtual('formattedPhone').get(function() {
  return this.phone.replace(/(\+91)?(\d{5})(\d{5})/, '+91 $2 $3')
})

// Virtual to check if currently open
supplierSchema.virtual('isCurrentlyOpen').get(function() {
  const now = new Date()
  const day = now.toLocaleLowerCase()
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
  
  const todayHours = this.operatingHours[day]
  if (!todayHours || !todayHours.isOpen) {
    return false
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close
})

// Method to check if supplier serves a location
supplierSchema.methods.servesLocation = function(city, area) {
  return this.serviceAreas.some(serviceArea => {
    const cityMatch = serviceArea.city.toLowerCase() === city.toLowerCase()
    const areaMatch = !area || serviceArea.areas.some(serviceArea => 
      serviceArea.toLowerCase().includes(area.toLowerCase())
    )
    return cityMatch && areaMatch
  })
}

// Method to get available items by category
supplierSchema.methods.getAvailableItems = function(category = null) {
  let items = this.inventory.filter(item => item.availability)
  
  if (category) {
    items = items.filter(item => item.category === category)
  }
  
  return items
}

// Method to update statistics
supplierSchema.methods.updateStatistics = function(orderValue, deliveryTime) {
  this.statistics.totalOrders += 1
  this.statistics.totalRevenue += orderValue
  
  // Update average delivery time
  const totalTime = this.statistics.averageDeliveryTime * (this.statistics.totalOrders - 1) + deliveryTime
  this.statistics.averageDeliveryTime = totalTime / this.statistics.totalOrders
  
  this.lastActive = new Date()
  return this.save()
}

// Static method to find suppliers by location
supplierSchema.statics.findByLocation = function(city, area = null) {
  const query = {
    status: 'active',
    'serviceAreas.city': new RegExp(city, 'i')
  }
  
  if (area) {
    query['serviceAreas.areas'] = new RegExp(area, 'i')
  }
  
  return this.find(query).sort({ 'ratings.average': -1 })
}

// Static method to find suppliers with specific items
supplierSchema.statics.findByItems = function(items) {
  return this.find({
    status: 'active',
    'inventory.item': { $in: items.map(item => new RegExp(item, 'i')) },
    'inventory.availability': true
  })
}

// Pre-save middleware
supplierSchema.pre('save', function(next) {
  // Update completion rate
  if (this.statistics.totalOrders > 0) {
    // This would need to be calculated based on actual completed vs total orders
    // For now, we'll set a default
    this.statistics.completionRate = 95 // percentage
  }
  
  next()
})

const Supplier = mongoose.model('Supplier', supplierSchema)

export default Supplier
