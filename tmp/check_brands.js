
const https = require('https');

const urlBrands = 'https://supabase.imbra.cloud/rest/v1/mapeo_articulos_woo?select=brand&limit=100';
const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UifQ.puX_B7GtWLGpZ02U-psLF4xHciApsaRhS5x1wLK2dog'
  }
};

https.get(urlBrands, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const brands = json.map(p => p.brand).filter(b => b && b.trim() !== '');
      const uniqueBrands = [...new Set(brands)];
      console.log('Unique Brands found in mapeo_articulos_woo:', uniqueBrands);
      console.log('Sample count:', json.length, 'Populated brands:', brands.length);
    } catch (e) {
      console.error('Error parsing JSON');
    }
  });
});
