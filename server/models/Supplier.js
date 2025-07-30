import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: function () {
      return this.isNew; // Only required for new documents
    },
    trim: true,
    validate: {
      validator: function (v) {
        return !v || /^\d{6}$/.test(v); // Allow empty for existing users, validate format if provided
      },
      message: 'Pincode must be 6 digits'
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profilePicture: {
    type: String,
    default: null
  },
  businessLicense: {
    type: String,
    default: null
  },
  categories: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Hash password before saving
supplierSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
supplierSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Generate supplier ID
supplierSchema.statics.generateSupplierId = function (email) {
  const prefix = 'SUP'
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  const emailHash = email.split('@')[0].substring(0, 3).toUpperCase()

  return `${prefix}-${emailHash}-${timestamp}-${random}`.toUpperCase()
}

// Remove password from JSON output
supplierSchema.methods.toJSON = function () {
  const supplier = this.toObject()
  delete supplier.password
  return supplier
}

export default mongoose.model('Supplier', supplierSchema)