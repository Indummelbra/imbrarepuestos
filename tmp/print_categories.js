
const https = require('https');

const urlYamaha = 'https://supabase.imbra.cloud/rest/v1/products_search?name=ilike.*yamaha*&limit=20';
const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its'
  }
};

https.get(urlYamaha, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      json.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`Categories: ${p.categories.map(c => c.name).join(', ')}`);
        console.log('---');
      });
    } catch (e) {
      console.error('Error parsing:', e);
    }
  });
});
