import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("products_search")
      .select("id, name, slug, sku, price, regular_price, sale_price, on_sale, image_url, stock_status, stock_quantity, is_comprable, brand, vehicle_brand, vehicle_model, vehicle_years, part_category, category_slug, categories")
      .eq("status", "publish")
      .eq("is_comprable", true)
      .not("image_url", "is", null)
      .limit(60);

    if (error) throw error;

    // Mezclar aleatoriamente server-side y devolver 8
    const shuffled = (data || []).sort(() => Math.random() - 0.5).slice(0, 8);

    return NextResponse.json({ products: shuffled });
  } catch (err) {
    console.error("showcase error:", err);
    return NextResponse.json({ products: [] });
  }
}
