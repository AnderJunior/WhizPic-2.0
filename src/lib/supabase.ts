import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Use Publishable Key (nova nomenclatura) ou anon key (legado)
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: mostra as variáveis de ambiente (sem mostrar valores completos por segurança)
if (import.meta.env.DEV) {
  console.log("🔍 Debug Supabase Config:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "não encontrado",
    keyPreview: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : "não encontrado",
  })
}

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "⚠️ Missing Supabase environment variables. Please check your .env file.\n" +
    "You need either VITE_SUPABASE_PUBLISHABLE_KEY (new) or VITE_SUPABASE_ANON_KEY (legacy).\n" +
    "IMPORTANTE: O arquivo deve se chamar .env (com ponto no início), não 'env'.\n" +
    "Após criar/atualizar o .env, REINICIE o servidor (Ctrl+C e npm run dev novamente)."
  )
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "❌ Variáveis de ambiente do Supabase não encontradas!\n" +
    "Crie um arquivo .env na raiz do projeto com:\n" +
    "VITE_SUPABASE_URL=sua_url\n" +
    "VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave\n" +
    "\nApós criar, REINICIE o servidor!"
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
