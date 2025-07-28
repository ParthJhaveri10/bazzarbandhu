import { createClient } from '@supabase/supabase-js'

// Production Supabase configuration
const supabaseUrl = 'https://maxviytujwpcucyflucu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heHZpeXR1andwY3VjeWZsdWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjEyMTMsImV4cCI6MjA2OTE5NzIxM30.O8w5_h9Bn5QmxM3xKZqwdwvT0TMoLs2SVCgDGemOR9c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
