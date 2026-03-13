import crypto from 'crypto';
import { PTPAuth, PTPCreateSessionRequest, PTPCreateSessionResponse, PTPQuerySessionResponse } from '../types/placetopay';

const LOGIN = process.env.PTP_LOGIN;
const SECRET_KEY = process.env.PTP_SECRET_KEY;
const BASE_URL = process.env.PTP_BASE_URL || 'https://checkout-test.placetopay.com';

/**
 * Genera el objeto de autenticación requerido por PlacetoPay
 */
export function generateAuth(): PTPAuth {
  if (!LOGIN || !SECRET_KEY) {
    throw new Error('Faltan variables de entorno PTP_LOGIN o PTP_SECRET_KEY');
  }

  const seed = new Date().toISOString();
  const nonceRaw = crypto.randomBytes(16);
  const nonce = nonceRaw.toString('base64');
  
  const hash = crypto.createHash('sha1');
  hash.update(nonceRaw);
  hash.update(seed);
  hash.update(SECRET_KEY);
  const tranKey = hash.digest('base64');

  return {
    login: LOGIN,
    tranKey,
    nonce,
    seed,
  };
}

/**
 * Crea una sesión de pago en PlacetoPay
 */
export async function createSession(data: Omit<PTPCreateSessionRequest, 'auth'>): Promise<PTPCreateSessionResponse> {
  const auth = generateAuth();
  
  const payload: PTPCreateSessionRequest = {
    ...data,
    auth,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status?.message || 'Error al crear la sesión en PlacetoPay');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in PlacetoPay createSession:', error);
    throw error;
  }
}

/**
 * Consulta el estado de una sesión en PlacetoPay
 */
export async function querySession(requestId: number): Promise<PTPQuerySessionResponse> {
  const auth = generateAuth();
  
  const payload = { auth };

  try {
    const response = await fetch(`${BASE_URL}/api/session/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status?.message || 'Error al consultar la sesión en PlacetoPay');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in PlacetoPay querySession:', error);
    throw error;
  }
}
