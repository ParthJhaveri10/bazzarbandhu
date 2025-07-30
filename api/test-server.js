// Local test server for API endpoints
const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse JSON bodies
app.use(express.json())

// Import our serverless functions
const loginHandler = require('./auth/login.js').default
const signupHandler = require('./auth/signup.js').default
const healthHandler = require('./health.js').default
const indexHandler = require('./index.js').default

// Mock req/res for serverless functions
function createMockResponse() {
  const res = {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.body = data
      return this
    },
    end() {
      return this
    }
  }
  return res
}

// Wrapper to convert serverless functions to Express middleware
function serverlessToExpress(handler) {
  return async (req, res) => {
    const mockRes = createMockResponse()
    
    try {
      await handler(req, mockRes)
      
      // Set headers
      Object.entries(mockRes.headers).forEach(([name, value]) => {
        res.setHeader(name, value)
      })
      
      // Send response
      res.status(mockRes.statusCode)
      if (mockRes.body) {
        res.json(mockRes.body)
      } else {
        res.end()
      }
    } catch (error) {
      console.error('Handler error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Routes
app.post('/api/auth/login', serverlessToExpress(loginHandler))
app.post('/api/auth/signup', serverlessToExpress(signupHandler))
app.get('/api/health', serverlessToExpress(healthHandler))
app.get('/api', serverlessToExpress(indexHandler))

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Local test server is running!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api',
      'GET /api/health', 
      'POST /api/auth/login',
      'POST /api/auth/signup'
    ]
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Local API Test Server Running!
📍 Port: ${PORT}
🔗 Test URL: http://localhost:${PORT}/test
🔐 Login: POST http://localhost:${PORT}/api/auth/login
📝 Signup: POST http://localhost:${PORT}/api/auth/signup
💚 Health: GET http://localhost:${PORT}/api/health
  `)
})

module.exports = app
