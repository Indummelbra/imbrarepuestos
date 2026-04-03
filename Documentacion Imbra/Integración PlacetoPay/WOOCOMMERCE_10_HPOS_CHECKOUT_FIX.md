# WooCommerce 10.x + HPOS: Bug del Checkout en Imbra Repuestos y Cómo lo Resolvimos

**Proyecto:** Imbra Repuestos (store.imbra.cloud / imbrarepuestos.com)  
**WordPress actual:** https://mkt.imbrarepuestos.com (GoDaddy — temporal)  
**Fecha del fix de checkout:** 3 de Abril de 2026  
**Estado:** Fix paralelo APLICADO — migración WordPress al VPS PENDIENTE  
**Tiempo invertido en diagnóstico:** ~2 días  

---

## El Problema en Palabras Simples

Después de una actualización automática de WooCommerce a la versión **10.6.2**, el checkout dejó de funcionar completamente:

- El usuario llenaba el formulario de pago y hacía clic en "PAGAR"
- El botón se quedaba en **"PROCESANDO..."** indefinidamente
- Nunca llegaba a PlacetoPay
- En el WordPress de GoDaddy sí aparecían los pedidos creados (señal clave: el problema no era PlacetoPay ni el headless — era WooCommerce)

---

## Diagnóstico: Lo Que Encontramos

### 1. La Causa Raíz — HPOS + BatchProcessingController

WooCommerce 10.x introdujo **HPOS (High Performance Order Storage)**: las órdenes ya no se guardan en `wp_posts` sino en tablas propias (`wc_orders`, `wc_order_addresses`, etc.).

El problema específico: cuando WooCommerce crea una orden via REST API, el `BatchProcessingController` se engancha en el hook `woocommerce_after_order_object_save` e intenta migrar/sincronizar **TODAS** las órdenes existentes en `wp_posts` hacia las nuevas tablas HPOS. Con miles de órdenes históricas de Imbra, esto:

1. Entra en un **bucle infinito** de `BEFORE_SAVE`
2. Agota **512MB de memoria PHP** (límite de GoDaddy shared hosting)
3. El proceso muere sin retornar respuesta HTTP
4. El cliente ve "PROCESANDO..." hasta que el browser hace timeout

Evidencia del log de diagnóstico:
```
[557ms] CALC_TOTALS START: #5254
[564ms] BEFORE_SAVE: #5254
[601ms] BEFORE_SAVE: #5254   ← mismo pedido guardándose en bucle
[608ms] BEFORE_SAVE: #5254
[617ms] BEFORE_SAVE: #5254
... hasta [19938ms] BEFORE_SAVE: #5254 → OOM
```

Y en debug.log de WordPress:
```
PHP Fatal error: Allowed memory size of 536870912 bytes exhausted
in class-wc-data-store-wp.php on line 111
```

### 2. El Factor GoDaddy Shared Hosting

El hosting compartido de GoDaddy tiene un límite real de **512MB por proceso PHP** que no se puede superar con configuración. WooCommerce 10.x con el catálogo histórico de Imbra necesita más. Ningún snippet de código puede resolver un límite de hardware.

### 3. Por Qué No Lo Vimos Antes

WooCommerce se actualizó automáticamente de 9.x a 10.6.2. Esta versión activa HPOS por defecto Y activa el "sync-on-read" y el BatchProcessingController que no existían antes. El código de Next.js no cambió — cambió WooCommerce.

---

## La Solución — Dos Partes

### Parte 1 (APLICADO): Fix del Checkout en Paralelo (Next.js)

El problema de background impedía que la API de WooCommerce retornara respuesta. La solución: **no esperar a WooCommerce para lanzar PlacetoPay**.

**Flujo anterior (bloqueante — roto):**
```
1. Crear orden en WC → await (esperar hasta 60s) →
2. Si WC responde: lanzar PlacetoPay → redirigir
3. Si WC no responde: timeout → botón "PROCESANDO..." para siempre
```

**Flujo nuevo (paralelo — aplicado):**
```
1. Lanzar creación de orden en WC en background (sin await)
2. Lanzar PlacetoPay inmediatamente con referencia temporal IB-{timestamp} → redirigir en ~3s
3. Cuando WC responde en background → asociar requestId de PTP al pedido
```

Código aplicado en `src/components/checkout/CheckoutForm.tsx`:
```typescript
// Referencia temporal para PlacetoPay
const tempReference = `IB-${Date.now()}`;

// Crear orden en WooCommerce en background — sin await
const orderPromise = fetch('/api/checkout/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderPayload),
})
  .then(r => r.json())
  .catch(() => ({ success: false }));

// Lanzar PlacetoPay INMEDIATAMENTE
const ptpResult = await initiatePayment({
  reference: tempReference,
  description: `Pedido Imbra Repuestos`,
  amount: { currency: 'COP', total: totalToPay },
  // ... buyer, ipAddress, userAgent
});

// Redirigir al portal de pago inmediatamente
window.location.href = ptpResult.processUrl;

// Cuando WC responda, asociar el requestId
orderPromise.then((orderData) => {
  if (orderData?.success && orderData?.orderId && ptpResult.requestId) {
    savePTPRequestId(orderData.orderId, ptpResult.requestId);
    sessionStorage.setItem('ptp_order_id', String(orderData.orderId));
  }
});
```

### Meta_data sin prefijo `_`

WooCommerce HPOS 10.x rechaza meta_data con prefijo `_` via REST API. Se corrigieron todas las claves:

| Antes (fallaba en HPOS) | Después (correcto) |
|---|---|
| `_billing_numero_documento` | `billing_numero_documento` |
| `_billing_tipo_documento` | `billing_tipo_documento` |
| `_billing_city_code` | `billing_city_code` |
| `_billing_state_code` | `billing_state_code` |
| `_ptp_request_id` | `ptp_request_id` |

### Parte 2 (PENDIENTE): Migrar WordPress al VPS

Aunque el fix paralelo resuelve la experiencia del cliente (puede pagar en 3 segundos), **si GoDaddy mata el proceso PHP por OOM, la orden no se crea en WooCommerce**. El cliente paga, pero el equipo de Imbra no ve el pedido en el panel de WordPress.

La solución definitiva es mover el WordPress de `mkt.imbrarepuestos.com` al VPS propio donde ya corren Dokploy, Supabase y n8n.

**Docker Compose para WordPress de Imbra en Dokploy:**
```yaml
services:
  wordpress:
    image: wordpress:latest
    volumes:
      - wp_app:/var/www/html
    environment:
      WORDPRESS_DB_HOST: wp_db
      WORDPRESS_DB_NAME: $DB_NAME
      WORDPRESS_DB_USER: root
      WORDPRESS_DB_PASSWORD: $DB_PASSWORD
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_MEMORY_LIMIT', '1G');
        define('WP_MAX_MEMORY_LIMIT', '1G');
        define('DISALLOW_FILE_EDIT', true);
        @ini_set('memory_limit', '1G');
        @ini_set('max_execution_time', '300');
        @ini_set('upload_max_filesize', '128M');
        @ini_set('post_max_size', '128M');
    depends_on:
      wp_db:
        condition: service_healthy
    restart: unless-stopped

  wp_db:
    image: mysql:8.4
    restart: unless-stopped
    volumes:
      - wp_data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: $DB_PASSWORD
      MYSQL_DATABASE: $DB_NAME
    healthcheck:
      test: ["CMD-SHELL", "exit | mysql -h localhost -P 3306 -u root -p$$MYSQL_ROOT_PASSWORD"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

volumes:
  wp_app:
  wp_data:
```

**Configuración crítica en WooCommerce → Ajustes → Avanzado → Características:**
- Almacenamiento de pedidos: **"Almacenamiento de entradas de WordPress (heredado)"**
- Compatibility mode: **DESACTIVADO**

> **Por qué usar modo heredado y no HPOS:** HPOS en WC 10.x activa el BatchProcessingController que causa el bucle de OOM. En un WordPress limpio en el VPS con 1GB de memoria, se puede usar heredado sin ningún problema. Cuando WooCommerce lance un fix oficial, se puede evaluar volver a HPOS.

---

## Checklist de Migración de Imbra al VPS

- [x] Fix checkout en paralelo aplicado en `CheckoutForm.tsx`
- [x] Meta_data sin prefijo `_` corregido
- [ ] Crear nuevo servicio WordPress en Dokploy (proyecto "Imbra")
- [ ] Levantar el Docker Compose de arriba con variables propias de Imbra
- [ ] Migrar contenido del WordPress de GoDaddy (productos, páginas, snippets, imágenes)
- [ ] Configurar WooCommerce en modo **heredado** (no HPOS)
- [ ] Desactivar plugin "WooCommerce Legacy REST API" (incompatible con HPOS — y ya no se necesita en modo heredado)
- [ ] Crear nuevas claves API de WooCommerce para Imbra en el nuevo WP
- [ ] Actualizar variables en Dokploy → Imbra Store:
  - `WC_CONSUMER_KEY` → nueva clave del WP en VPS
  - `WC_CONSUMER_SECRET` → nuevo secreto del WP en VPS
  - `WPGRAPHQL_URL` → nueva URL del WP en VPS
  - `NEXT_PUBLIC_WORDPRESS_URL` → nueva URL (también en Build-time Arguments)
- [ ] Redeploy de Imbra Store en Dokploy
- [ ] Apuntar DNS de `imbrarepuestos.com` y `mkt.imbrarepuestos.com` al VPS
- [ ] Prueba de pago completa con tarjeta de prueba

---

## Variables de Entorno Actuales de Imbra (Dokploy)

### Environment Settings (runtime):
```
WC_CONSUMER_KEY=ck_3adb8346265e17ceb80913d501480c5d80905adc
WC_CONSUMER_SECRET=cs_f499ee29185b9984465af5219f2b467eef77d630
PTP_LOGIN=bc1cb144264d2a706734f55068678e8a
PTP_SECRET_KEY=3NpZgA28j8bfgYi2
PTP_BASE_URL=https://checkout.placetopay.com
WPGRAPHQL_URL=https://mkt.imbrarepuestos.com/graphql
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SYNC_SECRET=Imbra2025_Sync_Safety
CRON_SECRET=ImbraSecurityCron2026_XyZ
NEXT_PUBLIC_RETURN_URL=https://store.imbra.cloud/checkout/resultado
NEXT_PUBLIC_WORDPRESS_URL=https://mkt.imbrarepuestos.com/
NEXT_PUBLIC_SUPABASE_URL=https://supabase.imbra.cloud
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Al lanzar con `imbrarepuestos.com`:** cambiar `NEXT_PUBLIC_RETURN_URL` a `https://imbrarepuestos.com/checkout/resultado`

### Build-time Arguments (OBLIGATORIO para variables NEXT_PUBLIC_):
```
NEXT_PUBLIC_WORDPRESS_URL=https://mkt.imbrarepuestos.com/
NEXT_PUBLIC_SUPABASE_URL=https://supabase.imbra.cloud
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_RETURN_URL=https://store.imbra.cloud/checkout/resultado
```

> **Importante:** Las variables `NEXT_PUBLIC_*` se incrustan en el bundle durante el build de Docker. Si no están en Build-time Arguments, quedan vacías y los productos no cargan aunque estén bien en Environment Settings.

---

## Snippets WordPress Requeridos (en el nuevo WP del VPS)

Todos deben estar activos en Code Snippets:

| Nombre | Función |
|---|---|
| Sincronización Estricta Páginas | Sync de páginas legales desde headless |
| Checkout Campos Cédula | Campos `billing_tipo_documento` y `billing_numero_documento` |
| Sistema de Envíos Imbra | Lógica de costos de envío por ciudad/zona |
| Slides Headless | Exposición de slides hero via REST |
| Transportadora y Guía de Envío | Campos de tracking en pedidos del admin |

> **NO activar en el nuevo WP:** Desactivar HPOS Sync, Limpiar ActionScheduler, Fix REST API Órdenes WC10, Bloquear ActionScheduler en REST API, Diagnóstico REST Órdenes — todos fueron parches temporales para el problema de GoDaddy, ya no son necesarios en el VPS con memoria suficiente.

---

## Pendientes Antes del Lanzamiento Definitivo (imbrarepuestos.com)

- [ ] Verificar certificado PlacetoPay para dominio `imbrarepuestos.com` (ya certificado con Evertec)
- [ ] Cambiar `NEXT_PUBLIC_RETURN_URL` a `https://imbrarepuestos.com/checkout/resultado`
- [ ] Prueba de pago completa en producción con tarjeta real (monto mínimo)
- [ ] Verificar que n8n recibe los webhooks de WooCommerce del nuevo WP en VPS
- [ ] Confirmar que el cron de PlacetoPay probe funciona (`/api/cron/placetopay-probe`)

---

*Documento generado el 3 de Abril de 2026.*  
*Próxima revisión: tras completar migración del WordPress de Imbra al VPS.*
