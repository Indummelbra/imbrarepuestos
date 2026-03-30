
/**
 * Utilidades para la extracción de datos de vehículos desde títulos de SAP/WooCommerce.
 * Basado en los patrones observados en la base de datos de IMBRA.
 */
import { findCategoryByText, CategoryMeta } from "./category-taxonomy";

export const COMMON_BRANDS = [
  "YAMAHA", "SUZUKI", "HONDA", "BAJAJ", "AKT", "KAWASAKI", "KTM", 
  "HERO", "TVS", "VICTORY", "KYMCO", "PIAGGIO", "SYM", "SIGMA", "TVS"
];

export const COMMON_MODELS = [
  "BWS", "PULSAR", "BOXER", "GN", "TS", "DT", "RX", "XTZ", "NMAX", 
  "FZ", "GIXER", "APACHE", "NKD", "LIBERO", "BWS 125", "BWS 4T", "FZ 16"
];

/**
 * Extrae marcas detectadas en el título.
 */
export function extractBrand(title: string): string | null {
  const upperTitle = title.toUpperCase();
  for (const brand of COMMON_BRANDS) {
    if (upperTitle.includes(brand)) return brand;
  }
  return null;
}

/**
 * Extrae modelos detectados en el título.
 */
export function extractModel(title: string): string | null {
  const upperTitle = title.toUpperCase();
  // Ordenar por longitud descendente para evitar que "FZ" matchee antes que "FZ 16"
  const sortedModels = [...COMMON_MODELS].sort((a, b) => b.length - a.length);
  
  for (const model of sortedModels) {
    if (upperTitle.includes(model)) return model;
  }
  return null;
}

/**
 * Extrae y expande años desde patrones como (MOD 11-15), (MOD 2024), etc.
 */
export function extractYears(title: string): number[] {
  const years: number[] = [];
  const upperTitle = title.toUpperCase();
  
  // Buscar el patrón (MOD ...)
  const modMatch = upperTitle.match(/\(MOD\s+([^)]+)\)/);
  if (!modMatch) return [];

  const content = modMatch[1].trim(); // Ejemplo: "11-15", "2024", "08-12 / 15"
  
  // Split por coma, guion o espacio
  const parts = content.split(/[\s,/]+|(?<=\d)-(?=\d)/);
  
  for (const part of parts) {
    if (part.includes('-')) {
      // Rango: "11-15"
      const [startStr, endStr] = part.split('-');
      let start = parseInt(startStr);
      let end = parseInt(endStr);
      
      if (!isNaN(start) && !isNaN(end)) {
        start = normalizeYear(start);
        end = normalizeYear(end);
        
        for (let y = Math.min(start, end); y <= Math.max(start, end); y++) {
          years.push(y);
        }
      }
    } else {
      // Año único: "11" o "2024"
      const year = parseInt(part);
      if (!isNaN(year)) {
        years.push(normalizeYear(year));
      }
    }
  }

  return [...new Set(years)].sort();
}

/**
 * Normaliza años de 2 dígitos a 4 dígitos.
 */
function normalizeYear(y: number): number {
  if (y >= 1000) return y;
  if (y < 30) return 2000 + y;
  if (y >= 70) return 1900 + y;
  return y;
}

/**
 * Extrae y normaliza la categoría de repuesto usando la taxonomía canónica.
 * Prioridad: categorías WooCommerce → título del producto.
 * Devuelve el nombre de display canónico (ej: "Suspensión").
 */
export function extractPartCategory(title: string, categories: string[] = []): string {
  // 1. Intentar con cada categoría WooCommerce (excluyendo genéricas)
  const skipCategories = new Set(["Sin categorizar", "Uncategorized", ""]);
  for (const cat of categories) {
    if (!skipCategories.has(cat?.trim())) {
      const found = findCategoryByText(cat);
      if (found.slug !== "general") return found.name;
    }
  }

  // 2. Fallback: escanear el título del producto
  const found = findCategoryByText(title);
  return found.name;
}

/**
 * Extrae el slug de categoría canónico para usar en URLs y filtros.
 * Ej: "KIT TIJERA" → "suspension"
 */
export function extractCategorySlug(title: string, categories: string[] = []): string {
  const skipCategories = new Set(["Sin categorizar", "Uncategorized", ""]);
  for (const cat of categories) {
    if (!skipCategories.has(cat?.trim())) {
      const found = findCategoryByText(cat);
      if (found.slug !== "general") return found.slug;
    }
  }
  return findCategoryByText(title).slug;
}

/**
 * Devuelve el objeto completo de categoría canónica.
 */
export function extractCategoryMeta(title: string, categories: string[] = []): CategoryMeta {
  const skipCategories = new Set(["Sin categorizar", "Uncategorized", ""]);
  for (const cat of categories) {
    if (!skipCategories.has(cat?.trim())) {
      const found = findCategoryByText(cat);
      if (found.slug !== "general") return found;
    }
  }
  return findCategoryByText(title);
}
