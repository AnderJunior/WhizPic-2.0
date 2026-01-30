"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, Plus, Search, Edit, Mail, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Client {
  id: string
  email: string | null
  full_name: string | null
  role: string
  plan_id: string | null
  plan_name?: string
  created_at: string
}

interface Plan {
  id: string
  name: string
}

export default function AdminClientes() {
  const [clients, setClients] = useState<Client[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    plan_id: "",
    role: "user",
  })

  useEffect(() => {
    fetchClients()
    fetchPlans()
  }, [])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          plans:plan_id (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const clientsWithPlanNames = data?.map((client: any) => ({
        ...client,
        plan_name: client.plans?.name || 'Sem plano'
      })) || []

      setClients(clientsWithPlanNames)
    } catch (error: any) {
      toast.error("Erro ao carregar clientes", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name')
        .eq('is_active', true)

      if (error) throw error
      setPlans(data || [])
    } catch (error: any) {
      console.error("Erro ao carregar planos:", error)
    }
  }

  const handleCreateClient = async () => {
    try {
      // Primeiro criar o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password || undefined,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
        },
      })

      if (authError) throw authError

      // Atualizar o perfil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            plan_id: formData.plan_id || null,
            role: formData.role,
          })
          .eq('id', authData.user.id)

        if (profileError) throw profileError
      }

      toast.success("Cliente criado com sucesso!")
      setIsDialogOpen(false)
      resetForm()
      fetchClients()
    } catch (error: any) {
      toast.error("Erro ao criar cliente", { description: error.message })
    }
  }

  const handleUpdateClient = async () => {
    if (!editingClient) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          plan_id: formData.plan_id || null,
          role: formData.role,
        })
        .eq('id', editingClient.id)

      if (error) throw error

      toast.success("Cliente atualizado com sucesso!")
      setIsDialogOpen(false)
      resetForm()
      fetchClients()
    } catch (error: any) {
      toast.error("Erro ao atualizar cliente", { description: error.message })
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      password: "",
      plan_id: "",
      role: "user",
    })
    setEditingClient(null)
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client)
    setFormData({
      email: client.email || "",
      full_name: client.full_name || "",
      password: "",
      plan_id: client.plan_id || "",
      role: client.role || "user",
    })
    setIsDialogOpen(true)
  }

  const filteredClients = clients.filter(client =>
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-br from-background via-background to-red-50/50">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Gerenciar Clientes</h1>
                <p className="text-lg text-muted-foreground mt-1">Visualize e gerencie todos os clientes da plataforma</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
                  <DialogDescription>
                    {editingClient ? 'Atualize as informações do cliente' : 'Preencha os dados para criar um novo cliente'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!!editingClient}
                      placeholder="cliente@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  {!editingClient && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha (opcional)</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Deixe vazio para gerar senha automática"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="plan_id">Plano</Label>
                    <Select value={formData.plan_id} onValueChange={(value) => setFormData({ ...formData, plan_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sem plano</SelectItem>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="admin_master">Admin Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={editingClient ? handleUpdateClient : handleCreateClient}>
                      {editingClient ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Total: {filteredClients.length} clientes</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {client.full_name?.charAt(0).toUpperCase() || client.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{client.full_name || 'Sem nome'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {client.plan_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(client)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
