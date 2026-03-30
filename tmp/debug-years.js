require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Checking products_search table...');
  const { data, error } = await supabase
    .from('products_search')
    .select('vehicle_years')
    .not('vehicle_years', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample data (vehicle_years):', JSON.stringify(data, null, 2));

  const { count, error: countError } = await supabase
    .from('products_search')
    .select('*', { count: 'exact', head: true });
  
  console.log('Total products in search table:', count);
}

test();
