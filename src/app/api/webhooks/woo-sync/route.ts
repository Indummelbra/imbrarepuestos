import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { mapWooProductToImbra, WooProductRaw } from "@/lib/mappers";

const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

/**
 * Helper para obtener la data completa del producto desde Woo REST API.
 * Se prefiere refetch sobre usar el body del webhook para asegurar integridad.
 */
async function getFullProduct(id: number) {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const response = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products/${id}`, {
    headers: { 'Authorization': `Basic ${auth}` },
    cache: 'no-store'
  });
  if (!response.ok) return null;
  return response.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topic = request.headers.get("x-wc-webhook-topic");
    const productId = body.id;

    console.log(`Webhook recibido: ${topic} para producto ID: ${productId}`);

    if (topic === "product.deleted") {
      // Eliminar de Supabase
      await supabaseAdmin.from('products_search').delete().eq('id', productId);
      revalidateTag('products');
      return NextResponse.json({ message: "Producto eliminado" });
    }

    if (topic === "product.created" || topic === "product.updated") {
      // Refetch completo (Nivel Dios)
      const wooProduct = await getFullProduct(productId);
      if (!wooProduct) throw new Error("No se pudo obtener el producto completo");

      const imbraProduct = mapWooProductToImbra(wooProduct as WooProductRaw);
      
      // Mapear para Supabase
      const supabaseData = {
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
        status: wooProduct.status || 'publish'
      };

      // Upsert en Supabase
      const { error } = await supabaseAdmin.from('products_search').upsert(supabaseData);
      if (error) throw error;

      // Revalidar caché de Next.js
      revalidateTag('products');
      revalidateTag(`product-${imbraProduct.slug}`);

      console.log(`Producto ${imbraProduct.slug} sincronizado y revalidado.`);
      return NextResponse.json({ message: "Sincronización exitosa", slug: imbraProduct.slug });
    }

    return NextResponse.json({ message: "Evento ignorado" });

  } catch (error: unknown) {
    console.error("Error en Webhook:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido en Webhook";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
