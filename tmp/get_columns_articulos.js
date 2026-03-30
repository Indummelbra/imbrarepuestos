
const https = require('https');

const urlSample = 'https://supabase.imbra.cloud/rest/v1/mapeo_articulos_woo?limit=1';

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
        console.log('Available columns in mapeo_articulos_woo:', Object.keys(json[0]));
      }
    } catch (e) {
      console.error('Error parsing JSON');
    }
  });
});
