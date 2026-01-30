"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Upload, X, Wand2, ArrowRight, ArrowLeft, Eye, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const steps = [
  { id: 1, title: "Informações Básicas", description: "Defina o tema e público-alvo" },
  { id: 2, title: "Imagens de Referência", description: "Adicione até 5 imagens" },
  { id: 3, title: "História Detalhada", description: "Descreva sua história" },
  { id: 4, title: "Geração IA", description: "A IA criará seu livro" },
  { id: 5, title: "Revisão e Edição", description: "Finalize seu livro" },
]

interface ImageData {
  file: File
  descricao: string
  papel: string
}

export default function CriarLivro() {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookData, setBookData] = useState({
    title: "",
    theme: "",
    target: "",
    language: "",
    story: "",
    images: [] as ImageData[],
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = 5 - bookData.images.length
    const filesToAdd = files.slice(0, remainingSlots)
    
    if (bookData.images.length + filesToAdd.length <= 5) {
      const newImages: ImageData[] = filesToAdd.map((file) => ({
        file,
        descricao: "",
        papel: "",
      }))
      setBookData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }))
    }
    // Reset input para permitir adicionar a mesma imagem novamente
    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setBookData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const updateImageInfo = (index: number, field: keyof ImageData, value: string) => {
    setBookData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      ),
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setCurrentStep(4)

    // Simular processo de geração
    for (let i = 0; i <= 100; i += 10) {
      setGenerationProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsGenerating(false)
    setCurrentStep(5)
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-br from-background to-accent/5">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Criar Novo Livro</h1>
              <p className="text-lg text-muted-foreground mt-1">Transforme suas ideias em um livro completo com IA</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      currentStep > step.id
                        ? "bg-accent text-white"
                        : currentStep === step.id
                          ? "bg-accent text-white ring-4 ring-accent/20"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-xs font-medium">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 transition-all ${currentStep > step.id ? "bg-accent" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold">{steps[currentStep - 1].title}</h2>
          <p className="text-muted-foreground mt-1">{steps[currentStep - 1].description}</p>
        </div>

        {/* Step 1: Informações Básicas */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Informações do Livro</CardTitle>
              <CardDescription>Defina as características principais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Livro</Label>
                <Input
                  id="title"
                  placeholder="Digite o título do seu livro"
                  value={bookData.title}
                  onChange={(e) => setBookData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Tema do Livro</Label>
                <Input
                  id="theme"
                  placeholder="Ex: Aventura, Romance, Mistério, Educativo..."
                  value={bookData.theme}
                  onChange={(e) => setBookData((prev) => ({ ...prev, theme: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Público-Alvo</Label>
                  <Select
                    value={bookData.target}
                    onValueChange={(value) => setBookData((prev) => ({ ...prev, target: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o público" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criancas">Crianças (0-12 anos)</SelectItem>
                      <SelectItem value="adolescentes">Adolescentes (13-17 anos)</SelectItem>
                      <SelectItem value="adultos">Adultos (18+ anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Linguagem do Livro</Label>
                  <Select
                    value={bookData.language}
                    onValueChange={(value) => setBookData((prev) => ({ ...prev, language: value }))}
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
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload de Imagens */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Imagens de Referência</CardTitle>
              <CardDescription>Adicione até 5 imagens e descreva quem aparece em cada uma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {bookData.images.length < 5 && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Clique para adicionar imagens</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 10MB cada</p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={bookData.images.length >= 5}
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Button variant="outline" asChild disabled={bookData.images.length >= 5}>
                        <span>Selecionar Imagens</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              )}

              {bookData.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookData.images.map((imageData, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="relative group">
                        <img
                          src={URL.createObjectURL(imageData.file) || "/placeholder.svg"}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-4 space-y-4">
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

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{bookData.images.length}/5 imagens adicionadas</span>
                {bookData.images.length === 5 && <Badge variant="secondary">Limite atingido</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: História Detalhada */}
        {currentStep === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Conte sua História</CardTitle>
              <CardDescription>Descreva sua visão em detalhes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="story">Descrição da História</Label>
                <Textarea
                  id="story"
                  placeholder="Descreva sua história em detalhes. Inclua personagens, cenários, conflitos e como você gostaria que a história se desenvolvesse..."
                  className="min-h-[200px]"
                  value={bookData.story}
                  onChange={(e) => setBookData((prev) => ({ ...prev, story: e.target.value }))}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Quanto mais detalhes você fornecer, melhor será o resultado gerado pela IA.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Geração IA */}
        {currentStep === 4 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Wand2 className="h-5 w-5" />
                </div>
                Gerando seu Livro
              </CardTitle>
              <CardDescription>A IA está criando conteúdo personalizado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Geração</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 20 ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-sm">Analisando história e referências</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 40 ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-sm">Gerando imagens personalizadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 60 ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-sm">Criando textos por página</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 80 ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-sm">Organizando layout do livro</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${generationProgress >= 100 ? "bg-green-500" : "bg-muted"}`} />
                  <span className="text-sm">Finalizando criação</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Revisão e Edição */}
        {currentStep === 5 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Livro Criado com Sucesso!</CardTitle>
              <CardDescription>Revise e publique quando estiver pronto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Informações do Livro</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Título:</strong> {bookData.title}
                    </p>
                    <p>
                      <strong>Tema:</strong> {bookData.theme}
                    </p>
                    <p>
                      <strong>Público:</strong> {bookData.target}
                    </p>
                    <p>
                      <strong>Linguagem:</strong> {bookData.language}
                    </p>
                    <p>
                      <strong>Páginas Geradas:</strong> 24
                    </p>
                    <p>
                      <strong>Imagens Criadas:</strong> 12
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Preview da Capa</h3>
                  <img
                    src="/placeholder.svg?height=200&width=150"
                    alt="Capa do livro gerada"
                    className="w-32 h-40 object-cover rounded-lg border"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button size="lg" onClick={() => window.open("/livro/preview", "_blank")}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar Livro
                </Button>
                <Button size="lg">Editar Livro</Button>
                <Button variant="outline" size="lg">
                  Publicar Livro
                </Button>
                <Button variant="ghost" size="lg">
                  Salvar Rascunho
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < 3 && (
            <Button size="lg" onClick={nextStep} className="gap-2">
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {currentStep === 3 && (
            <Button size="lg" onClick={handleGenerate} disabled={!bookData.story.trim()} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Gerar Livro com IA
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
