"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DollarSign, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CostMetric {
  id: string
  book_id: string
  user_id: string
  ai_usage_cost: number
  image_generation_cost: number
  text_generation_cost: number
  total_cost: number
  tokens_used: number
  images_generated: number
  created_at: string
  book_title?: string
  user_email?: string
}

export default function AdminMetricas() {
  const [metrics, setMetrics] = useState<CostMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")

  useEffect(() => {
    fetchMetrics()
  }, [timeRange])

  const fetchMetrics = async () => {
    try {
      let dateFilter = new Date()
      
      switch (timeRange) {
        case "7d":
          dateFilter.setDate(dateFilter.getDate() - 7)
          break
        case "30d":
          dateFilter.setDate(dateFilter.getDate() - 30)
          break
        case "90d":
          dateFilter.setDate(dateFilter.getDate() - 90)
          break
        default:
          dateFilter = new Date(0) // All time
      }

      const { data, error } = await supabase
        .from('book_costs')
        .select(`
          *,
          books:book_id (title),
          profiles:user_id (email)
        `)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      const metricsWithDetails = data?.map((metric: any) => ({
        ...metric,
        book_title: metric.books?.title || 'Livro sem título',
        user_email: metric.profiles?.email || 'Email não disponível'
      })) || []

      setMetrics(metricsWithDetails)
    } catch (error: any) {
      console.error("Erro ao carregar métricas:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = metrics.reduce((sum, m) => sum + (m.total_cost || 0), 0)
  const totalAiCost = metrics.reduce((sum, m) => sum + (m.ai_usage_cost || 0), 0)
  const totalImageCost = metrics.reduce((sum, m) => sum + (m.image_generation_cost || 0), 0)
  const totalTextCost = metrics.reduce((sum, m) => sum + (m.text_generation_cost || 0), 0)
  const totalTokens = metrics.reduce((sum, m) => sum + (m.tokens_used || 0), 0)
  const totalImages = metrics.reduce((sum, m) => sum + (m.images_generated || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando métricas...</p>
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
                <h1 className="text-4xl font-bold tracking-tight">Métricas de Custos</h1>
                <p className="text-lg text-muted-foreground mt-1">Análise detalhada dos custos de criação de livros</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(["7d", "30d", "90d", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {range === "all" ? "Todo período" : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                  <p className="text-3xl font-bold">R$ {totalCost.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Custo de IA</p>
                  <p className="text-3xl font-bold">R$ {totalAiCost.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Tokens Usados</p>
                  <p className="text-3xl font-bold">{totalTokens.toLocaleString()}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Imagens Geradas</p>
                  <p className="text-3xl font-bold">{totalImages}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Distribuição de Custos</CardTitle>
              <CardDescription>Breakdown dos custos por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Geração de Texto</span>
                    <span className="font-semibold">R$ {totalTextCost.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${totalCost > 0 ? (totalTextCost / totalCost) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Geração de Imagens</span>
                    <span className="font-semibold">R$ {totalImageCost.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${totalCost > 0 ? (totalImageCost / totalCost) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Outros Custos de IA</span>
                    <span className="font-semibold">R$ {(totalAiCost - totalTextCost - totalImageCost).toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${totalCost > 0 ? ((totalAiCost - totalTextCost - totalImageCost) / totalCost) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Métricas gerais de criação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Criações</span>
                  <span className="text-lg font-bold">{metrics.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Custo Médio por Livro</span>
                  <span className="text-lg font-bold">
                    R$ {metrics.length > 0 ? (totalCost / metrics.length).toFixed(2) : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tokens Médios por Livro</span>
                  <span className="text-lg font-bold">
                    {metrics.length > 0 ? Math.round(totalTokens / metrics.length).toLocaleString() : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Imagens Médias por Livro</span>
                  <span className="text-lg font-bold">
                    {metrics.length > 0 ? Math.round(totalImages / metrics.length) : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Histórico de Custos</CardTitle>
            <CardDescription>Detalhamento de cada criação de livro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{metric.book_title}</p>
                    <p className="text-sm text-muted-foreground">{metric.user_email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(metric.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">Custo Total</p>
                      <p className="font-bold">R$ {metric.total_cost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tokens</p>
                      <p className="font-semibold">{metric.tokens_used.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Imagens</p>
                      <p className="font-semibold">{metric.images_generated}</p>
                    </div>
                  </div>
                </div>
              ))}
              {metrics.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma métrica encontrada no período selecionado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
