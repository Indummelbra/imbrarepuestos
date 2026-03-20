# Guía Detallada de Integración: PlacetoPay (Imbra Store)

Esta guía documenta la implementación técnica final de la pasarela de pagos PlacetoPay para **Imbra Store**, cumpliendo con la Guía de Certificación WC v1.6 y optimizaciones de UX premium.

---

## 1. Términos y Condiciones (Garantía Legal)
Se ha implementado una barrera de cumplimiento obligatoria antes de iniciar cualquier transacción.

- **Componente**: `src/components/checkout/CheckoutForm.tsx`
- **Mecanismo**: Checkbox obligatorio (`acceptTerms`) vinculado a la página `/terminos`.
- **Validación**: El botón "Pagar con PlacetoPay" está habilitado únicamente tras la aceptación. Si se intenta forzar el envío, el sistema lanza un error visual (`errorMsg`).

## 2. Procesamiento Transaccional y Resumen de Sesión
El flujo garantiza que el usuario siempre esté informado y pueda reintentar su pago de forma sencilla.

- **Resumen Completo**: La página `/checkout/resultado` extrae los datos directamente de la respuesta serializada de PlacetoPay:
    - **Referencia**: ID del pedido de WooCommerce (ej: #1234).
    - **Valor**: Total de la transacción incluyendo moneda (COP).
    - **Fecha**: Fecha de la transacción en formato local `es-CO`.
    - **Estado**: Visualización premium (Aprobado, Rechazado, Fallido, Pendiente) con iconografía animada.
- **Recuperación de requestId**: Para garantizar la robustez, si el sistema no recibe el `requestId` por la URL de retorno, realiza una consulta automática a los metadatos del pedido en WooCommerce (`_ptp_request_id`) para recuperar el estado.
- **Persistencia de UX (Reintentos)**:
    - Los datos del formulario se guardan en `localStorage` (`imbra_checkout_data`).
    - Si el pago es rechazado, el botón "Intentar Nuevo Pago" redirige al checkout donde los campos ya están precargados.
    - Los datos se limpian automáticamente mediante un script solo tras un pago exitoso (`APPROVED`).

## 3. Sonda o Cronjob (Sincronización Automática)
Garantiza que los pedidos con pagos pendientes se actualicen en WooCommerce de forma desatendida.

- **Endpoint**: `https://store.imbra.cloud/api/cron/placetopay-probe`
- **Lógica**: 
    1. Busca todos los pedidos con estado `pending` en WooCommerce.
    2. Por cada pedido, extrae el `_ptp_request_id`.
    3. Consulta a PlacetoPay mediante `querySession`.
    4. Si el estado es `APPROVED`, marca el pedido como `processing`. Si es `REJECTED`, lo marca como `failed`.
- **Seguridad**: Solo responde ante peticiones con el Header `Authorization: Bearer [CRON_SECRET]`.

## 4. Webhook de Notificaciones (Real-Time)
Recepción de actualizaciones de estado enviadas directamente por los servidores de PlacetoPay.

- **Endpoint**: `POST https://store.imbra.cloud/api/payments/placetopay/webhook`
- **Validación de Firma**: El sistema verifica el hash `sha256:` de la notificación comparándolo con el `secretKey` configurado.
- **Consistencia**: Al recibir la notificación, el sistema realiza un `querySession` adicional para confirmar el estado final antes de actualizar WooCommerce.

## 5. Validaciones de Datos y Tipos de Documento
Optimización de datos para la prevención de fraudes y cumplimiento de estándares internacionales.

- **Validación de Nombres**: Los campos "Nombre" y "Apellido" usan regex para permitir únicamente letras, tildes y la letra 'ñ', bloqueando números o caracteres especiales.
- **Tipos de Documento**: Se soporta el catálogo extendido requerido por Evertec:
    - **Nacionales**: CC (Cédula de Ciudadanía), CE (Extranjería), NIT, TI (Identidad), RUT.
    - **Internacionales**: PPN (Pasaporte), DNI, CI, RUC, CPF, TAX.
- **Validación de Identificación**: El número de documento se valida dinámicamente según el tipo seleccionado (ej: CC entre 7 y 10 dígitos, NIT con 9 dígitos).

---

## Anexo: Variables de Entorno Requeridas
Para el funcionamiento correcto en producción (Docker/Dokploy), asegúrese de tener configuradas:

| Variable | Descripción |
|----------|-------------|
| `PTP_LOGIN` | Login identificador de PlacetoPay |
| `PTP_SECRET_KEY` | Llave secreta para generación de firmas |
| `PTP_ENDPOINT` | URL base de la API (Sandbox o Producción) |
| `NEXT_PUBLIC_RETURN_URL` | URL de retorno tras el pago |
| `CRON_SECRET` | Token para asegurar el endpoint de la sonda |

---
**Fecha de Documentación:** 19 de Marzo, 2026
**Autor:** iAnGo (Agentic AI) para Imbra Store
