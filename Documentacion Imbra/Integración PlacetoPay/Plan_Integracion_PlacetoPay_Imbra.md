# Análisis y Plan de Integración: PlacetoPay - Imbra Store

Este documento contiene el análisis detallado y el plan de acción para la integración de la pasarela de pagos PlacetoPay en el proyecto headless de Imbra Store.

---

## 1. Análisis de Requisitos (Referencia: Documentación Recibida)

### 1.1. Información del Comercio
- **Comercio:** INDUMMELBRA S.A.S
- **Modelo:** Agregador
- **Ambiente:** Certificación (Pruebas)

### 1.2. Credenciales Actuales (Modo Pruebas)
- **Login:** 9a5bf21c6535374a6aac834258bcfc7e
- **TranKey:** 3EKttTZ7Nd0rnHAT
- **Endpoint:** `https://checkout-test.placetopay.com`

### 1.3. Requisitos de Certificación Críticos
1. **Seguridad:** Los datos sensibles del comprador (tarjeta) son capturados por PlacetoPay. Imbra solo envía información básica del comprador y el monto.
2. **Sincronización:** Es mandatorio implementar el Webhook (URL de Notificación) para recibir actualizaciones de estado, especialmente para pagos PSE que pueden quedar pendientes.
3. **Consulta de Estado:** Implementar `QuerySession` para validar el estado del pago una vez el usuario regrese al sitio (no confiar únicamente en los parámetros de la URL de retorno).
4. **Visibilidad:** El logo de PlacetoPay y la sección de FAQ deben ser visibles en el sitio.

---

## 2. Plan de Implementación Técnica (Headless Next.js)

### 2.1. Configuración del Entorno (VPS/Dokploy)
Las siguientes variables deben configurarse en el panel de **Dokploy**:
```env
PTP_LOGIN=9a5bf21c6535374a6aac834258bcfc7e
PTP_SECRET_KEY=3EKttTZ7Nd0rnHAT
PTP_BASE_URL=https://checkout-test.placetopay.com
NEXT_PUBLIC_RETURN_URL=https://store.imbra.cloud/checkout/resultado
```

### 2.2. Flujo del Sistema
1. **Checkout:** El usuario completa su carrito y datos de envío.
2. **Creación de Sesión (Server-Side):**
   - Se genera una petición `createSessionRequest` incluyendo:
     - `buyer`: Datos del cliente.
     - `payment`: Referencia única, descripción, moneda (COP) y valor total.
     - `expiration`: Configurado entre 10 y 30 min.
     - `returnUrl`: URL de resultado en Imbra Store.
     - `ipAddress` y `userAgent`: Del cliente final.
3. **Redirección:** El cliente es enviado a la `processUrl` devuelta por PlacetoPay.
4. **Respuesta y Notificación:**
   - **Retorno:** PlacetoPay redirige al usuario de vuelta.
   - **Webhook:** PlacetoPay envía un POST asíncrono confirmando el éxito o rechazo.
5. **Finalización:** Imbra consulta `querySession` para confirmar el estado final y mostrar el recibo al usuario.

---

## 3. Checklist de Tareas UI/UX (Basado en Certificación)

- [ ] **Sección de FAQ:** Crear página `/ayuda/pagos` con el contenido del documento "FAQ - PLACETOPAY".
- [ ] **Logos:** Incluir el logo de PlacetoPay en el footer y en el proceso de selección de método de pago.
- [ ] **Checkout Inteligente:** Bloquear el botón de pago tras el primer clic para evitar duplicidad.
- [ ] **Historial de Pagos:** Implementar en el perfil de usuario una lista de los últimos 5 intentos de pago con su respectivo estado.
- [ ] **Aceptación de Políticas:** Incluir checkbox obligatorio para T&C y Políticas de Privacidad antes de proceder al pago.

---

## 4. Próximos Pasos Sugeridos

1. **Implementar `src/lib/placetopay.ts`**: Crear las funciones base de comunicación.
2. **Configurar el Webhook**: Crear la ruta API necesaria para Dokploy.
3. **Crear la Página de FAQ**: Cumplir con el requisito legal de inmediato.

---
**Elaborado por:** iAnGo (Asistente de Desarrollo)
**Fecha:** 12 de Marzo de 2026
**Ubicación de Referencia:** `f:\CLIENTES\IMBRA-MAPACHE\Imbra Store\Documentacion Imbra\Integración PlacetoPay\`
