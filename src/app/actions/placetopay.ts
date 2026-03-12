'use server';

import { createSession } from '@/lib/placetopay';
import { PTPAmount, PTPBuyer } from '@/types/placetopay';

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
 * Inicia una sesión de pago con PlacetoPay
 */
export async function initiatePayment(params: InitiatePaymentParams) {
  const { reference, description, amount, buyer, ipAddress, userAgent } = params;

  try {
    const response = await createSession({
      payment: {
        reference,
        description,
        amount,
      },
      buyer,
      expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos de expiración
      returnUrl: `${RETURN_URL}?reference=${reference}`,
      ipAddress,
      userAgent,
    });

    if (response.status.status === 'OK' && response.processUrl) {
      return {
        success: true,
        processUrl: response.processUrl,
        requestId: response.requestId,
      };
    }

    return {
      success: false,
      error: response.status.message || 'No se pudo generar la URL de pago',
    };
  } catch (error: any) {
    console.error('Action initiatePayment error:', error);
    return {
      success: false,
      error: error.message || 'Error interno al procesar el pago',
    };
  }
}
