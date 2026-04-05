# Documentación: Filtro MotoSelector — Sistema de Búsqueda por Vehículo

**Última actualización:** 2026-03-29
**Estado:** Implementado y funcionando
**Archivo principal:** `src/components/features/MotoSelector.tsx`

---

## Resumen

Selector de repuestos en 4 dropdowns en cascada ubicado debajo del hero de la home. Permite al usuario encontrar repuestos por tipo, marca, cilindrada y año. Cada dropdown filtra los siguientes con datos reales de Supabase.

---

## Diseño Visual

- **Fondo:** `#1a1a1a` (negro IMBRA)
- **Cabezal izquierdo:** ícono `<Bike>` naranja + texto "ENCUENTRA / **TU REPUESTO**"
- **4 dropdowns:** blancos con número de paso (01–04), componente `PremiumDropdown`
- **Botón:** naranja `bg-primary`, texto "BUSCAR REPUESTOS", ícono `<Search>`
- **Layout:** `flex-row` en desktop, `grid 2 cols` en tablet, `1 col` en móvil
- El botón se habilita cuando hay al menos REPUESTO o MARCA seleccionados

---

## Cascade de Filtros

```
01 REPUESTO  →  02 MARCA MOTO  →  03 CILINDRADA  →  04 AÑO (opcional)
```

| # | Label | Fuente de datos | Se recarga cuando |
|---|---|---|---|
| 01 | REPUESTO | `CATEGORY_GROUPS` (estático, 10 grupos) | Nunca (siempre disponible) |
| 02 | MARCA MOTO | `vehicle_brand` en Supabase | Cambia grupo 01 |
| 03 | CILINDRADA | `cc_class` en Supabase | Cambia marca 02 |
| 04 | AÑO (OPCIONAL) | `vehicle_years` en Supabase | Cambia cilindrada 03 |

### URL generada al buscar:
```
/tienda?cat=motor&brand=YAMAHA&cc=125cc&year=2015
```

---

## Arquitectura Técnica

### Server Actions (`src/app/actions/vehicle-actions.ts`)

```ts
// Marcas disponibles, filtradas por grupo y/o cilindrada
getVehicleBrands(categorySlugs?: string[], ccClass?: string): Promise<string[]>

// Cilindradas disponibles, filtradas por grupo y/o marca
getAvailableCCClasses(categorySlugs?: string[], brand?: string): Promise<string[]>
// Retorna ordenado numéricamente: ['100cc', '110cc', '125cc', '150cc'...]

// Años disponibles para la combinación brand + cc + categoría
getAvailableYears(brand?: string, ccClass?: string, categorySlugs?: string[]): Promise<number[]>
```

### Lógica del filtro por categoría

El parámetro `categorySlugs` que reciben las server actions es **siempre** `[CATEGORY_GROUPS.id]`, por ejemplo `["motor"]` o `["frenos"]`.

```ts
// En MotoSelector.tsx — CORRECTO
const activeGroupId = CATEGORY_GROUPS.find(g => g.name === selectedGroup)?.id ?? null;
const activeCatFilter = activeGroupId ? [activeGroupId] : undefined;
// → ["motor"], ["frenos"], ["suspension"], etc.
```

Esto filtra en Supabase por `category_slug = 'motor'`, que es exactamente el valor almacenado.

---

## ⚠️ Bug Histórico Resuelto: SLUG MISMATCH

Este bug causó que todos los dropdowns aparecieran vacíos. Documentado aquí para no repetirlo.

### El problema

El proyecto maneja **dos vocabularios de slugs incompatibles**:

| Sistema | Slugs | Dónde se usa |
|---|---|---|
| `IMBRA_CATEGORIES` (`category-taxonomy.ts`) | `"motor"`, `"frenos"`, `"suspension"`, `"electricos"`... | Campo `category_slug` en **Supabase** |
| `WOO_CATEGORIES` (`woo-categories.ts`) | `"guias-de-motor"`, `"bandas-y-pastillas"`, `"discos-de-freno"`... | Megamenú, sidebar WooCommerce |

El código anterior filtraba usando `CATEGORY_GROUPS.slugs` (slugs WooCommerce) pero Supabase almacena slugs IMBRA. Resultado: siempre 0 resultados.

### La solución

`CATEGORY_GROUPS.id` ya coincide con los slugs de `IMBRA_CATEGORIES`. Solo hay que usar `.id` en lugar de `.slugs` al filtrar.

```ts
// ❌ INCORRECTO — slugs WooCommerce, no existen en category_slug de Supabase
const activeSlugs = group.slugs; // ["guias-de-motor", "retenedores", "varillas-de-impulso"]

// ✅ CORRECTO — slug IMBRA, coincide con category_slug en Supabase
const activeGroupId = group.id; // "motor"
```

### Corrección adicional en `woo-categories.ts`

```ts
// ANTES (no coincidía con IMBRA_CATEGORIES slug "electricos")
{ id: "electrico", name: "Eléctrico", ... }

// DESPUÉS (correcto)
{ id: "electricos", name: "Eléctrico", ... }
```

### Regla permanente

> **`category_slug` en Supabase = slugs de `IMBRA_CATEGORIES`**
> Para filtrar por grupo de categoría, usar siempre `CATEGORY_GROUPS.id`, nunca `CATEGORY_GROUPS.slugs`.

---

## Migración SQL — Prerequisito Obligatorio

El sistema requiere que la tabla `products_search` tenga dos campos bien poblados: `vehicle_brand` y `cc_class`. Estos se generan ejecutando el script:

**`sql/enrich-products-search.sql`** → ejecutar en **Supabase → SQL Editor**

### Qué hace el script

**Paso 1 — Agrega columna `cc_class`**
Nueva columna con la cilindrada extraída del nombre del producto.
Valores posibles: `'50cc'`, `'80cc'`, `'100cc'`, `'110cc'`, `'115cc'`, `'125cc'`, `'135cc'`, `'150cc'`, `'155cc'`, `'160cc'`, `'175cc'`, `'180cc'`, `'185cc'`, `'200cc'`, `'250cc'`, `'300cc'`, `'390cc'`

**Paso 2 — Repuebla `vehicle_brand`**
Extrae la marca del nombre del producto con `ILIKE`. Cubre ~22 marcas:
YAMAHA, HONDA, SUZUKI, BAJAJ, AKT, KAWASAKI, KTM, HERO, TVS, AUTECO, VICTORY, BETA, KYMCO, PIAGGIO, SYM, SIGMA, LIFAN, LONCIN, SHINERAY, ZANELLA, ITALIKA, UM

**Paso 3 — Repuebla `vehicle_model`**
Extrae el modelo del nombre del producto con regex POSIX. Cubre ~70 modelos colombianos:
- YAMAHA: BWS 125, BWS 4T, FZ 16, FZ 25, XTZ 125, DT 125, RX 115, NMAX, CRYPTON, LIBERO 115, YBR 125
- HONDA: CBF 150, CBF 125, CB 125, WAVE 110, XR 150L, XR 250, CARGO 150, TITAN 150, DREAM, CGL 125
- SUZUKI: GN 125, GN 185, TS Z 125, TS 125, DR 200, AX 100, AX 115, BEST 125, GIXXER
- BAJAJ: PULSAR 200 NS, PULSAR 180, PULSAR 160 NS, PULSAR 150, PULSAR 135, BOXER CT 100, BOXER BM 150, DISCOVER 125, PLATINA
- AKT: NKD 125, TT 180, EVO 200, DYNAMIC 125, FLEX 150
- TVS: APACHE 200, APACHE 160, STAR CITY, METRO 100
- KAWASAKI: KLX 300, KLX 150, NINJA 400, NINJA 300, NINJA 250, Z 400
- KTM: DUKE 390, DUKE 250, DUKE 200

**Paso 4 — Crea índices**
Para queries instantáneas en el selector:
- `idx_ps_vehicle_brand` — en `vehicle_brand`
- `idx_ps_cc_class` — en `cc_class`
- `idx_ps_brand_cc` — compuesto `(vehicle_brand, cc_class)`
- `idx_ps_brand_cc_cat` — compuesto `(vehicle_brand, cc_class, category_slug)`

### Casos especiales manejados

| Nombre en producto | cc_class asignado | Por qué |
|---|---|---|
| `FZ 16` | `'160cc'` | FZ 16 = 160cc (el 16 es el nombre) |
| `FZ 25` | `'250cc'` | FZ 25 = 249cc |
| `NMAX` | `'155cc'` | Sin número, modelo conocido |
| `BOXER CT` | `'100cc'` | Sin número en nombre |
| `DREAM` | `'110cc'` | Sin número en nombre |
| `BEST` (Suzuki) | `'125cc'` | Sin número en nombre |

### ⚠️ Importante: Re-ejecutar tras sincronización

Si se re-sincroniza el catálogo desde WooCommerce (ruta `/api/sync-products`), el sync sobreescribe `vehicle_brand`, `vehicle_model`, y `cc_class` con los valores del mapper (que solo cubre ~15 marcas y ~16 modelos). **Hay que volver a ejecutar el SQL después de cada sync masivo.**

---

## Patrón de nombres SAP/WooCommerce

Los productos en la base de datos siguen siempre este patrón:

```
"BANDA FRENO YAMAHA BWS 125 (MOD 08-15)"
 ─────────── ────── ──────── ────────────
 TIPO        MARCA  MODELO   AÑOS COMPATIBLES
```

El SQL extrae cada parte usando `ILIKE` y regex POSIX (`\y` = word boundary en PostgreSQL).

---

## Flujo Completo de Búsqueda

**Usuario selecciona:** FRENOS → HONDA → 150cc → 2018

1. MotoSelector genera: `/tienda?cat=frenos&brand=HONDA&cc=150cc&year=2018`
2. `tienda/page.tsx` desestructura los params (`cat`, `brand`, `cc`, `year`)
3. `searchWithFilters` ejecuta en Supabase:
```sql
SELECT * FROM products_search
WHERE status = 'publish'
  AND category_slug = 'frenos'
  AND vehicle_brand = 'HONDA'
  AND cc_class = '150cc'
  AND vehicle_years @> ARRAY[2018]
ORDER BY name ASC
LIMIT 24;
```
4. Tienda muestra los productos con hero: "Repuestos para HONDA" / acento "150cc"

---

## Queries de Verificación Post-Migración

Ejecutar en Supabase → SQL Editor para confirmar que el script funcionó:

```sql
-- Cobertura global
SELECT
  ROUND(COUNT(*) FILTER (WHERE vehicle_brand IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con marca",
  ROUND(COUNT(*) FILTER (WHERE cc_class IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con cilindrada",
  ROUND(COUNT(*) FILTER (WHERE vehicle_model IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con modelo",
  COUNT(*) AS total
FROM products_search WHERE status = 'publish';

-- Marcas y cuántos productos por marca
SELECT vehicle_brand, COUNT(*) as productos
FROM products_search
WHERE vehicle_brand IS NOT NULL
GROUP BY vehicle_brand ORDER BY productos DESC;

-- Cilindradas disponibles
SELECT cc_class, COUNT(*) as productos
FROM products_search
WHERE cc_class IS NOT NULL
GROUP BY cc_class ORDER BY cc_class;
```

---

## Estructura de `products_search` (campos relevantes para filtros)

```
vehicle_brand   → YAMAHA, HONDA, SUZUKI, etc.
vehicle_model   → BWS 125, CBF 150, PULSAR 200 NS, etc.
vehicle_years   → int[] ej: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015]
cc_class        → '125cc', '150cc', etc. (columna agregada por SQL migration)
category_slug   → slug IMBRA: "motor", "frenos", "suspension", "electricos"...
part_category   → nombre display: "Motor", "Frenos", "Suspensión"...
status          → 'publish'
```
