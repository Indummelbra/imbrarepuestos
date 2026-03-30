
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTaxonomy() {
  const { data, error } = await supabase
    .from('products_search')
    .select('name, categories, tags')
    .limit(50);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log('--- SAMPLE DATA ---');
  data.forEach((p, i) => {
    console.log(`[${i}] ${p.name}`);
    console.log(`    Categories: ${JSON.stringify(p.categories)}`);
    console.log(`    Tags: ${JSON.stringify(p.tags)}`);
  });

  // Extract unique values for potential filters
  const allCategories = data.flatMap(p => p.categories || []);
  const uniqueCats = [...new Set(allCategories)];
  
  console.log('\n--- UNIQUE CATEGORIES (Sample) ---');
  console.log(uniqueCats.sort());

  const allTags = data.flatMap(p => p.tags || []);
  const uniqueTags = [...new Set(allTags)];
  
  console.log('\n--- UNIQUE TAGS (Sample) ---');
  console.log(uniqueTags.sort());
}

inspectTaxonomy();
