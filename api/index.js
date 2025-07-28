import express from 'express'
import cors from 'cors'
import authRoutes from './auth.js'

const app = express()

// Production CORS configuration
app.use(cors({
  origin: [
    'https://bazzarbandhu.vercel.app',
    'https://bazzarbandhu-git-main-parthjhaveri10s-projects.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'BazzarBandhu API is running',
    timestamp: new Date().toISOString()
  })
})

// Auth routes
app.use('/api/auth', authRoutes)

// Root API endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'BazzarBandhu API',
    version: '1.0.0',
    status: 'Production Ready',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        signup: 'POST /api/auth/signup'
      }
    }
  })
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

export default app
