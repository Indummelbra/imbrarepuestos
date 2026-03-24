import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ciudades?state=5
 * Consulta la tabla codigos_ciudades en Supabase filtrando por departamento
 * Retorna las ciudades ordenadas alfabeticamente
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase.imbra.cloud';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateCode = searchParams.get('state');

  if (!stateCode) {
    return NextResponse.json(
      { error: 'Parametro "state" requerido' },
      { status: 400 }
    );
  }

  try {
    // Consulta la tabla codigos_ciudades filtrada por codigo de departamento
    const url = `${SUPABASE_URL}/rest/v1/codigos_ciudades?State=eq.${stateCode}&select=Name,Code,State&order=Name.asc`;

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      // Cache por 1 hora — los datos de ciudades no cambian frecuentemente
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('Error consultando Supabase:', response.status, await response.text());
      return NextResponse.json(
        { error: 'Error consultando las ciudades' },
        { status: 500 }
      );
    }

    const ciudades = await response.json();

    return NextResponse.json(ciudades, {
      headers: {
        // Cache del navegador por 1 hora
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error en /api/ciudades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
