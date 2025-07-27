import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const vendorSchema = new mongoose.Schema({
    vendorId: {
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
    shopLicense: {
        type: String,
        default: null
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        },
        address: {
            type: String,
            default: ''
        }
    },
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

// Create geospatial index for location
vendorSchema.index({ location: '2dsphere' })

// Hash password before saving
vendorSchema.pre('save', async function (next) {
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
vendorSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

// Generate vendor ID
vendorSchema.statics.generateVendorId = function (email) {
    const prefix = 'VND'
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    const emailHash = email.split('@')[0].substring(0, 3).toUpperCase()

    return `${prefix}-${emailHash}-${timestamp}-${random}`.toUpperCase()
}

// Remove password from JSON output
vendorSchema.methods.toJSON = function () {
    const vendor = this.toObject()
    delete vendor.password
    return vendor
}

export default mongoose.model('Vendor', vendorSchema)