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
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, password, and name are required' 
      })
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    })

    if (error) {
      console.error('Signup error:', error)
      return res.status(400).json({ 
        success: false,
        message: error.message 
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: name
      },
      token: data.session?.access_token
    })

  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    })
  }
}
