"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, Monitor, Smartphone, MapPin, Globe, AlertTriangle } from "lucide-react"

export default function Configuracoes() {
  const { user, signOut } = useAuth()
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    bio: "",
    location: "",
    website: "",
  })

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "pt-BR",
    aiModel: "gpt-4",
    defaultAudience: "children",
    defaultLanguageStyle: "infantil",
  })

  const [notifications, setNotifications] = useState({
    emailNewFeatures: true,
    emailBookComplete: true,
    emailWeeklyReport: false,
    pushBookComplete: true,
    pushComments: false,
  })

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showEmail: false,
    allowSearchEngines: true,
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso!")
  }

  const handleSavePreferences = () => {
    toast.success("Preferências salvas com sucesso!")
  }

  const handleSaveNotifications = () => {
    toast.success("Configurações de notificações atualizadas!")
  }

  const handleSavePrivacy = () => {
    toast.success("Configurações de privacidade atualizadas!")
  }

  const handleChangePassword = () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }
    if (security.newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres")
      return
    }
    toast.success("Senha alterada com sucesso!")
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      toast.error("Conta excluída com sucesso")
      signOut()
    }
  }

  const userInitial = profileData.fullName?.[0] || user?.email?.[0]?.toUpperCase() || "U"

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#262626' }}>Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e informações da conta</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Atualize suas informações pessoais e foto de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-blue-100">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-800 text-2xl text-white">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Upload className="mr-2 h-4 w-4" />
                      Alterar Foto
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">PNG, JPG ou GIF até 5MB</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profileData.email} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    placeholder="Conte um pouco sobre você..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="resize-none"
                    rows={4}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin className="mr-2 inline h-4 w-4" />
                      Localização
                    </Label>
                    <Input
                      id="location"
                      placeholder="São Paulo, Brasil"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">
                      <Globe className="mr-2 inline h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://seusite.com"
                      value={profileData.website}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>Configure suas preferências de interface e IA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Aparência</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <Select
                        value={preferences.theme}
                        onValueChange={(v) => setPreferences({ ...preferences, theme: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Claro</SelectItem>
                          <SelectItem value="dark">Escuro</SelectItem>
                          <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select
                        value={preferences.language}
                        onValueChange={(v) => setPreferences({ ...preferences, language: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (BR)</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Configurações de IA</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Modelo de IA Preferido</Label>
                      <Select
                        value={preferences.aiModel}
                        onValueChange={(v) => setPreferences({ ...preferences, aiModel: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4 (Mais criativo)</SelectItem>
                          <SelectItem value="gpt-3.5">GPT-3.5 (Mais rápido)</SelectItem>
                          <SelectItem value="claude">Claude (Balanceado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Público-Alvo Padrão</Label>
                      <Select
                        value={preferences.defaultAudience}
                        onValueChange={(v) => setPreferences({ ...preferences, defaultAudience: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="children">Crianças</SelectItem>
                          <SelectItem value="teens">Adolescentes</SelectItem>
                          <SelectItem value="adults">Adultos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Linguagem Padrão</Label>
                    <Select
                      value={preferences.defaultLanguageStyle}
                      onValueChange={(v) => setPreferences({ ...preferences, defaultLanguageStyle: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infantil">Infantil</SelectItem>
                        <SelectItem value="direto">Direto</SelectItem>
                        <SelectItem value="educativo">Educativo</SelectItem>
                        <SelectItem value="poetico">Poético</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSavePreferences}>Salvar Preferências</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie como você recebe atualizações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Notificações por Email</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Novos Recursos</p>
                        <p className="text-sm text-muted-foreground">
                          Receba emails sobre novos recursos e atualizações
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailNewFeatures}
                        onCheckedChange={(v) => setNotifications({ ...notifications, emailNewFeatures: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Livro Concluído</p>
                        <p className="text-sm text-muted-foreground">Notificação quando seu livro for gerado</p>
                      </div>
                      <Switch
                        checked={notifications.emailBookComplete}
                        onCheckedChange={(v) => setNotifications({ ...notifications, emailBookComplete: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Relatório Semanal</p>
                        <p className="text-sm text-muted-foreground">Resumo semanal de suas atividades</p>
                      </div>
                      <Switch
                        checked={notifications.emailWeeklyReport}
                        onCheckedChange={(v) => setNotifications({ ...notifications, emailWeeklyReport: v })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Notificações Push</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Livro Concluído</p>
                        <p className="text-sm text-muted-foreground">
                          Notificação push quando seu livro estiver pronto
                        </p>
                      </div>
                      <Switch
                        checked={notifications.pushBookComplete}
                        onCheckedChange={(v) => setNotifications({ ...notifications, pushBookComplete: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Comentários</p>
                        <p className="text-sm text-muted-foreground">Quando alguém comentar em seus livros</p>
                      </div>
                      <Switch
                        checked={notifications.pushComments}
                        onCheckedChange={(v) => setNotifications({ ...notifications, pushComments: v })}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveNotifications}>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Privacidade</CardTitle>
                <CardDescription>Controle quem pode ver suas informações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Perfil Público</p>
                      <p className="text-sm text-muted-foreground">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <Switch
                      checked={privacy.publicProfile}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, publicProfile: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mostrar Email</p>
                      <p className="text-sm text-muted-foreground">Exibir seu email no perfil público</p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, showEmail: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Indexação em Motores de Busca</p>
                      <p className="text-sm text-muted-foreground">Permitir que motores de busca indexem seu perfil</p>
                    </div>
                    <Switch
                      checked={privacy.allowSearchEngines}
                      onCheckedChange={(v) => setPrivacy({ ...privacy, allowSearchEngines: v })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="mb-2 font-medium text-blue-900">Gerenciar Dados Pessoais (LGPD)</p>
                  <p className="mb-4 text-sm text-blue-700">
                    Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento.
                  </p>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    Baixar Meus Dados
                  </Button>
                </div>

                <Button onClick={handleSavePrivacy}>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Assinatura e Uso</CardTitle>
                <CardDescription>Gerencie seu plano e veja seu uso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-900">Plano Gratuito</h3>
                      <p className="text-blue-700">Recursos básicos incluídos</p>
                    </div>
                    <Button>Fazer Upgrade</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Uso do Mês Atual</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Livros Criados</span>
                        <span className="font-medium">12 / 50</span>
                      </div>
                      <Progress value={24} />
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Gerações de IA</span>
                        <span className="font-medium">89 / 200</span>
                      </div>
                      <Progress value={44.5} />
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Páginas Geradas</span>
                        <span className="font-medium">324 / 1000</span>
                      </div>
                      <Progress value={32.4} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Planos Disponíveis</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Gratuito</CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold text-primary">R$ 0</span>
                          <span className="text-muted-foreground">/mês</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>✓ 50 livros/mês</p>
                        <p>✓ 200 gerações IA/mês</p>
                        <p>✓ Suporte por email</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-blue-600">
                      <CardHeader>
                        <div className="mb-2 inline-block rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                          Popular
                        </div>
                        <CardTitle className="text-lg">Criador</CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold text-primary">R$ 19,90</span>
                          <span className="text-muted-foreground">/mês</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>✓ 200 livros/mês</p>
                        <p>✓ 1000 gerações IA/mês</p>
                        <p>✓ Suporte prioritário</p>
                        <p>✓ Sem marca d'água</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Profissional</CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold text-primary">R$ 49,90</span>
                          <span className="text-muted-foreground">/mês</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>✓ Livros ilimitados</p>
                        <p>✓ IA ilimitada</p>
                        <p>✓ Suporte 24/7</p>
                        <p>✓ API access</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Gerencie sua senha e sessões ativas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Alterar Senha</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={security.newPassword}
                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={security.confirmPassword}
                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleChangePassword}>Alterar Senha</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Sessões Ativas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-muted-foreground">São Paulo, Brasil • Ativo agora</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        Atual
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Safari - iPhone</p>
                          <p className="text-sm text-muted-foreground">São Paulo, Brasil • Há 2 horas</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Revogar
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-transparent">
                    Encerrar Todas as Outras Sessões
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-red-600">Zona de Perigo</h3>
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
                    <div className="mb-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <h4 className="font-semibold text-red-900">Excluir Conta</h4>
                        <p className="text-sm text-red-700">
                          Esta ação é permanente e não pode ser desfeita. Todos os seus livros e dados serão perdidos.
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Excluir Minha Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
