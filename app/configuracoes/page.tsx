"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  CreditCard,
  Key,
  Trash2,
  Save,
  Upload,
  LogOut,
  Sparkles,
} from "lucide-react"

export default function Configuracoes() {
  const [userData, setUserData] = useState({
    name: "Usuário Exemplo",
    email: "usuario@exemplo.com",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Criador de histórias incríveis com IA",
    location: "São Paulo, Brasil",
    website: "https://meusite.com",
  })

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "pt-BR",
    defaultAudience: "criancas",
    defaultLanguageStyle: "infantil",
    aiModel: "gpt-4",
  })

  const [notifications, setNotifications] = useState({
    emailNewFeatures: true,
    emailBookCompleted: true,
    emailWeeklyReport: false,
    pushBookCompleted: true,
    pushComments: false,
  })

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    showEmail: false,
    allowIndexing: true,
  })

  const [subscription] = useState({
    plan: "Gratuito",
    booksThisMonth: 2,
    maxBooksPerMonth: 2,
    pagesGenerated: 48,
    aiGenerationsUsed: 10,
    aiGenerationsLimit: 10,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-5xl mx-auto p-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Configurações</h1>
              <p className="text-lg text-muted-foreground mt-1">Personalize sua experiência</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted/50">
            <TabsTrigger value="perfil" className="flex items-center gap-2 data-[state=active]:bg-background">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferências</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="privacidade" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacidade</span>
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="flex items-center gap-2 data-[state=active]:bg-background">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Assinatura</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize suas informações de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                    <AvatarFallback>UE</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Alterar Foto
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Campos do Perfil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={userData.location}
                      onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={userData.website}
                      onChange={(e) => setUserData({ ...userData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Input
                    id="bio"
                    value={userData.bio}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Preferências */}
          <TabsContent value="preferencias" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência da interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
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
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Configurações de IA</CardTitle>
                <CardDescription>Defina preferências padrão para geração de livros</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Modelo de IA Preferido</Label>
                  <Select
                    value={preferences.aiModel}
                    onValueChange={(value) => setPreferences({ ...preferences, aiModel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recomendado)</SelectItem>
                      <SelectItem value="gpt-3.5">GPT-3.5 (Mais rápido)</SelectItem>
                      <SelectItem value="claude">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Público-Alvo Padrão</Label>
                  <Select
                    value={preferences.defaultAudience}
                    onValueChange={(value) => setPreferences({ ...preferences, defaultAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criancas">Crianças</SelectItem>
                      <SelectItem value="adolescentes">Adolescentes</SelectItem>
                      <SelectItem value="adultos">Adultos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Linguagem Padrão</Label>
                  <Select
                    value={preferences.defaultLanguageStyle}
                    onValueChange={(value) => setPreferences({ ...preferences, defaultLanguageStyle: value })}
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

                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Notificações por Email</CardTitle>
                <CardDescription>Escolha quais emails você deseja receber</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Novos Recursos</Label>
                    <p className="text-sm text-muted-foreground">Receba atualizações sobre novos recursos</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewFeatures}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewFeatures: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Livro Concluído</Label>
                    <p className="text-sm text-muted-foreground">Notificação quando seu livro for gerado</p>
                  </div>
                  <Switch
                    checked={notifications.emailBookCompleted}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailBookCompleted: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Relatório Semanal</Label>
                    <p className="text-sm text-muted-foreground">Resumo semanal de suas atividades</p>
                  </div>
                  <Switch
                    checked={notifications.emailWeeklyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailWeeklyReport: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Notificações Push</CardTitle>
                <CardDescription>Receba notificações em tempo real</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Livro Concluído</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificação instantânea quando o livro estiver pronto
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushBookCompleted}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushBookCompleted: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Comentários</Label>
                    <p className="text-sm text-muted-foreground">Quando alguém comentar em seus livros</p>
                  </div>
                  <Switch
                    checked={notifications.pushComments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushComments: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Privacidade */}
          <TabsContent value="privacidade" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Configurações de Privacidade</CardTitle>
                <CardDescription>Controle quem pode ver suas informações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Perfil Público</Label>
                    <p className="text-sm text-muted-foreground">Permitir que outros usuários vejam seu perfil</p>
                  </div>
                  <Switch
                    checked={privacy.publicProfile}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, publicProfile: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar Email</Label>
                    <p className="text-sm text-muted-foreground">Exibir seu email no perfil público</p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Indexação em Motores de Busca</Label>
                    <p className="text-sm text-muted-foreground">Permitir que seu perfil apareça no Google</p>
                  </div>
                  <Switch
                    checked={privacy.allowIndexing}
                    onCheckedChange={(checked) => setPrivacy({ ...privacy, allowIndexing: checked })}
                  />
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Globe className="h-4 w-4 mr-2" />
                    Gerenciar Dados Pessoais (LGPD)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Assinatura */}
          <TabsContent value="assinatura" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>Gerencie sua assinatura e uso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{subscription.plan}</h3>
                    <p className="text-sm text-muted-foreground">Seu plano atual</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    R$ 0,00/mês
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Uso do Mês Atual</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Livros Criados</span>
                      <span className="font-medium">
                        {subscription.booksThisMonth} / {subscription.maxBooksPerMonth}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(subscription.booksThisMonth / subscription.maxBooksPerMonth) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gerações de IA</span>
                      <span className="font-medium">
                        {subscription.aiGenerationsUsed} / {subscription.aiGenerationsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(subscription.aiGenerationsUsed / subscription.aiGenerationsLimit) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Páginas Geradas</span>
                    <span className="font-medium">{subscription.pagesGenerated}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Fazer Upgrade do Plano
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Desbloqueie recursos ilimitados e modelos de IA avançados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold">Criador</h4>
                    <p className="text-2xl font-bold">R$ 19,90</p>
                    <p className="text-sm text-muted-foreground">por mês</p>
                    <ul className="space-y-2 text-sm">
                      <li>✓ 10 livros/mês</li>
                      <li>✓ 50 páginas por livro</li>
                      <li>✓ Export PDF</li>
                      <li>✓ Temas personalizados</li>
                    </ul>
                    <Button variant="outline" className="w-full bg-transparent">
                      Escolher
                    </Button>
                  </div>

                  <div className="border-2 border-primary rounded-lg p-4 space-y-3 relative">
                    <Badge className="absolute -top-2 right-4">Popular</Badge>
                    <h4 className="font-semibold">Profissional</h4>
                    <p className="text-2xl font-bold">R$ 49,90</p>
                    <p className="text-sm text-muted-foreground">por mês</p>
                    <ul className="space-y-2 text-sm">
                      <li>✓ 50 livros/mês</li>
                      <li>✓ 100 páginas por livro</li>
                      <li>✓ Suporte prioritário</li>
                      <li>✓ IA Avançada</li>
                    </ul>
                    <Button className="w-full">Escolher</Button>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold">Empresa</h4>
                    <p className="text-2xl font-bold">R$ 99,90</p>
                    <p className="text-sm text-muted-foreground">por mês</p>
                    <ul className="space-y-2 text-sm">
                      <li>✓ Livros ilimitados</li>
                      <li>✓ Páginas ilimitadas</li>
                      <li>✓ Colaboração em equipe</li>
                      <li>✓ API Access</li>
                    </ul>
                    <Button variant="outline" className="w-full bg-transparent">
                      Escolher
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button>Atualizar Senha</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Sessões Ativas</CardTitle>
                <CardDescription>Dispositivos conectados à sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Chrome no Windows</p>
                    <p className="text-sm text-muted-foreground">São Paulo, Brasil • Ativo agora</p>
                  </div>
                  <Badge variant="secondary">Atual</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Safari no iPhone</p>
                    <p className="text-sm text-muted-foreground">Rio de Janeiro, Brasil • Há 2 dias</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Revogar
                  </Button>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <LogOut className="h-4 w-4 mr-2" />
                  Encerrar Todas as Outras Sessões
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>Ações irreversíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Excluir Conta</p>
                    <p className="text-sm text-muted-foreground">Remover permanentemente sua conta e todos os dados</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
