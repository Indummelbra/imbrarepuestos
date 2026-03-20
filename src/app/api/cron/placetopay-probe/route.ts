import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByStatus, updateOrderStatus } from '@/lib/woocommerce';
import { querySession } from '@/lib/placetopay';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de Sonda (Cron) para sincronizar transacciones pendientes de PlacetoPay.
 * Se recomienda ejecutar cada 24 horas.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const CRON_SECRET = process.env.CRON_SECRET;

  // Validacion de seguridad basica
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  console.log('[Cron] Iniciando sonda de sincronización PlacetoPay...');

  try {
    // 1. Obtener pedidos en estado 'pending'
    const pendingOrders = await getOrdersByStatus('pending');
    console.log(`[Cron] Encontrados ${pendingOrders.length} pedidos pendientes.`);

    const results = [];

    for (const order of pendingOrders) {
      // 2. Buscar el requestId de PlacetoPay en los metadatos
      const ptpMeta = order.meta_data.find((m: { key: string; value: string }) => m.key === '_ptp_request_id');
      
      if (!ptpMeta || !ptpMeta.value) {
        continue;
      }

      const requestId = Number(ptpMeta.value);
      console.log(`[Cron] Consultando requestId ${requestId} para pedido ${order.id}...`);

      try {
        // 3. Consultar estado en PlacetoPay
        const sessionInfo = await querySession(requestId);
        const finalStatus = sessionInfo.status.status;

        // 4. Actualizar WooCommerce si el estado es final
        if (finalStatus === 'APPROVED') {
          console.log(`[Cron] Pedido ${order.id} APROBADO. Actualizando...`);
          await updateOrderStatus(order.id, 'processing', true);
          results.push({ orderId: order.id, status: 'APPROVED' });
        } else if (finalStatus === 'REJECTED' || finalStatus === 'FAILED') {
          console.log(`[Cron] Pedido ${order.id} RECHAZADO/FALLIDO. Actualizando...`);
          await updateOrderStatus(order.id, 'failed', false);
          results.push({ orderId: order.id, status: 'REJECTED' });
        } else {
          console.log(`[Cron] Pedido ${order.id} sigue en estado ${finalStatus}.`);
        }
      } catch (queryError) {
        console.error(`[Cron] Error consultando requestId ${requestId}:`, queryError);
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results
    });

  } catch (error: unknown) {
    console.error('[Cron] Error fatal en la sonda:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}
