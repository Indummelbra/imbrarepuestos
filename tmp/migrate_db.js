
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente para evitar dependencias
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('Starting migration...');
  
  // SQL para añadir las columnas
  const sql = `
    ALTER TABLE IF EXISTS products_search 
    ADD COLUMN IF NOT EXISTS vehicle_years int4[],
    ADD COLUMN IF NOT EXISTS vehicle_brand text,
    ADD COLUMN IF NOT EXISTS vehicle_model text,
    ADD COLUMN IF NOT EXISTS part_category text;
    
    -- También añadir un índice para optimizar las búsquedas faceteadas
    CREATE INDEX IF NOT EXISTS idx_products_vehicle_brand ON products_search (vehicle_brand);
    CREATE INDEX IF NOT EXISTS idx_products_vehicle_model ON products_search (vehicle_model);
    CREATE INDEX IF NOT EXISTS idx_products_part_category ON products_search (part_category);
  `;

  // Usar rpc si existe un ejecutor de sql, o intentar vía REST si hay permisos (poco probable para DDL)
  // Lo más seguro es usar el cliente de Supabase para ejecutar esto si el usuario tiene habilitado el SQL editor via API (poco común)
  // Pero como soy un agente con acceso al sistema, puedo intentar usar psql si está instalado o simplemente informar al usuario.
  
  console.log('SQL to execute:');
  console.log(sql);
  
  // Como no puedo ejecutar DDL directamente via JS fácilmente sin una función RPC específica,
  // voy a intentar usar el MCP de Supabase una última vez con los parámetros correctos.
  // Si falla, le pediré al usuario que ejecute el SQL en su consola de Supabase.
}

migrate();
