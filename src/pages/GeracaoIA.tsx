import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WandSparkles, Save, Loader2, AlertCircle, ChevronRight, ChevronDown, Play, Upload, Database, Bot, Image, BookOpen, CheckCircle } from "lucide-react"
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

const PLACEHOLDER_TOOLTIPS: Record<string, string> = {
  HISTORIA: "Substituído pela história base escrita pelo usuário.",
  REFERENCIAS_SUMMARY: "Resumo dos personagens e papéis (nome e papel de cada imagem de referência).",
  ESTILO_IMAGEM: "Estilo de imagem escolhido (ex: Ilustração Digital, Cartoon).",
  LINGUAGEM: "Linguagem/estilo do texto (ex: infantil, direto).",
  CHARACTER_IDENTITY_RULE: "Texto da regra de identidade do personagem, definido na aba Regras de Personagem.",
  PROMPT_ESTILO_IMAGEM: "Prompt de estilo visual gerado pelo GPT na etapa de Prompts de Imagem.",
  FICHA_PERSONAGEM: "Ficha de personagem (character bible) gerada pelo GPT na etapa de Prompts de Imagem.",
}

const placeholderTagClassName =
  "inline-flex items-center rounded bg-[#6D56AB]/20 px-1 py-0.5 font-mono text-xs font-medium text-[#4a3b75] dark:bg-[#6D56AB]/30 dark:text-[#9982fc] transition-colors hover:bg-[#6D56AB]/35 hover:text-[#3d2d6b] dark:hover:bg-[#6D56AB]/40 dark:hover:text-[#b8a8f0] cursor-help"

function PlaceholderText({ text, tagClassName }: { text: string; tagClassName?: string }) {
  const parts = text.split(/(\{\{[^}]+\}\})/g)
  const tagClass = tagClassName ?? placeholderTagClassName
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{([^}]+)\}\}$/)
        if (match) {
          const key = match[1]
          const tooltip = PLACEHOLDER_TOOLTIPS[key] ?? `Substituído pelo sistema ao gerar o conteúdo.`
          return (
            <span key={i} className={tagClass} title={tooltip}>
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

const textareaTagClassName =
  "inline-flex items-center rounded bg-[#6D56AB]/20 px-1 py-0.5 font-mono text-sm font-medium text-[#4a3b75] dark:bg-[#6D56AB]/30 dark:text-[#9982fc] pointer-events-auto cursor-text transition-colors hover:bg-[#6D56AB]/35 hover:text-[#3d2d6b] dark:hover:bg-[#6D56AB]/40 dark:hover:text-[#b8a8f0]"

function TextareaWithPlaceholderTags(
  props: React.ComponentProps<"textarea"> & { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }
) {
  const { value, onChange, className = "", ...rest } = props
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (textareaRef.current) {
      if (mirrorRef.current) {
        mirrorRef.current.scrollTop = textareaRef.current.scrollTop
        mirrorRef.current.scrollLeft = textareaRef.current.scrollLeft
      }
      if (overlayRef.current) {
        overlayRef.current.scrollTop = textareaRef.current.scrollTop
        overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
      }
    }
  }

  const handleTagClick = (startIndex: number) => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    ta.setSelectionRange(startIndex, startIndex)
  }

  const mirrorContent = (() => {
    if (!value) return <span className="text-muted-foreground">{" "}</span>
    const parts = value.split(/(\{\{[^}]+\}\})/g)
    let index = 0
    return (
      <>
        {parts.map((part, i) => {
          const match = part.match(/^\{\{([^}]+)\}\}$/)
          if (match) {
            const key = match[1]
            const tooltip = PLACEHOLDER_TOOLTIPS[key] ?? "Substituído pelo sistema ao gerar o conteúdo."
            const startIndex = index
            index += part.length
            return (
              <span
                key={i}
                className={textareaTagClassName}
                title={tooltip}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleTagClick(startIndex)
                }}
              >
                {part}
              </span>
            )
          }
          index += part.length
          return <span key={i} className="pointer-events-none">{part}</span>
        })}
      </>
    )
  })()

  const overlayContent = (() => {
    if (!value) return <span className="invisible">{" "}</span>
    const parts = value.split(/(\{\{[^}]+\}\})/g)
    let index = 0
    return (
      <>
        {parts.map((part, i) => {
          const match = part.match(/^\{\{([^}]+)\}\}$/)
          if (match) {
            const key = match[1]
            const tooltip = PLACEHOLDER_TOOLTIPS[key] ?? "Substituído pelo sistema ao gerar o conteúdo."
            const startIndex = index
            index += part.length
            return (
              <span
                key={i}
                className={`${textareaTagClassName} cursor-help`}
                title={tooltip}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleTagClick(startIndex)
                }}
              >
                {part}
              </span>
            )
          }
          index += part.length
          return <span key={i} className="pointer-events-none text-transparent select-none">{part}</span>
        })}
      </>
    )
  })()

  const baseClass = "rounded-md px-3 py-2 text-sm font-mono overflow-auto w-full"
  const mirrorClass = `${baseClass} bg-background text-foreground whitespace-pre-wrap border-transparent absolute inset-0 [&>*]:pointer-events-none`
  const overlayClass = `${baseClass} whitespace-pre-wrap border-transparent absolute inset-0 cursor-text [&>*]:pointer-events-none [&_span[title]]:pointer-events-auto`
  const textareaClass = `${baseClass} bg-transparent absolute inset-0 text-transparent caret-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder:!text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none border-0 [&::placeholder]:opacity-100`

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (!target.hasAttribute("title")) {
      textareaRef.current?.focus()
    }
  }

  return (
    <div className={`relative w-full border border-input rounded-md overflow-hidden ${className}`.trim()}>
      <div ref={mirrorRef} className={mirrorClass} aria-hidden>
        <span className="inline-block min-h-full w-full align-top">
          {mirrorContent}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        className={textareaClass}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        spellCheck={false}
        {...rest}
      />
      <div ref={overlayRef} className={overlayClass} aria-hidden onMouseDown={handleOverlayMouseDown}>
        <span className="inline-block min-h-full w-full align-top">
          {overlayContent}
        </span>
      </div>
    </div>
  )
}

const flowVariants = {
  user: "border-blue-300 bg-blue-50 dark:bg-blue-950/30",
  gpt: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30",
  fal: "border-amber-400 bg-amber-50 dark:bg-amber-950/30",
  database: "border-violet-300 bg-violet-50 dark:bg-violet-950/30",
  external: "border-slate-300 bg-slate-100 dark:bg-slate-800/50",
  code: "border-cyan-300 bg-cyan-50 dark:bg-cyan-950/30",
  success: "border-green-400 bg-green-50 dark:bg-green-950/30",
} as const

function FlowNode({
  icon: Icon,
  title,
  subtitle,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  variant: keyof typeof flowVariants
}) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3 shadow-sm min-w-[280px] max-w-md ${flowVariants[variant]}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-black/20">
        <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

function FlowEdge() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-4 w-px bg-[#6D56AB]/50" />
      <ChevronDown className="h-4 w-4 text-[#6D56AB]/60" />
    </div>
  )
}

export default function GeracaoIA() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState(DEFAULT_AI_MODEL)
  const [tempDefault, setTempDefault] = useState(DEFAULT_TEMPERATURE)
  const [tempImagePrompts, setTempImagePrompts] = useState(DEFAULT_TEMPERATURE_IMAGE_PROMPTS)
  const [tempStory, setTempStory] = useState(DEFAULT_TEMPERATURE_STORY)
  const [prompts, setPrompts] = useState<AIPromptsConfig>(DEFAULT_AI_PROMPTS)
  const [detailOpen, setDetailOpen] = useState<Record<string, boolean>>({})

  const toggleDetail = (key: string) => {
    setDetailOpen((prev) => ({ ...prev, [key]: !prev[key] }))
  }

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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6D56AB]" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
      <div className="p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D56AB] to-[#4a3b75] text-white shadow-sm">
            <WandSparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: "#262626" }}>
              Geração IA
            </h1>
            <p className="text-muted-foreground">
              Modelo, temperatura e prompts usados na criação dos livros
            </p>
          </div>
        </div>
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-white border rounded-lg">
            <TabsTrigger value="geral">Modelo e Temperatura</TabsTrigger>
            <TabsTrigger value="prompts-imagem">Prompts de Imagem</TabsTrigger>
            <TabsTrigger value="prompts-historia">Prompts de História</TabsTrigger>
            <TabsTrigger value="regras">Regras de Personagem</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo de Geração</TabsTrigger>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Temperatura padrão</Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={tempDefault}
                    onChange={(e) => setTempDefault(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prompts de imagem</Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={tempImagePrompts}
                    onChange={(e) => setTempImagePrompts(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>História (cartoon / com base)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={tempStory}
                    onChange={(e) => setTempStory(Number(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompts-imagem" className="space-y-8">
            {/* Ilustração Digital */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#6D56AB]/30 pb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6D56AB]/20 to-[#4a3b75]/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#4a3b75]">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ilustração Digital</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Usado quando o estilo da imagem é &quot;Ilustração Digital&quot;. Gera prompt_personagem, prompt_estilo_imagem e ficha_personagem que depois são usados na geração de cada cena.
              </p>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">System (Ilustração Digital)</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#6D56AB] hover:text-[#4a3b75] hover:bg-[#6D56AB]/10"
                      onClick={() => toggleDetail("imageSystem")}
                    >
                      {detailOpen["imageSystem"] ? "Menos detalhes" : "Mais detalhes"}
                      {detailOpen["imageSystem"] ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                    </Button>
                  </div>
                  {detailOpen["imageSystem"] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Qual IA usa esse prompt</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            GPT (OpenAI). Este prompt é enviado na chamada que gera prompt_personagem, prompt_estilo_imagem e ficha_personagem.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Etapa</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Chamada única à IA antes de gerar a história — só prepara os &quot;ingredientes&quot; visuais.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Para que serve</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Define o papel da IA (especialista em prompts) e exige que a resposta seja um JSON com três chaves: prompt_personagem, prompt_estilo_imagem e ficha_personagem. Não contém a história nem as referências; isso vai na mensagem do usuário.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <TextareaWithPlaceholderTags
                    className="min-h-[160px] font-mono text-sm"
                    value={prompts.imagePromptsSystem ?? ""}
                    onChange={(e) => updatePrompt("imagePromptsSystem", e.target.value)}
                    placeholder={DEFAULT_AI_PROMPTS.imagePromptsSystem}
                  />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Mensagem do usuário (Ilustração Digital)</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#6D56AB] hover:text-[#4a3b75] hover:bg-[#6D56AB]/10"
                      onClick={() => toggleDetail("imageUser")}
                    >
                      {detailOpen["imageUser"] ? "Menos detalhes" : "Mais detalhes"}
                      {detailOpen["imageUser"] ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                    </Button>
                  </div>
                  {detailOpen["imageUser"] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Qual IA usa esse prompt</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            GPT (OpenAI). Enviado junto com o System na mesma chamada para gerar os prompts e a ficha de personagem.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Etapa</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Entrada de contexto daquela criação (história, personagens, estilo) para a IA preencher o JSON.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Para que serve</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            <PlaceholderText text="Envia à IA a história base, o resumo dos personagens e papéis e o estilo desejado, para ela gerar o prompt do personagem, o prompt de estilo e a ficha de personagem usados depois em cada cena. Placeholders: {{HISTORIA}}, {{REFERENCIAS_SUMMARY}}, {{ESTILO_IMAGEM}}." />
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <TextareaWithPlaceholderTags
                    className="min-h-[200px] font-mono text-sm"
                    value={prompts.imagePromptsUser ?? ""}
                    onChange={(e) => updatePrompt("imagePromptsUser", e.target.value)}
                    placeholder={DEFAULT_AI_PROMPTS.imagePromptsUser}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Cartoon */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#6D56AB]/30 pb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6D56AB]/20 to-[#4a3b75]/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#4a3b75]">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cartoon</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Usado quando o estilo da imagem é &quot;Cartoon&quot;. Esses prompts geram a história e as descrições de cada cena já no estilo cartoon (linhas limpas, iluminação equilibrada).
              </p>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">System (Cartoon)</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#6D56AB] hover:text-[#4a3b75] hover:bg-[#6D56AB]/10"
                      onClick={() => toggleDetail("cartoonSystem")}
                    >
                      {detailOpen["cartoonSystem"] ? "Menos detalhes" : "Mais detalhes"}
                      {detailOpen["cartoonSystem"] ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                    </Button>
                  </div>
                  {detailOpen["cartoonSystem"] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Qual IA usa esse prompt</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            GPT (OpenAI). Usado na geração da história e das descrições de imagem quando o estilo é Cartoon.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Etapa</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Primeira chamada à IA neste fluxo — define as regras da história e do estilo visual antes de receber o contexto.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Para que serve</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Define que a IA deve criar uma história infantil em 3 páginas, em PT-BR, com descrição da imagem em inglês e saída em JSON. Estabelece o &quot;persona&quot; e o formato, sem ainda incluir personagens nem história; isso vai na mensagem do usuário.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <TextareaWithPlaceholderTags
                    className="min-h-[140px] font-mono text-sm"
                    value={prompts.storyCartoonSystem ?? ""}
                    onChange={(e) => updatePrompt("storyCartoonSystem", e.target.value)}
                    placeholder={DEFAULT_AI_PROMPTS.storyCartoonSystem}
                  />
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">Mensagem do usuário (Cartoon)</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#6D56AB] hover:text-[#4a3b75] hover:bg-[#6D56AB]/10"
                      onClick={() => toggleDetail("cartoonUser")}
                    >
                      {detailOpen["cartoonUser"] ? "Menos detalhes" : "Mais detalhes"}
                      {detailOpen["cartoonUser"] ? <ChevronDown className="ml-1 h-4 w-4" /> : <ChevronRight className="ml-1 h-4 w-4" />}
                    </Button>
                  </div>
                  {detailOpen["cartoonUser"] && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Qual IA usa esse prompt</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            GPT (OpenAI). Enviado junto com o System (Cartoon) na mesma chamada para gerar história e descrições de cena.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Etapa</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Entrada de contexto para a IA gerar a história e as descrições de cada cena no estilo cartoon.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                      <Card className="border border-[#6D56AB]/20 bg-[#6D56AB]/5">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm font-semibold text-[#4a3b75]">Para que serve</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            <PlaceholderText text="Envia personagens e papéis, linguagem, estilo da imagem (cartoon), regras de identidade do personagem e a história base, para a IA devolver o JSON com o texto de cada página e a descrição da ilustração (em inglês, estilo cartoon). Placeholders: {{REFERENCIAS_SUMMARY}}, {{LINGUAGEM}}, {{ESTILO_IMAGEM}}, {{CHARACTER_IDENTITY_RULE}}, {{HISTORIA}}." />
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <TextareaWithPlaceholderTags
                    className="min-h-[220px] font-mono text-sm"
                    value={prompts.storyCartoonUser ?? ""}
                    onChange={(e) => updatePrompt("storyCartoonUser", e.target.value)}
                    placeholder={DEFAULT_AI_PROMPTS.storyCartoonUser}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Fal.ai (Nano Banana) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#6D56AB]/30 pb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6D56AB]/20 to-[#4a3b75]/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#4a3b75]">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Fal.ai (Nano Banana)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                O Fal.ai gera cada ilustração (uma por cena). O prompt é montado pelo sistema; a única parte que você edita é a <strong>Regra de identidade do personagem</strong>, na aba <strong>Regras de Personagem</strong>.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="prompts-historia" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>História estilo cartoon (system)</CardTitle>
                <CardDescription>Usado quando o estilo da imagem é cartoon.</CardDescription>
              </CardHeader>
              <CardContent>
                <TextareaWithPlaceholderTags
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
                <CardDescription><PlaceholderText text="Placeholders: {{REFERENCIAS_SUMMARY}}, {{LINGUAGEM}}, {{ESTILO_IMAGEM}}, {{CHARACTER_IDENTITY_RULE}}, {{HISTORIA}}." /></CardDescription>
              </CardHeader>
              <CardContent>
                <TextareaWithPlaceholderTags
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
                <TextareaWithPlaceholderTags
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
                  <PlaceholderText text="Placeholders: {{REFERENCIAS_SUMMARY}}, {{LINGUAGEM}}, {{PROMPT_ESTILO_IMAGEM}}, {{FICHA_PERSONAGEM}}, {{CHARACTER_IDENTITY_RULE}}, {{HISTORIA}}." />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TextareaWithPlaceholderTags
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
                  <PlaceholderText text="Usado como placeholder {{CHARACTER_IDENTITY_RULE}} nos prompts de história." />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TextareaWithPlaceholderTags
                  className="min-h-[160px] font-mono text-sm"
                  value={prompts.characterIdentityRule ?? ""}
                  onChange={(e) => updatePrompt("characterIdentityRule", e.target.value)}
                  placeholder={DEFAULT_AI_PROMPTS.characterIdentityRule}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fluxo" className="space-y-0">
            <p className="text-sm text-muted-foreground mb-6">
              Fluxo atual de geração de livro, do clique em &quot;Criar Livro&quot; até o livro finalizado. Cada nó representa uma etapa; as conexões mostram a ordem de execução.
            </p>
            <div className="relative rounded-xl border-2 border-[#6D56AB]/20 bg-[#fafafa] dark:bg-gray-900/50 p-8 min-h-[600px]" style={{ backgroundImage: "radial-gradient(circle, #6D56AB 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
              {/* Nós do fluxo em estilo n8n */}
              <div className="relative z-10 flex flex-col items-center gap-0">
                {/* 1. Início */}
                <FlowNode icon={Play} title="Usuário clica em Criar Livro" subtitle="Preenche título, história, referências, estilo (Ilustração Digital ou Cartoon)" variant="user" />
                <FlowEdge />
                {/* 2. Upload */}
                <FlowNode icon={Upload} title="Upload da imagem base" subtitle="ImgBB — imagem de referência principal" variant="external" />
                <FlowEdge />
                {/* 3. Banco */}
                <FlowNode icon={Database} title="Criar registro do livro" subtitle="Supabase — tabela books (status: Em Criação)" variant="database" />
                <FlowEdge />
                {/* 4. Ramo: Ilustração Digital? */}
                <div className="flex flex-col items-center w-full max-w-md">
                  <div className="rounded-lg border-2 border-amber-500/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">Decisão</p>
                    <p className="text-sm font-medium">Estilo = Ilustração Digital?</p>
                  </div>
                  <div className="flex gap-8 mt-4 w-full justify-center flex-wrap">
                    <div className="flex flex-col items-center flex-1 min-w-[200px]">
                      <p className="text-xs text-muted-foreground mb-2">Sim</p>
                      <FlowEdge />
                      <FlowNode icon={Bot} title="GPT: Prompts de Imagem" subtitle="System + User → prompt_personagem, prompt_estilo_imagem, ficha_personagem" variant="gpt" />
                    </div>
                    <div className="flex flex-col items-center flex-1 min-w-[200px]">
                      <p className="text-xs text-muted-foreground mb-2">Não (Cartoon)</p>
                      <FlowEdge />
                      <div className="rounded-lg border-2 border-gray-200 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-center min-h-[72px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Segue direto para História</p>
                      </div>
                    </div>
                  </div>
                </div>
                <FlowEdge />
                {/* 5. GPT História */}
                <FlowNode icon={BookOpen} title="GPT: História (3 páginas)" subtitle="Cartoon: system+user. Ilustração: system+user com base. → JSON texto + descrição imagem por página" variant="gpt" />
                <FlowEdge />
                {/* 6. Loop: para cada página */}
                <div className="rounded-lg border-2 border-[#6D56AB]/40 bg-[#6D56AB]/10 px-4 py-3 text-center">
                  <p className="text-xs font-semibold uppercase text-[#4a3b75]">Para cada página (1, 2, 3)</p>
                </div>
                <FlowEdge />
                <div className="flex flex-col items-center gap-0 max-w-md">
                  <FlowNode icon={Image} title="Montar prompt da cena" subtitle="buildPagePrompt: descrição + personagem + estilo + ficha + regra identidade" variant="code" />
                  <FlowEdge />
                  <FlowNode icon={Bot} title="Fal.ai Nano Banana" subtitle="Edit: gera a ilustração a partir do prompt + imagem anterior" variant="fal" />
                  <FlowEdge />
                  <FlowNode icon={Database} title="Salvar página" subtitle="Supabase — tabela pages_livro (texto + URL da imagem)" variant="database" />
                </div>
                <FlowEdge />
                {/* 7. Fim */}
                <FlowNode icon={CheckCircle} title="Livro finalizado" subtitle="Atualiza status do livro para Finalizado" variant="success" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-[#6D56AB] hover:bg-[#5a4789]">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
