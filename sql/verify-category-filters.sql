-- ============================================
-- DIAGNÓSTICO: Verificar category_slug en FRENOS, MOTOR, SUSPENSIÓN
-- ============================================

-- 1. Conteo total por category_slug (IMBRA taxonomy)
SELECT
  category_slug,
  COUNT(*) as total_productos
FROM products_search
WHERE status = 'publish'
  AND category_slug IS NOT NULL
GROUP BY category_slug
ORDER BY total_productos DESC;

-- 2. Ver productos en "frenos"
SELECT
  id,
  name,
  category_slug,
  part_category,
  vehicle_brand,
  price
FROM products_search
WHERE status = 'publish'
  AND category_slug = 'frenos'
ORDER BY name ASC
LIMIT 20;

-- 3. Ver productos en "motor"
SELECT
  id,
  name,
  category_slug,
  part_category,
  vehicle_brand,
  price
FROM products_search
WHERE status = 'publish'
  AND category_slug = 'motor'
ORDER BY name ASC
LIMIT 20;

-- 4. Ver productos en "suspension"
SELECT
  id,
  name,
  category_slug,
  part_category,
  vehicle_brand,
  price
FROM products_search
WHERE status = 'publish'
  AND category_slug = 'suspension'
ORDER BY name ASC
LIMIT 20;

-- 5. Ver categorías WooCommerce asociadas a productos en "frenos"
-- Esto ayuda a entender si el mapeo está funcionando bien
SELECT
  p.category_slug,
  jsonb_array_elements(p.categories) as woo_category,
  COUNT(*) as count
FROM products_search p
WHERE status = 'publish'
  AND p.category_slug = 'frenos'
  AND p.categories IS NOT NULL
GROUP BY p.category_slug, jsonb_array_elements(p.categories)
ORDER BY count DESC;

-- 6. Productos SIN category_slug asignado (deberían ser 0 o muy pocos)
SELECT
  id,
  name,
  categories,
  part_category
FROM products_search
WHERE status = 'publish'
  AND (category_slug IS NULL OR category_slug = '' OR category_slug = 'general')
LIMIT 20;
