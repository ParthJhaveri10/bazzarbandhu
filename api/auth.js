import express from "express"
import { supabase, supabaseAdmin } from "./supabase.js"
import jwt from 'jsonwebtoken'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'e3563ae243308fff9f557dc9a2741a2a1f94d6ad0e4ab756b732ef28e62ba43e520da02061addb22e294922e79f155a40e2417a93875df0a4dae763f168adbfd'

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Auth service using Supabase",
    timestamp: new Date().toISOString()
  })
})

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('🔐 Login attempt:', { email })

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('❌ Login error:', authError)
      return res.status(401).json({
        message: 'Invalid email or password',
        error: authError.message
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: authData.user.id, 
        email: authData.user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('✅ Login successful:', { email })

    res.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || 'User'
      },
      token,
      session: authData.session
    })

  } catch (error) {
    console.error('❌ Login server error:', error)
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    })
  }
})

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, password, type, name, phone, businessName, address, pincode } = req.body

    console.log('📝 Signup request:', { email, type, name })

    if (!email || !password || !type || !name) {
      return res.status(400).json({
        message: 'Email, password, type, and name are required'
      })
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          type,
          phone,
          businessName,
          address,
          pincode
        }
      }
    })

    if (authError) {
      console.error('❌ Signup error:', authError)
      return res.status(400).json({
        message: 'Failed to create account',
        error: authError.message
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: authData.user.id, 
        email: authData.user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('✅ Signup successful:', { email })

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name
      },
      token,
      session: authData.session
    })

  } catch (error) {
    console.error('❌ Signup server error:', error)
    res.status(500).json({
      message: 'Server error during signup',
      error: error.message
    })
  }
})

export default router
