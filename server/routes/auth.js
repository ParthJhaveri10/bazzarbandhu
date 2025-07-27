import express from 'express'
import jwt from 'jsonwebtoken'
import Vendor from '../models/Vendor.js'
import Supplier from '../models/Supplier.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            type: user.constructor.modelName.toLowerCase(),
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    )
}

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, businessName, address, pincode, type } = req.body

        // Validate required fields
        if (!name || !email || !phone || !password || !businessName || !address || !pincode || !type) {
            return res.status(400).json({
                message: 'All fields are required'
            })
        }

        // Validate pincode format
        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                message: 'Pincode must be 6 digits'
            })
        }

        // Validate type
        if (!['vendor', 'supplier'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid user type'
            })
        }

        const Model = type === 'vendor' ? Vendor : Supplier
        const idField = type === 'vendor' ? 'vendorId' : 'supplierId'

        // Check if user already exists
        const existingUser = await Model.findOne({
            $or: [{ email }, { phone }]
        })

        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or phone already exists'
            })
        }

        // Generate unique ID
        const uniqueId = Model.generateVendorId ?
            Model.generateVendorId(email) :
            Model.generateSupplierId(email)

        // Create new user
        const userData = {
            [idField]: uniqueId,
            name,
            email,
            phone,
            password,
            businessName,
            address,
            pincode
        }

        const user = new Model(userData)
        await user.save()

        // Generate token
        const token = generateToken(user)

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                [idField]: user[idField],
                name: user.name,
                email: user.email,
                phone: user.phone,
                businessName: user.businessName,
                type,
                isVerified: user.isVerified,
                status: user.status
            }
        })

    } catch (error) {
        console.error('Signup error:', error)
        res.status(500).json({
            message: 'Server error during signup'
        })
    }
})

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password, type } = req.body

        // Validate required fields
        if (!email || !password || !type) {
            return res.status(400).json({
                message: 'Email, password, and user type are required'
            })
        }

        // Validate type
        if (!['vendor', 'supplier'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid user type'
            })
        }

        const Model = type === 'vendor' ? Vendor : Supplier
        const idField = type === 'vendor' ? 'vendorId' : 'supplierId'

        // Find user
        const user = await Model.findOne({ email })
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            })
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            })
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({
                message: 'Account is suspended or inactive'
            })
        }

        // Update last login
        user.lastLogin = new Date()
        await user.save()

        // Generate token
        const token = generateToken(user)

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                [idField]: user[idField],
                name: user.name,
                email: user.email,
                phone: user.phone,
                businessName: user.businessName,
                type,
                isVerified: user.isVerified,
                status: user.status,
                lastLogin: user.lastLogin
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({
            message: 'Server error during login'
        })
    }
})

// Verify token route
router.get('/verify', auth, async (req, res) => {
    try {
        const { type } = req.user
        const Model = type === 'vendor' ? Vendor : Supplier
        const idField = type === 'vendor' ? 'vendorId' : 'supplierId'

        const user = await Model.findById(req.user.id)
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        res.json({
            user: {
                id: user._id,
                [idField]: user[idField],
                name: user.name,
                email: user.email,
                phone: user.phone,
                businessName: user.businessName,
                type,
                isVerified: user.isVerified,
                status: user.status,
                lastLogin: user.lastLogin
            }
        })

    } catch (error) {
        console.error('Token verification error:', error)
        res.status(500).json({
            message: 'Server error during token verification'
        })
    }
})

// Update profile route
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, businessName, address } = req.body
        const { type } = req.user
        const Model = type === 'vendor' ? Vendor : Supplier
        const idField = type === 'vendor' ? 'vendorId' : 'supplierId'

        const user = await Model.findById(req.user.id)
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        // Update fields
        if (name) user.name = name
        if (phone) user.phone = phone
        if (businessName) user.businessName = businessName
        if (address) user.address = address

        await user.save()

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                [idField]: user[idField],
                name: user.name,
                email: user.email,
                phone: user.phone,
                businessName: user.businessName,
                type,
                isVerified: user.isVerified,
                status: user.status
            }
        })

    } catch (error) {
        console.error('Profile update error:', error)
        res.status(500).json({
            message: 'Server error during profile update'
        })
    }
})

// Logout route (client-side mainly, but can be used for cleanup)
router.post('/logout', auth, async (req, res) => {
    res.json({ message: 'Logged out successfully' })
})

export default router