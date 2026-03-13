'use server';

import { supabase } from '@/lib/supabase';

export interface SearchResult {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  image_url: string;
  stock_status: string;
  headline: string;
  rank: number;
}

export async function searchProductsAdvanced(query: string, limit: number = 6) {
  if (!query || query.length < 2) return [];

  try {
    const { data, error } = await supabase.rpc('search_products_advanced', {
      search_query: query,
      limit_val: limit
    });

    if (error) {
      console.error('Error calling search_products_advanced:', error);
      
      // Fallback a búsqueda simple ILIKE si falla el RPC
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('products_search')
        .select('id, name, slug, sku, price, image_url, stock_status')
        .ilike('name', `%${query}%`)
        .limit(limit);

      if (fallbackError) throw fallbackError;
      
      return (fallbackData || []).map(p => ({
        ...p,
        headline: p.name,
        rank: 0
      }));
    }

    return data as SearchResult[];
  } catch (error) {
    console.error('Search internal error:', error);
    return [];
  }
}
