"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft, Download, Share2, Edit3, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"

const bookData = {
  id: 1,
  title: "A Aventura do Pequeno Explorador",
  author: "João Silva",
  target: "Crianças",
  theme: "Aventura",
  language: "Infantil",
  totalPages: 24,
  createdAt: "15 de Jan, 2026",
  pages: [
    {
      id: 1,
      type: "cover",
      title: "A Aventura do Pequeno Explorador",
      subtitle: "Uma história de coragem e descobertas",
      image: "/placeholder.svg?height=600&width=450&text=Capa+Aventura",
    },
    {
      id: 2,
      type: "story",
      title: "Era uma vez...",
      text: "Em uma pequena cidade cercada por montanhas, vivia um menino chamado Lucas. Ele tinha apenas 8 anos, mas seus olhos brilhavam com a curiosidade de mil aventureiros.",
      image: "/placeholder.svg?height=500&width=500&text=Lucas+na+Cidade",
    },
    {
      id: 3,
      type: "story",
      title: "O Mapa Misterioso",
      text: "Um dia, enquanto brincava no sótão da casa da vovó, Lucas encontrou um mapa antigo escondido em uma caixa empoeirada. O mapa mostrava um caminho secreto através da floresta.",
      image: "/placeholder.svg?height=500&width=500&text=Mapa+Antigo",
    },
    {
      id: 4,
      type: "story",
      title: "A Jornada Começa",
      text: "Com o coração cheio de coragem, Lucas decidiu seguir o mapa. Ele preparou sua mochila com água, biscoitos e sua bússola favorita que ganhou do avô.",
      image: "/placeholder.svg?height=500&width=500&text=Lucas+Preparando",
    },
    {
      id: 5,
      type: "story",
      title: "A Floresta Encantada",
      text: "A floresta era mais bonita do que Lucas imaginava. Árvores gigantes formavam um teto verde, e pequenos raios de sol dançavam entre as folhas.",
      image: "/placeholder.svg?height=500&width=500&text=Floresta+Magica",
    },
    {
      id: 6,
      type: "story",
      title: "Novos Amigos",
      text: "No caminho, Lucas conheceu uma raposa esperta chamada Mel e um coelho saltitante chamado Pulo. Eles decidiram acompanhar Lucas em sua aventura.",
      image: "/placeholder.svg?height=500&width=500&text=Amigos+da+Floresta",
    },
    {
      id: 7,
      type: "story",
      title: "O Desafio da Ponte",
      text: "Chegaram a uma ponte antiga sobre um riacho. A ponte parecia frágil, mas era o único caminho. Lucas respirou fundo e, com cuidado, atravessou com seus novos amigos.",
      image: "/placeholder.svg?height=500&width=500&text=Ponte+Suspensa",
    },
    {
      id: 8,
      type: "story",
      title: "A Caverna Secreta",
      text: "O mapa os levou até uma caverna escondida atrás de uma cachoeira. Dentro da caverna, eles descobriram cristais brilhantes que iluminavam todo o lugar.",
      image: "/placeholder.svg?height=500&width=500&text=Caverna+Cristais",
    },
    {
      id: 9,
      type: "story",
      title: "O Tesouro Verdadeiro",
      text: "No final da caverna, não havia ouro ou joias, mas algo muito mais valioso: um livro antigo cheio de histórias de outros aventureiros corajosos.",
      image: "/placeholder.svg?height=500&width=500&text=Livro+Tesouro",
    },
    {
      id: 10,
      type: "story",
      title: "O Retorno para Casa",
      text: "Lucas, Mel e Pulo voltaram para casa com o coração cheio de alegria. Eles haviam descoberto que a verdadeira aventura estava na jornada e nas amizades que fizeram.",
      image: "/placeholder.svg?height=500&width=500&text=Retorno+Casa",
    },
    {
      id: 11,
      type: "story",
      title: "Compartilhando a História",
      text: "De volta à cidade, Lucas contou sua aventura para todos. Ele aprendeu que compartilhar experiências torna as memórias ainda mais especiais.",
      image: "/placeholder.svg?height=500&width=500&text=Contando+Historia",
    },
    {
      id: 12,
      type: "ending",
      title: "Fim",
      text: "E assim, Lucas descobriu que ser um explorador não significa apenas encontrar tesouros, mas ter coragem para descobrir o mundo e fazer novos amigos pelo caminho.",
      image: "/placeholder.svg?height=500&width=500&text=Final+Feliz",
    },
  ],
}

export default function VisualizarLivro({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(0)

  const nextPage = () => {
    if (currentPage < bookData.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentPageData = bookData.pages[currentPage]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-slate-100">
                <Link href="/meus-livros">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{bookData.title}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                  <span>{bookData.author}</span>
                  <span>•</span>
                  <span>{bookData.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stats Card */}
            <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Total de Páginas</p>
                    <p className="text-2xl font-bold text-slate-900">{bookData.totalPages}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider">Detalhes</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Público-Alvo</p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {bookData.target}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tema</p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                      {bookData.theme}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Linguagem</p>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      {bookData.language}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Navigation */}
            <Card className="border-slate-200/60 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wider mb-3">Páginas</h3>
                <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {bookData.pages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPage(index)}
                      className={`relative aspect-[3/4] rounded-lg border-2 transition-all overflow-hidden ${
                        index === currentPage
                          ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={page.image || "/placeholder.svg"}
                        alt={`Página ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                        <span className="text-white text-xs font-medium">{index + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Viewer */}
          <div className="lg:col-span-9 space-y-6">
            <Card className="border-slate-200/60 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                {currentPageData.type === "cover" ? (
                  <div className="relative min-h-[700px] flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="relative text-center space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        <span className="text-white text-sm font-medium">Gerado por IA</span>
                      </div>
                      <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl">
                        {currentPageData.title}
                      </h1>
                      <p className="text-xl text-white/90 max-w-2xl mx-auto">{currentPageData.subtitle}</p>
                      <div className="pt-4 flex items-center justify-center gap-3 text-white/80 text-sm">
                        <span>{bookData.author}</span>
                        <span>•</span>
                        <span>{bookData.totalPages} páginas</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[700px] bg-white">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Imagem */}
                      <div className="relative bg-gradient-to-br from-slate-100 to-slate-50 p-12 flex items-center justify-center">
                        <div className="relative max-w-md">
                          <img
                            src={currentPageData.image || "/placeholder.svg"}
                            alt={`Ilustração da página ${currentPage + 1}`}
                            className="w-full h-auto rounded-2xl shadow-2xl"
                          />
                          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                            IA
                          </div>
                        </div>
                      </div>

                      {/* Texto */}
                      <div className="p-12 flex flex-col justify-center">
                        <div className="space-y-6 max-w-xl">
                          <div className="inline-block">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{currentPageData.title}</h2>
                            <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                          </div>

                          <p className="text-lg leading-relaxed text-slate-700">{currentPageData.text}</p>

                          {currentPageData.type === "ending" && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/60">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                  <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-semibold text-green-900 mb-1">História Completa!</p>
                                  <p className="text-sm text-green-700">
                                    Você terminou de visualizar este livro. Que tal compartilhar com seus amigos?
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

            {/* Navigation Controls */}
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
                  Página {currentPage + 1} de {bookData.pages.length}
                </span>
                <div className="flex gap-1">
                  {bookData.pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentPage
                          ? "w-8 bg-gradient-to-r from-blue-600 to-indigo-600"
                          : "w-1.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={nextPage}
                disabled={currentPage === bookData.pages.length - 1}
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
