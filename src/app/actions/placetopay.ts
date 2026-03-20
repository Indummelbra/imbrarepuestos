'use server';

import { createSession } from '@/lib/placetopay';
import { PTPAmount, PTPBuyer } from '@/types/placetopay';

// returnUrl base hacia la pagina de resultado del checkout
const RETURN_URL = process.env.NEXT_PUBLIC_RETURN_URL || 'https://store.imbra.cloud/checkout/resultado';

interface InitiatePaymentParams {
  reference: string;
  description: string;
  amount: PTPAmount;
  buyer: PTPBuyer;
  ipAddress: string;
  userAgent: string;
}

/**
 * Inicia una sesion de pago con PlacetoPay y retorna la URL del portal de pagos.
 * Cumple con los requisitos de la Guia de Certificacion WC v1.6 de Evertec:
 *  - locale 'es_CO' para mostrar la interfaz en espanol Colombia
 *  - buyer con tipo y numero de documento (punto 3.5)
 *  - returnUrl con reference como query param (el requestId se retorna al cliente
 *    para que lo agregue en la URL de redireccion al resultado)
 */
export async function initiatePayment(params: InitiatePaymentParams) {
  const { reference, description, amount, buyer, ipAddress, userAgent } = params;

  try {
    const response = await createSession({
      // Requisito: idioma Colombia
      locale: 'es_CO',
      payment: {
        reference,
        description,
        amount,
      },
      buyer,
      payer: buyer, // Requisito implícito: a menudo ayuda en la gestión de fraudes
      // Requisito Guia WC punto 1: expiracion de 30 minutos
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      // La referencia va en la URL para identificar el pedido al regresar
      returnUrl: `${RETURN_URL}?reference=${reference}`,
      ipAddress,
      userAgent,
    });

    if (response.status.status === 'OK' && response.processUrl && response.requestId) {
      return {
        success: true,
        processUrl: response.processUrl,
        // El cliente agrega requestId a la URL de resultado via sessionStorage
        requestId: response.requestId,
      };
    }

    return {
      success: false,
      error: response.status.message || 'No se pudo generar la URL de pago',
    };
  } catch (error: unknown) {
    console.error('Action initiatePayment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno al procesar el pago';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Guarda el requestId de PlacetoPay en los metadatos del pedido de WooCommerce
 * para que la sonda (Cron) pueda consultarlo despues.
 */
export async function savePTPRequestId(orderId: number, requestId: number) {
  try {
    const { updateOrderMetadata } = await import('@/lib/woocommerce');
    await updateOrderMetadata(orderId, [
      { key: '_ptp_request_id', value: String(requestId) }
    ]);
    return { success: true };
  } catch (error) {
    console.error(`Error saving PTP requestId for order ${orderId}:`, error);
    return { success: false };
  }
}
