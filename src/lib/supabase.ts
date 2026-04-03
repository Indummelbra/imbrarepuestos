import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Inicializacion directa con guard seguro
// Si las variables no existen en build-time, los clientes quedan como null
// Todos los llamadores ya manejan error o retornan [] cuando falla la query

const supabaseUrl       = process.env.NEXT_PUBLIC_SUPABASE_URL      ?? '';
const supabaseAnonKey   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY     ?? '';

// Cliente publico (anon) — para busquedas del lado del cliente
export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createClient('https://placeholder.supabase.co', 'placeholder') as SupabaseClient);

// Cliente administrador (service_role) — para sync y operaciones server-side
export const supabaseAdmin: SupabaseClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : (createClient('https://placeholder.supabase.co', 'placeholder') as SupabaseClient);

