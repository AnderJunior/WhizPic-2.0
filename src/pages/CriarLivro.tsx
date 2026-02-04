"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { createBookWithAI } from "@/lib/book-creation"

const STEPS = [
  { id: 1, name: "Informações Básicas", description: "Título, tema e público" },
  { id: 2, name: "Imagens de Referência", description: "" },
  { id: 3, name: "História", description: "Conte sua história" },
  { id: 4, name: "Geração IA", description: "Aguarde a mágica" },
  { id: 5, name: "Criação", description: "Visualize e publique" },
]

interface ImageData {
  file: File
  descricao: string
  papel: string
}

export default function CriarLivro() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [createdBookId, setCreatedBookId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    theme: "",
    audience: "",
    language: "",
    imageStyle: "Ilustração digital",
    storyDetails: "",
    images: [] as ImageData[],
    baseImageIndex: null as number | null,
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxImages = 5
    const remainingSlots = maxImages - formData.images.length
    const filesToAdd = files.slice(0, remainingSlots)
    
    if (formData.images.length + filesToAdd.length > maxImages) {
      toast.error("Você pode adicionar no máximo 5 imagens")
      return
    }
    
    const newImages: ImageData[] = filesToAdd.map((file) => ({
      file,
      descricao: "",
      papel: "",
    }))
    
    setFormData((prev) => {
      const nextImages = [...prev.images, ...newImages]
      const nextBaseIndex = prev.baseImageIndex ?? (nextImages.length > 0 ? 0 : null)
      return { ...prev, images: nextImages, baseImageIndex: nextBaseIndex }
    })
    // Reset input para permitir adicionar a mesma imagem novamente
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index)
      let nextBaseIndex = prev.baseImageIndex
      if (nextBaseIndex === index) {
        nextBaseIndex = nextImages.length > 0 ? 0 : null
      } else if (nextBaseIndex !== null && index < nextBaseIndex) {
        nextBaseIndex -= 1
      }
      return { ...prev, images: nextImages, baseImageIndex: nextBaseIndex }
    })
  }

  const updateImageInfo = (index: number, field: keyof ImageData, value: string) => {
    setFormData({
      ...formData,
      images: formData.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      ),
    })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.theme || !formData.audience || !formData.language || !formData.imageStyle) {
          toast.error("Por favor, preencha todos os campos obrigatórios")
          return false
        }
        return true
      case 2:
        if (formData.images.length === 0) {
          toast.error("Por favor, adicione pelo menos uma imagem de referência")
          return false
        }
        if (formData.baseImageIndex === null) {
          toast.error("Selecione a imagem base para a criação das ilustrações")
          return false
        }
        const incompleteReference = formData.images.find((image) => !image.descricao.trim() || !image.papel.trim())
        if (incompleteReference) {
          toast.error("Preencha quem é na imagem e o papel na história")
          return false
        }
        return true
      case 3:
        if (!formData.storyDetails || formData.storyDetails.length < 50) {
          toast.error("Por favor, escreva uma descrição mais detalhada da história (mínimo 50 caracteres)")
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        startGeneration()
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const startGeneration = async () => {
    setCurrentStep(4)
    setIsGenerating(true)
    setGenerationProgress(0)
    setCreatedBookId(null)

    try {
      const result = await createBookWithAI(
        {
          titulo: formData.title,
          categoria: formData.theme,
          publicoAlvo: formData.audience,
          linguagem: formData.language,
          historia: formData.storyDetails,
          estiloImagem: formData.imageStyle,
          referencias: formData.images,
          baseImageIndex: formData.baseImageIndex ?? 0,
          userId: user?.id,
        },
        (progress) => setGenerationProgress(progress)
      )
      setCreatedBookId(result.bookId)
      setIsGenerating(false)
      setTimeout(() => setCurrentStep(5), 500)
    } catch (error: any) {
      console.error("Erro ao gerar livro:", error)
      toast.error(error?.message || "Erro ao gerar o livro. Tente novamente.")
      setIsGenerating(false)
      setCurrentStep(3)
    }
  }

  // Redirecionar para visualização do livro após 3 segundos no step 5
  useEffect(() => {
    if (currentStep === 5) {
      const timer = setTimeout(() => {
        if (createdBookId) {
          navigate(`/livro/${createdBookId}`)
        } else {
          navigate("/livro/preview")
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [currentStep, createdBookId, navigate])

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Livro *</Label>
              <Input
                id="title"
                placeholder="Ex: A Grande Aventura do Pequeno Explorador"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Tema do Livro *</Label>
              <Input
                id="theme"
                placeholder="Ex: Aventura, Fantasia, Educação..."
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="audience">Público-Alvo *</Label>
                <Select
                  value={formData.audience}
                  onValueChange={(value) => setFormData({ ...formData, audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="children">Crianças (3-12 anos)</SelectItem>
                    <SelectItem value="teens">Adolescentes (13-17 anos)</SelectItem>
                    <SelectItem value="adults">Adultos (18+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Linguagem *</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a linguagem" />
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
            <div className="space-y-2">
              <Label htmlFor="imageStyle">Estilo das Imagens *</Label>
              <Select
                value={formData.imageStyle}
                onValueChange={(value) => setFormData({ ...formData, imageStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ilustração digital">Ilustração digital</SelectItem>
                  <SelectItem value="Cartoon">Cartoon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Adicione até 5 imagens, escolha a base e descreva quem aparece em cada uma
              </p>
            </div>

            {formData.images.length < 5 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-600 mb-2">Clique para adicionar imagens</p>
                <p className="text-xs text-gray-400 mb-3">PNG, JPG até 10MB cada</p>
                <label htmlFor="image-upload" className="cursor-pointer inline-block">
                  <Button variant="outline" asChild>
                    <span>Selecionar Imagens</span>
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={formData.images.length >= 5}
                />
                <p className="mt-2 text-xs text-gray-400">{formData.images.length}/5 imagens adicionadas</p>
              </div>
            )}

            {formData.images.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {formData.images.map((imageData, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(imageData.file) || "/placeholder.svg"}
                        alt={`Referência ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4 space-y-4">
                      <Button
                        type="button"
                        variant={formData.baseImageIndex === index ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setFormData((prev) => ({ ...prev, baseImageIndex: index }))}
                      >
                        {formData.baseImageIndex === index ? "Imagem base selecionada" : "Usar como base"}
                      </Button>
                      <div className="space-y-2">
                        <Label htmlFor={`descricao-${index}`} className="text-sm font-medium">
                          Quem é na imagem?
                        </Label>
                        <Input
                          id={`descricao-${index}`}
                          placeholder="Ex: João, Maria, um garoto de 8 anos..."
                          value={imageData.descricao}
                          onChange={(e) => updateImageInfo(index, "descricao", e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`papel-${index}`} className="text-sm font-medium">
                          Papel na história
                        </Label>
                        <Input
                          id={`papel-${index}`}
                          placeholder="Ex: Personagem principal, Tio, Pai, Avó..."
                          value={imageData.papel}
                          onChange={(e) => updateImageInfo(index, "papel", e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {formData.images.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Adicione imagens para começar</p>
              </div>
            )}

            {formData.images.length > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <span>{formData.images.length}/5 imagens adicionadas</span>
                {formData.images.length === 5 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Limite atingido</span>
                )}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="story">Conte sua História *</Label>
              <p className="text-sm text-muted-foreground">
                Descreva detalhadamente a história que você deseja contar. Quanto mais detalhes, melhor será o
                resultado!
              </p>
              <Textarea
                id="story"
                placeholder="Era uma vez um pequeno explorador que vivia em uma pequena vila...

Descreva:
• Os personagens principais e suas características
• O cenário e ambiente da história
• A trama principal e conflitos
• A mensagem ou lição que deseja transmitir
• Qualquer detalhe específico que você gostaria de incluir"
                className="min-h-[300px] resize-none"
                value={formData.storyDetails}
                onChange={(e) => setFormData({ ...formData, storyDetails: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{formData.storyDetails.length} caracteres (mínimo 50)</p>
            </div>
          </div>
        )

      case 4:
        return null // O conteúdo será renderizado no Dialog modal abaixo

      case 5:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="rounded-lg p-12 text-center max-w-md">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-4 text-3xl font-bold whitespace-nowrap" style={{ color: '#151515' }}>Livro Criado com Sucesso!</h2>
              <p className="mb-4 text-lg whitespace-nowrap" style={{ color: '#151515' }}>
                Seu livro "{formData.title}" foi gerado com sucesso.
              </p>
              <p className="text-sm whitespace-nowrap" style={{ color: '#151515' }}>
                Redirecionando para visualização...
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#262626' }}>Criar Novo Livro</h1>
          <p className="text-muted-foreground">Siga os passos para criar seu livro com IA</p>
        </div>

        {/* Steps Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
                      currentStep > step.id
                        ? "border-green-500 bg-green-500 text-white"
                        : currentStep === step.id
                          ? "border-[#6D56AB] bg-[#6D56AB] text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 hidden text-center md:block">
                    <p
                      className={`text-xs font-medium ${
                        currentStep > step.id 
                          ? "text-green-500" 
                          : currentStep === step.id 
                            ? "text-black" 
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 ${currentStep > step.id ? "bg-green-500" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          {currentStep !== 5 && (
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
            </CardHeader>
          )}
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep !== 4 && (
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button onClick={nextStep} disabled={currentStep === 5}>
              {currentStep === 3 ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Livro
                </>
              ) : currentStep === 5 ? (
                "Concluído"
              ) : (
                <>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Modal de Geração IA - Bloqueia a tela durante a criação */}
        <Dialog 
          open={currentStep === 4} 
          modal={true}
          onOpenChange={(open) => {
            // Não permite fechar enquanto está gerando
            if (!open && isGenerating) {
              return
            }
            // Se tentar fechar e não está gerando, só permite se já terminou
            if (!open && !isGenerating && generationProgress >= 100) {
              setCurrentStep(5)
            }
          }}
        >
          <DialogContent 
            className={`sm:max-w-md ${isGenerating ? '[&>button]:hidden' : ''}`}
            onPointerDownOutside={(e) => {
              // Bloqueia fechar clicando fora enquanto está gerando
              if (isGenerating) {
                e.preventDefault()
              }
            }}
            onEscapeKeyDown={(e) => {
              // Bloqueia fechar com ESC enquanto está gerando
              if (isGenerating) {
                e.preventDefault()
              }
            }}
            onInteractOutside={(e) => {
              // Bloqueia qualquer interação externa enquanto está gerando
              if (isGenerating) {
                e.preventDefault()
              }
            }}
          >
            
            <div className="flex flex-col items-center justify-center py-8">
              <div className="mb-8 flex h-24 w-24 items-center justify-center">
                {isGenerating ? (
                  <img src="/loading-whizpic.gif" alt="Gerando" className="h-24 w-24" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#6D56AB] to-[#4a3b75]">
                    <Check className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <h2 className="mb-4 text-2xl font-bold text-primary text-center">
                {isGenerating ? "Gerando seu livro..." : "Livro gerado com sucesso!"}
              </h2>
              <p className="mb-8 text-center text-muted-foreground">
                {isGenerating
                  ? "Nossa IA está criando textos e imagens incríveis para seu livro. Isso pode levar alguns segundos."
                  : "Seu livro está pronto! Revise e publique quando estiver satisfeito."}
              </p>
              <div className="w-full max-w-md space-y-2">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">{generationProgress}% concluído</p>
              </div>

              {generationProgress > 0 && generationProgress < 100 && (
                <div className="mt-8 space-y-2 text-center text-sm text-muted-foreground">
                  {generationProgress < 30 && <p>Analisando suas referências...</p>}
                  {generationProgress >= 30 && generationProgress < 60 && <p>Gerando textos com IA...</p>}
                  {generationProgress >= 60 && generationProgress < 90 && <p>Criando ilustrações personalizadas...</p>}
                  {generationProgress >= 90 && <p>Finalizando seu livro...</p>}
                </div>
              )}

              {!isGenerating && generationProgress >= 100 && (
                <Button 
                  className="mt-6" 
                  onClick={() => {
                    // Fecha o modal e continua para a próxima etapa
                    setCurrentStep(5)
                  }}
                >
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
