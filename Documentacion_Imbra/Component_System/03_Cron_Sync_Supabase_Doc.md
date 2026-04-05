# Sistema de Sincronización Diaria — WooCommerce → Supabase
## Cron 4:00am vía n8n

---

## ¿Qué problema resuelve?

La tabla `products_search` en Supabase se llenaba de **duplicados y productos fantasma** porque el sync anterior usaba UPSERT (que actualiza o inserta, pero **nunca borra**). Productos eliminados en WooCommerce quedaban en Supabase para siempre.

**Solución:** Todos los días a las 4:00am se borra toda la tabla y se vuelve a llenar desde cero con los productos actuales de WooCommerce.

---

## Flujo completo

```
4:00am Colombia
      ↓
n8n Schedule Trigger
      ↓
HTTP GET → https://store.imbra.cloud/api/cron/sync-products
           Header: Authorization: Bearer ImbraSecurityCron2026_XyZ
      ↓
[Next.js] /api/cron/sync-products/route.ts
      ↓
  PASO 1: DELETE FROM products_search WHERE id != 0
          → Tabla queda VACÍA (~instantáneo)
      ↓
  PASO 2: Paginar WooCommerce REST API
          GET /wp-json/wc/v3/products?per_page=100&page=1&status=publish
          GET /wp-json/wc/v3/products?per_page=100&page=2&status=publish
          ... (24 páginas para 2337 productos)
      ↓
  PASO 3: Mapear con mapWooProductToImbra()
          → extrae vehicle_brand, vehicle_model, vehicle_years, category_slug
      ↓
  PASO 4: INSERT masivo en products_search
          → 2337 registros limpios
      ↓
Respuesta: { success: true, count: 2337, duration_ms: ~90000 }
```

**Tiempo estimado:** 1.5 a 2 minutos  
**Impacto en usuarios:** Durante esos ~2 minutos el buscador no muestra productos. Por eso se ejecuta a las 4am.

---

## Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/app/api/cron/sync-products/route.ts` | Endpoint del cron — DELETE + re-sync |
| `src/app/api/sync-products/route.ts` | Sync manual puntual (no borra, solo UPSERT) |
| `src/lib/mappers.ts` | Transforma producto WooCommerce al formato Supabase |
| `src/lib/supabase.ts` | Cliente `supabaseAdmin` (service_role) para operaciones server-side |

---

## Seguridad

El endpoint valida el header `Authorization: Bearer CRON_SECRET`.  
Variable de entorno: `CRON_SECRET=ImbraSecurityCron2026_XyZ`

Sin ese header devuelve `401 No autorizado`.

---

## Configuración en n8n

### Workflow JSON (importar en n8n → Import from JSON)

```json
{
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "triggerAtHour": 4
            }
          ]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.3,
      "position": [-368, -80],
      "id": "8ba8b143-7ea9-467f-9bb6-2697d991b0a4",
      "name": "Schedule Trigger"
    },
    {
      "parameters": {
        "url": "https://store.imbra.cloud/api/cron/sync-products",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer ImbraSecurityCron2026_XyZ"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.4,
      "position": [-144, -80],
      "id": "681ef2ea-7c0b-461f-a057-6cfc62092588",
      "name": "HTTP Request"
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Cómo importar en n8n
1. Abrir n8n → **Workflows**
2. Botón **"..."** → **Import from JSON**
3. Pegar el JSON de arriba
4. **Save** → **Activate** (toggle arriba a la derecha)

### Cómo probar manualmente
Clic en **"Execute workflow"** dentro del workflow. Debe responder en ~2 minutos:
```json
{ "success": true, "count": 2337, "duration_ms": 90000 }
```

---

## El lunes — cambio de dominio

Cuando el dominio apunte a `imbrarepuestos.com`, actualizar la URL en el nodo HTTP Request de n8n:

```
https://store.imbra.cloud/api/cron/sync-products
→
https://imbrarepuestos.com/api/cron/sync-products
```

---

## Sync manual (cuando se necesite fuera del cron)

Para sincronizar manualmente sin esperar las 4am, abrir en el navegador:
```
https://store.imbra.cloud/api/sync-products?secret=Imbra2025_Sync_Safety
```
Este endpoint hace UPSERT (no borra). Si necesitas borrar y re-sincronizar manualmente, llama al endpoint del cron con curl:
```bash
curl -H "Authorization: Bearer ImbraSecurityCron2026_XyZ" \
  https://store.imbra.cloud/api/cron/sync-products
```

---

## Tabla products_search — estructura en Supabase

| Campo | Tipo | Descripción |
|---|---|---|
| id | int8 | ID del producto en WooCommerce (PRIMARY KEY) |
| name | text | Nombre del producto |
| slug | text | Slug URL |
| sku | text | Código SAP |
| brand | text | Marca extraída del nombre |
| price | numeric | Precio de venta |
| regular_price | numeric | Precio regular |
| sale_price | numeric | Precio oferta (null si no aplica) |
| on_sale | boolean | ¿Está en oferta? |
| image_url | text | URL imagen desde servidor SAP |
| categories | jsonb | Array de categorías WooCommerce |
| stock_status | text | instock / outofstock / onbackorder |
| stock_quantity | int | Cantidad en stock |
| is_comprable | boolean | ¿Se puede comprar? (stock + status) |
| vehicle_brand | text | Marca de moto (YAMAHA, HONDA...) |
| vehicle_model | text | Modelo de moto (BWS, PULSAR...) |
| vehicle_years | int[] | Años compatibles ([2018, 2019, 2020]) |
| part_category | text | Categoría de repuesto |
| category_slug | text | Slug del grupo de categoría Imbra |
| cc_class | text | Cilindrada (100cc, 125cc...) |
| status | text | Estado WooCommerce (publish) |
