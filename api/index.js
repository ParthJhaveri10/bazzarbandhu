import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './auth.js'

dotenv.config()

const app = express()

// CORS Configuration for Vercel
app.use(cors({
  origin: [
    'https://bazzarbandhu.vercel.app',
    'http://localhost:3002',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BazzarBandhu API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API test successful',
    timestamp: new Date().toISOString()
  })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Root route
app.get('/api', (req, res) => {
  res.json({
    message: 'BazzarBandhu API',
    version: '1.0.0',
    team: 'Team No Caps',
    endpoints: ['/api/auth', '/api/health', '/api/test']
  })
})

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableEndpoints: ['/api/auth', '/api/health', '/api/test']
  })
})

// Export for Vercel
export default app
