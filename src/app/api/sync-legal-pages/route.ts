import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const SYNC_SECRET = process.env.SYNC_SECRET || "imbra-secret-2026";

interface WordPressPage {
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  modified_gmt: string;
}

async function performSync(slug: string | null) {
  if (!WORDPRESS_URL) {
    throw new Error("URL de WordPress no configurada");
  }

  let pagesToSync: WordPressPage[] = [];

  if (slug) {
    console.log(`[SYNC] Iniciando sincronización para slug: ${slug}`);
    const wpResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${slug}`);
    if (!wpResponse.ok) throw new Error(`Error WordPress: ${wpResponse.statusText}`);
    pagesToSync = await wpResponse.json();
  } else {
    console.log("[SYNC] Iniciando sincronización masiva...");
    const wpResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/pages?per_page=100`);
    if (!wpResponse.ok) throw new Error(`Error WordPress Masivo: ${wpResponse.statusText}`);
    pagesToSync = await wpResponse.json();
  }

  if (!Array.isArray(pagesToSync) || pagesToSync.length === 0) {
    return { success: false, message: "No se encontraron páginas para sincronizar" };
  }

  const supabaseData = pagesToSync.map(wpPage => {
    let pageType = 'otro';
    if (wpPage.slug.startsWith('politica-')) pageType = 'legal';
    else if (wpPage.slug.startsWith('pagina-')) pageType = 'pagina';
    else if (wpPage.slug === 'terminos-y-condiciones') pageType = 'legal';

    return {
      slug: wpPage.slug,
      title: wpPage.title.rendered,
      content: wpPage.content.rendered,
      type: pageType,
      modified_gmt: wpPage.modified_gmt,
      last_sync: new Date().toISOString()
    };
  });

  const { error: supabaseError } = await supabaseAdmin
    .from('info_politica_paginas')
    .upsert(supabaseData, { onConflict: 'slug' });

  if (supabaseError) {
    throw new Error(`Error en Supabase: ${supabaseError.message}`);
  }

  // REVALIDAR LA RUTA EN NEXT.JS PARA ACTUALIZACIÓN INSTANTÁNEA
  if (slug) {
    console.log(`[SYNC] Revalidando ruta: /${slug}`);
    revalidatePath(`/${slug}`);
  } else {
    console.log("[SYNC] Revalidando rutas raíz");
    revalidatePath("/[slug]", "page");
  }

  return {
    success: true,
    count: supabaseData.length,
    synced_pages: supabaseData.map(p => p.slug)
  };
}

// MANEJADOR GET (Para pruebas manuales)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const secret = searchParams.get("secret");

  if (secret !== SYNC_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await performSync(slug);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// MANEJADOR POST (Para Webhooks de WordPress)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, secret } = body;

    // Verificar secreto en el body
    if (secret !== SYNC_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const result = await performSync(slug);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

