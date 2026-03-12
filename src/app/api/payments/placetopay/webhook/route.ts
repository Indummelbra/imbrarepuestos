import { NextRequest, NextResponse } from 'next/server';
import { querySession } from '@/lib/placetopay';

/**
 * Endpoint de Webhook para recibir notificaciones de PlacetoPay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // El cuerpo contiene: status, requestId, reference, signature
    const { status, requestId, reference } = body;

    console.log(`Webhook PlacetoPay recibido para referencia ${reference}:`, status.status);

    // 1. Consultar el estado real para mayor seguridad
    const sessionInfo = await querySession(requestId);
    const finalStatus = sessionInfo.status.status;

    // 2. Aquí iría la lógica para actualizar el pedido en WooCommerce
    // Por ahora, solo logueamos el resultado.
    // TODO: Implementar integración con WooCommerce para actualizar el pedido.
    
    if (finalStatus === 'APPROVED') {
      console.log(`Pedido ${reference} PAGADO con éxito.`);
      // await updateWooCommerceOrder(reference, 'processing');
    } else if (finalStatus === 'REJECTED' || finalStatus === 'FAILED') {
      console.log(`Pedido ${reference} RECHAZADO.`);
      // await updateWooCommerceOrder(reference, 'failed');
    }

    return NextResponse.json({ message: 'Webhook procesado correctamente' }, { status: 200 });
  } catch (error: any) {
    console.error('Error en Webhook PlacetoPay:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
