
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.imbra.cloud';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function extractCategories() {
  const { data, error } = await supabase
    .from('products_search')
    .select('categories');

  if (error) {
    console.error('Error:', error);
    return;
  }

  const allCategories = new Set<string>();
  data?.forEach(row => {
    row.categories?.forEach((cat: any) => {
      allCategories.add(JSON.stringify(cat));
    });
  });

  const uniqueCats = Array.from(allCategories).map(s => JSON.parse(s));
  console.log('Total Unique Categories:', uniqueCats.length);
  console.log('Sample Categories:', JSON.stringify(uniqueCats.slice(0, 50), null, 2));
}

extractCategories();
