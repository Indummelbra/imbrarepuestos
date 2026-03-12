const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export async function getProducts() {
  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error("Faltan variables de entorno de WooCommerce");
    return [];
  }

  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      next: { revalidate: 3600 } // Revalidar cada hora
    });

    if (!response.ok) throw new Error('Error al obtener productos');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
