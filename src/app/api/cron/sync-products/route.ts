import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { mapWooProductToImbra, WooProductRaw } from '@/lib/mappers';

/**
 * Calcula la prioridad de visualizacion del producto:
 * 1 = con stock y con foto real
 * 2 = con stock pero sin foto real
 * 3 = sin stock
 */
function calcularPrioridad(imageUrl: string | null, stockStatus: string): number {
  // Las imagenes SAP (movil.indummelbra.com) son fotos reales de los productos IMBRA
  // Solo se considera sin foto cuando no hay URL o es el placeholder generico
  const sinFoto =
    !imageUrl ||
    imageUrl.includes('/images/placeholder.png');

  const tieneStock = stockStatus === 'instock';

  if (tieneStock && !sinFoto) return 1;
  if (tieneStock && sinFoto)  return 2;
  return 3;
}

const CONSUMER_KEY    = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const WOOCOMMERCE_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '');

/**
 * Cron diario 4:00am — borra toda la tabla products_search y re-sincroniza
 * desde WooCommerce. Elimina productos fantasma y duplicados.
 *
 * Llamar con: Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  const start = Date.now();
  const authHeader = request.headers.get('authorization');
  const CRON_SECRET = process.env.CRON_SECRET;

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    return NextResponse.json({ error: 'Faltan variables de entorno de WooCommerce' }, { status: 500 });
  }

  // PASO 1: Borrar TODA la tabla para evitar duplicados y productos fantasma
  const { error: deleteError } = await supabaseAdmin
    .from('products_search')
    .delete()
    .neq('id', 0);

  if (deleteError) {
    return NextResponse.json({ success: false, error: `Error borrando tabla: ${deleteError.message}` }, { status: 500 });
  }

  // PASO 2: Paginar todos los productos publicados desde WooCommerce
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  let page = 1;
  let allProducts: unknown[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Error WooCommerce página ${page}: ${res.status}` },
        { status: 500 }
      );
    }

    const batch = await res.json() as unknown[];

    if (batch.length === 0 || page > 50) {
      hasMore = false;
    } else {
      allProducts = [...allProducts, ...batch];
      page++;
    }
  }

  // PASO 3: Mapear al formato Supabase
  const mappedProducts = allProducts.map(p => {
    const raw = p as WooProductRaw & { status?: string };
    const product = mapWooProductToImbra(raw);
    const salePriceNum = parseFloat(product.sale_price || '0');
    const imageUrl = product.images[0]?.src || null;
    return {
      id:               product.id,
      name:             product.name,
      slug:             product.slug,
      sku:              product.sku,
      brand:            product.brand,
      price:            parseFloat(product.price) || 0,
      regular_price:    parseFloat(product.regular_price) || 0,
      sale_price:       salePriceNum > 0 ? salePriceNum : null,
      on_sale:          product.on_sale,
      description:      product.description,
      short_description: product.short_description,
      image_url:        imageUrl,
      categories:       product.categories,
      stock_status:     product.stock_status,
      stock_quantity:   product.stock_quantity,
      is_comprable:     product.is_comprable,
      vehicle_brand:    product.vehicle_brand,
      vehicle_model:    product.vehicle_model,
      vehicle_years:    product.vehicle_years,
      part_category:    product.part_category,
      category_slug:    product.category_slug,
      cc_class:         product.cc_class ?? null,
      status:           raw.status || 'publish',
      display_priority: calcularPrioridad(imageUrl, product.stock_status),
    };
  });

  // PASO 4: Insertar todo limpio (tabla ya vacía, INSERT directo es más rápido)
  const { error: insertError } = await supabaseAdmin
    .from('products_search')
    .insert(mappedProducts);

  if (insertError) {
    return NextResponse.json(
      { success: false, error: `Error insertando productos: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    count: mappedProducts.length,
    duration_ms: Date.now() - start,
    message: `Sync completo: ${mappedProducts.length} productos sincronizados`,
  });
}
