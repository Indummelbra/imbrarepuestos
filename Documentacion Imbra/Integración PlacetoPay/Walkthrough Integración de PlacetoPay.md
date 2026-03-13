# Walkthrough: Integración de PlacetoPay

He implementado la estructura completa para la pasarela de pagos PlacetoPay en el headless de Imbra Store, siguiendo estrictamente los requisitos de certificación de Evertec.

## Estructura de Archivos Creada

### 1. Núcleo y Tipos
- [placetopay.ts](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/lib/placetopay.ts): Lógica de generación de `TranKey` (SHA1), `nonce` y comunicación con la API.
- [placetopay.ts](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/types/placetopay.ts): Definición de interfaces para todas las peticiones y respuestas de la pasarela.

### 2. Lógica de Servidor (Next.js 15)
- [placetopay.ts](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/app/actions/placetopay.ts): Server Action [initiatePayment](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/src/app/actions/placetopay.ts#17-57) para ser llamada desde el botón de checkout.
- [route.ts](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/app/api/payments/placetopay/webhook/route.ts): Endpoint de Webhook para sincronización asíncrona de pedidos.

### 3. Interfaz de Usuario e Información Legal
- [page.tsx](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/app/checkout/resultado/page.tsx): Página de aterrizaje post-pago que maneja el retorno del usuario.
- [page.tsx](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/app/ayuda/pagos/page.tsx): Página de Preguntas Frecuentes (FAQ) con el copy oficial requerido.
- [PaymentLogos.tsx](file:///f:/CLIENTES\IMBRA-MAPACHE\Imbra Store/src/components/features/PaymentLogos.tsx): Componente con los logos oficiales de PlacetoPay y franquicias.

## Cómo Probar la Integración

1. **Variables de Entorno:** Asegúrate de tener configuradas las claves de prueba en tu archivo `.env.local` o en Dokploy:
   ```env
   PTP_LOGIN=9a5bf21c6535374a6aac834258bcfc7e
   PTP_SECRET_KEY=3EKttTZ7Nd0rnHAT
   PTP_BASE_URL=https://checkout-test.placetopay.com
   NEXT_PUBLIC_RETURN_URL=https://store.imbra.cloud/checkout/resultado
   ```

2. **Simulación de Pago:**
   - Puedes llamar a la acción [initiatePayment](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/src/app/actions/placetopay.ts#17-57) con datos de prueba.
   - Serás redirigido al ambiente de pruebas de PlacetoPay.
   - Al finalizar, regresarás a `/checkout/resultado`.

3. **Verificación de Requisitos:**
   - Visita `/ayuda/pagos` para ver la sección de FAQ.
   - Usa el componente `<PaymentLogos />` en el footer para cumplir con la visibilidad del logo.

## Siguientes Pasos
- Conectar la lógica del Webhook con la base de datos o el API de WooCommerce para actualizar el estado real del pedido.
- Implementar el historial de pagos en el perfil del usuario utilizando la función [querySession](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/src/lib/placetopay.ts#66-94) de [src/lib/placetopay.ts](file:///f:/CLIENTES/IMBRA-MAPACHE/Imbra%20Store/src/lib/placetopay.ts).
