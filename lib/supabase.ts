import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "❌ Variáveis de ambiente do Supabase não encontradas!\n" +
    "Crie um arquivo .env na raiz do projeto com:\n" +
    "NEXT_PUBLIC_SUPABASE_URL=sua_url\n" +
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua_chave\n" +
    "\nApós criar, REINICIE o servidor!"
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
