
const https = require('https');

const urlSap = 'https://supabase.imbra.cloud/rest/v1/mapeo_articulos_sap?select=titulo_sap,tags,categoria_sap&limit=50';
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
      json.forEach(p => {
        if (p.tags) {
          console.log(`Title: ${p.titulo_sap}`);
          console.log(`Tags: ${p.tags}`);
          console.log(`Cat: ${p.categoria_sap}`);
          console.log('---');
        }
      });
    } catch (e) {
      console.error('Error parsing JSON');
    }
  });
});
