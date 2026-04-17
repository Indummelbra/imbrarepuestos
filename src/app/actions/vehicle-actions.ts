
'use server';

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { IMBRA_CATEGORIES } from '@/lib/category-taxonomy';
import { unstable_cache } from 'next/cache';

/**
 * Obtiene las marcas de moto disponibles,
 * opcionalmente filtradas por grupo de categorías y/o cilindrada.
 */
export async function getVehicleBrands(categorySlugs?: string[], ccClass?: string) {
  let query = supabase
    .from('products_search')
    .select('vehicle_brand')
    .not('vehicle_brand', 'is', null)
    .neq('vehicle_brand', '')
    .eq('status', 'publish');

  if (categorySlugs?.length) query = query.in('category_slug', categorySlugs);
  if (ccClass) query = query.eq('cc_class', ccClass);

  const { data, error } = await query.order('vehicle_brand');
  if (error) return [];
  return [...new Set(data.map((r) => r.vehicle_brand))] as string[];
}

/**
 * Obtiene las cilindradas (cc_class) disponibles,
 * opcionalmente filtradas por marca y/o grupo de categorías.
 * Devuelve valores ordenados numéricamente: '100cc', '110cc', '125cc'...
 */
export async function getAvailableCCClasses(categorySlugs?: string[], brand?: string) {
  let query = supabase
    .from('products_search')
    .select('cc_class')
    .not('cc_class', 'is', null)
    .neq('cc_class', '')
    .eq('status', 'publish');

  if (categorySlugs?.length) query = query.in('category_slug', categorySlugs);
  if (brand) query = query.eq('vehicle_brand', brand);

  const { data, error } = await query;
  if (error) return [];

  const unique = [...new Set(data.map((r) => r.cc_class as string))];
  // Ordenar numéricamente: '100cc' → 100, '125cc' → 125, etc.
  return unique.sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Obtiene los modelos de moto disponibles, opcionalmente restringidos
 * a los slugs de un grupo de categorías (ej: solo modelos con repuestos de frenos).
 */
export async function getVehicleModels(categorySlugs?: string[]) {
  let query = supabase
    .from('products_search')
    .select('vehicle_model, vehicle_brand')
    .not('vehicle_model', 'is', null)
    .neq('vehicle_model', '')
    .eq('status', 'publish');

  if (categorySlugs?.length) {
    query = query.in('category_slug', categorySlugs);
  }

  const { data, error } = await query.order('vehicle_model');
  if (error) return [];

  // Devuelve modelos únicos con su marca para mostrar "BWS (YAMAHA)"
  const seen = new Set<string>();
  const results: { model: string; brand: string }[] = [];
  for (const row of data) {
    const key = `${row.vehicle_model}__${row.vehicle_brand}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ model: row.vehicle_model as string, brand: row.vehicle_brand as string });
    }
  }
  return results;
}

/**
 * Obtiene los años disponibles filtrados por marca + cilindrada + categoría.
 * Requiere al menos marca o cilindrada para tener resultados relevantes.
 */
export async function getAvailableYears(
  brand?: string,
  ccClass?: string,
  categorySlugs?: string[]
) {
  let query = supabase
    .from('products_search')
    .select('vehicle_years')
    .not('vehicle_years', 'is', null)
    .eq('status', 'publish');

  if (brand)              query = query.eq('vehicle_brand', brand);
  if (ccClass)            query = query.eq('cc_class', ccClass);
  if (categorySlugs?.length) query = query.in('category_slug', categorySlugs);

  const { data, error } = await query;
  if (error) return [];

  const allYears = data.flatMap((item) => item.vehicle_years || []);
  return [...new Set(allYears)].sort((a: number, b: number) => b - a) as number[];
}

/**
 * Obtiene las subcategorías WooCommerce reales disponibles dentro de un grupo,
 * opcionalmente filtradas por modelo y año. Sirve para el 4to dropdown de "TIPO".
 */
export async function getGroupSubcategories(
  groupSlugs: string[],
  model?: string,
  year?: number
): Promise<Array<{ slug: string; name: string; count: number }>> {
  if (!groupSlugs.length) return [];

  let query = supabase
    .from('products_search')
    .select('category_slug, part_category')
    .in('category_slug', groupSlugs)
    .not('category_slug', 'is', null)
    .eq('status', 'publish');

  if (model) query = query.eq('vehicle_model', model);
  if (year)  query = query.contains('vehicle_years', [year]);

  const { data, error } = await query;
  if (error) return [];

  const counts = new Map<string, { name: string; count: number }>();
  for (const row of data || []) {
    const slug = row.category_slug as string;
    const name = row.part_category as string;
    if (!slug) continue;
    const existing = counts.get(slug);
    if (existing) existing.count++;
    else counts.set(slug, { name: name || slug, count: 1 });
  }

  return [...counts.entries()]
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Obtiene las categorías de repuestos (Partes) disponibles.
 */
export async function getPartCategories(brand?: string, model?: string, year?: number) {
  let query = supabase
    .from('products_search')
    .select('part_category')
    .not('part_category', 'is', null)
    .neq('part_category', '');

  if (brand) query = query.eq('vehicle_brand', brand);
  if (model) query = query.eq('vehicle_model', model);
  if (year) query = query.contains('vehicle_years', [year]);

  const { data, error } = await query.order('part_category');

  if (error) {
    console.error('Error fetching parts:', error);
    return [];
  }

  const parts = [...new Set(data.map(item => item.part_category))];
  return parts;
}

/**
 * Realiza la búsqueda final basada en los filtros del vehículo.
 */
export async function searchByVehicle({
  brand,
  model,
  year,
  part,
  limit = 20
}: {
  brand: string;
  model: string;
  year?: number;
  part?: string;
  limit?: number;
}) {
  let query = supabase
    .from('products_search')
    .select('id, name, slug, sku, price, image_url, stock_status, vehicle_brand, vehicle_model, vehicle_years, part_category, category_slug')
    .eq('vehicle_brand', brand)
    .eq('vehicle_model', model);

  if (year) {
    query = query.contains('vehicle_years', [year]);
  }

  if (part) {
    query = query.eq('part_category', part);
  }

  const { data, error } = await query
    .order('display_priority', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error searching by vehicle:', error);
    return [];
  }

  return data;
}

// ─── FILTROS PARA SIDEBAR ────────────────────────────────────────────────────

export interface SidebarFilters {
  categories?: string[];   // category_slug[] (taxonomía / grupos expandidos)
  wooCategory?: string;    // slug exacto de categoría WooCommerce
  priceMin?: number;
  priceMax?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  vehicleBrand?: string;   // vehicle_brand: YAMAHA, HONDA, etc.
  vehicleModel?: string;   // vehicle_model: BWS, PULSAR, etc.
  vehicleYear?: number;
  ccClass?: string;        // cc_class: '125cc', '150cc', etc.
  query?: string;
}

/**
 * Devuelve las categorías reales de WooCommerce con conteo de productos cada una.
 * Lee el campo JSONB `categories` de products_search.
 */
export const getWooCategoriesWithCount = unstable_cache(
  async (): Promise<Array<{ slug: string; name: string; count: number }>> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products_search')
      .select('categories')
      .eq('status', 'publish');

    if (error || !data) return [];

    const counts = new Map<string, { name: string; count: number }>();
    for (const row of data) {
      const cats = (row.categories || []) as Array<{ id: number; name: string; slug: string }>;
      for (const cat of cats) {
        if (!cat?.slug || cat.slug === 'sin-categorizar' || cat.slug === 'uncategorized') continue;
        const existing = counts.get(cat.slug);
        if (existing) {
          existing.count++;
        } else {
          counts.set(cat.slug, { name: cat.name, count: 1 });
        }
      }
    }

    return Array.from(counts.entries())
      .map(([slug, { name, count }]) => ({ slug, name, count }))
      .sort((a, b) => b.count - a.count);
  },
  ['woo-categories-count'],
  { revalidate: 3600, tags: ['woo-counts'] }
);

/**
 * Devuelve las categorías disponibles con el conteo de productos para cada una.
 * Se puede filtrar por contexto de vehículo para mostrar solo lo relevante.
 */
export async function getCategoriesWithCount(filters?: Pick<SidebarFilters, 'vehicleBrand' | 'vehicleModel' | 'vehicleYear'>) {
  let query = supabase
    .from('products_search')
    .select('category_slug, part_category')
    .eq('status', 'publish')
    .not('category_slug', 'is', null)
    .neq('category_slug', '');

  if (filters?.vehicleBrand) query = query.eq('vehicle_brand', filters.vehicleBrand);
  if (filters?.vehicleModel) query = query.eq('vehicle_model', filters.vehicleModel);
  if (filters?.vehicleYear)  query = query.contains('vehicle_years', [filters.vehicleYear]);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching categories with count:', error);
    return [];
  }

  // Agrupar por category_slug y contar
  const counts = new Map<string, { name: string; slug: string; count: number }>();
  for (const row of data || []) {
    const slug = row.category_slug as string;
    const name = row.part_category as string;
    if (!slug) continue;
    const existing = counts.get(slug);
    if (existing) {
      existing.count++;
    } else {
      counts.set(slug, { slug, name, count: 1 });
    }
  }

  // Ordenar según el orden de la taxonomía, luego por conteo
  const taxonomyOrder = IMBRA_CATEGORIES.map((c) => c.slug);
  return [...counts.values()].sort((a, b) => {
    const ia = taxonomyOrder.indexOf(a.slug);
    const ib = taxonomyOrder.indexOf(b.slug);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return b.count - a.count;
  });
}

/**
 * Devuelve el rango de precios (min, max) para usar en el slider del sidebar.
 */
export async function getPriceRange(filters?: SidebarFilters): Promise<{ min: number; max: number }> {
  let query = supabase
    .from('products_search')
    .select('price')
    .eq('status', 'publish')
    .gt('price', 0);

  if (filters?.vehicleBrand) query = query.eq('vehicle_brand', filters.vehicleBrand);
  if (filters?.vehicleModel) query = query.eq('vehicle_model', filters.vehicleModel);
  if (filters?.vehicleYear)  query = query.contains('vehicle_years', [filters.vehicleYear]);
  if (filters?.inStockOnly)  query = query.eq('stock_status', 'instock');
  if (filters?.categories?.length) query = query.in('category_slug', filters.categories);

  const { data, error } = await query;
  if (error || !data?.length) return { min: 0, max: 1_000_000 };

  const prices = data.map((r) => r.price as number).filter(Boolean);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

/**
 * Búsqueda general con todos los filtros del sidebar.
 * Reemplaza searchByVehicle cuando se usan filtros avanzados.
 */
export async function searchWithFilters({
  filters = {},
  page = 1,
  perPage = 24,
  sortBy = 'name',
}: {
  filters?: SidebarFilters;
  page?: number;
  perPage?: number;
  sortBy?: 'name' | 'price_asc' | 'price_desc' | 'newest';
}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from('products_search')
    .select(
      'id, name, slug, sku, price, regular_price, sale_price, on_sale, image_url, stock_status, stock_quantity, is_comprable, vehicle_brand, vehicle_model, vehicle_years, part_category, category_slug, brand',
      { count: 'exact' }
    )
    .eq('status', 'publish');

  if (filters.vehicleBrand) query = query.eq('vehicle_brand', filters.vehicleBrand);
  if (filters.vehicleModel) query = query.eq('vehicle_model', filters.vehicleModel);
  if (filters.vehicleYear)  query = query.contains('vehicle_years', [filters.vehicleYear]);
  if (filters.ccClass)      query = query.eq('cc_class', filters.ccClass);
  if (filters.categories?.length) query = query.in('category_slug', filters.categories);
  if (filters.wooCategory) query = query.filter('categories', 'cs', JSON.stringify([{ slug: filters.wooCategory }]));
  if (filters.query)        query = query.or(`name.ilike.%${filters.query}%,sku.ilike.%${filters.query}%`);
  if (filters.inStockOnly)  query = query.eq('stock_status', 'instock');
  if (filters.onSaleOnly)   query = query.eq('on_sale', true);
  if (filters.priceMin != null) query = query.gte('price', filters.priceMin);
  if (filters.priceMax != null) query = query.lte('price', filters.priceMax);

  // Ordenamiento — display_priority siempre es el primer criterio:
  // 1 = con stock y con foto, 2 = con stock sin foto, 3 = sin stock
  query = query.order('display_priority', { ascending: true });
  switch (sortBy) {
    case 'price_asc':  query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    default:           query = query.order('name', { ascending: true }); break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error in searchWithFilters:', JSON.stringify(error, null, 2));
    return { products: [], total: 0, pages: 0 };
  }

  return {
    products: data || [],
    total: count || 0,
    pages: Math.ceil((count || 0) / perPage),
  };
}

/**
 * Conteo de productos publicados agrupados por category_slug (IMBRA taxonomy).
 * Usado por el CategoryCarousel del home para mostrar conteos reales.
 * Retorna: { "motor": 142, "frenos": 87, "suspension": 63, ... }
 */
export const getGroupProductCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase
      .from('products_search')
      .select('category_slug')
      .eq('status', 'publish')
      .not('category_slug', 'is', null)
      .neq('category_slug', '');

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    for (const row of data) {
      const slug = row.category_slug as string;
      if (slug) counts[slug] = (counts[slug] || 0) + 1;
    }
    return counts;
  },
  ['group-product-counts'],
  { revalidate: 3600, tags: ['group-counts'] }
);

export async function getFeaturedProductsForCarousel() {
  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('products_search')
        .select('id, name, slug, price, regular_price, on_sale, image_url, part_category')
        .eq('stock_status', 'instock')
        .not('image_url', 'is', null)
        .gt('stock_quantity', 0)
        .order('display_priority', { ascending: true })
        .order('name', { ascending: true })
        .limit(24);
      if (error || !data) return [];
      return data;
    },
    ['featured-carousel-products'],
    { revalidate: 1800, tags: ['featured-products'] }
  )();
}
