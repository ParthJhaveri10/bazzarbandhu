const { setCorsHeaders } = require('./_lib/supabase')

export default async function handler(req, res) {
  setCorsHeaders(res)
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  return res.status(200).json({
    status: 'OK',
    message: 'BazzarBandhu API is running!',
    timestamp: new Date().toISOString(),
    environment: 'production',
    team: 'Team No Caps'
  })
}
