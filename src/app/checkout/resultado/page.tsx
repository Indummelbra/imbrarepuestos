import Link from 'next/link';
import { querySession } from '@/lib/placetopay';
import { getOrder } from '@/lib/woocommerce';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/ui/PageHero';
import RequestIdRedirect from '@/components/checkout/RequestIdRedirect';

import { PTPQuerySessionResponse } from '@/types/placetopay';

interface ResultPageProps {
  searchParams: Promise<{
    reference?: string;
    requestId?: string;
  }>;
}

interface WCLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  image?: { src: string };
}

interface WCOrder {
  total: string;
  shipping_total: string;
  currency: string;
  date_created: string;
  billing: { first_name?: string; last_name?: string; city?: string };
  line_items: WCLineItem[];
  meta_data: Array<{ key: string; value: string | number | boolean | null }>;
}

function formatearFecha(isoFecha: string): string {
  try {
    return new Date(isoFecha).toLocaleString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch {
    return isoFecha;
  }
}

export default async function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const { reference, requestId: paramRequestId } = await searchParams;

  let requestId = paramRequestId;
  let orderDataFromWC: WCOrder | null = null;

  // Solo buscamos la orden en WC si la referencia es un numero entero (orderId real)
  // Limpiamos prefijo IB- o similar que WooCommerce puede agregar al order number
  const rawReference = reference?.replace(/^[A-Z]+-/i, '');
  const numericOrderId = rawReference && /^\d+$/.test(rawReference) ? Number(rawReference) : null;

  if (numericOrderId) {
    try {
      orderDataFromWC = await getOrder(numericOrderId);
      const ptpMeta = orderDataFromWC?.meta_data?.find((m) => m.key === '_ptp_request_id' || m.key === 'ptp_request_id');
      if (!requestId && ptpMeta) requestId = String(ptpMeta.value);
    } catch (err) {
      console.error('Error recuperando pedido para el resultado:', err);
    }
  }

  let ptpSession: PTPQuerySessionResponse | null = null;
  let estadoFinal: string | null = null;
  let motivoTransaccion: string | null = null;
  let fechaTransaccion: string | null = null;
  let montoTotal: string | null = null;

  if (requestId) {
    try {
      ptpSession = await querySession(Number(requestId));
      estadoFinal = ptpSession.status.status;
      motivoTransaccion = ptpSession.status.message;
      fechaTransaccion = ptpSession.status.date;

      if (ptpSession.payment && ptpSession.payment.length > 0) {
        const pago = ptpSession.payment[0] as unknown as {
          amount?: { to?: { total: string | number; currency: string }; total?: string | number; currency?: string }
        };
        const amountData = pago.amount;
        const total = amountData?.to?.total ?? amountData?.total;
        const currency = amountData?.to?.currency ?? amountData?.currency;
        if (total !== undefined && currency !== undefined) {
          montoTotal = `$${Number(total).toLocaleString('es-CO')} ${currency}`;
        }
      }

      if (!montoTotal && ptpSession.request?.payment?.amount) {
        const amount = ptpSession.request.payment.amount;
        montoTotal = `$${Number(amount.total).toLocaleString('es-CO')} ${amount.currency}`;
      }
    } catch (err) {
      console.error('Error consultando sesion PTP:', err);
    }
  }

  if (!montoTotal && orderDataFromWC) {
    montoTotal = `$${Number(orderDataFromWC.total).toLocaleString('es-CO')} ${orderDataFromWC.currency || 'COP'}`;
  }
  if (!fechaTransaccion && orderDataFromWC?.date_created) {
    fechaTransaccion = orderDataFromWC.date_created;
  }

  const subtotal = orderDataFromWC
    ? Number(orderDataFromWC.total) - Number(orderDataFromWC.shipping_total)
    : 0;
  const shippingTotal = orderDataFromWC ? Number(orderDataFromWC.shipping_total) : 0;
  const clienteNombre = orderDataFromWC?.billing
    ? `${orderDataFromWC.billing.first_name || ''} ${orderDataFromWC.billing.last_name || ''}`.trim()
    : null;
  const ciudadEnvio = orderDataFromWC?.billing?.city || null;

  const isSuccess = estadoFinal === 'APPROVED' || estadoFinal === 'PENDING';
  const isError = estadoFinal === 'REJECTED' || estadoFinal === 'FAILED' || estadoFinal === 'CANCELLED';

  const estadoConfig: Record<string, {
    accentColor: string;
    heroTitle: string;
    heroAccent: string;
    badgeText: string;
    badgeBg: string;
    badgeColor: string;
    iconBg: string;
    iconColor: string;
    iconPath: string;
    mensaje: string;
    barColor: string;
  }> = {
    APPROVED: {
      accentColor: 'text-green-400',
      heroTitle: 'Pago', heroAccent: 'Aprobado',
      badgeText: 'APROBADO', badgeBg: 'bg-green-100', badgeColor: 'text-green-700',
      iconBg: 'bg-green-500', iconColor: 'text-white',
      iconPath: 'M5 13l4 4L19 7',
      mensaje: 'Tu pedido ha sido confirmado. Recibirás un correo con los detalles del envío en los próximos minutos.',
      barColor: 'bg-green-500',
    },
    REJECTED: {
      accentColor: 'text-red-400',
      heroTitle: 'Pago', heroAccent: 'Rechazado',
      badgeText: 'RECHAZADO', badgeBg: 'bg-red-100', badgeColor: 'text-red-700',
      iconBg: 'bg-red-500', iconColor: 'text-white',
      iconPath: 'M6 18L18 6M6 6l12 12',
      mensaje: motivoTransaccion || 'La entidad financiera ha declinado la transacción. Verifica los datos de tu tarjeta e intenta de nuevo.',
      barColor: 'bg-red-500',
    },
    FAILED: {
      accentColor: 'text-yellow-400',
      heroTitle: 'Error en el', heroAccent: 'Proceso',
      badgeText: 'FALLIDO', badgeBg: 'bg-yellow-100', badgeColor: 'text-yellow-700',
      iconBg: 'bg-yellow-400', iconColor: 'text-white',
      iconPath: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
      mensaje: motivoTransaccion || 'Hubo un inconveniente técnico al procesar tu pago. Por favor intenta de nuevo más tarde.',
      barColor: 'bg-yellow-400',
    },
    PENDING: {
      accentColor: 'text-white',
      heroTitle: 'Pago en', heroAccent: 'Verificación',
      badgeText: 'PENDIENTE', badgeBg: 'bg-gray-100', badgeColor: 'text-gray-600',
      iconBg: 'bg-gray-400', iconColor: 'text-white',
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      mensaje: 'Tu pago está siendo verificado. Te notificaremos por correo electrónico cuando se confirme.',
      barColor: 'bg-gray-400',
    },
    CANCELLED: {
      accentColor: 'text-gray-400',
      heroTitle: 'Pago', heroAccent: 'Cancelado',
      badgeText: 'CANCELADO', badgeBg: 'bg-gray-100', badgeColor: 'text-gray-600',
      iconBg: 'bg-gray-500', iconColor: 'text-white',
      iconPath: 'M6 18L18 6M6 6l12 12',
      mensaje: 'Cancelaste el proceso de pago. Puedes intentarlo de nuevo cuando quieras.',
      barColor: 'bg-gray-500',
    },
  };

  const cfg = estadoConfig[estadoFinal ?? 'PENDING'] ?? estadoConfig['PENDING'];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F7F5]">
      <Header />
      <PageHero
        label="Tu pedido"
        title={cfg.heroTitle}
        titleAccent={cfg.heroAccent}
        accentColor={cfg.accentColor}
      />

      {/* Limpiar carrito si el pago fue aprobado */}
      {estadoFinal === 'APPROVED' && (
        <script dangerouslySetInnerHTML={{ __html: `
          localStorage.removeItem('imbra_cart');
          localStorage.removeItem('imbra_checkout_data');
          sessionStorage.removeItem('ptp_request_id');
          sessionStorage.removeItem('ptp_order_id');
        `}} />
      )}

      <RequestIdRedirect />
      <main className="flex-grow px-5 py-12">
        <div className="max-w-7xl mx-auto">

          {/* ── BLOQUE SUPERIOR: estado + mensaje + acciones ── */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 bg-white border border-gray-100 p-8">
            {/* Ícono de estado */}
            <div className={`w-16 h-16 shrink-0 flex items-center justify-center ${cfg.iconBg}`}>
              <svg className={`w-8 h-8 ${cfg.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cfg.iconPath} />
              </svg>
            </div>

            {/* Texto */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 ${cfg.badgeBg} ${cfg.badgeColor}`}>
                  {cfg.badgeText}
                </span>
                {reference && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Pedido #{reference}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-xl">{cfg.mensaje}</p>
            </div>

            {/* Acciones rápidas */}
            <div className="flex flex-col gap-3 shrink-0">
              {isError && (
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 bg-primary text-secondary px-6 py-3 font-black text-[11px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors"
                >
                  <span className="material-icons text-sm">refresh</span>
                  Reintentar pago
                </Link>
              )}
              <Link
                href="/tienda"
                className="flex items-center justify-center gap-2 border border-gray-200 text-gray-500 px-6 py-3 font-black text-[11px] uppercase tracking-widest hover:border-secondary hover:text-secondary transition-colors"
              >
                <span className="material-icons text-sm">store</span>
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* ── GRID PRINCIPAL: 2/3 izquierda + 1/3 derecha ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── COLUMNA IZQUIERDA ── */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Productos del pedido */}
              <div className="bg-white border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-1 h-5 bg-primary inline-block"></span>
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-secondary">Productos del pedido</h2>
                </div>

                {orderDataFromWC?.line_items && orderDataFromWC.line_items.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {orderDataFromWC.line_items.map((item: WCLineItem) => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="w-14 h-14 bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden relative">
                          {item.image?.src ? (
                            <Image src={item.image.src} alt={item.name} fill sizes="56px" className="object-contain" unoptimized />
                          ) : (
                            <span className="material-icons text-gray-300 text-2xl">inventory_2</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-secondary leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Cant: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-black text-secondary shrink-0">
                          ${Number(item.total).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center text-gray-400 text-sm">
                    Cargando productos del pedido...
                  </div>
                )}

                {/* Totales */}
                <div className="px-6 py-5 border-t border-gray-100 bg-[#FAFAFA] space-y-3">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">Subtotal</span>
                    <span className="font-bold text-secondary">${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500 font-bold uppercase tracking-widest">
                      Envío{ciudadEnvio ? ` a ${ciudadEnvio}` : ''}
                    </span>
                    <span className={`font-bold ${shippingTotal === 0 ? 'text-green-600' : 'text-secondary'}`}>
                      {shippingTotal === 0 ? 'Gratis' : `$${shippingTotal.toLocaleString('es-CO')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total pagado</span>
                    <span className="text-xl font-black text-primary">{montoTotal || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Seguimiento del envío — solo APPROVED o PENDING */}
              {isSuccess && (
                <div className="bg-white border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                    <span className="w-1 h-5 bg-primary inline-block"></span>
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-secondary">Estado del envío</h2>
                  </div>
                  <div className="px-6 py-8">
                    <div className="relative">
                      <div className="h-1 bg-gray-100 w-full absolute top-5"></div>
                      <div className={`h-1 ${cfg.barColor} w-1/4 absolute top-5 transition-all duration-700`}></div>
                      <div className="relative flex justify-between">
                        {[
                          { icon: 'check_circle', label: 'Confirmado', done: true },
                          { icon: 'inventory', label: 'En preparación', done: false },
                          { icon: 'local_shipping', label: 'En camino', done: false },
                          { icon: 'home', label: 'Entregado', done: false },
                        ].map((step, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 flex items-center justify-center ${step.done ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-300'}`}>
                              <span className="material-icons text-lg">{step.icon}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${step.done ? 'text-secondary' : 'text-gray-300'}`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── COLUMNA DERECHA ── */}
            <div className="flex flex-col gap-6">

              {/* Detalles del pedido */}
              <div className="bg-white border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <span className="w-1 h-5 bg-primary inline-block"></span>
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-secondary">Detalles</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: 'Nº de pedido', value: reference ? `#${reference}` : '—' },
                    { label: 'Fecha', value: fechaTransaccion ? formatearFecha(fechaTransaccion) : 'Pendiente' },
                    ...(clienteNombre ? [{ label: 'Cliente', value: clienteNombre }] : []),
                    ...(ciudadEnvio ? [{ label: 'Ciudad de envío', value: ciudadEnvio }] : []),
                  ].map((row) => (
                    <div key={row.label} className="px-6 py-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{row.label}</p>
                      <p className="text-[12px] font-bold text-secondary">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Mis Pedidos */}
              <Link
                href="/mis-pedidos"
                className="flex items-center justify-between bg-secondary px-6 py-6 hover:bg-black transition-colors group"
              >
                <div>
                  <p className="text-[10px] !font-black uppercase tracking-widest !text-primary mb-1.5">Consulta tu pedido</p>
                  <p className="text-base !font-black uppercase !text-white">Mis Pedidos</p>
                </div>
                <span className="material-icons !text-primary text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>

              {/* PlacetoPay */}
              <div className="bg-white border border-gray-100 px-6 py-5 flex flex-col items-center gap-2">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">Pagos procesados por</p>
                <Image
                  src="https://static.placetopay.com/placetopay-logo.svg"
                  alt="PlacetoPay"
                  width={100}
                  height={28}
                  className="h-6 w-auto grayscale opacity-30"
                  unoptimized
                />
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
