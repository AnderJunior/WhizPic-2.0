"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft, Download, Share2, Edit3, BookOpen, Sparkles, Check } from "lucide-react"
import { useRouter } from "next/navigation"

// Dados do livro recém-criado (preview)
const previewBookData = {
  title: "Minha História Criada",
  author: "Criado por IA",
  target: "Crianças",
  theme: "Aventura",
  language: "Infantil",
  totalPages: 16,
  pages: [
    {
      id: 1,
      type: "cover",
      title: "Minha História Criada",
      subtitle: "Uma aventura única gerada por IA",
      image: "/placeholder.svg?height=400&width=300&text=Nova+Capa",
    },
    {
      id: 2,
      type: "story",
      title: "O Início da Aventura",
      text: "Esta é a história que você criou! A IA gerou este conteúdo baseado nas suas informações e imagens de referência.",
      image: "/placeholder.svg?height=300&width=400&text=Primeira+Página",
    },
    {
      id: 3,
      type: "story",
      title: "Personagens Únicos",
      text: "Os personagens foram criados especialmente para sua história, com base no público-alvo e tema escolhidos.",
      image: "/placeholder.svg?height=300&width=400&text=Personagens+IA",
    },
    {
      id: 4,
      type: "story",
      title: "Cenários Incríveis",
      text: "Cada cenário foi cuidadosamente gerado para complementar sua narrativa e criar uma experiência visual única.",
      image: "/placeholder.svg?height=300&width=400&text=Cenários+Gerados",
    },
    {
      id: 5,
      type: "story",
      title: "Sua Visão Realizada",
      text: "A IA transformou suas ideias em uma história completa, mantendo o tom e linguagem que você escolheu.",
      image: "/placeholder.svg?height=300&width=400&text=Visão+Realizada",
    },
    {
      id: 6,
      type: "ending",
      title: "Parabéns!",
      text: "Você criou um livro único! Agora pode editá-lo, personalizá-lo ainda mais ou publicá-lo para compartilhar com o mundo.",
      image: "/placeholder.svg?height=300&width=400&text=Parabéns+Criador",
    },
  ],
}

export default function PreviewLivro() {
  const [currentPage, setCurrentPage] = useState(0)
  const router = useRouter()

  const nextPage = () => {
    if (currentPage < previewBookData.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentPageData = previewBookData.pages[currentPage]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-slate-900">{previewBookData.title}</h1>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <Check className="h-3 w-3 mr-1" />
                    Novo
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Gerado por IA agora mesmo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Publicar Livro
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Banner de sucesso */}
        <Card className="mb-8 border-green-200/60 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-green-900 mb-1">Livro criado com sucesso!</h2>
                <p className="text-sm text-green-700">
                  A IA gerou {previewBookData.pages.length} páginas personalizadas baseadas nas suas especificações.
                  Visualize abaixo ou faça ajustes.
                </p>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Ver Estatísticas
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Páginas Geradas</p>
                    <p className="text-2xl font-bold text-slate-900">{previewBookData.pages.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Configurações</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Público-Alvo</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {previewBookData.target}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tema</p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      {previewBookData.theme}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Linguagem</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      {previewBookData.language}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximas ações */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-4">Próximas Ações</h3>

                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Conteúdo
                </Button>

                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>

                <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>

                <div className="pt-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-slate-600 hover:text-slate-900"
                    size="sm"
                    onClick={() => router.push("/criar-livro")}
                  >
                    Criar Outro Livro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualizador */}
          <div className="lg:col-span-9 space-y-6">
            <Card className="border-slate-200/60 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                {currentPageData.type === "cover" ? (
                  <div className="relative min-h-[700px] flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-12">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="relative text-center space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                        <span className="text-white text-sm font-medium">Criado por IA</span>
                      </div>
                      <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
                        {currentPageData.title}
                      </h1>
                      <p className="text-xl text-white/90 max-w-2xl mx-auto">{currentPageData.subtitle}</p>
                      <div className="pt-4 flex items-center justify-center gap-3 text-white/80 text-sm">
                        <span>{previewBookData.author}</span>
                        <span>•</span>
                        <span>{previewBookData.pages.length} páginas</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[700px] bg-white">
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 p-12 flex items-center justify-center">
                        <div className="relative max-w-md">
                          <img
                            src={currentPageData.image || "/placeholder.svg"}
                            alt={`Ilustração da página ${currentPage + 1}`}
                            className="w-full h-auto rounded-2xl shadow-2xl"
                          />
                          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            IA
                          </div>
                        </div>
                      </div>

                      <div className="p-12 flex flex-col justify-center">
                        <div className="space-y-6 max-w-xl">
                          <div className="inline-block">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{currentPageData.title}</h2>
                            <div className="h-1 w-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
                          </div>

                          <p className="text-lg leading-relaxed text-slate-700">{currentPageData.text}</p>

                          {currentPageData.type === "ending" && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-blue-900 mb-1">Pronto para publicar!</p>
                                  <p className="text-sm text-blue-700">
                                    Seu livro está completo e pronto para ser compartilhado com o mundo.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Controles */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={currentPage === 0}
                className="h-12 px-6 border-slate-200 hover:bg-slate-50 disabled:opacity-40 bg-transparent"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Anterior
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-900">
                  Página {currentPage + 1} de {previewBookData.pages.length}
                </span>
                <div className="flex gap-1">
                  {previewBookData.pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentPage
                          ? "w-8 bg-gradient-to-r from-green-600 to-emerald-600"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={nextPage}
                disabled={currentPage === previewBookData.pages.length - 1}
                className="h-12 px-6 border-slate-200 hover:bg-slate-50 disabled:opacity-40 bg-transparent"
              >
                Próxima
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
