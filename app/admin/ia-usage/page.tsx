"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Sparkles, TrendingUp, Activity, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface AIUsage {
  id: string
  user_id: string | null
  service_type: 'text_generation' | 'image_generation' | 'embedding'
  tokens_used: number
  cost: number
  model: string | null
  created_at: string
  user_email?: string
}

export default function AdminIAUsage() {
  const [usage, setUsage] = useState<AIUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")

  useEffect(() => {
    fetchUsage()
  }, [timeRange])

  const fetchUsage = async () => {
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
          dateFilter = new Date(0)
      }

      const { data, error } = await supabase
        .from('ai_usage_metrics')
        .select(`
          *,
          profiles:user_id (email)
        `)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      const usageWithEmails = data?.map((item: any) => ({
        ...item,
        user_email: item.profiles?.email || 'Anônimo'
      })) || []

      setUsage(usageWithEmails)
    } catch (error: any) {
      console.error("Erro ao carregar uso de IA:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = usage.reduce((sum, u) => sum + (u.cost || 0), 0)
  const totalTokens = usage.reduce((sum, u) => sum + (u.tokens_used || 0), 0)
  
  const textGenCost = usage
    .filter(u => u.service_type === 'text_generation')
    .reduce((sum, u) => sum + (u.cost || 0), 0)
  
  const imageGenCost = usage
    .filter(u => u.service_type === 'image_generation')
    .reduce((sum, u) => sum + (u.cost || 0), 0)
  
  const embeddingCost = usage
    .filter(u => u.service_type === 'embedding')
    .reduce((sum, u) => sum + (u.cost || 0), 0)

  const usageByType = {
    text_generation: usage.filter(u => u.service_type === 'text_generation').length,
    image_generation: usage.filter(u => u.service_type === 'image_generation').length,
    embedding: usage.filter(u => u.service_type === 'embedding').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados de IA...</p>
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
                <h1 className="text-4xl font-bold tracking-tight">Consumo de IA</h1>
                <p className="text-lg text-muted-foreground mt-1">Métricas detalhadas de uso de Inteligência Artificial</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Custo Total de IA</p>
                  <p className="text-3xl font-bold">R$ {totalCost.toFixed(2)}</p>
                </div>
                <Sparkles className="h-8 w-8 text-purple-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total de Tokens</p>
                  <p className="text-3xl font-bold">{totalTokens.toLocaleString()}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Requisições de IA</p>
                  <p className="text-3xl font-bold">{usage.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
                  <p className="text-3xl font-bold">
                    R$ {usage.length > 0 ? (totalCost / usage.length).toFixed(4) : "0.00"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Geração de Texto
              </CardTitle>
              <CardDescription>Uso de modelos de linguagem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">R$ {textGenCost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Custo total</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{usageByType.text_generation}</p>
                  <p className="text-sm text-muted-foreground">Requisições</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${totalCost > 0 ? (textGenCost / totalCost) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Geração de Imagens
              </CardTitle>
              <CardDescription>Uso de modelos de imagem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">R$ {imageGenCost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Custo total</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{usageByType.image_generation}</p>
                  <p className="text-sm text-muted-foreground">Requisições</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${totalCost > 0 ? (imageGenCost / totalCost) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Embeddings
              </CardTitle>
              <CardDescription>Processamento de embeddings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">R$ {embeddingCost.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Custo total</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{usageByType.embedding}</p>
                  <p className="text-sm text-muted-foreground">Requisições</p>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${totalCost > 0 ? (embeddingCost / totalCost) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Histórico de Uso de IA</CardTitle>
            <CardDescription>Registro detalhado de todas as requisições de IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usage.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.service_type === 'text_generation' ? 'bg-blue-100 text-blue-700' :
                        item.service_type === 'image_generation' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.service_type === 'text_generation' ? 'Texto' :
                         item.service_type === 'image_generation' ? 'Imagem' : 'Embedding'}
                      </div>
                      <p className="font-semibold">{item.user_email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Modelo: {item.model || 'N/A'} • Tokens: {item.tokens_used.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ {item.cost.toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground">Custo</p>
                  </div>
                </div>
              ))}
              {usage.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum uso de IA registrado no período selecionado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
