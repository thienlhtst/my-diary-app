import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPA_URL_KEY // Dán URL vào đây
const supabaseKey = import.meta.env.VITE_SUPA_API_KEY  // Dán Anon Key vào đây

export const supabase = createClient(supabaseUrl, supabaseKey)