import Link from 'next/link';
import { querySession } from '@/lib/placetopay';
import { getOrder } from '@/lib/woocommerce';
import Image from 'next/image';
import OrderTracking from '@/components/checkout/OrderTracking';

import { PTPQuerySessionResponse } from '@/types/placetopay';

interface ResultPageProps {
  searchParams: Promise<{
    reference?: string;
    requestId?: string;
  }>;
}

// Interfaces básicas para evitar 'any' y pasar linter
interface WCLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  image?: {
    src: string;
  };
}

interface WCOrder {
  total: string;
  shipping_total: string;
  currency: string;
  date_created: string;
  line_items: WCLineItem[];
  meta_data: Array<{ key: string; value: string | number | boolean | null }>;
}

/**
 * Formatea una fecha ISO al formato visual para el usuario
 */
function formatearFecha(isoFecha: string): string {
  try {
    return new Date(isoFecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoFecha;
  }
}

export default async function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const { reference, requestId: paramRequestId } = await searchParams;

  let requestId = paramRequestId;
  let orderDataFromWC: WCOrder | null = null;

  // 1. Intentamos recuperar el pedido de WooCommerce siempre que tengamos la referencia
  if (reference) {
    try {
      orderDataFromWC = await getOrder(Number(reference));
      
      const ptpMeta = orderDataFromWC?.meta_data?.find((m) => m.key === '_ptp_request_id');
      if (!requestId && ptpMeta) {
        requestId = String(ptpMeta.value);
      }
    } catch (err) {
      console.error('Error recuperando pedido para el resultado:', err);
    }
  }

  // 2. Consultar el estado real en PlacetoPay
  let ptpSession: PTPQuerySessionResponse | null = null;
  let estadoFinal: string | null = null;
  let motivoTransaccion: string | null = null;
  let fechaTransaccion: string | null = null;
  let montoTotal: string | null = null;

  if (requestId) {
    try {
      ptpSession = await querySession(Number(requestId));
      estadoFinal = ptpSession.status.status;
      motivoTransaccion = ptpSession.status.message; // Mensaje detallado del estado
      fechaTransaccion = ptpSession.status.date;

      if (ptpSession.payment && ptpSession.payment.length > 0) {
        // Estructura flexible para manejar diferentes respuestas de PTP (algunas no documentadas oficialmente en el SDK)
        const pago = ptpSession.payment[0] as unknown as { 
          amount?: { 
            to?: { total: string | number; currency: string }; 
            total?: string | number; 
            currency?: string 
          } 
        }; 
        const amountData = pago.amount;
        const total = amountData?.to?.total ?? amountData?.total;
        const currency = amountData?.to?.currency ?? amountData?.currency;
        
        if (total !== undefined && currency !== undefined) {
          montoTotal = `$${Number(total).toLocaleString('es-CO')} ${currency}`;
        }
      } 
      
      if (!montoTotal && ptpSession.request?.payment?.amount) {
        // Fallback al monto solicitado si no hay pagos registrados aun
        const amount = ptpSession.request.payment.amount;
        montoTotal = `$${Number(amount.total).toLocaleString('es-CO')} ${amount.currency}`;
      }
    } catch (err) {
      console.error('Error consultando sesion PTP:', err);
    }
  }

  // Si no se obtiene monto total de Placetopay, intentar sacarlo de WooCommerce
  if (!montoTotal && orderDataFromWC) {
    montoTotal = `$${Number(orderDataFromWC.total).toLocaleString('es-CO')} ${orderDataFromWC.currency || 'COP'}`;
  }

  // Si no se obtiene la fecha de Placetopay, intentar sacarla de WooCommerce
  if (!fechaTransaccion && orderDataFromWC?.date_created) {
    fechaTransaccion = orderDataFromWC.date_created;
  }

  // Lógica de estilos por estado
  const config: Record<string, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    statusColor: string;
    bgColor: string;
  }> = {
    APPROVED: {
      title: '¡PAGO APROBADO!',
      subtitle: 'Tu pedido ha sido confirmado. Pronto recibirás un correo con los detalles del envío.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-[6px] border-white shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-green-400/20 animate-pulse"></div>
          <svg className="w-10 h-10 text-green-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      statusColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    REJECTED: {
      title: 'PAGO RECHAZADO',
      subtitle: motivoTransaccion || 'La entidad financiera ha declinado la transacción. Puedes intentarlo de nuevo.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center border-[6px] border-white shadow-lg">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      statusColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    FAILED: {
      title: 'ERROR EN EL PROCESO',
      subtitle: motivoTransaccion || 'Hubo un inconveniente técnico al procesar tu pago. Por favor intenta más tarde.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center border-[6px] border-white shadow-lg">
          <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      ),
      statusColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    PENDING: {
      title: 'PAGO EN VERIFICACIÓN',
      subtitle: 'Tu pago está pendiente de confirmación. Te notificaremos por correo electrónico.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center border-[6px] border-white shadow-lg">
          <svg className="w-10 h-10 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      statusColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  };

  const currentConfig = config[estadoFinal || 'PENDING'];

  const subtotal = orderDataFromWC ? Number(orderDataFromWC.total) - Number(orderDataFromWC.shipping_total) : 0;
  const shippingTotal = orderDataFromWC ? Number(orderDataFromWC.shipping_total) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-16 px-4 md:px-6 font-Archivo">
      {/* Script para limpiar el carrito y datos si es aprobado */}
      {estadoFinal === 'APPROVED' && (
        <script dangerouslySetInnerHTML={{ __html: `
          localStorage.removeItem('imbra_cart');
          localStorage.removeItem('imbra_checkout_data');
          sessionStorage.removeItem('ptp_request_id');
          sessionStorage.removeItem('ptp_order_id');
        `}} />
      )}
      
      {/* Tarjeta Premium */}
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-gray-100/50">
        
        {/* Cabecera de Color segun estado */}
        <div className={`h-36 ${currentConfig.bgColor} flex justify-center items-end relative pb-8`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2">
            {currentConfig.icon}
          </div>
        </div>

        <div className="pt-12 pb-14 px-6 md:px-12 text-center">
          <h1 className={`text-3xl font-black mb-3 uppercase tracking-tight ${currentConfig.statusColor}`}>
            {currentConfig.title}
          </h1>
          <p className="text-gray-500 mb-10 text-sm max-w-sm mx-auto leading-relaxed">
            {currentConfig.subtitle}
          </p>

          {/* Resumen de Tu Pedido Principal */}
          <div className="text-left mb-10 bg-[#FAFAFA] p-6 md:p-8 rounded-3xl border border-gray-100 shadow-inner">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-3">
                 <span className="w-8 h-[2px] bg-primary rounded-full"></span>
                 Resumen de tu pedido
               </h3>
               <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${currentConfig.bgColor} ${currentConfig.statusColor}`}>
                  {estadoFinal || 'PENDIENTE'}
               </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número de pedido</span>
                <span className="text-sm font-black text-secondary bg-white px-4 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  #{reference || 'SIN_REF'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha y Hora</span>
                <span className="text-sm font-bold text-gray-700">
                  {fechaTransaccion ? formatearFecha(fechaTransaccion) : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Listado de Productos Adquiridos */}
            {orderDataFromWC && orderDataFromWC.line_items && orderDataFromWC.line_items.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200/60">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Productos Comprados</h4>
                <div className="space-y-4">
                  {orderDataFromWC.line_items.map((item: WCLineItem) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {item.image?.src ? (
                        <div className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 relative">
                           <Image 
                             src={item.image.src} 
                             alt={item.name} 
                             fill 
                             sizes="60px"
                             className="object-cover" 
                             unoptimized 
                           />
                        </div>
                      ) : (
                        <div className="w-[60px] h-[60px] rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pr-2">
                        <h5 className="text-sm font-bold text-secondary truncate" title={item.name}>{item.name}</h5>
                        <p className="text-xs text-gray-500 mt-1">
                          Cant: <span className="font-bold text-gray-700">{item.quantity}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-secondary">
                          ${Number(item.total).toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desglose de Costos Totales */}
            <div className="mt-8 pt-6 border-t border-gray-200/60 space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500 font-bold">Subtotal</span>
                 <span className="font-bold text-secondary">${subtotal.toLocaleString('es-CO')}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500 font-bold">Envío</span>
                 <span className="font-bold text-secondary">
                   {shippingTotal === 0 ? 'Gratis' : `$${shippingTotal.toLocaleString('es-CO')}`}
                 </span>
               </div>
               <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200/60">
                 <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Valor Total</span>
                 <span className="text-xl font-black text-primary">{montoTotal || '$ 0.00 COP'}</span>
               </div>
            </div>
          </div>

          {/* Seguimiento de Pedido Animado (Ficticio para Demo) */}
          {(estadoFinal === 'APPROVED' || estadoFinal === 'PENDING') && (
            <OrderTracking />
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-4 max-w-sm mx-auto p-6 md:p-12 pt-0">
          {(estadoFinal === 'REJECTED' || estadoFinal === 'FAILED') && (
              <Link
                href="/checkout"
                className="group relative flex items-center justify-center bg-primary text-secondary py-4 px-8 font-black rounded-xl hover:bg-secondary hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
              >
                <span className="uppercase tracking-[0.1em] text-sm">Intentar Nuevo Pago</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}

            <Link
              href="/"
              className="w-full flex items-center justify-center py-4 px-8 font-black text-gray-400 hover:text-secondary hover:bg-gray-50 transition-all uppercase tracking-widest text-xs border-2 border-gray-100 rounded-xl"
            >
              Volver a la tienda
            </Link>
          </div>

        {/* Footer PlacetoPay */}
        <div className="pb-12 pt-0 flex flex-col items-center opacity-40 space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Pagos Seguros Procesados por</p>
          <Image
            src="https://static.placetopay.com/placetopay-logo.svg"
            alt="PlacetoPay"
            width={100}
            height={28}
            className="h-7 w-auto grayscale contrast-125"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
