
const https = require('https');

const urlTables = 'https://supabase.imbra.cloud/rest/v1/';
const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Prefer': 'params=single-object'
  }
};

// Query the root of PostgREST to get the OpenAPI spec, which lists tables
https.get(urlTables, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Tables found:', Object.keys(json.paths || {}).filter(p => !p.includes('rpc')).map(p => p.replace('/', '')));
    } catch (e) {
      console.error('Error parsing OpenAPI spec');
      // Fallback: try to query common tables
    }
  });
});
