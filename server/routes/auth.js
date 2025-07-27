import express from "express"
import { supabase, supabaseAdmin } from "../config/supabase.js"

const router = express.Router()

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Auth service using Supabase",
    timestamp: new Date().toISOString()
  })
})

// Signup endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, password, type, name, phone, businessName, address, pincode } = req.body

    console.log('📝 Signup request:', { email, type, name, phone, businessName })

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          type,
          phone,
          business_name: businessName
        }
      }
    })

    if (authError) {
      console.error('❌ Auth signup error:', authError)
      return res.status(400).json({
        success: false,
        error: authError.message
      })
    }

    console.log('✅ User created in auth:', authData.user?.id)

    // Auto-confirm email for development (bypass email verification)
    if (authData.user && !authData.user.email_confirmed_at) {
      console.log('🔧 Auto-confirming email for development...')
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      )
      if (confirmError) {
        console.warn('⚠️ Could not auto-confirm email:', confirmError.message)
      } else {
        console.log('✅ Email auto-confirmed for development')
      }
    }

    // Insert into appropriate table (vendors or suppliers)
    let tableData, table
    
    if (type === 'vendor') {
      table = 'vendors'
      tableData = {
        id: authData.user.id,
        email,
        name,
        phone,
        business_name: businessName || name,
        address: address || 'Not provided',
        pincode: pincode || '000000'
      }
    } else if (type === 'supplier') {
      table = 'suppliers'
      tableData = {
        id: authData.user.id,
        email,
        name,
        phone,
        business_name: businessName || name,
        address: address || 'Not provided',
        pincode: pincode || '000000',
        items: [] // Empty array for now
      }
    }

    // Use admin client to bypass RLS for initial user creation
    const { data: userData, error: dbError } = await supabaseAdmin
      .from(table)
      .insert([tableData])
      .select()
      .single()

    if (dbError) {
      console.error('❌ Database insert error:', dbError)
      return res.status(400).json({
        success: false,
        error: 'Failed to create user profile: ' + dbError.message
      })
    }

    console.log('✅ User profile created:', userData)

    res.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        type,
        name,
        phone,
        businessName,
        address,
        pincode
      },
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('❌ Signup error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('🔑 Login request for:', email)
    console.log('📧 Email type:', typeof email)
    console.log('🔒 Password type:', typeof password)

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    // Ensure email and password are strings
    const cleanEmail = String(email).trim()
    const cleanPassword = String(password)

    // Authenticate with Supabase - only pass email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    })

    if (authError) {
      console.error('❌ Auth login error:', authError)
      return res.status(400).json({
        success: false,
        error: authError.message
      })
    }

    console.log('✅ User authenticated:', authData.user?.id)

    // Get user profile from vendors or suppliers table
    let userData = null
    let userType = null

    // Try vendors table first
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (vendorData) {
      userData = vendorData
      userType = 'vendor'
    } else {
      // Try suppliers table
      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (supplierData) {
        userData = supplierData
        userType = 'supplier'
      }
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      })
    }

    console.log('✅ User profile found:', userData)

    res.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        type: userType,
        name: userData.name,
        phone: userData.phone,
        businessName: userData.business_name,
        address: userData.address,
        pincode: userData.pincode
      },
      token: authData.session.access_token,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Logout endpoint
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('❌ Logout error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Development helper: Confirm email for testing
router.post("/dev/confirm-email", async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      })
    }

    // Get user by email
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (getUserError) {
      return res.status(400).json({
        success: false,
        error: getUserError.message
      })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      })
    }

    // Confirm the user's email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      return res.status(400).json({
        success: false,
        error: confirmError.message
      })
    }

    res.json({
      success: true,
      message: `Email confirmed for ${email}`
    })

  } catch (error) {
    console.error('❌ Email confirmation error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
