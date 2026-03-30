
const https = require('https');

const CONSUMER_KEY = 'ck_3adb8346265e17ceb80913d501480c5d80905adc';
const CONSUMER_SECRET = 'cs_f499ee29185b9984465af5219f2b467eef77d630';
const HOST = 'mkt.imbrarepuestos.com';
const PATH = '/wp-json/wc/v3/products?search=FZ%2016';

const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

const options = {
  hostname: HOST,
  path: PATH,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (Array.isArray(json) && json.length > 0) {
        const p = json[0];
        console.log(`Product: ${p.name}`);
        console.log(`SKU: ${p.sku}`);
        console.log(`Attributes:`, JSON.stringify(p.attributes, null, 2));
        console.log(`Categories:`, JSON.stringify(p.categories, null, 2));
        console.log(`Meta:`, JSON.stringify(p.meta_data.filter(m => m.key.includes('brand') || m.key.includes('motor')), null, 2));
      } else {
        console.log('No products found for FZ 16');
      }
    } catch (e) {
      console.error('Error parsing:', e);
      console.log('Raw:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
