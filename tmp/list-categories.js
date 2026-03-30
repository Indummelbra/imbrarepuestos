const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const url = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}wp-json/wc/v3/products/categories`;
const auth = {
  username: process.env.WC_CONSUMER_KEY,
  password: process.env.WC_CONSUMER_SECRET
};

async function listCategories() {
  try {
    const response = await axios.get(url, { 
      auth,
      params: { per_page: 100 }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
  }
}

listCategories();
