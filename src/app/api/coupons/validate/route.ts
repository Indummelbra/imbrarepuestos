import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Credenciales de WooCommerce (solo servidor)
const WOOCOMMERCE_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '');
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

/**
 * POST /api/coupons/validate
 * Valida un cupon contra la REST API de WooCommerce.
 * Recibe: { code: string, subtotal?: number, productIds?: number[] }
 * Devuelve: { valid, code, discount_type, amount, description, ... } o { valid: false, error }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal = 0 } = body;

    // Validacion basica del input
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json({
        valid: false,
        error: 'Ingresa un codigo de cupon valido.'
      }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();

    // Verificar que tenemos las credenciales
    if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      console.error('[CUPONES] Faltan variables de entorno de WooCommerce');
      return NextResponse.json({
        valid: false,
        error: 'Error interno del servidor. Intenta de nuevo mas tarde.'
      }, { status: 500 });
    }

    // Consultar cupon en WooCommerce
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const wcRes = await fetch(
      `${WOOCOMMERCE_URL}/wp-json/wc/v3/coupons?code=${encodeURIComponent(cleanCode)}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Sin cache — siempre datos frescos
      }
    );

    if (!wcRes.ok) {
      console.error(`[CUPONES] Error consultando WooCommerce: ${wcRes.status}`);
      return NextResponse.json({
        valid: false,
        error: 'No pudimos verificar tu cupon. Intenta de nuevo en unos segundos.'
      }, { status: 502 });
    }

    const coupons = await wcRes.json();

    // Si no existe el cupon
    if (!Array.isArray(coupons) || coupons.length === 0) {
      return NextResponse.json({
        valid: false,
        error: 'Ese codigo no existe. Revisalo bien y vuelve a intentar.'
      });
    }

    const coupon = coupons[0];

    // --- VALIDACIONES ---

    // 1. Verificar si esta publicado
    if (coupon.status && coupon.status !== 'publish') {
      return NextResponse.json({
        valid: false,
        error: 'Este cupon ya no esta disponible.'
      });
    }

    // 2. Verificar fecha de expiracion
    if (coupon.date_expires) {
      const expiryDate = new Date(coupon.date_expires);
      const now = new Date();
      if (now > expiryDate) {
        return NextResponse.json({
          valid: false,
          error: 'Este cupon ya expiro. Busca uno vigente y vuelve por tu descuento.'
        });
      }
    }

    // 3. Verificar limite de uso total
    if (coupon.usage_limit !== null && coupon.usage_limit > 0) {
      if (coupon.usage_count >= coupon.usage_limit) {
        return NextResponse.json({
          valid: false,
          error: 'Este cupon ya alcanzo su limite de usos. Ya no esta activo.'
        });
      }
    }

    // 4. Verificar monto minimo
    const minimumAmount = parseFloat(coupon.minimum_amount || '0');
    if (minimumAmount > 0 && subtotal < minimumAmount) {
      return NextResponse.json({
        valid: false,
        error: `Tu pedido necesita un minimo de $${minimumAmount.toLocaleString('es-CO')} para usar este cupon. Agrega mas productos.`
      });
    }

    // 5. Verificar monto maximo
    const maximumAmount = parseFloat(coupon.maximum_amount || '0');
    if (maximumAmount > 0 && subtotal > maximumAmount) {
      return NextResponse.json({
        valid: false,
        error: `Este cupon solo aplica para pedidos de hasta $${maximumAmount.toLocaleString('es-CO')}.`
      });
    }

    // --- CUPON VALIDO ---
    const amount = parseFloat(coupon.amount || '0');

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,      // 'fixed_cart', 'percent', 'fixed_product'
      amount,
      description: coupon.description || '',
      free_shipping: coupon.free_shipping || false,
      date_expires: coupon.date_expires || null,
      minimum_amount: coupon.minimum_amount || '0',
      maximum_amount: coupon.maximum_amount || '0',
      product_ids: coupon.product_ids || [],
      excluded_product_ids: coupon.excluded_product_ids || [],
    });

  } catch (error: unknown) {
    console.error('[CUPONES] Error inesperado:', error);
    return NextResponse.json({
      valid: false,
      error: 'Algo salio mal al verificar tu cupon. Intenta de nuevo.'
    }, { status: 500 });
  }
}
