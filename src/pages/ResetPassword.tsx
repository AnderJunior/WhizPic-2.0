import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Verifica se há token na URL (quando o usuário clica no link do email)
  useEffect(() => {
    const token = searchParams.get("token")
    const type = searchParams.get("type")
    
    if (token && (type === "recovery" || type === "email")) {
      setStep("code")
      // O token será usado quando o usuário inserir a nova senha
    }
  }, [searchParams])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      toast.error("Erro ao enviar código", {
        description: error.message,
      })
    } else {
      toast.success("Email enviado!", {
        description: "Verifique seu email e clique no link recebido para redefinir sua senha.",
      })
      // Não muda para o step "code" automaticamente, pois o usuário precisa clicar no link do email
    }

    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }

    setLoading(true)

    // Tenta verificar o código OTP e atualizar a senha
    try {
      const urlToken = searchParams.get("token")
      
      // Se há token na URL (link do email), verifica e atualiza diretamente
      if (urlToken) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: urlToken,
          type: 'recovery',
        })

        if (verifyError) {
          toast.error("Link inválido ou expirado", {
            description: verifyError.message,
          })
          setLoading(false)
          return
        }

        // Atualiza a senha
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        })

        if (updateError) {
          toast.error("Erro ao redefinir senha", {
            description: updateError.message,
          })
        } else {
          toast.success("Senha redefinida com sucesso!", {
            description: "Você pode fazer login com sua nova senha.",
          })
          navigate("/login")
        }
        setLoading(false)
        return
      }

      // Se não há token na URL, usa o código OTP inserido
      if (!code) {
        toast.error("Por favor, insira o código recebido por email")
        setLoading(false)
        return
      }

      // Verifica o código OTP (recovery com código requer email)
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      })

      if (verifyError) {
        toast.error("Código inválido ou expirado", {
          description: verifyError.message,
        })
        setLoading(false)
        return
      }

      // Atualiza a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        toast.error("Erro ao redefinir senha", {
          description: updateError.message,
        })
      } else {
        toast.success("Senha redefinida com sucesso!", {
          description: "Você pode fazer login com sua nova senha.",
        })
        navigate("/login")
      }
    } catch (error: any) {
      toast.error("Erro ao redefinir senha", {
        description: error.message || "Ocorreu um erro inesperado.",
      })
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Reset Form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <img 
                src="/logo-principal-whizpic.png" 
                alt="WhizPic Logo" 
                className="h-16 w-auto"
                onError={(e) => {
                  console.error("Erro ao carregar logo:", e)
                }}
              />
            </div>
            <p className="text-muted-foreground">Redefinir sua senha</p>
          </div>

          {step === "email" ? (
            <Card>
              <CardHeader>
                <CardTitle>Esqueceu sua senha?</CardTitle>
                <CardDescription>
                  Digite seu email e enviaremos um código para redefinir sua senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enviando..." : "Enviar Código"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para login
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Redefinir senha</CardTitle>
                <CardDescription>
                  {searchParams.get("token") 
                    ? "Crie uma nova senha para sua conta"
                    : "Insira o código recebido por email e sua nova senha"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {!searchParams.get("token") && (
                    <div className="space-y-2">
                      <Label htmlFor="reset-code">Código de verificação</Label>
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="Digite o código recebido"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setStep("email")
                      setCode("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Right side - Hero Section */}
      <div className="hidden flex-1 bg-gradient-to-br from-[#6D56AB] via-[#4a3b75] to-[#6D56AB] lg:flex lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-xl text-white">
          <h2 className="mb-4 text-5xl font-bold leading-tight">Redefina sua senha com segurança</h2>
          <p className="mb-8 text-xl text-white/90">
            Receba um código de verificação por email e crie uma nova senha segura para sua conta.
          </p>
        </div>
      </div>
    </div>
  )
}
