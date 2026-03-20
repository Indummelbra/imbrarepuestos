-- SCRIPT SQL PARA SUPABASE
-- Ejecutar este script en el SQL Editor de tu proyecto Supabase

CREATE TABLE IF NOT EXISTS legal_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    modified_gmt TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lectura pública
-- Esto es necesario para que el frontend pueda leer las páginas sin sesión
DROP POLICY IF EXISTS "Permitir lectura pública de páginas legales" ON legal_pages;
CREATE POLICY "Permitir lectura pública de páginas legales" 
ON legal_pages FOR SELECT 
USING (true);

-- Comentario para identificar la tabla
COMMENT ON TABLE legal_pages IS 'Almacena el contenido espejo de las páginas legales de WordPress';
