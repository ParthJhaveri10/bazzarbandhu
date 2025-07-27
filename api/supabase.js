import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://maxviytujwpcucyflucu.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heHZpeXR1andwY3VjeWZsdWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjEyMTMsImV4cCI6MjA2OTE5NzIxM30.O8w5_h9Bn5QmxM3xKZqwdwvT0TMoLs2SVCgDGemOR9c'

export const supabase = createClient(supabaseUrl, supabaseKey)

// For server-side operations with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heHZpeXR1andwY3VjeWZsdWN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYyMTIxMywiZXhwIjoyMDY5MTk3MjEzfQ.2ec6dQK28HjMQKbYsZu8EZR09CSfonVzuk2t7HcQFNk'
)
