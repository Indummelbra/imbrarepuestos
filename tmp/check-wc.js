require('dotenv').config({ path: '.env.local' });
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkWC() {
    const url = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const ck = process.env.WC_CONSUMER_KEY;
    const cs = process.env.WC_CONSUMER_SECRET;
    const auth = Buffer.from(`${ck}:${cs}`).toString('base64');

    console.log(`Connecting to: ${url}`);
    try {
        const response = await fetch(`${url}/wp-json/wc/v3/products?per_page=5`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        const products = await response.json();
        console.log("Sample Product Names:");
        products.forEach(p => console.log(`- ${p.name}`));
    } catch (e) {
        console.error("Error connecting to WC:", e);
    }
}

checkWC();
