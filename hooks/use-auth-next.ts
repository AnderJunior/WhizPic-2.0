"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  role: 'user' | 'admin' | 'admin_master'
  plan_id: string | null
  /** Configurações de Geração IA (página Geração IA) */
  ai_model?: string
  ai_temperature_default?: number
  ai_temperature_image_prompts?: number
  ai_temperature_story?: number
  ai_prompts?: Record<string, string> | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isAdminMaster: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (token: string, newPassword: string) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error("Erro ao buscar perfil:", error)
        return null
      }

      return data as UserProfile
    } catch (err) {
      console.error("Erro ao buscar perfil:", err)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id)
      setProfile(userProfile)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id)
        setProfile(userProfile)
      }
      setLoading(false)
    }).catch((error) => {
      console.error("Erro ao obter sessão:", error)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("Erro no login:", error)
        return { error }
      }

      // Buscar perfil após login bem-sucedido
      if (data.user) {
        const userProfile = await fetchProfile(data.user.id)
        setProfile(userProfile)
      }
      
      return { error }
    } catch (err: any) {
      console.error("Erro ao fazer login:", err)
      return { 
        error: { 
          message: err.message || "Erro ao conectar com o servidor." 
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
    setProfile(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const updatePassword = async (token: string, newPassword: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })
    
    if (error) {
      return { error }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    
    return { error: updateError }
  }

  const isAdmin = profile?.role === 'admin' || profile?.role === 'admin_master'
  const isAdminMaster = profile?.role === 'admin_master'

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile,
        loading, 
        isAdmin,
        isAdminMaster,
        signIn, 
        signUp, 
        signOut, 
        resetPassword, 
        updatePassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
