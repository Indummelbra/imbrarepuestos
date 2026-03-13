import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { mapWooProductToImbra } from "@/lib/mappers";

const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const SYNC_SECRET = process.env.SYNC_SECRET || "imbra-secret-2026"; // Cambiar en producción

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== SYNC_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    return NextResponse.json({ error: "Variables de entorno de WooCommerce no configuradas" }, { status: 500 });
  }

  try {
    let page = 1;
    let allProducts: unknown[] = [];
    let hasMore = true;
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    console.log("Iniciando sincronización masiva...");

    while (hasMore) {
      const response = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish`, {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!response.ok) throw new Error(`Error en la página ${page}: ${response.status}`);

      const products = await response.json() as unknown[];
      if (products.length === 0) {
        hasMore = false;
      } else {
        allProducts = [...allProducts, ...products];
        page++;
        // Limitar para evitar loops infinitos en dev
        if (page > 20) hasMore = false; 
      }
    }

    console.log(`Mapeando ${allProducts.length} productos...`);
    const mappedProducts = allProducts.map(p => {
      const imbraProduct = mapWooProductToImbra(p);
      const productRaw = p as { status?: string }; // Cast seguro para acceso a status
      return {
        id: imbraProduct.id,
        name: imbraProduct.name,
        slug: imbraProduct.slug,
        sku: imbraProduct.sku,
        price: parseFloat(imbraProduct.price) || 0,
        regular_price: parseFloat(imbraProduct.regular_price) || 0,
        sale_price: imbraProduct.sale_price ? parseFloat(imbraProduct.sale_price) : null,
        description: imbraProduct.description,
        short_description: imbraProduct.short_description,
        image_url: imbraProduct.images[0]?.src || null,
        categories: imbraProduct.categories, // Ahora se envía como JSONB
        stock_status: imbraProduct.stock_status,
        stock_quantity: imbraProduct.stock_quantity,
        status: productRaw.status || 'publish'
      };
    });

    // Subir a Supabase (Table: products_search)
    // Usamos upsert basado en el ID del producto
    const { error } = await supabaseAdmin
      .from('products_search')
      .upsert(mappedProducts, { onConflict: 'id' });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: mappedProducts.length,
      message: "Sincronización masiva completada con éxito"
    });

  } catch (error: unknown) {
    console.error("Error en sincronización:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido en sincronización";
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
