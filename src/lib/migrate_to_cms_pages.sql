-- MIGRACIÓN DE legal_pages A info_politica_paginas
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Renombrar la tabla (si ya existe legal_pages)
-- Si estás empezando de cero, puedes saltar al punto 2
ALTER TABLE IF EXISTS legal_pages RENAME TO info_politica_paginas;

-- 2. Asegurarse de que la estructura sea la correcta
-- Añadir columna 'type' si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='info_politica_paginas' AND column_name='type') THEN
        ALTER TABLE info_politica_paginas ADD COLUMN type TEXT DEFAULT 'legal';
    END IF;
END $$;

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE info_politica_paginas ENABLE ROW LEVEL SECURITY;

-- 4. Crear política de lectura pública (si no existe)
DROP POLICY IF EXISTS "Permitir lectura pública de info_politica_paginas" ON info_politica_paginas;
CREATE POLICY "Permitir lectura pública de info_politica_paginas" 
ON info_politica_paginas FOR SELECT 
USING (true);

-- NOTA: La sincronización usará supabaseAdmin (Service Role) por lo que no necesita políticas de escritura.
