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
            image {
              sourceUrl
              altText
            }
            ... on SimpleProduct {
              price
              regularPrice
              salePrice
              stockStatus
              stockQuantity
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
            }
            ... on VariableProduct {
              price
              regularPrice
              salePrice
              stockStatus
              stockQuantity
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
      stock_quantity: node.stockQuantity ?? undefined
    }));

  } catch (error) {
    console.warn("GraphQL falló, reintentando con REST API...", error);
    
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
            price
            regularPrice
            salePrice
            stockStatus
            stockQuantity
          }
          ... on VariableProduct {
            price
            regularPrice
            salePrice
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
      stock_quantity: node.stockQuantity ?? undefined  // null = manage_stock:false, el mapper lo maneja
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
 * Obtiene los últimos productos publicados (para sidebar).
 */
export async function getRecentProducts(limit = 5): Promise<Product[]> {
  try {
    const wooProducts = await fetchWooRest(`products?status=publish&per_page=${limit}&orderby=date&order=desc`, {
      next: { tags: ['products'], revalidate: 3600 }
    });
    return wooProducts.map(mapWooProductToImbra);
  } catch (error) {
    console.error("Error obteniendo productos recientes:", error);
    return [];
  }
}

/**
 * Obtiene productos de una categoría específica por su slug.
 */
export async function getProductsByCategory(categorySlug: string, limit = 20): Promise<Product[]> {
  try {
    // Primero obtenemos el ID de la categoría
    const categories = await fetchWooRest(`products/categories?slug=${categorySlug}`, {
      next: { tags: ['categories'], revalidate: 3600 }
    });

    if (!categories || categories.length === 0) return [];

    const categoryId = categories[0].id;
    const wooProducts = await fetchWooRest(`products?status=publish&category=${categoryId}&per_page=${limit}&orderby=date&order=desc`, {
      next: { tags: [`category-${categorySlug}`], revalidate: 3600 }
    });

    return wooProducts.map(mapWooProductToImbra);
  } catch (error) {
    console.error("Error obteniendo productos por categoría:", error);
    return [];
  }
}

/**
 * Navega al producto anterior / siguiente dentro de la misma categoría.
 * Devuelve { prev, next } con slug y nombre del producto contiguo.
 */
export async function getAdjacentProductsInCategory(
  currentSlug: string,
  categorySlug: string
): Promise<{ prev: { slug: string; name: string } | null; next: { slug: string; name: string } | null }> {
  try {
    const productos = await getProductsByCategory(categorySlug, 100);

    const idx = productos.findIndex((p) => p.slug === currentSlug);
    if (idx === -1) return { prev: null, next: null };

    const prev = idx > 0 ? { slug: productos[idx - 1].slug, name: productos[idx - 1].name } : null;
    const next = idx < productos.length - 1 ? { slug: productos[idx + 1].slug, name: productos[idx + 1].name } : null;

    return { prev, next };
  } catch (error) {
    console.error("Error obteniendo productos adyacentes:", error);
    return { prev: null, next: null };
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
      cache: 'no-store'
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

/**
 * Actualiza los metadatos de un pedido.
 */
export async function updateOrderMetadata(orderId: number, metaData: Array<{ key: string, value: string }>) {
  return fetchWooRest(`orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      meta_data: metaData
    })
  });
}

/**
 * Obtiene pedidos con un estado específico.
 */
export async function getOrdersByStatus(status: string) {
  return fetchWooRest(`orders?status=${status}&per_page=100`);
}

/**
 * Obtiene un pedido específico por su ID.
 */
export async function getOrder(orderId: number) {
  return fetchWooRest(`orders/${orderId}`);
}

/**
 * Obtiene los productos destacados (featured = true).
 */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  try {
    const wooProducts = await fetchWooRest(
      `products?status=publish&featured=true&per_page=${limit}&orderby=date&order=desc`,
      { next: { tags: ['products'], revalidate: 3600 } }
    );
    return wooProducts.map(mapWooProductToImbra);
  } catch (error) {
    console.error("Error obteniendo productos destacados:", error);
    return [];
  }
}
