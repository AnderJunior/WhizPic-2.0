import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (token: string, newPassword: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      console.error("Erro ao obter sessão:", error)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("Erro no login:", error)
        // Se for erro de fetch, pode ser problema de configuração
        if (error.message?.includes("fetch") || error.message?.includes("Failed to fetch")) {
          console.error("❌ Erro de conexão com Supabase. Verifique:")
          console.error("1. As variáveis de ambiente no arquivo .env")
          console.error("2. Se o servidor foi reiniciado após criar/atualizar o .env")
          console.error("3. Se a URL e chave do Supabase estão corretas")
        }
      }
      
      return { error }
    } catch (err: any) {
      console.error("Erro ao fazer login:", err)
      return { 
        error: { 
          message: err.message || "Erro ao conectar com o servidor. Verifique sua conexão e as configurações do Supabase." 
        } 
      }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const updatePassword = async (token: string, newPassword: string) => {
    // Verifica o token e atualiza a senha
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })
    
    if (error) {
      return { error }
    }

    // Atualiza a senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    
    return { error: updateError }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, updatePassword }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
