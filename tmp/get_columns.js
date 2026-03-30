
const https = require('https');

const url = 'https://supabase.imbra.cloud/rest/v1/rpc/get_table_columns?table_name=products_search';
// If get_table_columns doesn't exist, I'll just query the table and take one record
const urlSample = 'https://supabase.imbra.cloud/rest/v1/products_search?limit=1';

const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its'
  }
};

https.get(urlSample, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.length > 0) {
        console.log('Available columns:', Object.keys(json[0]));
        console.log('Sample record:', JSON.stringify(json[0], null, 2));
      } else {
        console.log('No data found');
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});
