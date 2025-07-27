import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
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

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecart')
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error('Database connection error:', error)
    process.exit(1)
  }
}

// CORS Configuration - MUST be first middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3002", // Vite dev server
    "http://localhost:3003", // Alternate Vite port
    "http://localhost:3004"  // Another Vite port
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
    'http://localhost:3004'
  ]
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
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
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
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

const startServer = async () => {
  try {
    await connectDB()

    server.listen(PORT, () => {
      console.log(`
🚀 VoiceCart Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: ${mongoose.connection.host}
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

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err)
  console.log('Shutting down server due to unhandled promise rejection')
  server.close(() => {
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  console.log('Shutting down server due to uncaught exception')
  process.exit(1)
})

// Start the server
startServer()

export { app, io }
