import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Warning: SUPABASE_URL or SUPABASE_API_KEY is missing in your .env file')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
