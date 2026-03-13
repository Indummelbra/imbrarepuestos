import { Product } from "@/types/product";

/**
 * Mapper "Nivel Dios" para normalizar productos de WooCommerce.
 * Transforma la data cruda de la API (REST o GQL) al formato estándar de IMBRA.
 */
export interface WooProductRaw {
  id?: number;
  databaseId?: number;
  name: string;
  slug: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  description?: string;
  short_description?: string;
  permalink?: string;
  images?: Array<{ src?: string; sourceUrl?: string; alt?: string }>;
  categories?: Array<{ id: number; name: string; slug: string }>;
  attributes?: Array<{ name: string; options: string[] }>;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity?: number;
  meta_data?: Array<{ key: string; value: unknown }>;
}

export function mapWooProductToImbra(wooProduct: WooProductRaw): Product {
  // 1. Extracción de Metadatos
  const meta_data = wooProduct.meta_data || [];
  
  // Buscar Marca en meta_data o atributos
  let brand = "Genérico";
  const brandMeta = meta_data.find((m) => m.key === "_brand" || m.key === "pa_marca" || m.key === "_marca");
  if (brandMeta) {
    brand = String(brandMeta.value);
  } else if (wooProduct.attributes) {
    const brandAttr = wooProduct.attributes.find((a) => a.name.toLowerCase() === "marca");
    if (brandAttr && brandAttr.options && brandAttr.options.length > 0) {
      brand = brandAttr.options[0];
    }
  }

  // 2. Lógica de Stock e Disponibilidad
  const stock_quantity = wooProduct.stock_quantity || 0;
  const stock_status = wooProduct.stock_status || 'outofstock';
  
  // Un producto es comprable solo si tiene stock real > 0 Y el estado es 'instock'
  const is_comprable = stock_quantity > 0 && stock_status === 'instock';

  // 3. Normalización de Imágenes
  const images = wooProduct.images && wooProduct.images.length > 0 
    ? wooProduct.images.map((img) => ({
        src: img.src || img.sourceUrl || "/images/placeholder.png",
        alt: img.alt || wooProduct.name
      }))
    : [{ src: "/images/placeholder.png", alt: wooProduct.name }];

  // 4. Mapeo Final
  return {
    id: wooProduct.id || wooProduct.databaseId || 0,
    name: wooProduct.name,
    slug: wooProduct.slug,
    sku: wooProduct.sku || "",
    price: wooProduct.price || "0",
    regular_price: wooProduct.regular_price || wooProduct.price || "0",
    sale_price: wooProduct.sale_price || "",
    on_sale: wooProduct.on_sale || false,
    description: wooProduct.description || "",
    short_description: wooProduct.short_description || "",
    permalink: wooProduct.permalink || "",
    images,
    categories: (wooProduct.categories || []) as Product['categories'],
    attributes: (wooProduct.attributes || []) as Product['attributes'],
    brand,
    stock_status,
    stock_quantity,
    is_comprable,
    meta_data
  };
}

/**
 * Mapper para colecciones de productos.
 */
export function mapWooProductsToImbra(wooProducts: WooProductRaw[]): Product[] {
  if (!wooProducts || !Array.isArray(wooProducts)) return [];
  return wooProducts.map(mapWooProductToImbra);
}
