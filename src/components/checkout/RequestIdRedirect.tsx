'use client';

import { useEffect } from 'react';

/**
 * Componente cliente que lee el requestId de PlacetoPay desde sessionStorage.
 * Si no está en la URL (porque PTP no lo reenvía), fuerza un reload con el parámetro.
 * Esto permite que la página de resultado (server component) consulte el estado real del pago.
 */
export default function RequestIdRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('requestId')) return; // ya está en la URL

    const storedRequestId = sessionStorage.getItem('ptp_request_id');
    if (!storedRequestId) return;

    params.set('requestId', storedRequestId);
    // Reemplazamos la URL forzando reload del server component con el requestId
    window.location.replace(`/checkout/resultado?${params.toString()}`);
  }, []);

  return null;
}
