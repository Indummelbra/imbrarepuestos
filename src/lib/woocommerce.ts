import { mapWooProductToImbra } from "./mappers";
import { Product } from "@/types/product";

const WOOCOMMERCE_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '');
const GRAPHQL_URL = process.env.WPGRAPHQL_URL || (WOOCOMMERCE_URL ? `${WOOCOMMERCE_URL}/graphql` : '');
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

/**
 * Función base para realizar peticiones a la REST API de WooCommerce.
 */
async function fetchWooRest(endpoint: string, options: RequestInit = {}) {
  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error("Faltan variables de entorno de WooCommerce");
  }

  console.log(`[DEBUG] Intentando fetch REST a: ${WOOCOMMERCE_URL}/wp-json/wc/v3/${endpoint}`);
  
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  try {
    const response = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[DEBUG] Error en respuesta REST: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({}));
      console.error(`[DEBUG] Detalle error REST:`, JSON.stringify(errorData));
      throw new Error(errorData.message || `Error en la petición REST: ${response.status}`);
    }

    return response.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fatal en fetch REST";
    console.error(`[DEBUG] Error fatal en fetch REST:`, message);
    throw error;
  }
}

/**
 * Función base para realizar peticiones a WPGraphQL.
 */
async function fetchWooGraphQL(query: string, variables: Record<string, unknown> = {}, options: RequestInit = {}) {
  if (!WOOCOMMERCE_URL) {
    throw new Error("Faltan variables de entorno de WooCommerce (URL)");
  }
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      ...options,
    });

    if (!response.ok) {
      console.error(`GraphQL HTTP Error: ${response.status}`);
      return null;
    }

    const json = await response.json();
    if (json.errors) {
      console.error('GraphQL Errors Details:', JSON.stringify(json.errors, null, 2));
      // No lanzamos error para permitir que getProducts intente el fallback REST
      return null;
    }

    return json.data;
  } catch (error) {
    console.error('fetchWooGraphQL Exception:', error);
    return null;
  }
}

/**
 * Obtiene todos los productos usando la estrategia híbrida.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    // 1. Intentar con GraphQL para mayor velocidad y menor peso de datos
    const query = `
      query GetProducts {
        products(first: 50, where: {status: "publish"}) {
          nodes {
            databaseId
            name
            slug
            sku
            description
            shortDescription
            onSale
            ... on ProductWithPricing {
              regularPrice
              salePrice
              price
            }
            image {
              sourceUrl
              altText
            }
            ... on ProductWithGallery {
              galleryImages {
                nodes {
                  sourceUrl
                  altText
                }
              }
            }
            productCategories {
              nodes {
                databaseId
                name
                slug
              }
            }
            attributes {
              nodes {
                name
                options
              }
            }
            ... on SimpleProduct {
              stockStatus
              stockQuantity
            }
            ... on VariableProduct {
              stockStatus
              stockQuantity
            }
          }
        }
      }
    `;

    const data = await fetchWooGraphQL(query, {}, { next: { tags: ['products'], revalidate: 3600 } });
    
    if (!data || !data.products) {
      throw new Error("GraphQL no devolvió datos de productos");
    }

    interface GQLNode {
      databaseId: number;
      name: string;
      slug: string;
      sku?: string;
      description?: string;
      shortDescription?: string;
      onSale: boolean;
      regularPrice?: string;
      salePrice?: string;
      price?: string;
      image?: { sourceUrl: string; altText: string };
      galleryImages?: { nodes: Array<{ sourceUrl: string; altText: string }> };
      productCategories?: { nodes: Array<{ databaseId: number; name: string; slug: string }> };
      attributes?: { nodes: Array<{ name: string; options: string[] }> };
      stockStatus?: string;
      stockQuantity?: number;
    }

    // Mapear la data de GraphQL (los campos pueden variar ligeramente)
    return data.products.nodes.map((node: GQLNode) => mapWooProductToImbra({
      id: node.databaseId,
      name: node.name,
      slug: node.slug,
      sku: node.sku,
      description: node.description,
      short_description: node.shortDescription,
      price: node.price?.replace(/[^\d]/g, '') || "0",
      regular_price: node.regularPrice?.replace(/[^\d]/g, '') || "0",
      sale_price: node.salePrice?.replace(/[^\d]/g, '') || "",
      on_sale: node.onSale,
      images: [
        node.image,
        ...(node.galleryImages?.nodes || [])
      ].filter((img): img is { sourceUrl: string; altText: string } => !!img).map(img => ({ src: img.sourceUrl, alt: img.altText })),
      categories: node.productCategories?.nodes.map((c) => ({ id: c.databaseId, name: c.name, slug: c.slug })),
      attributes: node.attributes?.nodes || [],
      stock_status: node.stockStatus?.toLowerCase() as Product['stock_status'],
      stock_quantity: node.stockQuantity || 0
    }));

  } catch (error) {
    console.warn("GraphQL falló, reintentando con REST API...", error);
    
    // 2. Fallback a REST API
    try {
      const wooProducts = await fetchWooRest('products?status=publish&per_page=50', {
        next: { tags: ['products'], revalidate: 3600 }
      });
      return wooProducts.map(mapWooProductToImbra);
    } catch (restError) {
      console.error("REST API también falló:", restError);
      return [];
    }
  }
}

/**
 * Obtiene un producto por su slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const query = `
      query GetProductBySlug($slug: ID!) {
        product(id: $slug, idType: SLUG) {
          databaseId
          name
          slug
          sku
          description
          shortDescription
          onSale
          regularPrice
          salePrice
          price
          image {
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              sourceUrl
              altText
            }
          }
          productCategories {
            nodes {
              databaseId
              name
              slug
            }
          }
          attributes {
            nodes {
              name
              options
            }
          }
          ... on SimpleProduct {
            stockStatus
            stockQuantity
          }
          ... on VariableProduct {
            stockStatus
            stockQuantity
          }
        }
      }
    `;

    const data = await fetchWooGraphQL(query, { slug }, { next: { tags: [`product-${slug}`], revalidate: 3600 } });
    if (!data.product) return null;

    const node = data.product;
    return mapWooProductToImbra({
      id: node.databaseId,
      name: node.name,
      slug: node.slug,
      sku: node.sku,
      description: node.description,
      short_description: node.shortDescription,
      price: node.price?.replace(/[^\d]/g, '') || "0",
      regular_price: node.regularPrice?.replace(/[^\d]/g, '') || "0",
      sale_price: node.salePrice?.replace(/[^\d]/g, '') || "",
      on_sale: node.onSale,
      images: [
        node.image,
        ...(node.galleryImages?.nodes || [])
      ].filter((img: { sourceUrl: string; altText: string } | undefined): img is { sourceUrl: string; altText: string } => !!img)
       .map(img => ({ src: img.sourceUrl, alt: img.altText })),
      categories: node.productCategories?.nodes.map((c: { databaseId: number; name: string; slug: string }) => ({ id: c.databaseId, name: c.name, slug: c.slug })),
      attributes: node.attributes?.nodes || [],
      stock_status: node.stockStatus?.toLowerCase() as Product['stock_status'],
      stock_quantity: node.stockQuantity || 0
    });
  } catch (error) {
    console.warn("GraphQL falló para producto individual, reintentando con REST API...", error);
    try {
      const products = await fetchWooRest(`products?slug=${slug}`);
      if (products.length === 0) return null;
      return mapWooProductToImbra(products[0]);
    } catch (restError) {
      console.error(restError);
      return null;
    }
  }
}

/**
 * Verifica el stock de un producto directamente en la REST API (Bypass Caché).
 */
export async function checkProductStock(productId: number): Promise<{ 
  inStock: boolean; 
  quantity: number; 
  status: string 
}> {
  try {
    const product = await fetchWooRest(`products/${productId}`, {
      cache: 'no-store' // Forzar bypass de caché de Next.js
    });

    return {
      inStock: product.stock_status === 'instock' && (product.manage_stock === false || (product.stock_quantity || 0) > 0),
      quantity: product.stock_quantity || 0,
      status: product.stock_status
    };
  } catch (error) {
    console.error(`Error verificando stock para producto ${productId}:`, error);
    throw error;
  }
}

/**
 * Crea un pedido en WooCommerce.
 */
export async function createOrder(orderData: Record<string, unknown>) {
  return fetchWooRest('orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

/**
 * Actualiza el estado de un pedido en WooCommerce.
 */
export async function updateOrderStatus(orderId: number, status: string, setPaid: boolean = false) {
  return fetchWooRest(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status,
      set_paid: setPaid
    })
  });
}
