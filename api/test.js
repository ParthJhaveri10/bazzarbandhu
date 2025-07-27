import express from 'express'

const app = express()

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Export for Vercel
export default app
