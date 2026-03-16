import { NextRequest, NextResponse } from 'next/server';

/**
 * Retorna la IP real del cliente, necesaria para el campo ipAddress de PlacetoPay.
 * PlacetoPay requiere la IP del usuario final segun la Guia de Certificacion WC (punto 3.5).
 */
export async function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  // x-forwarded-for puede contener multiples IPs separadas por coma; tomamos la primera (cliente real)
  const ip = forwarded?.split(',')[0].trim() ?? realIp ?? '127.0.0.1';

  return NextResponse.json({ ip });
}
