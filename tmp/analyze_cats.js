
const https = require('https');

const urlArticulos = 'https://supabase.imbra.cloud/rest/v1/mapeo_articulos_woo?select=post_title,product_cat,product_tag,brand&limit=20';
const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its'
  }
};

https.get(urlArticulos, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      json.forEach(p => {
        console.log(`Title: ${p.post_title}`);
        console.log(`Brand: ${p.brand}`);
        console.log(`Cats: ${p.product_cat}`);
        console.log(`Tags: ${p.product_tag}`);
        console.log('---');
      });
    } catch (e) {
      console.error('Error parsing JSON');
    }
  });
});
