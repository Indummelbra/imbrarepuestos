import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente para uso general (Client side o Anon actions)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con privilegios de administrador para operaciones de sincronización (Server side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
