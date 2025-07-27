import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization')
        console.log('🔍 Auth Debug - Header:', authHeader ? 'EXISTS' : 'MISSING')

        if (!authHeader) {
            console.log('❌ Auth Debug - No authorization header')
            return res.status(401).json({ message: 'No token provided' })
        }

        const token = authHeader.replace('Bearer ', '')
        console.log('🔍 Auth Debug - Token extracted:', token ? 'EXISTS' : 'EMPTY')

        if (!token) {
            console.log('❌ Auth Debug - Invalid token format')
            return res.status(401).json({ message: 'Invalid token format' })
        }

        const decoded = jwt.verify(token, JWT_SECRET)
        console.log('🔍 Auth Debug - Decoded token:', JSON.stringify(decoded, null, 2))
        req.user = decoded
        next()

    } catch (error) {
        console.error('❌ Auth Debug - Error:', error.message)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' })
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' })
        }

        res.status(401).json({ message: 'Token verification failed' })
    }
}

// Middleware to check if user is a vendor
export const isVendor = (req, res, next) => {
    if (req.user.type !== 'vendor') {
        return res.status(403).json({ message: 'Vendor access required' })
    }
    next()
}

// Middleware to check if user is a supplier
export const isSupplier = (req, res, next) => {
    if (req.user.type !== 'supplier') {
        return res.status(403).json({ message: 'Supplier access required' })
    }
    next()
}