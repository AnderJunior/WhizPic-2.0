"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Package, Plus, Edit, Trash2, Check, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  max_books: number
  max_pages_per_book: number
  features: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminPlanos() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    max_books: 0,
    max_pages_per_book: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error: any) {
      toast.error("Erro ao carregar planos", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async () => {
    try {
      const { error } = await supabase
        .from('plans')
        .insert([{
          ...formData,
          features: {},
        }])

      if (error) throw error

      toast.success("Plano criado com sucesso!")
      setIsDialogOpen(false)
      resetForm()
      fetchPlans()
    } catch (error: any) {
      toast.error("Erro ao criar plano", { description: error.message })
    }
  }

  const handleUpdatePlan = async () => {
    if (!editingPlan) return

    try {
      const { error } = await supabase
        .from('plans')
        .update(formData)
        .eq('id', editingPlan.id)

      if (error) throw error

      toast.success("Plano atualizado com sucesso!")
      setIsDialogOpen(false)
      resetForm()
      fetchPlans()
    } catch (error: any) {
      toast.error("Erro ao atualizar plano", { description: error.message })
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)

      if (error) throw error

      toast.success("Plano excluído com sucesso!")
      fetchPlans()
    } catch (error: any) {
      toast.error("Erro ao excluir plano", { description: error.message })
    }
  }

  const togglePlanStatus = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id)

      if (error) throw error

      toast.success(`Plano ${!plan.is_active ? 'ativado' : 'desativado'} com sucesso!`)
      fetchPlans()
    } catch (error: any) {
      toast.error("Erro ao alterar status do plano", { description: error.message })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      max_books: 0,
      max_pages_per_book: 0,
      is_active: true,
    })
    setEditingPlan(null)
  }

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price,
      max_books: plan.max_books,
      max_pages_per_book: plan.max_pages_per_book,
      is_active: plan.is_active,
    })
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando planos...</p>
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
                <h1 className="text-4xl font-bold tracking-tight">Gerenciar Planos</h1>
                <p className="text-lg text-muted-foreground mt-1">Crie e gerencie os planos de assinatura</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Plano
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
                  <DialogDescription>
                    {editingPlan ? 'Atualize as informações do plano' : 'Preencha os dados para criar um novo plano'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Plano</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Básico, Profissional, Enterprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição do plano"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_books">Máximo de Livros (-1 para ilimitado)</Label>
                    <Input
                      id="max_books"
                      type="number"
                      value={formData.max_books}
                      onChange={(e) => setFormData({ ...formData, max_books: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_pages_per_book">Máximo de Páginas por Livro</Label>
                    <Input
                      id="max_pages_per_book"
                      type="number"
                      value={formData.max_pages_per_book}
                      onChange={(e) => setFormData({ ...formData, max_pages_per_book: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Plano Ativo</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}>
                      {editingPlan ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </div>
                  <div className={`flex items-center gap-2 ${plan.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {plan.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">por mês</p>
                  </div>
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Máx. Livros:</span>
                      <span className="font-medium">{plan.max_books === -1 ? 'Ilimitado' : plan.max_books}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Máx. Páginas/Livro:</span>
                      <span className="font-medium">{plan.max_pages_per_book}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)} className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePlanStatus(plan)}
                      className={plan.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {plan.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {plans.length === 0 && (
          <Card className="border-0 shadow-sm mt-8">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum plano encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
