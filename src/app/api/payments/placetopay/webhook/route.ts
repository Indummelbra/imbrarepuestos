import { NextRequest, NextResponse } from 'next/server';
import { querySession } from '@/lib/placetopay';
import { updateOrderStatus } from '@/lib/woocommerce';

/**
 * Endpoint de Webhook para recibir notificaciones de PlacetoPay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // El cuerpo contiene: status, requestId, reference, signature
    const { status: ptpStatus, requestId, reference } = body;

    console.log(`Webhook PlacetoPay recibido para referencia ${reference}:`, ptpStatus.status);

    // 1. Consultar el estado real para mayor seguridad
    const sessionInfo = await querySession(requestId);
    const finalStatus = sessionInfo.status.status;
    const orderId = parseInt(reference);

    if (isNaN(orderId)) {
      console.error(`Referencia inválda recibida en webhook: ${reference}`);
      return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 });
    }

    // 2. Actualizar el pedido en WooCommerce según el resultado
    if (finalStatus === 'APPROVED') {
      console.log(`Pedido ${orderId} PAGADO con éxito. Actualizando en WooCommerce...`);
      await updateOrderStatus(orderId, 'processing', true); // setPaid: true reduce stock en WC
    } else if (finalStatus === 'REJECTED' || finalStatus === 'FAILED') {
      console.log(`Pedido ${orderId} RECHAZADO o FALLIDO. Marcando como fallido en WooCommerce...`);
      await updateOrderStatus(orderId, 'failed', false);
    } else {
      console.log(`Estado ignorado (${finalStatus}) para el pedido ${orderId}`);
    }

    return NextResponse.json({ message: 'Webhook procesado correctamente' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error en Webhook PlacetoPay:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en Webhook PlacetoPay';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
