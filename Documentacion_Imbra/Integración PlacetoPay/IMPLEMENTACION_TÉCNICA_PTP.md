# Documentación de Implementación: PlacetoPay (Fase 1)

**Fecha de Finalización:** 16 de Marzo, 2026
**Estado:** Implementado en Sandbox & Listo para Certificación

## 1. Resumen de la Implementación
Se ha completado la integración del flujo real de pagos con PlacetoPay (Evertec) cumpliendo con los estándares de seguridad SHA-256 y los requisitos de la Guía de Certificación WC v1.6.

## 2. Componentes Técnicos
- **Captura de IP Real**: Implementación de un endpoint seguro (`/api/user-ip`) para capturar la IP del cliente, requisito crítico para la prevención de fraudes.
- **Autenticación SHA-256**: Migración del algoritmo de hashing de SHA-1 a SHA-256 para la generación de `tranKey` y validación de firmas.
- **Flujo Anti-Doble-Clic**: Protección en el lado del cliente usando `useRef` para evitar transacciones duplicadas.
- **Gestión de Sesiones**: Uso de `sessionStorage` para persistir el `requestId` y permitir la consulta de estado en tiempo real tras el redireccionamiento.

## 3. Página de Resultados (`/checkout/resultado`)
La página ha sido diseñada para manejar 4 estados transaccionales:
- **APROBADO**: Visualización de detalles (Referencia, Monto, Fecha local).
- **RECHAZADO/FALLIDO**: Opciones de reintento automático.
- **PENDIENTE**: Mensajería de espera para transacciones asincrónicas.

## 4. Archivos Clave
- `src/lib/placetopay.ts`: Lógica de autenticación y comunicación con la API.
- `src/app/actions/placetopay.ts`: Server Action para iniciar el pago.
- `src/app/api/payments/placetopay/webhook/route.ts`: Notificaciones automáticas de PlacetoPay.
- `src/components/checkout/CheckoutForm.tsx`: Orquestador del flujo de pago.
