
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testInsert() {
  console.log('Testing insert with Service Role Key...')
  const { data, error } = await supabase.from('faculty').insert({
    employee_id: 'TEST001',
    name: 'Test Faculty',
    email: 'test@example.com',
    department: 'CS',
    designation: 'Professor'
  }).select()

  if (error) {
    console.error('Insert error:', error.message)
    console.error('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Successfully inserted test record:', data)
  }
}

testInsert()
