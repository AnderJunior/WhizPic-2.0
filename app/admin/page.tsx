"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Users, BookOpen, DollarSign, TrendingUp, Package, Sparkles, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalUsers: number
  totalBooks: number
  totalRevenue: number
  activePlans: number
  aiUsageCost: number
  booksCreatedToday: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBooks: 0,
    totalRevenue: 0,
    activePlans: 0,
    aiUsageCost: 0,
    booksCreatedToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Buscar total de usuários
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Buscar total de livros
      const { count: booksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })

      // Buscar livros criados hoje
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: todayBooks } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Buscar planos ativos
      const { count: plansCount } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Buscar custos totais de IA (últimos 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { data: aiUsage } = await supabase
        .from('ai_usage_metrics')
        .select('cost')
        .gte('created_at', thirtyDaysAgo.toISOString())

      const totalAiCost = aiUsage?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0

      // Calcular receita total (simplificado - baseado nos planos dos usuários)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('plan_id')

      const planIds = profiles?.map(p => p.plan_id).filter(Boolean) || []
      let totalRevenue = 0
      if (planIds.length > 0) {
        const { data: plans } = await supabase
          .from('plans')
          .select('id, price')
          .in('id', planIds)

        totalRevenue = plans?.reduce((sum, plan) => sum + (plan.price || 0), 0) || 0
      }

      setStats({
        totalUsers: usersCount || 0,
        totalBooks: booksCount || 0,
        totalRevenue,
        activePlans: plansCount || 0,
        aiUsageCost: totalAiCost,
        booksCreatedToday: todayBooks || 0,
      })
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      change: "+12% este mês",
      color: "blue",
    },
    {
      title: "Livros Criados",
      value: stats.totalBooks,
      icon: BookOpen,
      change: `${stats.booksCreatedToday} hoje`,
      color: "green",
    },
    {
      title: "Receita Total",
      value: `R$ ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: "+8% este mês",
      color: "yellow",
    },
    {
      title: "Custos de IA (30d)",
      value: `R$ ${stats.aiUsageCost.toFixed(2)}`,
      icon: Sparkles,
      change: "Últimos 30 dias",
      color: "purple",
    },
    {
      title: "Planos Ativos",
      value: stats.activePlans,
      icon: Package,
      change: "Planos disponíveis",
      color: "orange",
    },
    {
      title: "Crescimento",
      value: "+15%",
      icon: TrendingUp,
      change: "vs mês anterior",
      color: "green",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-br from-background via-background to-red-50/50">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Dashboard Administrativo</h1>
              <p className="text-lg text-muted-foreground mt-1">Visão geral da plataforma WhizPic</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <CardDescription>Últimas ações na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo livro criado</p>
                    <p className="text-xs text-muted-foreground">Há 5 minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo usuário registrado</p>
                    <p className="text-xs text-muted-foreground">Há 15 minutos</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Plano atualizado</p>
                    <p className="text-xs text-muted-foreground">Há 1 hora</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Consumo de IA
              </CardTitle>
              <CardDescription>Métricas de uso de IA (últimos 7 dias)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Geração de Texto</span>
                  <span className="text-sm font-semibold">R$ {((stats.aiUsageCost * 0.6) || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Geração de Imagens</span>
                  <span className="text-sm font-semibold">R$ {((stats.aiUsageCost * 0.4) || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold">R$ {stats.aiUsageCost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
