# Checkout Resultado — Diseño, Funcionamiento y Documentación Técnica

> **Archivo:** `src/app/checkout/resultado/page.tsx`
> **Borrador de diseño:** `src/app/checkout/resultado-preview/page.tsx`
> **Última actualización:** 2026-03-30
> **Estado:** Diseño aprobado — pendiente migrar borrador a producción

---

## 1. Propósito de la página

Esta página es el destino final del flujo de pago. El usuario llega aquí automáticamente después de completar (o abandonar) el proceso en la plataforma de PlacetoPay. Su función es:

- Confirmar al usuario el resultado de su transacción
- Mostrar el resumen completo del pedido
- Dar opciones de acción según el estado (reintentar, ir a la tienda, consultar pedidos)
- Limpiar el carrito local si el pago fue aprobado

---

## 2. Flujo completo de retorno desde PlacetoPay

```
Usuario en PlacetoPay
        │
        │ PlacetoPay redirige automáticamente a:
        ▼
https://store.imbra.cloud/checkout/resultado?reference=ORDER_ID
        │
        ├── getOrder(reference)         → recupera pedido de WooCommerce
        ├── querySession(requestId)     → consulta estado real en PlacetoPay
        │
        ▼
Página renderiza según estadoFinal:
  APPROVED / REJECTED / FAILED / PENDING
```

**Parámetros de URL recibidos:**
| Parámetro | Fuente | Uso |
|---|---|---|
| `reference` | URL query param | ID del pedido en WooCommerce |
| `requestId` | URL query param o meta de WC (`_ptp_request_id`) | ID de sesión en PlacetoPay |

---

## 3. Estados posibles y comportamiento

| Estado | Color acento | PageHero | Icono | Comportamiento especial |
|---|---|---|---|---|
| `APPROVED` | Verde (`text-green-400`) | "Pago **Aprobado**" | ✅ Check verde | Limpia `localStorage` del carrito y datos de checkout |
| `REJECTED` | Rojo (`text-red-400`) | "Pago **Rechazado**" | ❌ X roja | Muestra botón "Reintentar pago" |
| `FAILED` | Amarillo (`text-yellow-400`) | "Error en el **Proceso**" | ⚠️ Triángulo amarillo | Muestra botón "Reintentar pago" |
| `PENDING` | Blanco (`text-white`) | "Pago en **Verificación**" | ⏳ Reloj gris | Muestra barra de seguimiento |

---

## 4. Componentes y estructura visual

### 4.1 Header y PageHero dinámico

La página incluye el `<Header />` (con StickyHeader integrado) y un `<PageHero />` cuyo título y color de acento cambian según el estado del pago.

```tsx
<PageHero
  label="Tu pedido"
  title={hero.title}           // "Pago" | "Error en el" | "Pago en"
  titleAccent={hero.titleAccent} // "Aprobado" | "Rechazado" | "Proceso" | "Verificación"
  accentColor={hero.accentColor} // text-green-400 | text-red-400 | text-yellow-400 | text-white
/>
```

El prop `accentColor` fue agregado al componente `PageHero` en esta sesión para soportar colores dinámicos. Por defecto sigue siendo `text-primary` (naranja) en todas las demás páginas.

### 4.2 Bloque superior — Estado + Mensaje + Acciones rápidas

Barra horizontal que contiene:
- **Ícono de estado**: cuadrado de color sólido con ícono SVG
- **Badge de estado**: etiqueta (APROBADO / RECHAZADO / FALLIDO / PENDIENTE)
- **Número de pedido**
- **Mensaje descriptivo** según el estado
- **Botones de acción**:
  - "Reintentar pago" → `/checkout` (solo si REJECTED o FAILED)
  - "Seguir comprando" → `/tienda` (siempre visible)

### 4.3 Grid principal — 2 columnas (desktop)

```
┌─────────────────────────────┬───────────────┐
│  Productos del pedido        │  Detalles     │
│  (nombre, cantidad, precio)  │  (# pedido,   │
│                              │  fecha,       │
│  Totales                     │  cliente,     │
│  (subtotal, envío, total)    │  ciudad)      │
│                              │               │
│  Seguimiento del envío       │  Mis Pedidos  │
│  (solo APPROVED/PENDING)     │  (CTA negro)  │
│                              │               │
│                              │  PlacetoPay   │
│                              │  logo         │
└─────────────────────────────┴───────────────┘
```

En mobile: columna única, el bloque derecho va abajo.

### 4.4 Sección de productos

Cada producto muestra:
- Imagen del producto (si viene de WooCommerce) o ícono placeholder `inventory_2`
- Nombre del producto
- Cantidad
- Precio total del ítem

### 4.5 Desglose de costos

| Campo | Fuente |
|---|---|
| Subtotal | `order.total - order.shipping_total` |
| Envío | `order.shipping_total` (muestra "Gratis" si es 0) |
| Total pagado | Monto de PlacetoPay o fallback de WooCommerce |

### 4.6 Barra de seguimiento del envío

Visible únicamente en estado `APPROVED` o `PENDING`. Muestra 4 pasos:
1. **Confirmado** (activo al recibir el pago)
2. En preparación
3. En camino
4. Entregado

El paso activo tiene fondo `bg-primary` (naranja) con ícono en negro. Los pasos futuros aparecen en gris.

### 4.7 CTA "Mis Pedidos"

Bloque oscuro (`bg-secondary`) con:
- Label en naranja: "Consulta tu pedido"
- Título en blanco bold: "MIS PEDIDOS"
- Flecha `arrow_forward` en color primario (naranja)
- Hover: fondo negro
- Link directo a `/mis-pedidos`

### 4.8 Logo PlacetoPay

Imagen oficial desde `https://static.placetopay.com/placetopay-logo.svg` en escala de grises con baja opacidad, al final de la columna derecha.

---

## 5. Lógica de datos — Fuentes y fallbacks

```
1. reference (query param)
   └─ getOrder(reference) → WooCommerce REST API
      ├─ line_items (productos)
      ├─ total, shipping_total, currency
      ├─ date_created
      └─ meta_data._ptp_request_id → requestId

2. requestId (query param o meta)
   └─ querySession(requestId) → PlacetoPay API
      ├─ status.status → estadoFinal (APPROVED/REJECTED/FAILED/PENDING)
      ├─ status.message → motivoTransaccion
      ├─ status.date → fechaTransaccion
      └─ payment[0].amount → montoTotal

Fallbacks:
  - montoTotal: WooCommerce si PTP no lo devuelve
  - fechaTransaccion: WooCommerce date_created si PTP no responde
  - estadoFinal: 'PENDING' si no hay requestId
```

---

## 6. Limpieza del carrito (APPROVED)

Cuando el estado es `APPROVED`, se inyecta un script inline que ejecuta en el cliente:

```js
localStorage.removeItem('imbra_cart');
localStorage.removeItem('imbra_checkout_data');
sessionStorage.removeItem('ptp_request_id');
sessionStorage.removeItem('ptp_order_id');
```

Esto limpia el carrito y todos los datos temporales del checkout, dejando la sesión limpia para una nueva compra.

---

## 7. Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/app/checkout/resultado/page.tsx` | Página de producción con datos reales |
| `src/app/checkout/resultado-preview/page.tsx` | Borrador de diseño con datos falsos |
| `src/lib/placetopay.ts` | `querySession()` — consulta estado en PlacetoPay |
| `src/lib/woocommerce.ts` | `getOrder()` — recupera pedido de WooCommerce |
| `src/app/actions/placetopay.ts` | `initiatePayment()` — crea la sesión de pago |
| `src/components/checkout/OrderTracking.tsx` | Componente de seguimiento animado |
| `src/components/ui/PageHero.tsx` | Hero dinámico con prop `accentColor` |

---

## 8. Credenciales de pago (producción)

Las credenciales fueron migradas de prueba a producción el **2026-03-30**:

| Variable | Entorno |
|---|---|
| `PTP_LOGIN` | Credencial de producción activa |
| `PTP_SECRET_KEY` | Credencial de producción activa |
| `PTP_BASE_URL` | `https://checkout.placetopay.com` (producción) |

> Las credenciales están en `.env.local` (local) y deben estar configuradas también en **Dokploy** (servidor de producción).

---

## 9. URLs de prueba del borrador de diseño

Para previsualizar el diseño de cada estado sin hacer un pago real:

| Estado | URL local |
|---|---|
| ✅ Aprobado | http://localhost:3000/checkout/resultado-preview?estado=APPROVED |
| ❌ Rechazado | http://localhost:3000/checkout/resultado-preview?estado=REJECTED |
| ⚠️ Fallido | http://localhost:3000/checkout/resultado-preview?estado=FAILED |
| ⏳ Pendiente | http://localhost:3000/checkout/resultado-preview?estado=PENDING |

> El borrador usa datos completamente ficticios. No afecta la página de producción en ningún momento.

---

## 10. Pendientes

- [ ] Migrar el diseño aprobado del borrador (`resultado-preview`) a la página de producción (`resultado`)
- [ ] Eliminar `resultado-preview` una vez migrado
- [ ] Configurar variables de producción PTP en Dokploy
- [ ] Verificar primer pago real en producción
