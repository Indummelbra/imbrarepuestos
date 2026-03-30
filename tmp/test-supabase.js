
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://supabase.imbra.cloud';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UifQ.puX_B7GtWLGpZ02U-psLF4xHciApsaRhS5x1wLK2dog';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  console.log('--- TEST DE SUPABASE ---');
  
  try {
  
    // 1. Verificar columnas reales
    const { data: columns, error: colError } = await supabase
      .rpc('get_table_columns', { table_name: 'products_search' });
      
    // Si el RPC no existe, usamos una consulta directa
    if (colError) {
      const { data: infoSchema, error: infoError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'products_search');
        
      if (infoError) {
        // Probamos con una consulta SQL cruda via .rpc si existe exec_sql
        console.log('No se pudo acceder a information_schema. Intentando inferir columnas de una fila...');
      } else {
        console.log('Columnas encontradas:', infoSchema.map(c => `${c.column_name} (${c.data_type})`));
      }
    } else {
      console.log('Columnas (via RPC):', columns);
    }

    // Alternativa simple: intentar seleccionar una de las columnas nuevas
    const { error: testColError } = await supabase
      .from('products_search')
      .select('vehicle_brand')
      .limit(1);
    
    if (testColError) {
      console.log('CONFIRMADO: La columna vehicle_brand NO EXISTE.');
    } else {
      console.log('La columna vehicle_brand EXISTE.');
    }

    // 3. Ver una muestra de producto
    const { data: sample, error: sampleError } = await supabase
      .from('products_search')
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.error('Error muestra:', sampleError);
    } else {
      console.log('Muestra de producto (columnas disponibles):', Object.keys(sample[0]));
      console.log('Datos de vehículo en la muestra:', {
        brand: sample[0].vehicle_brand,
        model: sample[0].vehicle_model,
        years: sample[0].vehicle_years,
        part: sample[0].part_category
      });
    }
  } catch (err) {
    console.error('Error fatal:', err);
  }
}

test();
