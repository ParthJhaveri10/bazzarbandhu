import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Ensure environment variables are loaded
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// For server-side operations with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
)
