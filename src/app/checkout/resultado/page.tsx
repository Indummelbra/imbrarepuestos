import Link from 'next/link';
import { querySession } from '@/lib/placetopay';
import Image from 'next/image';

interface ResultPageProps {
  searchParams: Promise<{
    reference?: string;
    requestId?: string;
  }>;
}

/**
 * Formatea una fecha ISO al formato visual para el usuario
 * Ej: "2025-02-21T16:30:14-05:00" -> "21 de febrero de 2025, 4:30 p.m."
 */
function formatearFecha(isoFecha: string): string {
  try {
    return new Date(isoFecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoFecha;
  }
}

export default async function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const { reference, requestId } = await searchParams;

  // Si no hay requestId en la URL, no podemos consultar el estado
  // (el requestId puede venir de PlacetoPay como query param o desde sessionStorage via JS)
  let estadoFinal: string | null = null;
  let fechaTransaccion: string | null = null;
  let montoTotal: string | null = null;

  if (requestId) {
    try {
      const sesion = await querySession(Number(requestId));
      estadoFinal = sesion.status.status;
      fechaTransaccion = sesion.status.date;

      // Intentar obtener el monto del primer pago de la sesion
      if (sesion.payment && sesion.payment.length > 0) {
        const pago = sesion.payment[0];
        montoTotal = `$${Number(pago.amount.total).toLocaleString('es-CO')} ${pago.amount.currency}`;
      }
    } catch {
      // Si falla la consulta mostramos estado generico
      estadoFinal = null;
    }
  }

  // Pantalla APROBADO
  if (estadoFinal === 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide">
            PAGO APROBADO
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Tu pedido ha sido confirmado. Recibiras un correo electronico con el comprobante.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Referencia del pedido:</span>
              <span className="font-bold text-gray-900">#{reference || 'N/A'}</span>
            </div>
            {montoTotal && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total pagado:</span>
                <span className="font-bold text-green-700">{montoTotal}</span>
              </div>
            )}
            {fechaTransaccion && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-semibold text-gray-700">{formatearFecha(fechaTransaccion)}</span>
              </div>
            )}
          </div>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
          >
            Volver a la tienda
          </Link>
          <div className="mt-6 flex justify-center">
            <Image
              src="https://static.placetopay.com/placetopay-logo.svg"
              alt="PlacetoPay by Evertec"
              width={100}
              height={28}
              className="h-6 w-auto opacity-60"
              unoptimized
            />
          </div>
        </div>
      </div>
    );
  }

  // Pantalla RECHAZADO o FALLIDO
  if (estadoFinal === 'REJECTED' || estadoFinal === 'FAILED') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide">
            PAGO {estadoFinal === 'REJECTED' ? 'RECHAZADO' : 'FALLIDO'}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Tu pago no pudo ser procesado. Puedes intentarlo de nuevo con otro medio de pago.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Referencia del pedido:</span>
              <span className="font-bold text-gray-900">#{reference || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Estado:</span>
              <span className="font-bold text-red-600">
                {estadoFinal === 'REJECTED' ? 'Rechazado' : 'Fallido'}
              </span>
            </div>
            {fechaTransaccion && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-semibold text-gray-700">{formatearFecha(fechaTransaccion)}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
            >
              Intentar de nuevo
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-50 transition-colors uppercase tracking-widest text-sm"
            >
              Volver a la tienda
            </Link>
          </div>
          <div className="mt-6 flex justify-center">
            <Image
              src="https://static.placetopay.com/placetopay-logo.svg"
              alt="PlacetoPay by Evertec"
              width={100}
              height={28}
              className="h-6 w-auto opacity-60"
              unoptimized
            />
          </div>
        </div>
      </div>
    );
  }

  // Pantalla PENDIENTE (incluye cuando no hay requestId o la consulta falla)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-wide">
          PAGO EN VERIFICACION
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Tu transaccion esta siendo verificada con PlacetoPay. Este proceso puede tomar unos minutos.
          Recibiras un correo electronico una vez que sea confirmada.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Referencia del pedido:</span>
            <span className="font-bold text-gray-900">#{reference || 'No disponible'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estado:</span>
            <span className="font-bold text-yellow-600">Pendiente de confirmacion</span>
          </div>
        </div>
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-lg font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
        >
          Volver a la tienda
        </Link>
        <div className="mt-6 flex justify-center">
          <Image
            src="https://static.placetopay.com/placetopay-logo.svg"
            alt="PlacetoPay by Evertec"
            width={100}
            height={28}
            className="h-6 w-auto opacity-60"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
