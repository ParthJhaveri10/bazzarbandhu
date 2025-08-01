import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import voiceRoutes from './routes/voice.js'
import simpleVoiceRoutes from './routes/simple-voice.js'
import orderRoutes from './routes/orders.js'
import poolRoutes from './routes/pools.js'
import supplierRoutes from './routes/suppliers.js'
import authRoutes from './routes/auth.js'

// Import utilities
import { setupSocket } from './utils/socket.js'
import { rateLimitMiddleware } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = createServer(app)

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3002", // Vite dev server
      "http://localhost:3003"  // Alternate Vite port
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
})

// Supabase connection (no explicit connection needed)
console.log('🚀 Supabase configuration loaded')

// CORS Configuration - MUST be first middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3002", // Vite dev server
    "http://localhost:3003", // Alternate Vite port
    "http://localhost:3004", // Another Vite port
    "https://bazzarbandhu.vercel.app", // Production domain
    /\.vercel\.app$/ // Any Vercel app domain
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
}))

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'https://bazzarbandhu.vercel.app'
  ]
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(morgan('combined'))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting - apply to API routes only
app.use('/api', rateLimitMiddleware)

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health check - before other routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'Supabase'
  })
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'VoiceCart API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      voice: '/api/voice',
      simpleVoice: '/api/simple-voice',
      orders: '/api/orders',
      pools: '/api/pools',
      suppliers: '/api/suppliers',
      health: '/health'
    }
  })
})

// API Routes - after middleware setup
app.use('/api/auth', authRoutes)
app.use('/api/voice', voiceRoutes)
app.use('/api/simple-voice', simpleVoiceRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/pools', poolRoutes)
app.use('/api/suppliers', supplierRoutes)

// Setup Socket.IO
setupSocket(io)

// Error handling middleware - must be after routes
app.use(errorHandler)

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`,
    availableEndpoints: [
      '/api/auth',
      '/api/voice',
      '/api/orders',
      '/api/pools',
      '/api/suppliers',
      '/health'
    ]
  })
})

// Start server
const PORT = process.env.PORT || 5000

// Only start server in development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      const PORT = process.env.PORT || 5000
      
      server.listen(PORT, () => {
        console.log(`
🚀 VoiceCart Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: Supabase
🔗 Health Check: http://localhost:${PORT}/health
🔐 Auth Endpoints: http://localhost:${PORT}/api/auth
📡 Socket.IO enabled for real-time updates
🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}
        `)
      })
    } catch (error) {
      console.error('Failed to start server:', error)
      process.exit(1)
    }
  }

  // Start the server
  startServer()
}

// Export for Vercel
export default app
