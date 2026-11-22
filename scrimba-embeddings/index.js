import { supabase } from './supabaseClient.js'

/**
 * Test Supabase connection
 */
async function checkConnection() {
  console.log('Testing Supabase connection...')

  const { data, error } = await supabase.from('documents').select('count', { count: 'exact', head: true })

  if (error) {
    console.error('❌ Connection error or table not found:', error.message)
    console.log('👉 Make sure you ran 01_schema.sql in your Supabase SQL Editor and set up .env')
  } else {
    console.log('✅ Connected successfully to Supabase!')
  }
}

checkConnection()
