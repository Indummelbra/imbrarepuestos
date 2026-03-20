import Link from 'next/link';
import { querySession } from '@/lib/placetopay';
import { getOrder } from '@/lib/woocommerce';
import Image from 'next/image';

interface ResultPageProps {
  searchParams: Promise<{
    reference?: string;
    requestId?: string;
  }>;
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
  let orderDataFromWC: { meta_data: Array<{ key: string; value: string }> } | null = null;

  // 1. Si no tenemos requestId en la URL, intentamos recuperarlo de WooCommerce usando la referencia
  if (!requestId && reference) {
    try {
      orderDataFromWC = await getOrder(Number(reference)) as { meta_data: Array<{ key: string; value: string }> };
      const ptpMeta = orderDataFromWC?.meta_data.find((m: { key: string; value: string }) => m.key === '_ptp_request_id');
      if (ptpMeta) {
        requestId = ptpMeta.value;
      }
    } catch (err) {
      console.error('Error recuperando pedido para el resultado:', err);
    }
  }

  // 2. Consultar el estado real en PlacetoPay
  let ptpSession: { 
    status: { status: string; message: string; date: string };
    payment?: Array<{ amount: { total: number; currency: string } }>;
    request?: { payment: { amount: { total: number; currency: string } } };
  } | null = null;
  let estadoFinal: string | null = null;
  let motivoTransaccion: string | null = null;
  let fechaTransaccion: string | null = null;
  let montoTotal: string | null = null;

  if (requestId) {
    try {
      ptpSession = await querySession(Number(requestId)) as { 
        status: { status: string; message: string; date: string };
        payment?: Array<{ amount: { total: number; currency: string } }>;
        request?: { payment: { amount: { total: number; currency: string } } };
      };
      estadoFinal = ptpSession.status.status;
      motivoTransaccion = ptpSession.status.message; // Mensaje detallado del estado
      fechaTransaccion = ptpSession.status.date;

      if (ptpSession.payment && ptpSession.payment.length > 0) {
        const pago = ptpSession.payment[0];
        montoTotal = `$${Number(pago.amount.total).toLocaleString('es-CO')} ${pago.amount.currency}`;
      } else if (ptpSession.request?.payment?.amount) {
        // Fallback al monto solicitado si no hay pagos registrados aun
        const amount = ptpSession.request.payment.amount;
        montoTotal = `$${Number(amount.total).toLocaleString('es-CO')} ${amount.currency}`;
      }
    } catch (err) {
      console.error('Error consultando sesion PTP:', err);
    }
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
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
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
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center border-4 border-white shadow-lg">
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
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-lg">
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
        <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-white shadow-lg">
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 font-Archivo">
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
      <div className="max-w-xl w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Cabecera de Color segun estado */}
        <div className={`h-24 ${currentConfig.bgColor} flex justify-center items-end relative pb-4`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
            {currentConfig.icon}
          </div>
        </div>

        <div className="pt-16 pb-10 px-8 text-center">
          <h1 className={`text-2xl font-black mb-2 uppercase tracking-tight ${currentConfig.statusColor} italic`}>
            {currentConfig.title}
          </h1>
          <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto leading-relaxed">
            {currentConfig.subtitle}
          </p>

          {/* Resumen de Transaccion - El "Summary" solicitado */}
          <div className="text-left mb-8">
            <h3 className="text-[11px] font-black text-secondary uppercase tracking-[0.2em] mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary"></span>
              Resumen de la Sesión
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Referencia</span>
                <span className="text-sm font-black text-secondary">#{reference || 'SIN_REF'}</span>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Valor</span>
                <span className="text-sm font-black text-secondary">{montoTotal || '$ 0.00 COP'}</span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</span>
                <span className="text-sm font-bold text-gray-700">
                  {fechaTransaccion ? formatearFecha(fechaTransaccion) : 'Pendiente'}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
                <span className={`text-xs font-black uppercase px-2 py-1 ${currentConfig.bgColor} ${currentConfig.statusColor}`}>
                  {estadoFinal || 'PENDIENTE'}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3">
            {(estadoFinal === 'REJECTED' || estadoFinal === 'FAILED') && (
              <Link
                href="/checkout"
                className="group relative flex items-center justify-center bg-primary text-secondary py-4 px-8 font-black hover:bg-secondary hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0"
              >
                <span className="uppercase tracking-[0.1em] text-sm">Intentar Nuevo Pago</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}

            <Link
              href="/"
              className="w-full flex items-center justify-center py-4 px-8 font-bold text-gray-400 hover:text-secondary transition-all uppercase tracking-widest text-xs border border-gray-100 hover:border-gray-200"
            >
              Volver a la Página Principal
            </Link>
          </div>

          {/* Footer PlacetoPay */}
          <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center opacity-50 space-y-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em]">Tecnología por</p>
            <Image
              src="https://static.placetopay.com/placetopay-logo.svg"
              alt="PlacetoPay"
              width={90}
              height={26}
              className="h-6 w-auto grayscale brightness-50"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
