# Ingeniería: Checkout, Validación de Stock y Reporte de Pedidos (Headless)

Este documento detalla el proceso crítico de cierre de transacciones, asegurando que los pedidos se creen correctamente en WooCommerce con validación de inventario en tiempo real.

## 1. Validación de Stock en Checkout (Real-Time)
Para evitar ventas de productos sin inventario real (overselling), el sistema implementa un bloqueo de seguridad en los endpoints de checkout (`/api/checkout/process-payment` y `/api/checkout/create-order`):

- **Bypass de Caché:** Antes de procesar el pago o crear la orden, el sistema realiza una consulta directa a la REST API de WooCommerce (`GET /wp-json/wc/v3/products/{id}`). NO se confía en la caché de Supabase o Redis en este punto.
- **Lógica de Bloqueo:** Si el stock es insuficiente o el estado es `outofstock`, la transacción se cancela y se devuelve un error 400 detallado al usuario.
- **Sincronización de Emergencia:** Ante una falla de stock, se dispara [syncProductCache(productId)](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/lib/woocommerce.ts#45-64) para actualizar de inmediato la tienda para otros usuarios.

## 2. Creación de Pedidos en WooCommerce (Order Reporting)
El reporte de pedidos al panel administrativo de WordPress se realiza mediante el endpoint `POST /wp-json/wc/v3/orders`.

### A. Estructura del Payload
Se debe enviar un mapeo completo que incluya:
- **Billing & Shipping:** Nombre, dirección, email, teléfono y ciudad.
- **Line Items:** Array con `product_id`, `variation_id` y `quantity`.
- **Metadatos de Negocio (Meta):**
    - `_billing_cedula` / `billing_dni`: Documento de identidad (Crítico para Colombia).
    - `_cl_rx_attachment_url`: URL de la receta médica si aplica.
    - `_wompi_transaction_id`: ID de referencia de la pasarela.

## 3. Flujo de Estados y Confirmación
1.  **Estado Inicial (Pending):** El pedido se crea en WooCommerce como `pending`. Esto reserva el stock temporalmente.
2.  **Confirmación de Pago:** Una vez que la pasarela confirma el éxito, se actualiza el pedido a `processing` enviando `set_paid: true`.
3.  **Manejo de Fallos:** Si el pago es rechazado, el frontend marca el pedido como `failed` en WooCommerce para liberar el stock reservado.

## 4. Conclusión Técnica
Esta implementación garantiza la integridad de la transacción separando la velocidad de navegación (GQL/Caché) de la seguridad transaccional (REST API).

---
*Documento de Ingeniería de Pedidos - 13/03/2026*
