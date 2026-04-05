# PROMPT DE IMPLEMENTACIÓN — Sistema MotoSelector + Categorías + Sync Supabase
### Para usar en proyecto Mapache (o cualquier marca nueva basada en la arquitectura Imbra)

---

> **Instrucciones de uso:** Copia todo el texto desde "INICIO DEL PROMPT" hasta "FIN DEL PROMPT" y pégalo en una nueva conversación con Claude, con el proyecto Mapache abierto como directorio de trabajo.

---

## INICIO DEL PROMPT

Eres un experto en Next.js 15 App Router + Supabase + WooCommerce. Voy a pedirte que implementes un sistema completo de búsqueda por vehículo (MotoSelector), megaménú por categorías, y sincronización de productos WooCommerce → Supabase.

Este sistema ya fue implementado exitosamente en otro proyecto (Imbra Store). Tu trabajo es replicarlo en este proyecto nuevo (Mapache), adaptando marcas, colores, URLs y categorías propias de Mapache. **No inventes arquitectura nueva — replica exactamente lo que te describo.**

---

## ARQUITECTURA GENERAL

```
WordPress + WooCommerce (backend de Mapache)
        ↓  REST API
      Next.js 15 App Router (este proyecto)
        ↓  sync masivo diario
      Supabase (tabla products_search — búsqueda y filtros)
        ↓
  MotoSelector (4 dropdowns en cascada) + Megamenú por categorías
```

---

## PARTE 1 — TABLA `products_search` EN SUPABASE

### 1.1 Estructura requerida

La tabla `products_search` debe tener estos campos. Si no existen, créalos con ALTER TABLE:

```sql
-- Verificar/crear columna cc_class (cilindrada)
ALTER TABLE products_search ADD COLUMN IF NOT EXISTS cc_class text;

-- Verificar/crear columna vehicle_years (años compatibles)
ALTER TABLE products_search ADD COLUMN IF NOT EXISTS vehicle_years int[];

-- Verificar/crear columna vehicle_brand
ALTER TABLE products_search ADD COLUMN IF NOT EXISTS vehicle_brand text;

-- Verificar/crear columna vehicle_model  
ALTER TABLE products_search ADD COLUMN IF NOT EXISTS vehicle_model text;

-- Verificar/crear columna category_slug (slug IMBRA canónico, NO slug WooCommerce)
ALTER TABLE products_search ADD COLUMN IF NOT EXISTS category_slug text;

-- Verificar/crear columna is_comprable
ALTER TABLE products_search ADD COLUMN IF NOT EXISTS is_comprable boolean;
```

### 1.2 Índices para performance (ejecutar en Supabase SQL Editor)

```sql
CREATE INDEX IF NOT EXISTS idx_ps_vehicle_brand ON products_search(vehicle_brand);
CREATE INDEX IF NOT EXISTS idx_ps_cc_class ON products_search(cc_class);
CREATE INDEX IF NOT EXISTS idx_ps_category_slug ON products_search(category_slug);
CREATE INDEX IF NOT EXISTS idx_ps_brand_cc ON products_search(vehicle_brand, cc_class);
CREATE INDEX IF NOT EXISTS idx_ps_brand_cc_cat ON products_search(vehicle_brand, cc_class, category_slug);
```

### 1.3 Queries de verificación post-sync

```sql
-- Cobertura global
SELECT
  ROUND(COUNT(*) FILTER (WHERE vehicle_brand IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con marca",
  ROUND(COUNT(*) FILTER (WHERE cc_class IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con cilindrada",
  COUNT(*) AS total
FROM products_search WHERE status = 'publish';

-- Cilindradas disponibles
SELECT cc_class, COUNT(*) as productos
FROM products_search WHERE cc_class IS NOT NULL
GROUP BY cc_class ORDER BY cc_class;
```

---

## PARTE 2 — SYNC PRODUCTOS WOOCOMMERCE → SUPABASE

### 2.1 Variables de entorno necesarias

Asegúrate de que existan en `.env.local` y en Dokploy (Environment Settings):

```env
NEXT_PUBLIC_WORDPRESS_URL=https://TU-WORDPRESS-MAPACHE.com
WC_CONSUMER_KEY=ck_XXXX        # Generar en WooCommerce → Ajustes → REST API
WC_CONSUMER_SECRET=cs_XXXX
SUPABASE_URL=https://XXXX.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyXXXX   # Service Role (no la anon key)
CRON_SECRET=MapacheSecurityCron2026_XyZ   # Inventar una clave segura
```

> ⚠️ `NEXT_PUBLIC_WORDPRESS_URL` NO debe tener slash final. Si el valor en el env lo tiene, el código lo elimina con `.replace(/\/$/, '')`. Verificar igual.

### 2.2 Crear archivo `src/app/api/cron/sync-products/route.ts`

Este endpoint hace DELETE total de la tabla + re-sync completo desde WooCommerce. Se ejecuta diariamente a las 4am. Requiere el header `Authorization: Bearer CRON_SECRET`.

```typescript
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase';
import { mapWooProductToImbra, WooProductRaw } from '@/lib/mappers';

const CONSUMER_KEY    = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;
const WOOCOMMERCE_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || '').replace(/\/$/, '');

export async function GET(request: NextRequest) {
  const start = Date.now();
  const authHeader = request.headers.get('authorization');
  const CRON_SECRET = process.env.CRON_SECRET;

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!WOOCOMMERCE_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
    return NextResponse.json({ error: 'Faltan variables de entorno de WooCommerce' }, { status: 500 });
  }

  // PASO 1: Borrar TODA la tabla para evitar duplicados y productos fantasma
  const { error: deleteError } = await supabaseAdmin
    .from('products_search')
    .delete()
    .neq('id', 0);

  if (deleteError) {
    return NextResponse.json({ success: false, error: `Error borrando tabla: ${deleteError.message}` }, { status: 500 });
  }

  // PASO 2: Paginar todos los productos publicados desde WooCommerce
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  let page = 1;
  let allProducts: unknown[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(
      `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&page=${page}&status=publish`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Error WooCommerce página ${page}: ${res.status}` },
        { status: 500 }
      );
    }

    const batch = await res.json() as unknown[];
    if (batch.length === 0 || page > 50) {
      hasMore = false;
    } else {
      allProducts = [...allProducts, ...batch];
      page++;
    }
  }

  // PASO 3: Mapear al formato Supabase
  const mappedProducts = allProducts.map(p => {
    const raw = p as WooProductRaw & { status?: string };
    const product = mapWooProductToImbra(raw);
    const salePriceNum = parseFloat(product.sale_price || '0');
    return {
      id:              product.id,
      name:            product.name,
      slug:            product.slug,
      sku:             product.sku,
      brand:           product.brand,
      price:           parseFloat(product.price) || 0,
      regular_price:   parseFloat(product.regular_price) || 0,
      sale_price:      salePriceNum > 0 ? salePriceNum : null,
      on_sale:         product.on_sale,
      description:     product.description,
      short_description: product.short_description,
      image_url:       product.images[0]?.src || null,
      categories:      product.categories,
      stock_status:    product.stock_status,
      stock_quantity:  product.stock_quantity,
      is_comprable:    product.is_comprable,
      vehicle_brand:   product.vehicle_brand,
      vehicle_model:   product.vehicle_model,
      vehicle_years:   product.vehicle_years,
      part_category:   product.part_category,
      category_slug:   product.category_slug,
      cc_class:        product.cc_class ?? null,
      status:          raw.status || 'publish',
    };
  });

  // PASO 4: INSERT directo (tabla ya vacía, más rápido que upsert)
  const { error: insertError } = await supabaseAdmin
    .from('products_search')
    .insert(mappedProducts);

  if (insertError) {
    return NextResponse.json(
      { success: false, error: `Error insertando productos: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    count: mappedProducts.length,
    duration_ms: Date.now() - start,
    message: `Sync completo: ${mappedProducts.length} productos sincronizados`,
  });
}
```

### 2.3 Ejecutar sync manual desde PowerShell (para probar)

```powershell
Invoke-WebRequest -Uri "https://TU-DOMINIO.com/api/cron/sync-products" `
  -Headers @{ Authorization = "Bearer MapacheSecurityCron2026_XyZ" } `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

Si pregunta confirmación de seguridad, escribe `S` y Enter.

Respuesta esperada: `{"success":true,"count":XXXX,"duration_ms":XXXX}`

### 2.4 Cron diario — configurar en cPanel

En cPanel → Cron Jobs, agregar:
```
Minuto: 0 | Hora: 4 | Día: * | Mes: * | Día semana: *
Comando: curl -s -H "Authorization: Bearer MapacheSecurityCron2026_XyZ" https://TU-DOMINIO.com/api/cron/sync-products
```

> ⚠️ **Sobre n8n:** Si usas n8n para el cron, NO pongas más de un nodo trigger en el mismo workflow (ni Manual Trigger + Schedule Trigger juntos). Eso causa error `Cannot read properties of undefined (reading 'execute')` en algunas versiones de n8n. Usa solo el Schedule Trigger conectado al HTTP Request.

---

## PARTE 3 — MAPPER `src/lib/mappers.ts`

El mapper transforma cada producto WooCommerce al formato Supabase. Puntos críticos:

### 3.1 Imágenes — WooCommerce como fuente primaria

```typescript
// ✅ CORRECTO — WooCommerce primero, fallback placeholder
const wooImageSrc = wooProduct.images?.[0]?.src || wooProduct.images?.[0]?.sourceUrl || null;
const images = [{
  src: wooImageSrc || "/images/placeholder.png",
  alt: wooProduct.name
}];
```

> ⚠️ No uses servidores SAP internos como fuente primaria de imágenes — no son accesibles desde Internet.

### 3.2 Lógica de stock

```typescript
const rawQty = wooProduct.stock_quantity; // null = WooCommerce no gestiona cantidad
const stock_quantity = rawQty ?? 0;
const stock_status = wooProduct.stock_status || 'outofstock';
// is_comprable: si WC gestiona qty → requiere qty > 0; si no gestiona → basta con instock
const is_comprable = stock_status === 'instock' && (rawQty === null || rawQty === undefined || rawQty > 0);
```

---

## PARTE 4 — EXTRACCIÓN DE DATOS DE VEHÍCULO `src/lib/vehicle-utils.ts`

Este archivo extrae marca, modelo, años y cilindrada desde los nombres de producto SAP.

### 4.1 Patrón de nombres SAP

Los productos siguen este patrón:
```
"BANDA FRENO YAMAHA BWS 125 (08-15)"
"DISCO DE FRENO SUZUKI GIXXER 150(15-17) - GIXXER 150 FI (21-23)"
"DESLIZADOR DE CADENA YAMAHA DT200"
"LEVA DE FRENO TRASERO FR80-V80"
```

### 4.2 `extractCCClass` — regla crítica

```typescript
export const CC_CLASSES = ["50", "80", "100", "110", "115", "125", "135", "150", "175", "190", "200", "250", "300", "650"];

export function extractCCClass(title: string, attributes: Array<{name: string; options: string[]}> = []): string | null {
  const upper = title.toUpperCase();

  // 1. Atributos WooCommerce (más confiable)
  for (const attr of attributes) {
    const attrName = attr.name.toUpperCase();
    if (attrName.includes('CC') || attrName.includes('CILINDRAD') || attrName.includes('CILINDRAJE')) {
      const val = attr.options[0] ?? '';
      const num = val.match(/\d+/)?.[0];
      if (num && CC_CLASSES.includes(num)) return `${num}cc`;
    }
  }

  // 2. Patrón explícito "125CC", "125 CC"
  const explicit = upper.match(/\b(\d{2,3})\s*CC\b/);
  if (explicit && CC_CLASSES.includes(explicit[1])) return `${explicit[1]}cc`;

  // 3. Número que coincide con CC conocida
  // ⚠️ CRÍTICO: usar (?<!\d) y (?!\d) en vez de \b
  // \b NO funciona entre letra y dígito en JS → "DT200" no matchea con \b200\b
  for (const cc of [...CC_CLASSES].sort((a, b) => b.length - a.length)) {
    if (new RegExp(`(?<!\\d)${cc}(?!\\d)`).test(upper)) return `${cc}cc`;
  }

  return null;
}
```

> ⚠️ **Error conocido a evitar:** Si implementas `extractCCClass` usando `\b` como word boundary, la función fallará para productos como "DT200", "GN125", "FR80" donde el número va pegado a letras. Siempre usa `(?<!\d)` y `(?!\d)`.

### 4.3 `extractYears` — detectar rangos sin prefijo MOD

```typescript
export function extractYears(title: string): number[] {
  const years: number[] = [];
  const upperTitle = title.toUpperCase();

  function parseYearBlock(content: string) {
    const parts = content.split(/[\s,/]+/);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        let start = parseInt(startStr);
        let end = parseInt(endStr);
        if (!isNaN(start) && !isNaN(end)) {
          start = normalizeYear(start);
          end = normalizeYear(end);
          for (let y = Math.min(start, end); y <= Math.max(start, end); y++) years.push(y);
        }
      } else {
        const year = parseInt(part);
        if (!isNaN(year) && year >= 70) years.push(normalizeYear(year));
      }
    }
  }

  // Patrón 1: (MOD 11-15)
  for (const match of upperTitle.matchAll(/\(MOD\s+([^)]+)\)/g)) parseYearBlock(match[1].trim());

  // Patrón 2: (15-17), (21-23), (03-04) — rango entre paréntesis SIN "MOD"
  for (const match of upperTitle.matchAll(/\((\d{2,4}-\d{2,4}(?:\s*\/\s*\d{2,4})*)\)/g)) parseYearBlock(match[1].trim());

  // Patrón 3: (03), (2024) — año suelto
  for (const match of upperTitle.matchAll(/\((\d{2,4})\)/g)) {
    const year = parseInt(match[1]);
    if (!isNaN(year)) years.push(normalizeYear(year));
  }

  return [...new Set(years)].sort();
}

function normalizeYear(y: number): number {
  if (y >= 1000) return y;
  if (y < 30) return 2000 + y;
  if (y >= 70) return 1900 + y;
  return y;
}
```

> ⚠️ **Error conocido a evitar:** Si solo detectas `(MOD ...)` los dropdowns de AÑO aparecerán siempre vacíos. Los productos SAP usan `(15-17)` sin prefijo MOD en la mayoría de los casos.

---

## PARTE 5 — SISTEMA DE CATEGORÍAS

### 5.1 Dos sistemas de slugs — no confundirlos

Existen **dos vocabularios de slugs distintos** en el proyecto:

| Sistema | Ejemplo de slugs | Dónde se usa |
|---|---|---|
| IMBRA_CATEGORIES (`category-taxonomy.ts`) | `"motor"`, `"frenos"`, `"suspension"`, `"electricos"` | Campo `category_slug` en **Supabase** |
| WOO_CATEGORIES (`woo-categories.ts`) | `"guias-de-motor"`, `"discos-de-freno"`, `"kit-tijera"` | Megamenú, URLs de WooCommerce |

**Regla de oro:** Para filtrar productos en Supabase, siempre usar los slugs de `IMBRA_CATEGORIES`, nunca los de `WOO_CATEGORIES`.

### 5.2 CATEGORY_GROUPS — fuente de verdad

Define los grupos del megamenú y del MotoSelector. El `.id` de cada grupo debe coincidir exactamente con el `category_slug` almacenado en Supabase.

```typescript
// src/lib/woo-categories.ts
export const CATEGORY_GROUPS = [
  { id: "frenos",      name: "Frenos",       slugs: ["bandas-y-pastillas", "discos-de-freno", ...] },
  { id: "motor",       name: "Motor",        slugs: ["guias-de-motor", "retenedores", ...] },
  { id: "transmision", name: "Transmisión",  slugs: ["bujes", "coronas", ...] },
  { id: "suspension",  name: "Suspensión",   slugs: ["kit-de-suspension", "kit-tijera", ...] },
  { id: "electricos",  name: "Eléctrico",    slugs: ["partes-electricas", "direccionales"] },
  // ... etc
];
```

> ⚠️ **Error conocido a evitar:** Si el `id` de un grupo en `CATEGORY_GROUPS` no coincide con el valor de `category_slug` en Supabase, todos los filtros devolverán 0 resultados. Por ejemplo: `id: "electrico"` (sin s) vs `category_slug: "electricos"` (con s) → falla.

### 5.3 Cómo usar CATEGORY_GROUPS en el MotoSelector

```typescript
// ✅ CORRECTO — usar .id (slug IMBRA = lo que está en Supabase)
const activeGroupId = CATEGORY_GROUPS.find(g => g.name === selectedGroup)?.id ?? null;
const activeCatFilter = activeGroupId ? [activeGroupId] : undefined;
// → activeCatFilter = ["motor"] o ["frenos"], coincide con category_slug en Supabase

// ❌ INCORRECTO — usar .slugs (slugs WooCommerce, NO están en category_slug de Supabase)
const activeSlugs = group.slugs; // ["guias-de-motor", ...] → 0 resultados
```

---

## PARTE 6 — MOTOSELECTOR (4 DROPDOWNS EN CASCADA)

### 6.1 Server Actions `src/app/actions/vehicle-actions.ts`

```typescript
'use server';
import { supabase } from '@/lib/supabase';

// Retorna marcas disponibles para un grupo de categoría y/o cilindrada
export async function getVehicleBrands(categorySlugs?: string[], ccClass?: string): Promise<string[]> {
  let query = supabase
    .from('products_search')
    .select('vehicle_brand')
    .eq('status', 'publish')
    .not('vehicle_brand', 'is', null);

  if (categorySlugs?.length) query = query.in('category_slug', categorySlugs);
  if (ccClass) query = query.eq('cc_class', ccClass);

  const { data } = await query;
  const brands = [...new Set((data || []).map(r => r.vehicle_brand).filter(Boolean))] as string[];
  return brands.sort();
}

// Retorna cilindradas disponibles para un grupo y/o marca
export async function getAvailableCCClasses(categorySlugs?: string[], brand?: string): Promise<string[]> {
  let query = supabase
    .from('products_search')
    .select('cc_class')
    .eq('status', 'publish')
    .not('cc_class', 'is', null);

  if (categorySlugs?.length) query = query.in('category_slug', categorySlugs);
  if (brand) query = query.eq('vehicle_brand', brand);

  const { data } = await query;
  const classes = [...new Set((data || []).map(r => r.cc_class).filter(Boolean))] as string[];
  // Ordenar numéricamente: 100cc, 110cc, 125cc...
  return classes.sort((a, b) => parseInt(a) - parseInt(b));
}

// Retorna años disponibles para brand + cc + categoría
export async function getAvailableYears(brand?: string, ccClass?: string, categorySlugs?: string[]): Promise<number[]> {
  let query = supabase
    .from('products_search')
    .select('vehicle_years')
    .eq('status', 'publish')
    .not('vehicle_years', 'is', null);

  if (categorySlugs?.length) query = query.in('category_slug', categorySlugs);
  if (brand) query = query.eq('vehicle_brand', brand);
  if (ccClass) query = query.eq('cc_class', ccClass);

  const { data } = await query;
  const allYears = (data || []).flatMap(r => r.vehicle_years || []);
  return [...new Set(allYears)].sort((a, b) => a - b);
}
```

### 6.2 Flujo de filtros en cascada

```
Usuario selecciona REPUESTO (ej: "Frenos")
  → carga MARCAS disponibles filtrando por category_slug = 'frenos'

Usuario selecciona MARCA (ej: "HONDA")
  → carga CILINDRADAS disponibles filtrando por brand = 'HONDA' + category_slug = 'frenos'

Usuario selecciona CILINDRADA (ej: "150cc")
  → carga AÑOS disponibles filtrando por brand + cc + category_slug

Usuario hace clic BUSCAR
  → navega a /tienda?cat=frenos&brand=HONDA&cc=150cc&year=2018
```

---

## PARTE 7 — ERRORES COMUNES EN DOKPLOY (BUILD FAILURES)

Al hacer deploy en Dokploy con Docker, el build puede fallar por estos errores de TypeScript/ESLint. Tenlos en cuenta para evitarlos desde el principio:

### Error 1: `@typescript-eslint/no-explicit-any`
```
Error: Unexpected any. Specify a different type.
```
**Solución:** Nunca usar `catch (error: any)`. Usar siempre:
```typescript
catch (error: unknown) {
  const msg = error instanceof Error ? error.message : 'Error desconocido';
}
```

### Error 2: Archivo binario corrupto
```
Error: Parsing error: File appears to be binary.
```
**Solución:** Revisar si hay archivos `_old.tsx` o backups en el proyecto. Eliminarlos con `git rm`.

### Error 3: Propiedad faltante en tipo Product
```
Type error: Property 'cc_class' is missing in type '{ ... }' but required in type 'Product'.
```
**Solución:** Cuando agregas un campo nuevo a la interfaz `Product` (ej: `cc_class`), busca TODOS los archivos que construyen objetos `Product` manualmente y agrégales el nuevo campo:
```bash
grep -r "vehicle_brand:" src/ --include="*.tsx" --include="*.ts" -l
```
Cada archivo encontrado necesita también el campo nuevo. Agregar `cc_class: null` o el valor correspondiente.

### Error 4: `@next/next/no-img-element` (Warning que puede convertirse en error)
```
Warning: Using <img> could result in slower LCP...
```
Si el proyecto tiene `"errors": true` en la config de ESLint para esta regla, fallaría el build. Verificar `next.config.ts` y `.eslintrc`.

---

## PARTE 8 — CHECKLIST DE VERIFICACIÓN FINAL

Después de implementar todo, verificar en orden:

- [ ] `products_search` tiene columna `cc_class` (no null en productos de motos)
- [ ] `products_search` tiene columna `vehicle_years` (array con años, ej: `[2015,2016,2017]`)
- [ ] `products_search` tiene columna `vehicle_brand` (YAMAHA, HONDA, etc.)
- [ ] `products_search` tiene columna `category_slug` (motor, frenos, suspension...)
- [ ] Sync manual funciona: `GET /api/cron/sync-products` con Bearer token → `{"success":true}`
- [ ] Cron diario configurado en cPanel o n8n
- [ ] MotoSelector dropdown 02 MARCA carga datos (no "No se encontraron resultados")
- [ ] MotoSelector dropdown 03 CILINDRADA carga datos al seleccionar marca
- [ ] MotoSelector dropdown 04 AÑO carga datos al seleccionar cilindrada
- [ ] Imágenes de productos cargan (desde WooCommerce, no desde servidor SAP)
- [ ] Build en Dokploy pasa sin errores TypeScript
- [ ] Deploy exitoso confirmado en Dokploy

---

## FIN DEL PROMPT
