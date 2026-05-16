
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Checking connection to:', supabaseUrl)
  const { data, error } = await supabase.from('faculty').select('id').limit(1)
  if (error) {
    console.error('Error connecting to faculty table:', error.message)
    console.error('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Successfully connected to faculty table. Found:', data.length, 'records')
  }

  const tables = ['faculty', 'classes', 'committees', 'events', 'students', 'tasks']
  for (const table of tables) {
    const { error: tableError } = await supabase.from(table).select('count').limit(1)
    if (tableError) {
      console.error(`Table "${table}" error:`, tableError.message)
    } else {
      console.log(`Table "${table}" exists.`)
    }
  }
}

check()
