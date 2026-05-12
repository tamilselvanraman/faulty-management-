const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkAll() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const tables = ['faculty', 'students', 'classes', 'events', 'committees', 'tasks'];

  for (const table of tables) {
    console.log(`Checking ${table} table...`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('not find the table')) {
        console.log(`❌ Table '${table}' is MISSING.`);
      } else {
        console.log(`⚠️ Error checking '${table}':`, error.message);
      }
    } else {
      console.log(`✅ Table '${table}' exists.`);
    }
  }
}

checkAll();
