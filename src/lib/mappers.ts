import { Product } from "@/types/product";
import { extractBrand, extractModel, extractYears, extractPartCategory, extractCategorySlug } from "./vehicle-utils";

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
  const rawQty = wooProduct.stock_quantity; // null = WooCommerce no gestiona cantidad (manage_stock: false)
  const stock_quantity = rawQty ?? 0;
  const stock_status = wooProduct.stock_status || 'outofstock';

  // Si WooCommerce gestiona cantidad → requiere qty > 0 para ser comprable
  // Si NO gestiona cantidad (rawQty === null) → basta con que status sea 'instock'
  const is_comprable = stock_status === 'instock' && (rawQty === null || rawQty === undefined || rawQty > 0);

  // 3. Normalización de Imágenes SAP (Fuente única de verdad)
  const cleanSku = (wooProduct.sku || "").toLowerCase().replace(/b$/, "");
  const sapImageUrl = cleanSku 
    ? `https://movil.indummelbra.com:50101/Imbrapp/images/${cleanSku}.png`
    : "/images/placeholder.png";

  const images = [{ 
    src: sapImageUrl, 
    alt: wooProduct.name 
  }];

  // 4. Extracción de Datos de Vehículo (Aumentado para Buscador Faceteado)
  const categoryNames = (wooProduct.categories || []).map((c) => c.name);
  const vehicle_brand = extractBrand(wooProduct.name) || brand;
  const vehicle_model = extractModel(wooProduct.name) || "";
  const vehicle_years = extractYears(wooProduct.name);
  const part_category = extractPartCategory(wooProduct.name, categoryNames);
  const category_slug = extractCategorySlug(wooProduct.name, categoryNames);

  // 5. Normalización de on_sale: sale_price > 0 y diferente al precio regular
  const salePriceNum = parseFloat(wooProduct.sale_price || "0");
  const regularPriceNum = parseFloat(wooProduct.regular_price || wooProduct.price || "0");
  const on_sale = salePriceNum > 0 && salePriceNum < regularPriceNum;

  // 6. Mapeo Final
  return {
    id: wooProduct.id || wooProduct.databaseId || 0,
    name: wooProduct.name,
    slug: wooProduct.slug,
    sku: wooProduct.sku || "",
    price: wooProduct.price || "0",
    regular_price: wooProduct.regular_price || wooProduct.price || "0",
    sale_price: on_sale ? wooProduct.sale_price! : "",
    on_sale,
    description: wooProduct.description || "",
    short_description: wooProduct.short_description || "",
    permalink: wooProduct.permalink || "",
    images,
    categories: (wooProduct.categories || []) as Product['categories'],
    attributes: (wooProduct.attributes || []) as Product['attributes'],
    brand: vehicle_brand,
    vehicle_brand,
    vehicle_model,
    vehicle_years,
    part_category,
    category_slug,
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
