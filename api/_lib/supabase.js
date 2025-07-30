const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://maxviytujwpcucyflucu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heHZpeXR1andwY3VjeWZsdWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjEyMTMsImV4cCI6MjA2OTE5NzIxM30.O8w5_h9Bn5QmxM3xKZqwdwvT0TMoLs2SVCgDGemOR9c'
)

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

// For local testing (CommonJS)
module.exports = { supabase, setCorsHeaders }

// For Vercel deployment (ES6)
export { supabase, setCorsHeaders }
