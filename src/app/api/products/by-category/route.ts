import { NextRequest, NextResponse } from "next/server";
export const revalidate = 300; // cache 5 minutos
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const groupId = req.nextUrl.searchParams.get("group");
    if (!groupId) return NextResponse.json({ products: [] });

    const { data, error } = await supabaseAdmin
      .from("products_search")
      .select("id, name, slug, price, regular_price, on_sale, image_url, stock_status, stock_quantity, is_comprable, brand")
      .eq("status", "publish")
      .eq("is_comprable", true)
      .eq("category_slug", groupId)
      .limit(24);

    if (error) throw error;

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    console.error("by-category error:", err);
    return NextResponse.json({ products: [] });
  }
}
