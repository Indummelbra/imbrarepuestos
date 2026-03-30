
const https = require('https');

const urlSap = 'https://supabase.imbra.cloud/rest/v1/mapeo_articulos_sap?limit=1';
const options = {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIn0.o9GEZhRAKObUtjfBvSX0KGpdRy_weu7luns56Rp4its',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UifQ.puX_B7GtWLGpZ02U-psLF4xHciApsaRhS5x1wLK2dog'
  }
};

https.get(urlSap, options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.length > 0) {
        console.log('Columns in mapeo_articulos_sap:', Object.keys(json[0]));
        console.log('Sample record:', JSON.stringify(json[0], null, 2));
      }
    } catch (e) {
      console.error('Error parsing JSON');
    }
  });
});
