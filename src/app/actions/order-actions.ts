'use server';

import { getCarrier } from '@/lib/carriers';

const WOOCOMMERCE_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '');
const CONSUMER_KEY    = process.env.WC_CONSUMER_KEY    || '';
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

function wcAuth() {
  return 'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface OrderLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  image_url?: string;
}

export interface CustomerOrder {
  id: number;
  number: string;
  status: string;
  statusLabel: string;
  dateCreated: string;
  total: string;
  currency: string;
  items: OrderLineItem[];
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
  } | null;
  paymentMethodTitle: string;
  shipping: {
    carrier: string;
    carrierName: string;
    guide: string;
    trackingUrl: string;
    hasTracking: boolean;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending:    'Pendiente de pago',
  processing: 'En proceso',
  'on-hold':  'En espera',
  completed:  'Completado',
  cancelled:  'Cancelado',
  refunded:   'Reembolsado',
  failed:     'Fallido',
};

// ─── Utilidad: extraer valor de meta_data ────────────────────────────────────
function getMeta(metaData: Array<{ key: string; value: unknown }>, key: string): string {
  return String(metaData?.find((m) => m.key === key)?.value ?? '');
}

// ─── Server Action principal ─────────────────────────────────────────────────

/**
 * Busca los pedidos de un cliente por email + número de documento.
 * La doble verificación garantiza que nadie pueda ver pedidos ajenos.
 *
 * @returns Array de pedidos o null si las credenciales no coinciden.
 */
export async function getOrdersByDocument(
  email: string,
  documentNumber: string,
  phone?: string
): Promise<CustomerOrder[] | null> {
  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error('[orders] Faltan variables de entorno WooCommerce');
    return null;
  }

  const normalizedDoc   = documentNumber.trim().replace(/\D/g, '');
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone ? phone.trim().replace(/\D/g, '') : '';

  if (!normalizedDoc || !normalizedEmail) return null;

  try {
    // Consulta WC: órdenes con ese email de facturación
    const url = `${WOOCOMMERCE_URL}/wp-json/wc/v3/orders?billing_email=${encodeURIComponent(normalizedEmail)}&per_page=50&orderby=date&order=desc`;

    const res = await fetch(url, {
      headers: { Authorization: wcAuth(), 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const raw: Array<Record<string, unknown>> = await res.json();
    if (!Array.isArray(raw)) return null;

    // Verificar documento + teléfono (factores de seguridad)
    const verified = raw.filter((order) => {
      const meta = (order.meta_data as Array<{ key: string; value: unknown }>) ?? [];
      const storedDoc = getMeta(meta, '_billing_numero_documento').replace(/\D/g, '');
      if (storedDoc !== normalizedDoc) return false;

      // Verificación de teléfono: si se proporcionó Y la orden tiene teléfono, deben coincidir
      if (normalizedPhone) {
        const billing = (order.billing as Record<string, string>) ?? {};
        const orderPhone = (billing.phone ?? '').replace(/\D/g, '');
        if (orderPhone && orderPhone !== normalizedPhone) return false;
      }

      return true;
    });

    if (verified.length === 0) return null;

    // Mapear al formato que usa el frontend
    return verified.map((o): CustomerOrder => {
      const meta          = (o.meta_data as Array<{ key: string; value: unknown }>) ?? [];
      const billing       = (o.billing  as Record<string, string>) ?? {};
      const shippingAddr  = (o.shipping as Record<string, string>) ?? {};
      const status        = String(o.status ?? 'pending');
      const carrier  = String(o.imbra_shipping_carrier ?? getMeta(meta, '_imbra_shipping_carrier') ?? '');
      const guide    = String(o.imbra_shipping_guide   ?? getMeta(meta, '_imbra_shipping_guide')   ?? '');
      const carrierInfo = getCarrier(carrier);

      const items: OrderLineItem[] = ((o.line_items as Array<Record<string, unknown>>) ?? []).map((li) => ({
        id:        Number(li.id),
        name:      String(li.name ?? ''),
        quantity:  Number(li.quantity ?? 1),
        total:     String(li.total ?? '0'),
        image_url: (li.image as Record<string, string> | null)?.src ?? undefined,
      }));

      return {
        id:           Number(o.id),
        number:       String(o.number ?? o.id),
        status,
        statusLabel:  STATUS_LABELS[status] ?? status,
        dateCreated:  String(o.date_created ?? ''),
        total:        String(o.total ?? '0'),
        currency:     String(o.currency ?? 'COP'),
        items,
        billing: {
          firstName: billing.first_name  ?? '',
          lastName:  billing.last_name   ?? '',
          email:     billing.email       ?? normalizedEmail,
          phone:     billing.phone       ?? '',
          address:   billing.address_1   ?? '',
          city:      billing.city        ?? '',
        },
        shippingAddress: shippingAddr.address_1
          ? {
              firstName: shippingAddr.first_name ?? '',
              lastName:  shippingAddr.last_name  ?? '',
              address:   shippingAddr.address_1  ?? '',
              city:      shippingAddr.city       ?? '',
              state:     shippingAddr.state      ?? '',
            }
          : null,
        paymentMethodTitle: String(o.payment_method_title ?? ''),
        shipping: carrier && guide
          ? {
              carrier,
              carrierName: carrierInfo?.name ?? carrier,
              guide,
              trackingUrl: carrierInfo?.trackingUrl ?? '#',
              hasTracking: carrier !== 'otra',
            }
          : null,
      };
    });

  } catch (err) {
    console.error('[orders] Error consultando WooCommerce:', err);
    return null;
  }
}
