"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WandSparkles, Save, Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  DEFAULT_AI_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_TEMPERATURE_IMAGE_PROMPTS,
  DEFAULT_TEMPERATURE_STORY,
  DEFAULT_AI_PROMPTS,
  OPENAI_MODELS,
  type AIPromptsConfig,
} from "@/lib/ai-generation-defaults"
import { toast } from "sonner"

interface ProfileAIConfig {
  ai_model: string
  ai_temperature_default: number
  ai_temperature_image_prompts: number
  ai_temperature_story: number
  ai_prompts: AIPromptsConfig | null
}

function mergePrompts(saved: AIPromptsConfig | null): AIPromptsConfig {
  return {
    ...DEFAULT_AI_PROMPTS,
    ...(saved && typeof saved === "object" ? saved : {}),
  }
}

export default function GeracaoIAPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState(DEFAULT_AI_MODEL)
  const [tempDefault, setTempDefault] = useState(DEFAULT_TEMPERATURE)
  const [tempImagePrompts, setTempImagePrompts] = useState(DEFAULT_TEMPERATURE_IMAGE_PROMPTS)
  const [tempStory, setTempStory] = useState(DEFAULT_TEMPERATURE_STORY)
  const [prompts, setPrompts] = useState<AIPromptsConfig>(DEFAULT_AI_PROMPTS)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setError("Faça login para carregar suas configurações.")
        setLoading(false)
        return
      }
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("ai_model, ai_temperature_default, ai_temperature_image_prompts, ai_temperature_story, ai_prompts")
        .eq("id", session.user.id)
        .single()
      if (fetchError) {
        setError("Perfil não encontrado ou colunas de IA ainda não existem. Execute a migração SQL.")
        setLoading(false)
        return
      }
      const row = data as ProfileAIConfig | null
      if (row) {
        setModel(row.ai_model ?? DEFAULT_AI_MODEL)
        setTempDefault(Number(row.ai_temperature_default) ?? DEFAULT_TEMPERATURE)
        setTempImagePrompts(Number(row.ai_temperature_image_prompts) ?? DEFAULT_TEMPERATURE_IMAGE_PROMPTS)
        setTempStory(Number(row.ai_temperature_story) ?? DEFAULT_TEMPERATURE_STORY)
        setPrompts(mergePrompts(row.ai_prompts))
      }
      setError(null)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      toast.error("Faça login para salvar.")
      return
    }
    setSaving(true)
    // Garantir que ai_prompts tenha todas as chaves: prompts de imagem, história e regras do personagem
    const aiPromptsToSave: AIPromptsConfig = {
      ...DEFAULT_AI_PROMPTS,
      ...prompts,
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ai_model: model,
        ai_temperature_default: tempDefault,
        ai_temperature_image_prompts: tempImagePrompts,
        ai_temperature_story: tempStory,
        ai_prompts: aiPromptsToSave,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
    setSaving(false)
    if (updateError) {
      toast.error(updateError.message || "Erro ao salvar.")
      return
    }
    toast.success("Configurações de Geração IA salvas!")
  }

  const updatePrompt = (key: keyof AIPromptsConfig, value: string) => {
    setPrompts((p) => ({ ...p, [key]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-5xl mx-auto p-8">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
                <WandSparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Geração IA</h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Modelo, temperatura e prompts usados na criação dos livros
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger value="geral" className="data-[state=active]:bg-background">
              Modelo e Temperatura
            </TabsTrigger>
            <TabsTrigger value="prompts-imagem" className="data-[state=active]:bg-background">
              Prompts de Imagem
            </TabsTrigger>
            <TabsTrigger value="prompts-historia" className="data-[state=active]:bg-background">
              Prompts de História
            </TabsTrigger>
            <TabsTrigger value="regras" className="data-[state=active]:bg-background">
              Regras de Personagem
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Modelo OpenAI</CardTitle>
                <CardDescription>
                  Modelo usado para geração de texto (histórias e prompts de imagem).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPENAI_MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Temperatura</CardTitle>
                <CardDescription>
                  Valores mais altos deixam a IA mais criativa; mais baixos deixam mais previsível.
                  Recomendado: 0,4–0,6.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Temperatura padrão: {tempDefault.toFixed(1)}</Label>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[tempDefault]}
                    onValueChange={([v]) => setTempDefault(v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prompts de imagem: {tempImagePrompts.toFixed(1)}</Label>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[tempImagePrompts]}
                    onValueChange={([v]) => setTempImagePrompts(v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>História (cartoon / com base): {tempStory.toFixed(1)}</Label>
                  <Slider
                    min={0}
                    max={2}
                    step={0.1}
                    value={[tempStory]}
                    onValueChange={([v]) => setTempStory(v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts-imagem" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Prompts de imagem (system)</CardTitle>
                <CardDescription>
                  Instruções de sistema para a IA que gera prompt_personagem, prompt_estilo_imagem e
                  ficha_personagem. Use placeholders: {"{{HISTORIA}}"}, {"{{REFERENCIAS_SUMMARY}}"}, {"{{ESTILO_IMAGEM}}"}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[180px] font-mono text-sm"
                  value={prompts.imagePromptsSystem ?? ""}
                  onChange={(e) => updatePrompt("imagePromptsSystem", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.imagePromptsSystem}
                />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Prompts de imagem (mensagem do usuário)</CardTitle>
                <CardDescription>
                  Template da mensagem do usuário. Placeholders: {"{{HISTORIA}}"}, {"{{REFERENCIAS_SUMMARY}}"}, {"{{ESTILO_IMAGEM}}"}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[220px] font-mono text-sm"
                  value={prompts.imagePromptsUser ?? ""}
                  onChange={(e) => updatePrompt("imagePromptsUser", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.imagePromptsUser}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts-historia" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>História estilo cartoon (system)</CardTitle>
                <CardDescription>Usado quando o estilo da imagem é cartoon.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[140px] font-mono text-sm"
                  value={prompts.storyCartoonSystem ?? ""}
                  onChange={(e) => updatePrompt("storyCartoonSystem", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.storyCartoonSystem}
                />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>História estilo cartoon (mensagem do usuário)</CardTitle>
                <CardDescription>Placeholders: {"{{REFERENCIAS_SUMMARY}}"}, {"{{LINGUAGEM}}"}, {"{{ESTILO_IMAGEM}}"}, {"{{CHARACTER_IDENTITY_RULE}}"}, {"{{HISTORIA}}"}.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[220px] font-mono text-sm"
                  value={prompts.storyCartoonUser ?? ""}
                  onChange={(e) => updatePrompt("storyCartoonUser", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.storyCartoonUser}
                />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>História com base de imagem (system)</CardTitle>
                <CardDescription>Usado para estilos como Ilustração digital.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[160px] font-mono text-sm"
                  value={prompts.storyWithImageBaseSystem ?? ""}
                  onChange={(e) => updatePrompt("storyWithImageBaseSystem", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.storyWithImageBaseSystem}
                />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>História com base de imagem (mensagem do usuário)</CardTitle>
                <CardDescription>
                  Placeholders: {"{{REFERENCIAS_SUMMARY}}"}, {"{{LINGUAGEM}}"}, {"{{PROMPT_ESTILO_IMAGEM}}"}, {"{{FICHA_PERSONAGEM}}"}, {"{{CHARACTER_IDENTITY_RULE}}"}, {"{{HISTORIA}}"}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[280px] font-mono text-sm"
                  value={prompts.storyWithImageBaseUser ?? ""}
                  onChange={(e) => updatePrompt("storyWithImageBaseUser", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.storyWithImageBaseUser}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regras" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Regra de identidade do personagem</CardTitle>
                <CardDescription>
                  Texto injetado nos prompts de imagem para manter consistência facial e visual.
                  Usado como placeholder {"{{CHARACTER_IDENTITY_RULE}}"} nos prompts de história.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[160px] font-mono text-sm"
                  value={prompts.characterIdentityRule ?? ""}
                  onChange={(e) => updatePrompt("characterIdentityRule", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.characterIdentityRule}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
