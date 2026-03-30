-- ============================================================
-- IMBRA STORE — Enriquecimiento de products_search
-- Ejecutar en: Supabase → SQL Editor (una sola vez)
--
-- Qué hace este script:
--   1. Agrega columna cc_class (cilindrada) con valor como '125cc'
--   2. Repobla vehicle_brand con regex ampliado (más marcas, más cobertura)
--   3. Repobla vehicle_model con lista extendida de modelos colombianos
--   4. Crea índices para queries rápidas en los filtros del selector
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- PASO 1: Agregar columna cc_class
-- ─────────────────────────────────────────────────────────────
ALTER TABLE products_search
  ADD COLUMN IF NOT EXISTS cc_class TEXT;


-- ─────────────────────────────────────────────────────────────
-- PASO 2: Poblar vehicle_brand desde el nombre del producto
-- Los nombres siguen el patrón: [TIPO REPUESTO] [MARCA] [MODELO] [CC]
-- Ej: "BANDA FRENO YAMAHA BWS 125 (MOD 08-15)"
-- ─────────────────────────────────────────────────────────────
UPDATE products_search
SET vehicle_brand = CASE
  WHEN name ILIKE '%YAMAHA%'    THEN 'YAMAHA'
  WHEN name ILIKE '%HONDA%'     THEN 'HONDA'
  WHEN name ILIKE '%SUZUKI%'    THEN 'SUZUKI'
  WHEN name ILIKE '%BAJAJ%'     THEN 'BAJAJ'
  WHEN name ILIKE '%AKT%'       THEN 'AKT'
  WHEN name ILIKE '%KAWASAKI%'  THEN 'KAWASAKI'
  WHEN name ILIKE '%KTM%'       THEN 'KTM'
  WHEN name ILIKE '%HERO%'      THEN 'HERO'
  WHEN name ILIKE '%TVS%'       THEN 'TVS'
  WHEN name ILIKE '%AUTECO%'    THEN 'AUTECO'
  WHEN name ILIKE '%VICTORY%'   THEN 'VICTORY'
  WHEN name ILIKE '%BETA%'      THEN 'BETA'
  WHEN name ILIKE '%KYMCO%'     THEN 'KYMCO'
  WHEN name ILIKE '%PIAGGIO%'   THEN 'PIAGGIO'
  WHEN name ILIKE '%SYM%'       THEN 'SYM'
  WHEN name ILIKE '%SIGMA%'     THEN 'SIGMA'
  WHEN name ILIKE '%LIFAN%'     THEN 'LIFAN'
  WHEN name ILIKE '%LONCIN%'    THEN 'LONCIN'
  WHEN name ILIKE '%SHINERAY%'  THEN 'SHINERAY'
  WHEN name ILIKE '%ZANELLA%'   THEN 'ZANELLA'
  WHEN name ILIKE '%ITALIKA%'   THEN 'ITALIKA'
  WHEN name ILIKE '%UM MOTO%' OR name ILIKE '%UM MOTOR%' THEN 'UM'
  WHEN name ILIKE '%KIMCO%'     THEN 'KYMCO'   -- typo frecuente
  ELSE NULL
END
WHERE name IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- PASO 3: Poblar vehicle_model desde el nombre del producto
-- Orden de CASE importa: primero los más específicos/largos
-- para evitar que "GN" matchee antes que "GN 185"
-- ─────────────────────────────────────────────────────────────
UPDATE products_search
SET vehicle_model = CASE

  -- ── YAMAHA ──────────────────────────────────────────────
  WHEN name ~* '\yBWS\s*125\y'                    THEN 'BWS 125'
  WHEN name ~* '\yBWS\s*4T\y'                     THEN 'BWS 4T'
  WHEN name ~* '\yBWS\y'                          THEN 'BWS'
  WHEN name ~* '\yFZ\s*FI\y'                      THEN 'FZ FI'
  WHEN name ~* '\yFZ\s*25\y'                      THEN 'FZ 25'
  WHEN name ~* '\yFZ\s*16\y' OR name ~* '\yFZR\y' THEN 'FZ 16'
  WHEN name ~* '\yFZ\y'                           THEN 'FZ'
  WHEN name ~* '\yXTZ\s*250\y'                    THEN 'XTZ 250'
  WHEN name ~* '\yXTZ\s*150\y'                    THEN 'XTZ 150'
  WHEN name ~* '\yXTZ\s*125\y'                    THEN 'XTZ 125'
  WHEN name ~* '\yXTZ\y'                          THEN 'XTZ'
  WHEN name ~* '\yNMAX\y'                         THEN 'NMAX'
  WHEN name ~* '\yCRYPTON\y'                      THEN 'CRYPTON'
  WHEN name ~* '\yLIBERO\s*115\y'                 THEN 'LIBERO 115'
  WHEN name ~* '\yLIBERO\y'                       THEN 'LIBERO'
  WHEN name ~* '\yYBR\s*125\y'                    THEN 'YBR 125'
  WHEN name ~* '\yYBR\y'                          THEN 'YBR'
  WHEN name ~* '\yDT\s*175\y'                     THEN 'DT 175'
  WHEN name ~* '\yDT\s*125\y'                     THEN 'DT 125'
  WHEN name ~* '\yDT\y'                           THEN 'DT'
  WHEN name ~* '\yRX\s*115\y'                     THEN 'RX 115'
  WHEN name ~* '\yRX\y'                           THEN 'RX'
  WHEN name ~* '\ySR\s*185\y'                     THEN 'SR 185'
  WHEN name ~* '\yTZR\y'                          THEN 'TZR'

  -- ── HONDA ───────────────────────────────────────────────
  WHEN name ~* '\yCBF\s*150\y'                    THEN 'CBF 150'
  WHEN name ~* '\yCBF\s*125\y'                    THEN 'CBF 125'
  WHEN name ~* '\yCBF\y'                          THEN 'CBF'
  WHEN name ~* '\yCB\s*125\y'                     THEN 'CB 125'
  WHEN name ~* '\yCB\s*190\y'                     THEN 'CB 190R'
  WHEN name ~* '\yWAVE\s*110\y'                   THEN 'WAVE 110'
  WHEN name ~* '\yWAVE\y'                         THEN 'WAVE'
  WHEN name ~* '\yXR\s*250\y'                     THEN 'XR 250'
  WHEN name ~* '\yXR\s*150\y'                     THEN 'XR 150L'
  WHEN name ~* '\yXR\s*125\y'                     THEN 'XR 125'
  WHEN name ~* '\yXR\y'                           THEN 'XR'
  WHEN name ~* '\yCARGO\s*150\y'                  THEN 'CARGO 150'
  WHEN name ~* '\yCARGO\y'                        THEN 'CARGO'
  WHEN name ~* '\yTITAN\y'                        THEN 'TITAN 150'
  WHEN name ~* '\yDREAM\y'                        THEN 'DREAM'
  WHEN name ~* '\yCGL\y'                          THEN 'CGL 125'
  WHEN name ~* '\yCRF\s*250\y'                    THEN 'CRF 250'
  WHEN name ~* '\yCRF\s*150\y'                    THEN 'CRF 150'
  WHEN name ~* '\yCBR\s*600\y'                    THEN 'CBR 600'
  WHEN name ~* '\yCBR\s*300\y'                    THEN 'CBR 300'
  WHEN name ~* '\yCBR\y'                          THEN 'CBR'

  -- ── SUZUKI ──────────────────────────────────────────────
  WHEN name ~* '\yGN\s*185\y'                     THEN 'GN 185'
  WHEN name ~* '\yGN\s*125\y'                     THEN 'GN 125'
  WHEN name ~* '\yGN\y'                           THEN 'GN 125'
  WHEN name ~* '\yTS\s*Z\s*125\y'                 THEN 'TS Z 125'
  WHEN name ~* '\yTS\s*125\y'                     THEN 'TS 125'
  WHEN name ~* '\yTS\y'                           THEN 'TS'
  WHEN name ~* '\yDR\s*200\y'                     THEN 'DR 200'
  WHEN name ~* '\yAX\s*115\y'                     THEN 'AX 115'
  WHEN name ~* '\yAX\s*100\y'                     THEN 'AX 100'
  WHEN name ~* '\yAX\y'                           THEN 'AX 100'
  WHEN name ~* '\yBEST\s*125\y'                   THEN 'BEST 125'
  WHEN name ~* '\yBEST\y'                         THEN 'BEST 125'
  WHEN name ~* '\yGIXXER\s*250\y'                 THEN 'GIXXER 250'
  WHEN name ~* '\yGIXXER\s*155\y'                 THEN 'GIXXER 155'
  WHEN name ~* '\yGIXXER\y'                       THEN 'GIXXER'
  WHEN name ~* '\ySMART\y'                        THEN 'SMART 125'

  -- ── BAJAJ ───────────────────────────────────────────────
  WHEN name ~* '\yPULSAR\s*200\s*NS\y'            THEN 'PULSAR 200 NS'
  WHEN name ~* '\yPULSAR\s*NS\s*200\y'            THEN 'PULSAR 200 NS'
  WHEN name ~* '\yPULSAR\s*200\y'                 THEN 'PULSAR 200'
  WHEN name ~* '\yPULSAR\s*180\y'                 THEN 'PULSAR 180'
  WHEN name ~* '\yPULSAR\s*160\y' OR name ~* '\yPULSAR\s*NS\s*160\y' THEN 'PULSAR 160 NS'
  WHEN name ~* '\yPULSAR\s*150\y'                 THEN 'PULSAR 150'
  WHEN name ~* '\yPULSAR\s*135\y'                 THEN 'PULSAR 135'
  WHEN name ~* '\yPULSAR\y'                       THEN 'PULSAR'
  WHEN name ~* '\yBOXER\s*CT\y'                   THEN 'BOXER CT 100'
  WHEN name ~* '\yBOXER\s*BM\s*150\y'             THEN 'BOXER BM 150'
  WHEN name ~* '\yBOXER\y'                        THEN 'BOXER'
  WHEN name ~* '\yDISCOVER\s*125\y'               THEN 'DISCOVER 125'
  WHEN name ~* '\yDISCOVER\y'                     THEN 'DISCOVER'
  WHEN name ~* '\yPLATINA\y'                      THEN 'PLATINA'

  -- ── AKT ─────────────────────────────────────────────────
  WHEN name ~* '\yNKD\s*125\y'                    THEN 'NKD 125'
  WHEN name ~* '\yNKD\y'                          THEN 'NKD 125'
  WHEN name ~* '\yTT\s*180\y'                     THEN 'TT 180'
  WHEN name ~* '\yEVO\s*200\y'                    THEN 'EVO 200'
  WHEN name ~* '\yDYNAMIC\s*125\y'                THEN 'DYNAMIC 125'
  WHEN name ~* '\yFLEX\s*150\y'                   THEN 'FLEX 150'

  -- ── TVS ─────────────────────────────────────────────────
  WHEN name ~* '\yAPACHE\s*200\y'                 THEN 'APACHE 200'
  WHEN name ~* '\yAPACHE\s*160\y'                 THEN 'APACHE 160'
  WHEN name ~* '\yAPACHE\y'                       THEN 'APACHE'
  WHEN name ~* '\ySTAR\s*CITY\y'                  THEN 'STAR CITY'
  WHEN name ~* '\yMETRO\s*100\y'                  THEN 'METRO 100'

  -- ── KAWASAKI ────────────────────────────────────────────
  WHEN name ~* '\yKLX\s*300\y'                    THEN 'KLX 300'
  WHEN name ~* '\yKLX\s*150\y'                    THEN 'KLX 150'
  WHEN name ~* '\yKLX\y'                          THEN 'KLX'
  WHEN name ~* '\yNINJA\s*400\y'                  THEN 'NINJA 400'
  WHEN name ~* '\yNINJA\s*300\y'                  THEN 'NINJA 300'
  WHEN name ~* '\yNINJA\s*250\y'                  THEN 'NINJA 250'
  WHEN name ~* '\yNINJA\y'                        THEN 'NINJA'
  WHEN name ~* '\yZ\s*400\y'                      THEN 'Z 400'

  -- ── KTM ─────────────────────────────────────────────────
  WHEN name ~* '\yDUKE\s*390\y'                   THEN 'DUKE 390'
  WHEN name ~* '\yDUKE\s*250\y'                   THEN 'DUKE 250'
  WHEN name ~* '\yDUKE\s*200\y'                   THEN 'DUKE 200'
  WHEN name ~* '\yDUKE\y'                         THEN 'DUKE'

  ELSE NULL
END
WHERE name IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- PASO 4: Poblar cc_class (cilindrada) desde el nombre
-- Orden: primero casos especiales, luego patrones numéricos.
-- Se usa \y como word boundary en regex POSIX de PostgreSQL.
-- ─────────────────────────────────────────────────────────────
UPDATE products_search
SET cc_class = CASE

  -- ── Casos especiales (modelo ≠ CC numérico) ─────────────
  WHEN name ~* '\yFZ\s*16\y'                         THEN '160cc'  -- FZ 16 = 160cc
  WHEN name ~* '\yFZ\s*25\y'                         THEN '250cc'  -- FZ 25 = 249cc
  WHEN name ~* '\yNMAX\y'                            THEN '155cc'  -- NMAX = 155cc
  WHEN name ~* '\yBOXER\s*CT\y'                      THEN '100cc'  -- Boxer CT = 100cc
  WHEN name ~* '\yAX\s*100\y' OR name ~* '\yAX100\y' THEN '100cc'
  WHEN name ~* '\yAX\s*115\y'                        THEN '115cc'
  WHEN name ~* '\yBEST\y'                            THEN '125cc'  -- Best 125
  WHEN name ~* '\ySMART\y' AND name ILIKE '%SUZUKI%' THEN '125cc'
  WHEN name ~* '\yDREAM\y'                           THEN '110cc'

  -- ── Explícito: número + CC/CC ────────────────────────────
  WHEN name ~* '\y50\s*[Cc][Cc]\y'                   THEN '50cc'
  WHEN name ~* '\y80\s*[Cc][Cc]\y'                   THEN '80cc'
  WHEN name ~* '\y100\s*[Cc][Cc]\y'                  THEN '100cc'
  WHEN name ~* '\y110\s*[Cc][Cc]\y'                  THEN '110cc'
  WHEN name ~* '\y115\s*[Cc][Cc]\y'                  THEN '115cc'
  WHEN name ~* '\y125\s*[Cc][Cc]\y'                  THEN '125cc'
  WHEN name ~* '\y150\s*[Cc][Cc]\y'                  THEN '150cc'
  WHEN name ~* '\y155\s*[Cc][Cc]\y'                  THEN '155cc'
  WHEN name ~* '\y160\s*[Cc][Cc]\y'                  THEN '160cc'
  WHEN name ~* '\y180\s*[Cc][Cc]\y'                  THEN '180cc'
  WHEN name ~* '\y200\s*[Cc][Cc]\y'                  THEN '200cc'
  WHEN name ~* '\y250\s*[Cc][Cc]\y'                  THEN '250cc'
  WHEN name ~* '\y300\s*[Cc][Cc]\y'                  THEN '300cc'
  WHEN name ~* '\y390\s*[Cc][Cc]\y'                  THEN '390cc'

  -- ── Implícito: número standalone en nombre del producto ──
  -- Orden importante: más específico primero
  WHEN name ~* '\y390\y'                             THEN '390cc'
  WHEN name ~* '\y300\y'                             THEN '300cc'
  WHEN name ~* '\y250\y'                             THEN '250cc'
  WHEN name ~* '\y200\y'                             THEN '200cc'
  WHEN name ~* '\y185\y'                             THEN '185cc'
  WHEN name ~* '\y180\y'                             THEN '180cc'
  WHEN name ~* '\y175\y'                             THEN '175cc'
  WHEN name ~* '\y160\y'                             THEN '160cc'
  WHEN name ~* '\y155\y'                             THEN '155cc'
  WHEN name ~* '\y150\y'                             THEN '150cc'
  WHEN name ~* '\y135\y'                             THEN '135cc'
  WHEN name ~* '\y125\y'                             THEN '125cc'
  WHEN name ~* '\y115\y'                             THEN '115cc'
  WHEN name ~* '\y110\y'                             THEN '110cc'
  WHEN name ~* '\y100\y'                             THEN '100cc'
  WHEN name ~* '\y80\y'                              THEN '80cc'
  WHEN name ~* '\y50\y'                              THEN '50cc'

  ELSE NULL
END
WHERE name IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- PASO 5: Índices para performance en los filtros del selector
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ps_vehicle_brand
  ON products_search (vehicle_brand)
  WHERE vehicle_brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ps_cc_class
  ON products_search (cc_class)
  WHERE cc_class IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ps_category_slug
  ON products_search (category_slug)
  WHERE category_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ps_brand_cc
  ON products_search (vehicle_brand, cc_class)
  WHERE vehicle_brand IS NOT NULL AND cc_class IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ps_brand_cc_cat
  ON products_search (vehicle_brand, cc_class, category_slug)
  WHERE vehicle_brand IS NOT NULL AND cc_class IS NOT NULL;


-- ─────────────────────────────────────────────────────────────
-- VERIFICACIÓN: ejecuta esto después para ver los resultados
-- ─────────────────────────────────────────────────────────────

-- Marcas encontradas y cuántos productos:
-- SELECT vehicle_brand, COUNT(*) FROM products_search
-- WHERE vehicle_brand IS NOT NULL GROUP BY vehicle_brand ORDER BY COUNT(*) DESC;

-- Cilindradas encontradas:
-- SELECT cc_class, COUNT(*) FROM products_search
-- WHERE cc_class IS NOT NULL GROUP BY cc_class ORDER BY cc_class;

-- Modelos encontrados:
-- SELECT vehicle_model, COUNT(*) FROM products_search
-- WHERE vehicle_model IS NOT NULL GROUP BY vehicle_model ORDER BY COUNT(*) DESC;

-- Porcentaje de cobertura:
-- SELECT
--   ROUND(COUNT(*) FILTER (WHERE vehicle_brand IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con marca",
--   ROUND(COUNT(*) FILTER (WHERE cc_class IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con cilindrada",
--   ROUND(COUNT(*) FILTER (WHERE vehicle_model IS NOT NULL) * 100.0 / COUNT(*), 1) AS "% con modelo",
--   COUNT(*) AS total
-- FROM products_search WHERE status = 'publish';
