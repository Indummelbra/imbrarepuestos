# WooCommerce 10.x + HPOS: El Gran Bug del Checkout y Cómo lo Resolvimos

**Proyectos afectados:** Mapache Parts (mapachestore.imbra.cloud) e Imbra Repuestos (store.imbra.cloud)  
**Fecha de resolución Mapache:** 3 de Abril de 2026  
**Fecha de resolución Imbra:** 3 de Abril de 2026  
**Estado Imbra:** Fix de checkout en paralelo APLICADO — migración al VPS PENDIENTE  
**Tiempo invertido en diagnóstico:** ~2 días  

---

## El Problema en Palabras Simples

Después de una actualización automática de WooCommerce a la versión **10.6.2**, el checkout dejó de funcionar completamente en los dos proyectos:

- El usuario llenaba el formulario, hacía clic en "Pagar"
- El botón se quedaba en **"PROCESANDO..."** indefinidamente
- Nunca llegaba a PlacetoPay
- En WordPress sí aparecían los pedidos creados (señal clave: el problema no era PlacetoPay)

---

## Diagnóstico: Lo Que Encontramos

### 1. La Causa Raíz — HPOS + BatchProcessingController

WooCommerce 10.x introdujo **HPOS (High Performance Order Storage)**: las órdenes ya no se guardan en `wp_posts` sino en tablas propias (`wc_orders`, `wc_order_addresses`, etc.).

El problema específico: cuando WooCommerce crea una orden via REST API, el `BatchProcessingController` se engancha en el hook `woocommerce_after_order_object_save` e intenta migrar/sincronizar **TODAS** las órdenes existentes en `wp_posts` hacia las nuevas tablas HPOS. Con miles de órdenes históricas, esto:

1. Entra en un **bucle infinito** de `BEFORE_SAVE` (lo confirmamos con logs de diagnóstico)
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

### 2. El Segundo Factor — GoDaddy Shared Hosting

El hosting compartido de GoDaddy tiene un límite real de **512MB por proceso PHP** que no se puede superar. WooCommerce 10.x con catálogos grandes necesita más. Ningún snippet de código puede resolver un límite de hardware.

### 3. Por Qué No Lo Vimos Antes

WooCommerce se actualizó automáticamente de 9.x a 10.6.2. Esta versión activa HPOS por defecto Y activa el "sync-on-read" y el BatchProcessingController que no existían antes. El código de Next.js no cambió — cambió WooCommerce.

---

## La Solución — Dos Partes

### Parte 1: Migrar WordPress a VPS propio (Dokploy)

Mover el WordPress de GoDaddy shared hosting a un VPS KVM con Ubuntu 24.04 donde ya corren Dokploy, Supabase y n8n.

**Docker Compose para WordPress en Dokploy:**
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

> **Por qué heredado y no HPOS:** HPOS en WC 10.x activa el BatchProcessingController que causa el bucle. En un WordPress nuevo limpio, se puede usar heredado sin problema. Si en el futuro WooCommerce lanza un fix oficial (prometido en WC 10.7), se puede volver a HPOS.

### Parte 2: Checkout en Paralelo (Next.js)

Aunque mover al VPS resuelve el problema de memoria, WooCommerce igual puede tardar 5-10 segundos en crear una orden con muchos productos. La segunda solución fue cambiar el flujo del checkout para **no bloquear PlacetoPay** esperando que WooCommerce responda.

**Flujo anterior (bloqueante):**
```
1. Crear orden en WC → esperar respuesta (60s+) → 
2. Lanzar PlacetoPay → redirigir
```

**Flujo nuevo (paralelo):**
```
1. Lanzar creación de orden en WC (sin await)
2. Lanzar PlacetoPay inmediatamente con referencia temporal → redirigir (3s)
3. Cuando WC responde en background → asociar requestId de PTP al pedido
```

Código clave en `src/components/checkout/CheckoutForm.tsx`:
```typescript
const tempReference = `MP-${Date.now()}`;

// Crear orden en background — no bloqueamos aquí
const orderPromise = fetch('/api/checkout/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderPayload),
}).then(r => r.json()).catch(() => ({ success: false }));

// Lanzar PlacetoPay INMEDIATAMENTE
const ptpResult = await initiatePayment({
  reference: tempReference,
  description: `Pedido Mapache Parts`,
  amount: { currency: 'COP', total: totalToPay },
  // ... buyer, ipAddress, userAgent
});

// Redirigir al portal de pago
window.location.href = ptpResult.processUrl;

// Cuando WC responda, asociar el requestId
orderPromise.then((orderData) => {
  if (orderData?.success && orderData?.orderId && ptpResult.requestId) {
    savePTPRequestId(orderData.orderId, ptpResult.requestId);
    sessionStorage.setItem('ptp_order_id', String(orderData.orderId));
  }
});
```

---

## Otros Cambios Importantes en Esta Sesión

### Meta_data sin prefijo `_`
WooCommerce HPOS rechaza meta_data con prefijo `_` via REST API. Renombramos todas las claves:

| Antes | Después |
|---|---|
| `_billing_numero_documento` | `billing_numero_documento` |
| `_billing_tipo_documento` | `billing_tipo_documento` |
| `_billing_city_code` | `billing_city_code` |
| `_billing_state_code` | `billing_state_code` |
| `_created_via` | `created_via` |
| `_ptp_request_id` | `ptp_request_id` |

### Función search_products_advanced en Supabase
La función RPC tenía tipo de retorno `uuid` en la columna `id` pero la tabla usa `bigint`. Se recreó:

```sql
DROP FUNCTION IF EXISTS search_products_advanced(text, int);

CREATE OR REPLACE FUNCTION search_products_advanced(
  search_query text,
  limit_val int DEFAULT 6
)
RETURNS TABLE (
  id bigint,
  name text,
  slug text,
  sku text,
  price numeric,
  image_url text,
  stock_status text,
  headline text,
  rank real
)
LANGUAGE sql STABLE AS $$
  SELECT
    p.id, p.name, p.slug, p.sku, p.price, p.image_url, p.stock_status,
    p.name AS headline,
    ts_rank(
      coalesce(p.fts, to_tsvector('spanish', coalesce(p.name,'') || ' ' || coalesce(p.sku,''))),
      plainto_tsquery('spanish', search_query)
    ) AS rank
  FROM products_search p
  WHERE p.status = 'publish'
    AND (
      coalesce(p.fts, to_tsvector('spanish', coalesce(p.name,'') || ' ' || coalesce(p.sku,'')))
        @@ plainto_tsquery('spanish', search_query)
      OR p.name ILIKE '%' || search_query || '%'
      OR p.sku ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC, p.name ASC
  LIMIT limit_val;
$$;
```

### Plugin "WooCommerce Legacy REST API" desactivado
Tenía el plugin "WooCommerce Legacy REST API" activo junto con HPOS. WooCommerce mismo advierte que son incompatibles. Se desactivó en los dos WordPress.

---

## ¿Puede IMBRA quedarse en GoDaddy?

**Respuesta directa: No completamente.**

### Opción A — Solo aplicar el fix del checkout en paralelo (rápido, imperfecto)

Se puede aplicar el mismo fix de Next.js a Imbra Store sin mover el WordPress. El resultado sería:

✅ PlacetoPay abre en 3 segundos  
✅ El cliente puede pagar  
❌ La orden en WooCommerce **puede no crearse** si PHP muere por OOM en GoDaddy  
❌ Si la orden no se crea, no hay número de pedido, no hay tracking, n8n no recibe nada  
❌ El cliente paga pero el equipo de IMBRA no ve el pedido en WordPress  

**Cuándo sirve esta opción:** Como solución temporal mientras se migra al VPS. Permite que el checkout funcione para el cliente, pero requiere revisar manualmente los pagos en el dashboard de PlacetoPay para cruzarlos con pedidos faltantes.

### Opción B — Migrar IMBRA al VPS (recomendado)

Mismos pasos que Mapache. El WordPress de IMBRA queda en el VPS con 1GB de memoria y todo funciona correctamente: orden creada, PlacetoPay, n8n, webhooks, todo.

### Opción C — Bajar WooCommerce a versión 9.x en GoDaddy

En teoría volver a WC 9.5 o 9.6 resolvería el problema porque HPOS no era obligatorio. En la práctica GoDaddy puede no permitir bajar versiones y los plugins pueden tener dependencias de WC 10.x. **No recomendado.**

---

## Lo Que Falta Hacer en IMBRA (store.imbra.cloud)

IBRA tiene exactamente el mismo problema — mismo servidor GoDaddy, misma versión WooCommerce 10.6.2, mismo síntoma. Estado actual:

- [x] **Fix checkout en paralelo aplicado** en `src/components/checkout/CheckoutForm.tsx` (commit 3 Abr 2026)
- [x] **Meta_data sin prefijo `_`** — alineado con comportamiento HPOS WC 10.x
- [ ] **Crear un nuevo servicio WordPress en Dokploy** dentro del proyecto "Imbra" (ya existe el proyecto)
- [ ] **Usar el mismo Docker Compose** de arriba con variables propias
- [ ] **Importar productos de IMBRA** al nuevo WordPress
- [ ] **Configurar en modo heredado** (mismo paso que Mapache) — WooCommerce → Ajustes → Avanzado → Características → Almacenamiento heredado
- [ ] **Crear nuevas claves API** de WooCommerce para IMBRA en el nuevo WP
- [ ] **Actualizar variables en Dokploy** para Imbra Store con las nuevas claves y URL del nuevo WP
- [ ] **Hacer redeploy** de Imbra Store en Dokploy
- [ ] **Apuntar DNS** de `mkt.imbrarepuestos.com` al VPS

> **Claves actuales de IMBRA (GoDaddy — temporales hasta migración):**
> - `WC_CONSUMER_KEY=ck_3adb8346265e17ceb80913d501480c5d80905adc`
> - `WC_CONSUMER_SECRET=cs_f499ee29185b9984465af5219f2b467eef77d630`
> - URL: `https://mkt.imbrarepuestos.com`

> **Nota importante:** Con el fix del checkout en paralelo ya aplicado, el cliente PUEDE pagar aunque WooCommerce tarde o falle. Sin embargo, si PHP muere por OOM en GoDaddy, la orden puede no crearse en WooCommerce. La migración al VPS es necesaria para garantizar que AMBAS cosas funcionen correctamente.

---

## Variables de Entorno Finales (Mapache — Dokploy)

### Environment Settings (runtime):
```
WC_CONSUMER_KEY=ck_57fc2a3f3b110d3f2d5a0eb02db8f3d3a4c97838
WC_CONSUMER_SECRET=cs_4faab0dc13b7a70596f48a33677510bc973d063a
PTP_LOGIN=07e6fff2fbf87403f60913424f3c8537
PTP_SECRET_KEY=IITFd4XUr76n8gRz
PTP_BASE_URL=https://checkout-test.placetopay.com
WPGRAPHQL_URL=https://mkt.mapacheparts.com/graphql
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=FZhIdBfrudo9SSylbNDaCezQAy71LfRkJ50HTVOTfTeqGZD4MfRA
SYNC_SECRET=MapacheParts_2026_SecureSync_HQ
CRON_SECRET=MapacheSecurityCron2026_XyZ
NEXT_PUBLIC_RETURN_URL=https://mapachestore.imbra.cloud/checkout/resultado
NEXT_PUBLIC_WORDPRESS_URL=https://mkt.mapacheparts.com/
NEXT_PUBLIC_SUPABASE_URL=https://supabasemapa.imbra.cloud/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Build-time Arguments (compilación):
```
NEXT_PUBLIC_WORDPRESS_URL=https://mkt.mapacheparts.com/
NEXT_PUBLIC_SUPABASE_URL=https://supabasemapa.imbra.cloud/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_RETURN_URL=https://mapachestore.imbra.cloud/checkout/resultado
```

---

## Pendientes Mapache (antes de ir a producción real)

- [ ] Cambiar `PTP_BASE_URL` de `checkout-test.placetopay.com` a `checkout.placetopay.com` al certificar con Evertec
- [ ] Revertir `NEXT_PUBLIC_RETURN_URL` a producción en `.env.local` local (ya está en Dokploy correcto)
- [ ] Eliminar endpoint de diagnóstico `src/app/api/debug/woo-order-test/route.ts`
- [ ] Configurar Cron en Dokploy apuntando a `/api/cron/placetopay-probe` con header `x-cron-secret`
- [ ] Sincronizar productos al nuevo WordPress del VPS y hacer re-sync de Supabase
- [ ] Verificar que `mkt.mapacheparts.com` DNS apunta al VPS
- [ ] Prueba de pago completa con tarjeta de prueba y verificar página de resultado

---

## Snippets WordPress Requeridos (en el nuevo WP del VPS)

Todos deben estar activos en Code Snippets:

| Nombre | Función |
|---|---|
| Sincronización Estricta Páginas | Sync de páginas legales desde headless |
| Checkout Campos Cédula | Campos `billing_tipo_documento` y `billing_numero_documento` |
| Sistema de Envíos | Lógica de costos de envío |
| Slides Headless | Exposición de slides via REST |
| Transportadora & Guía de Envío | Campos de tracking en pedidos admin |

> **NO activar:** Desactivar HPOS Sync, Limpiar ActionScheduler, Fix REST API Órdenes WC10, Bloquear ActionScheduler en REST API, Diagnóstico REST Órdenes — todos fueron parches temporales para el problema de GoDaddy, ya no son necesarios en el VPS.

---

*Documento generado el 3 de Abril de 2026.*  
*Próxima revisión: tras completar migración de IMBRA al VPS.*
