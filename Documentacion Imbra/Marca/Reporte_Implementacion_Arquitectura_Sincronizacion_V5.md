# Reporte de Implementación: Arquitectura de Sincronización V5.0 🚀

Este documento sirve como registro oficial de la implementación técnica realizada para el sistema de sincronización y mapeo de productos de IMBRA Store.

## 📁 Ubicación de los Cambios
Para mantener la transparencia y el orden, todos los archivos clave se han organizado de la siguiente manera:

-   **Lógica de Negocio y Mapeo:** `src/lib/mappers.ts`
-   **Motor de Datos (Fetching Híbrido):** `src/lib/woocommerce.ts`
-   **Endpoints de Sincronización:**
    -   Masivo: `src/app/api/sync-products/route.ts`
    -   Tiempo Real: `src/app/api/webhooks/woo-sync/route.ts`
-   **Gestión del Carrito (Handover):** `src/context/CartContext.tsx`
-   **Integración UI:** `src/app/page.tsx`, `src/components/layout/Header.tsx`, `src/components/features/ProductCard.tsx` y `src/components/features/ProductShowcase.tsx`
-   **Capa Transaccional (Pago y Pedidos):**
    -   Validación Stock: `src/app/api/checkout/validate-stock/route.ts`
    -   Creación Pedidos: `src/app/api/checkout/create-order/route.ts`
    -   Webhook Pagos: `src/app/api/payments/placetopay/webhook/route.ts`
-   **Motor de Búsqueda Inteligente (Live Search):**
    -   Componente UI: `src/components/search/LiveSearch.tsx`
    -   Server Action: `src/app/actions/search-actions.ts`
    -   Configuración DB: Funciones RPC en Supabase.

---

## 🛠️ Resumen de la Intervención

### 1. Arquitectura de 3 Capas
Se ha establecido WooCommerce como fuente única de verdad, utilizando Supabase como capa intermedia para búsquedas y Next.js para una experiencia de usuario instantánea.

### 2. Mapeo Industrial (V5.0)
El sistema ahora reconoce y normaliza stock real, atributos técnicos y precios automatizados.

### 3. Sistema de Checkout y Stock (Capa Transaccional)
Se implementó una capa de seguridad para transacciones con validación real-time y reporte automático de pedidos.

### 4. Live Search (Búsqueda Nivel Dios)
Se implementó un motor de búsqueda sobre Supabase que permite:
-   **Highlighting:** Resaltado visual de coincidencias.
-   **Fuzzy Search:** Tolerancia a errores de escritura.
-   **Velocidad:** Resultados instantáneos mediante RPC sin sobrecargar WordPress.

---

## 🚦 Instrucciones para el Administrador

Para que el sistema sea 100% operativo, se requieren las siguientes configuraciones manuales:

1.  **Variables de Entorno:** Editar `.env.local` con las llaves de Supabase, WooCommerce REST API y PlacetoPay.
2.  **Webhooks de WordPress:** 
    -   Configurar triggers de productos hacia `/api/webhooks/woo-sync`.
    -   Asegurar que el webhook de PlacetoPay apunte al endpoint del Headless.
3.  **Snippet PHP:** Asegurarse de que `handover_helper.php` esté activo.

**Fecha de Entrega:** 13 de marzo de 2026
**Responsable:** iAnGo (AI Assistant)
