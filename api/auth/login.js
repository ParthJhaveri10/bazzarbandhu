const { supabase, setCorsHeaders } = require('../_lib/supabase')

export default async function handler(req, res) {
  // Handle CORS
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      })
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'User'
      },
      token: data.session.access_token
    })

  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
}
