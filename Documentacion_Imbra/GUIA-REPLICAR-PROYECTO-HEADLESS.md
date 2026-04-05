# GUÍA — Replicar proyecto Next.js Headless para nueva marca
### Basado en: Imbra Store → Aplicable a: Mapache Store (u otra marca)

---

## ARQUITECTURA DEL SISTEMA

```
WordPress + WooCommerce (backend)
        ↓  REST API + WPGraphQL
      Next.js 15 App Router (storefront headless)
        ↓  sync masivo + webhooks en tiempo real
      Supabase (base de datos búsqueda y filtros)
        ↓
  Search + MotoSelector (filtros por marca/modelo/año)
        ↓
      PlacetoPay (pasarela de pagos Colombia)
```

---

## PASO 1 — WordPress + WooCommerce

### 1.1 Plugins requeridos
Instalar en el WordPress de la nueva marca:

| Plugin | Función |
|---|---|
| WooCommerce | Tienda y productos |
| WPGraphQL | Consulta de productos vía GraphQL desde Next.js |
| WooGraphQL (WPGraphQL for WooCommerce) | Extiende GraphQL con tipos de WooCommerce |
| JWT Authentication for WP REST API | Autenticación segura para el blog/posts |

### 1.2 Configurar JWT Auth
En `wp-config.php` agregar antes de `/* That's all, stop editing! */`:
```php
define('JWT_AUTH_SECRET_KEY', 'TU_CLAVE_SECRETA_UNICA_AQUI'); // Generar en random.org
define('JWT_AUTH_CORS_ENABLE', true);
```

> La clave secreta debe ser larga y aleatoria. Nunca reutilizar entre proyectos.

Verificar que funciona:
```bash
curl -X POST https://TU-WORDPRESS.com/wp-json/jwt-auth/v1/token \
  -H 'Content-Type: application/json' \
  -d '{"username": "tu@email.com", "password": "tu-password"}'
```
Debe devolver un `token`.

### 1.3 Generar claves WooCommerce REST API
WooCommerce → Ajustes → Avanzado → REST API → **Agregar clave**
- Descripción: `[Marca] Store Headless`
- Usuario: admin
- Permisos: **Lectura/Escritura**

Guardar el `Consumer Key` (ck_...) y `Consumer Secret` (cs_...).

### 1.4 Configurar Webhooks en WooCommerce
WooCommerce → Ajustes → Avanzado → Webhooks → Crear **3 webhooks**:

| Nombre | Tema | URL de entrega | Versión API |
|---|---|---|---|
| Producto Creado | Producto creado | `https://TU-DOMINIO.com/api/webhooks/woo-sync` | WP REST API v3 |
| Producto Actualizado | Producto actualizado | `https://TU-DOMINIO.com/api/webhooks/woo-sync` | WP REST API v3 |
| Producto Eliminado | Producto eliminado | `https://TU-DOMINIO.com/api/webhooks/woo-sync` | WP REST API v3 |

> El webhook retorna 500 si el endpoint de Next.js no está desplegado aún. Créalos después del primer deploy.

---

## PASO 2 — Supabase

### 2.1 Crear proyecto en Supabase
- Entrar a supabase.com → New project
- Guardar: `Project URL`, `anon key`, `service_role key`

### 2.2 Crear tabla `products_search`
Ejecutar este SQL en Supabase → SQL Editor:

```sql
CREATE TABLE products_search (
  id INTEGER PRIMARY KEY,
  name TEXT,
  slug TEXT,
  sku TEXT,
  brand TEXT,
  price NUMERIC,
  regular_price NUMERIC,
  sale_price NUMERIC,
  on_sale BOOLEAN,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  categories JSONB,
  stock_status TEXT,
  stock_quantity INTEGER,
  is_comprable BOOLEAN,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_years INTEGER[],
  part_category TEXT,
  category_slug TEXT,
  cc_class TEXT,
  status TEXT DEFAULT 'publish'
);

-- Índices para búsqueda rápida
CREATE INDEX idx_products_search_vehicle_brand ON products_search(vehicle_brand);
CREATE INDEX idx_products_search_vehicle_model ON products_search(vehicle_model);
CREATE INDEX idx_products_search_category_slug ON products_search(category_slug);
CREATE INDEX idx_products_search_status ON products_search(status);
CREATE INDEX idx_products_search_name ON products_search USING gin(to_tsvector('spanish', name));
```

---

## PASO 3 — Variables de entorno (.env.local y Dokploy)

Crear `.env.local` en la raíz del proyecto Next.js:

```env
# WordPress / WooCommerce
NEXT_PUBLIC_WORDPRESS_URL=https://TU-WORDPRESS.com/
WC_CONSUMER_KEY=ck_XXXXXXXXXXXX
WC_CONSUMER_SECRET=cs_XXXXXXXXXXXX
WPGRAPHQL_URL=https://TU-WORDPRESS.com/graphql

# JWT WordPress (para blog/posts)
WP_JWT_USER=tu@email.com
WP_JWT_PASS=tu-password-wordpress

# PlacetoPay
PTP_LOGIN=TU_PTP_LOGIN
PTP_SECRET_KEY=TU_PTP_SECRET
PTP_BASE_URL=https://checkout.placetopay.com      # producción
# PTP_BASE_URL=https://checkout-test.placetopay.com  # sandbox

# URL de retorno después del pago
NEXT_PUBLIC_RETURN_URL=https://TU-DOMINIO.com/checkout/resultado

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Seguridad
SYNC_SECRET=TuClaveSecretaSync2026    # para proteger /api/sync-products
CRON_SECRET=TuClaveCron2026           # para el cron de PlacetoPay
```

### En Dokploy
Agregar las mismas variables en:
- **Environment Settings** → todas las variables
- **Build-time Arguments** → solo las `NEXT_PUBLIC_*`

---

## PASO 4 — Código del proyecto

### 4.1 Archivos clave que dependen de las variables de entorno

| Archivo | Variables que usa |
|---|---|
| `src/lib/woocommerce.ts` | NEXT_PUBLIC_WORDPRESS_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET, WPGRAPHQL_URL |
| `src/lib/wordpress.ts` | NEXT_PUBLIC_WORDPRESS_URL, WP_JWT_USER, WP_JWT_PASS |
| `src/lib/placetopay.ts` | PTP_LOGIN, PTP_SECRET_KEY, PTP_BASE_URL |
| `src/app/actions/placetopay.ts` | NEXT_PUBLIC_RETURN_URL |
| `src/lib/supabase.ts` | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY |
| `src/app/api/sync-products/route.ts` | WC_CONSUMER_KEY, WC_CONSUMER_SECRET, NEXT_PUBLIC_WORDPRESS_URL, SYNC_SECRET |
| `src/app/api/webhooks/woo-sync/route.ts` | WC_CONSUMER_KEY, WC_CONSUMER_SECRET, NEXT_PUBLIC_WORDPRESS_URL |

### 4.2 Categorías y grupos — personalizar por marca
El archivo `src/lib/woo-categories.ts` contiene las categorías de productos agrupadas (ej: Motor, Frenos, Transmisión). **Debes adaptarlo a las categorías de la nueva marca.**

### 4.3 Marcas y modelos de motos — personalizar
El archivo `src/lib/vehicle-utils.ts` contiene listas de marcas y modelos de motos (`COMMON_BRANDS`, `COMMON_MODELS`). **Actualizar según el catálogo de la nueva marca.**

### 4.4 Imágenes de productos — revisar fuente
En `src/lib/mappers.ts` las imágenes se construyen desde el SKU apuntando al servidor SAP de IMBRA:
```ts
const sapImageUrl = `https://movil.indummelbra.com:50101/Imbrapp/images/${cleanSku}.png`
```
**Para Mapache u otra marca, cambiar esta URL al servidor de imágenes correspondiente, o usar las imágenes de WooCommerce directamente.**

---

## PASO 5 — Primer deploy y sync inicial

### 5.1 Deploy en Dokploy
1. Conectar repositorio Git en Dokploy
2. Agregar todas las variables de entorno (Environment Settings + Build-time Arguments)
3. Ejecutar el primer deploy

### 5.2 Sync inicial de productos a Supabase
Una vez desplegado, llamar:
```
https://TU-DOMINIO.com/api/sync-products?secret=TU_SYNC_SECRET
```
Esperar respuesta (1-2 min para 2000+ productos):
```json
{ "success": true, "count": 2337, "message": "Sincronización masiva completada con éxito" }
```

### 5.3 Crear webhooks en WooCommerce
Solo después de que el sync funcione correctamente.

---

## PASO 6 — Lanzamiento (cambio de dominio)

Cuando el dominio final esté listo:

1. **Apuntar DNS** al servidor Dokploy
2. **Cambiar en Dokploy** (Environment Settings + Build-time Arguments):
   ```
   NEXT_PUBLIC_RETURN_URL=https://DOMINIO-FINAL.com/checkout/resultado
   ```
3. **Redeploy**
4. **Actualizar los 3 webhooks** de WooCommerce con la URL del dominio final
5. **Correr sync de nuevo**:
   ```
   https://DOMINIO-FINAL.com/api/sync-products?secret=TU_SYNC_SECRET
   ```

---

## ERRORES COMUNES Y SOLUCIONES

| Error | Causa | Solución |
|---|---|---|
| `401` en sync-products | Consumer Key/Secret inválidas | Generar nuevas claves en WC → Avanzado → REST API |
| `500` en webhooks WooCommerce | Endpoint no desplegado o URL con doble `//` | Hacer deploy primero, revisar NEXT_PUBLIC_WORDPRESS_URL sin trailing slash doble |
| Productos no aparecen en tienda | Supabase no sincronizado | Llamar `/api/sync-products?secret=...` |
| JWT token 403 | Usuario no existe en WordPress | Verificar email exacto del usuario en WP admin |
| PlacetoPay redirige al dominio viejo | NEXT_PUBLIC_RETURN_URL desactualizada | Cambiar variable en Dokploy (Environment + Build-time) y redeploy |
| MotoSelector sin resultados | `cc_class` no poblado en Supabase | Revisar campo cc_class en mapper y sync |

---

## CHECKLIST COMPLETO

### Configuración inicial
- [ ] WordPress + WooCommerce instalado
- [ ] Plugins: WPGraphQL, WooGraphQL, JWT Auth instalados
- [ ] JWT configurado en wp-config.php
- [ ] Claves WooCommerce REST API generadas (Lectura/Escritura)
- [ ] Supabase: proyecto creado y tabla `products_search` creada con SQL
- [ ] PlacetoPay: credenciales de producción obtenidas
- [ ] Variables `.env.local` completas
- [ ] Variables Dokploy completas (Environment + Build-time)

### Primer deploy
- [ ] Deploy exitoso en Dokploy
- [ ] Sync inicial: `/api/sync-products?secret=...` → count > 0
- [ ] Webhooks WooCommerce creados (los 3)
- [ ] JWT funciona: test con curl devuelve token

### Lanzamiento
- [ ] DNS apuntando al servidor
- [ ] NEXT_PUBLIC_RETURN_URL cambiada al dominio final
- [ ] Redeploy ejecutado
- [ ] Webhooks actualizados al dominio final
- [ ] Sync ejecutado en dominio final
- [ ] Pago de prueba exitoso con PlacetoPay
- [ ] Buscador muestra productos
- [ ] MotoSelector funciona
