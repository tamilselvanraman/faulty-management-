const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking faculty table...');
  const { data, error } = await supabase.from('faculty').select('*').limit(1);

  if (error) {
    console.log('Error or table missing:', error.message);
  } else {
    console.log('Faculty table exists. Row count:', data.length);
  }
}

check();
