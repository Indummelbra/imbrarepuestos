import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

interface ResultPageProps {
  searchParams: {
    reference?: string;
    requestId?: string;
  };
}

export default function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const { reference } = searchParams;

  // En un escenario real, aquí consultaríamos el estado usando querySession(requestId)
  // Por ahora mostramos una vista de "Procesando / Resultado"
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Procesando tu pago
        </h1>
        <p className="text-gray-600 mb-8">
          Estamos verificando el estado de tu transacción con PlacetoPay. 
          Esto puede tomar unos segundos.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Referencia de pedido:</span>
            <span className="text-sm font-semibold text-gray-900">{reference || 'No disponible'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Estado:</span>
            <span className="text-sm font-semibold text-yellow-600">Pendiente de confirmación</span>
          </div>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Volver a la tienda
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <p className="text-xs text-gray-400">
            Recibirás un correo electrónico una vez que el pago sea confirmado.
          </p>
        </div>
      </div>
    </div>
  );
}
