# Ingeniería: Live Search, Sincronización y Configuración de Supabase

Este documento detalla la arquitectura de búsqueda avanzada ("Live Search") que permite encontrar productos de forma instantánea, con tolerancia a errores (fuzzy search) y alta relevancia.

## 1. Arquitectura de 3 Capas
1.  **Fuente de Verdad (WooCommerce):** Donde se gestionan los productos.
2.  **Indexador de Búsqueda (Supabase):** Una base de datos Postgres que actúa como espejo optimizado para búsquedas Full-Text y Fuzzy.
3.  **Frontend (Headless Next.js):** Consulta a Supabase en lugar de WooCommerce para obtener resultados en milisegundos.

## 2. Configuración de Supabase (SQL)

Para replicar este sistema, se deben ejecutar los siguientes comandos SQL en el editor de Supabase:

```sql
-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- 2. Tabla de búsqueda optimizada
CREATE TABLE products_search (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    sku TEXT,
    price DECIMAL(12, 2),
    regular_price DECIMAL(12, 2),
    sale_price DECIMAL(12, 2),
    stock_status TEXT,
    stock_quantity INTEGER,
    short_description TEXT,
    description TEXT,
    image_url TEXT,
    categories JSONB,
    tags JSONB,
    status TEXT DEFAULT 'publish',
    fts_es tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', name), 'A') ||
        setweight(to_tsvector('spanish', coalesce(sku, '')), 'B') ||
        setweight(to_tsvector('spanish', coalesce(short_description, '')), 'C')
    ) STORED
);

-- 3. Índices de alta velocidad
CREATE INDEX idx_products_search_fts ON products_search USING GIN (fts_es);
CREATE INDEX idx_products_search_name_trgm ON products_search USING GIN (name gin_trgm_ops);

-- 4. Función de Búsqueda Avanzada (RPC)
CREATE OR REPLACE FUNCTION search_products_advanced(
    search_query TEXT,
    limit_val INTEGER DEFAULT 10,
    offset_val INTEGER DEFAULT 0,
    fuzzy_threshold FLOAT DEFAULT 0.2
)
RETURNS TABLE (
    id BIGINT, name TEXT, slug TEXT, sku TEXT, price DECIMAL, 
    image_url TEXT, stock_status TEXT, headline TEXT, rank FLOAT4, total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH matches AS (
        SELECT 
            p.id, p.name, p.slug, p.sku, p.price, p.image_url, p.stock_status,
            (ts_rank_cd(p.fts_es, websearch_to_tsquery('spanish', search_query)) * 1.5 + 
             similarity(p.name, search_query) * 2.0)::FLOAT4 as combined_rank,
            ts_headline('spanish', p.name, websearch_to_tsquery('spanish', search_query), 
                        'StartSel="<mark>", StopSel="</mark>"') as headline,
            count(*) OVER() as full_count
        FROM products_search p
        WHERE p.fts_es @@ websearch_to_tsquery('spanish', search_query)
           OR similarity(p.name, search_query) > fuzzy_threshold
           OR p.name ILIKE '%' || search_query || '%'
    )
    SELECT * FROM matches ORDER BY combined_rank DESC LIMIT limit_val OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;
```

## 3. Lógica de Sincronización

### A. Sincronización Masiva (Bulk Sync)
Implementada en [app/api/sync-products/route.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/api/sync-products/route.ts). 
- Recorre todos los productos de WooCommerce vía API REST (paginación de 100 en 100).
- Realiza un `upsert` masivo en Supabase.
- Se recomienda ejecutar este proceso al menos una vez al día vía Cron Job.

### B. Sincronización en Tiempo Real (Webhooks)
Implementada en [app/api/webhooks/woo-sync/route.ts](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/api/webhooks/woo-sync/route.ts).
- WooCommerce envía un JSON al crearse/editarse/borrarse un producto.
- El headless recibe el webhook, **re-consulta** el producto completo a la API de WooCommerce para asegurar data 100% real (Estrategia "Nivel Dios").
- Actualiza la fila correspondiente en Supabase de inmediato.

## 4. Implementación en el Frontend
El componente [LiveSearch.tsx](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/components/search/LiveSearch.tsx) utiliza `use-debounce` (300ms) para llamar al Server Action [searchProductsAdvanced](file:///f:/CLIENTES/PHARMAPLUS/pharma-headless-1a%20Vercel/app/actions/products.ts#136-246), el cual invoca la función RPC de Supabase. Esto garantiza:
- **Resaltado de texto:** Uso de `ts_headline` para marcar dónde coincidió la búsqueda.
- **Velocidad:** Resultados en < 100ms.
- **Fallas (Fallback):** Si el RPC falla, el sistema cae automáticamente a una búsqueda `ILIKE` simple para nunca dejar al usuario sin resultados.

---
*Documento de Ingeniería de Live Search - 13/03/2026*
