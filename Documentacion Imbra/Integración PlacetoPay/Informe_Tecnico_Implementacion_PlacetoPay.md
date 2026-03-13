# Informe Técnico de Implementación: PlacetoPay - Imbra Store (INDUMMELBRA S.A.S)

**Para:** Equipo de Soporte e Implementación - Evertec / PlacetoPay
**De:** Equipo de Desarrollo - iAnGo (Headless Imbra Store)
**Fecha:** 12 de Marzo de 2026
**Asunto:** Resumen técnico de integración en arquitectura Headless (Next.js 15)

---

## 1. Contexto del Proyecto
Se está realizando la migración tecnológica de la tienda **Imbra Store** (antes en Shopify) hacia una arquitectura **Headless E-commerce** propia, desplegada en contenedores Docker mediante Dokploy en un VPS independiente.

- **Stack Tecnológico:** Next.js 15.1, React 19, Tailwind CSS.
- **Plataforma Backend:** WooCommerce (v3 API).
- **Dominio de Pruebas:** `https://store.imbra.cloud`
- **Dominio Final:** `https://imbrarepuestos.com`

---

## 2. Desarrollo Realizado

Hemos completado la integración de todos los componentes requeridos en la **Guía de Certificación WC (v1.6)**:

### 2.1. Seguridad y Autenticación
- Se ha implementado la generación de autenticación dinámica mediante el estándar requerido:
  - Generación de `nonce` aleatorio (base64).
  - Generación de `seed` (ISO 8601).
  - Cálculo de `tranKey` utilizando hash SHA1 (`Base64(SHA1(nonce + seed + secretKey))`).
- Se garantiza que los datos sensibles de la tarjeta son capturados exclusivamente por el servicio de WebCheckout de PlacetoPay.

### 2.2. Implementación de Flujo WebCheckout
- **Creación de Sesión:** Implementada mediante Server Actions de Next.js para proteger las credenciales en el lado del servidor.
- **Redirección:** Manejada de forma segura hacia `https://checkout-test.placetopay.com`.
- **Retorno al Comercio:** El sistema redirige al usuario a una página de resultados interna (`/checkout/resultado`) para brindar una experiencia fluida.

### 2.3. Sincronización y Notificaciones (Webhook)
- Se ha habilitado un endpoint de API público:  
  `POST https://store.imbra.cloud/api/payments/placetopay/webhook`
- Este endpoint está diseñado para:
  1. Validar asíncronamente los cambios de estado (PENDING -> APPROVED/REJECTED).
  2. Ejecutar un `QuerySession` por cada notificación recibida para garantizar la integridad de los datos.
  3. Actualizar el estado del pedido en nuestro backend de WooCommerce.

---

## 3. Cumplimiento de Requisitos Legales y de UI
Siguiendo las directrices de la marca y de la pasarela, hemos incluido:
- **Página de Preguntas Frecuentes (FAQ):** Disponible en `/ayuda/pagos`, con el contenido oficial sobre seguridad y procesos.
- **Logotipos Oficiales:** Inclusión de distintivos de PlacetoPay y franquicias (Visa, MC, etc.) en el flujo de caja y pie de página.
- **Resumen de Pagos:** Página de confirmación que muestra referencia única, estado, fecha y monto procesado.

---

## 4. Estado Actual y Próximos Pasos de Certificación

1. **Pruebas de Funcionalidad:** Iniciando fase de pruebas controladas con tarjetas de test.
2. **Sonda (Cronjob):** En fase de diseño para validación periódica (cada 15 min en pruebas).
3. **Solicitud de Credenciales:** Una vez validada la sonda y el webhook, procederemos a solicitar la revisión oficial para el paso a producción.

---
**Atentamente,**
Equipo de Desarrollo Imbra Store
*Implementación realizada por iAnGo (Agentic Assistant)*
