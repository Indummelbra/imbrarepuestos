import { Product } from "@/types/product";

/**
 * Mapper "Nivel Dios" para normalizar productos de WooCommerce.
 * Transforma la data cruda de la API (REST o GQL) al formato estándar de IMBRA.
 */
export function mapWooProductToImbra(wooProduct: any): Product {
  // 1. Extracción de Metadatos
  const meta_data = wooProduct.meta_data || [];
  
  // Buscar Marca en meta_data o atributos
  let brand = "Genérico";
  const brandMeta = meta_data.find((m: any) => m.key === "_brand" || m.key === "pa_marca" || m.key === "_marca");
  if (brandMeta) {
    brand = brandMeta.value;
  } else if (wooProduct.attributes) {
    const brandAttr = wooProduct.attributes.find((a: any) => a.name.toLowerCase() === "marca");
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
    ? wooProduct.images.map((img: any) => ({
        src: img.src || img.sourceUrl || "/images/placeholder.png",
        alt: img.alt || wooProduct.name
      }))
    : [{ src: "/images/placeholder.png", alt: wooProduct.name }];

  // 4. Mapeo Final
  return {
    id: wooProduct.id || wooProduct.databaseId,
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
    categories: wooProduct.categories || [],
    attributes: wooProduct.attributes || [],
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
export function mapWooProductsToImbra(wooProducts: any[]): Product[] {
  if (!wooProducts || !Array.isArray(wooProducts)) return [];
  return wooProducts.map(mapWooProductToImbra);
}
