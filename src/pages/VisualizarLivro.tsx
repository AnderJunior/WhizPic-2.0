"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ChevronLeft, ChevronRight, Edit, Share2, Download, ArrowLeft } from "lucide-react"
import { Loading } from "@/components/Loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { getBookWithPages } from "@/lib/books-api"

interface Page {
  number: number
  type: "cover" | "content"
  image: string
  text: string
}

interface BookDisplay {
  id: number
  title: string
  theme: string
  audience: string
  language: string
  pages: Page[]
}

export default function VisualizarLivro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isPreview = location.pathname === "/livro/preview"
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(0)
  const [book, setBook] = useState<BookDisplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBook() {
      // Se for preview, usa dados mockados
      if (isPreview) {
        const mockBook: BookDisplay = {
          id: 0,
          title: "Meu Livro Criado",
          theme: "Aventura",
          audience: "Crianças",
          language: "Infantil",
          pages: [
            {
              number: 0,
              type: "cover",
              image: "/placeholder.svg",
              text: "",
            },
            {
              number: 1,
              type: "content",
              image: "/placeholder.svg",
              text: "Era uma vez um pequeno explorador que vivia em uma pequena vila. Ele sempre sonhava em descobrir o mundo além das montanhas que cercavam seu lar.",
            },
            {
              number: 2,
              type: "content",
              image: "/placeholder.svg",
              text: "Um dia, o explorador decidiu embarcar em uma grande aventura. Ele pegou sua mochila, seu mapa antigo e partiu em busca de tesouros escondidos.",
            },
            {
              number: 3,
              type: "content",
              image: "/placeholder.svg",
              text: "Pelo caminho, encontrou criaturas mágicas e fez novos amigos. Cada passo era uma nova descoberta, cada encontro uma nova amizade.",
            },
            {
              number: 4,
              type: "content",
              image: "/placeholder.svg",
              text: "No final de sua jornada, o explorador percebeu que o verdadeiro tesouro não estava escondido em um baú, mas sim nas memórias e amizades que construiu pelo caminho.",
            },
          ],
        }
        setBook(mockBook)
        setLoading(false)
        return
      }

      if (!id || !user?.id) {
        setError("Usuário não autenticado")
        setLoading(false)
        return
      }

      try {
        const bookId = parseInt(id, 10)
        if (isNaN(bookId)) {
          setError("ID do livro inválido")
          setLoading(false)
          return
        }

        const bookData = await getBookWithPages(bookId, user.id)

        if (!bookData) {
          setError("Livro não encontrado")
          setLoading(false)
          return
        }

        // Transforma os dados do Supabase para o formato esperado
        const pages: Page[] = []

        // Primeira página é sempre a capa (se houver cover_image_url na primeira página)
        if (bookData.pages.length > 0 && bookData.pages[0].cover_image_url) {
          pages.push({
            number: 0,
            type: "cover",
            image: bookData.pages[0].cover_image_url || "/placeholder.svg",
            text: "",
          })
        }

        // Adiciona as páginas de conteúdo
        bookData.pages.forEach((page) => {
          if (page.story_description) {
            pages.push({
              number: pages.length,
              type: "content",
              image: page.cover_image_url || "/placeholder.svg",
              text: page.story_description,
            })
          }
        })

        // Se não houver páginas, cria uma página vazia
        if (pages.length === 0) {
          pages.push({
            number: 0,
            type: "content",
            image: "/placeholder.svg",
            text: "Este livro ainda não tem páginas.",
          })
        }

        const bookDisplay: BookDisplay = {
          id: bookData.id,
          title: bookData.titulo || "Sem título",
          theme: bookData.categoria_livro || "Não especificado",
          audience: bookData.publico_alvo || "Não especificado",
          language: bookData.lingaguem_livro || "Não especificado",
          pages,
        }

        setBook(bookDisplay)
      } catch (err) {
        console.error("Erro ao carregar livro:", err)
        setError("Erro ao carregar o livro. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    loadBook()
  }, [id, user?.id, isPreview])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
        <Loading message="Carregando livro..." />
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4 text-xl font-semibold text-primary">Erro ao carregar livro</h2>
            <p className="mb-6 text-muted-foreground">{error || "Livro não encontrado"}</p>
            <Button onClick={() => navigate("/meus-livros")}>Voltar para Meus Livros</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalPages = book.pages.length
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copiado para a área de transferência!")
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="font-semibold" style={{ color: '#262626' }}>{book.title}</h1>
              <p className="text-xs text-muted-foreground">
                {totalPages > 0 ? `Página ${currentPage + 1} de ${totalPages}` : "Sem páginas"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de edição em desenvolvimento")}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={() => alert("Download em desenvolvimento")}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Carrossel Principal - Esquerda */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {book.pages.length > 0 ? (
            <div className="w-full max-w-4xl">
              {/* Carrossel Principal - Página Atual */}
              <div className="relative mb-6">
                <Card className="overflow-hidden border shadow-lg">
                  {book.pages[currentPage]?.type === "cover" ? (
                    <div className="grid md:grid-cols-2">
                      {/* Image Side */}
                      <div className="aspect-square bg-gray-50 md:aspect-auto md:h-[500px]">
                        <img
                          src={book.pages[currentPage].image || "/placeholder.svg"}
                          alt="Capa do livro"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {/* Title Side */}
                      <div className="flex flex-col justify-center bg-white p-6 md:p-8">
                        <div className="mb-4 text-sm font-medium text-[#6D56AB]">Capa</div>
                        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900">
                          {book.title}
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2">
                      {/* Image Side */}
                      <div className="aspect-square bg-gray-50 md:aspect-auto md:h-[500px]">
                        <img
                          src={book.pages[currentPage]?.image || "/placeholder.svg"}
                          alt={`Página ${currentPage + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {/* Text Side */}
                      <div className="flex flex-col justify-center bg-white p-6 md:p-8">
                        <div className="mb-4 text-sm font-medium text-[#6D56AB]">Página {currentPage + 1}</div>
                        <p className="text-balance text-base leading-relaxed text-gray-800">
                          {book.pages[currentPage]?.text || "Sem conteúdo"}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Navigation Arrows */}
                <div className="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 items-center justify-between pointer-events-none">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="pointer-events-auto h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="pointer-events-auto h-10 w-10 rounded-full bg-white/90 shadow-md hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Carrossel de Miniaturas - Embaixo */}
              <div className="border-t bg-white pt-4 pb-4">
                <div className="overflow-x-auto px-2">
                  <div className="flex gap-3 justify-center pb-2">
                    {book.pages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`flex-shrink-0 transition-all transform hover:scale-105 focus:outline-none ${
                          currentPage === index ? "opacity-100" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <div className={`w-20 h-28 md:w-24 md:h-32 overflow-hidden rounded-md bg-gray-100 border-2 transition-colors ${
                          currentPage === index ? "border-[#6D56AB]" : "border-gray-200"
                        }`}>
                          <img
                            src={page.image || "/placeholder.svg"}
                            alt={`Página ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className={`mt-1 text-center text-xs font-medium ${
                          currentPage === index ? "text-[#6D56AB]" : "text-muted-foreground"
                        }`}>
                          {page.type === "cover" ? "Capa" : `${index + 1}`}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="mt-4 flex items-center justify-between px-4 pb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Página Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentPage + 1}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    className="bg-transparent"
                  >
                    Próxima Página
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border shadow-lg">
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                <p className="text-muted-foreground">Este livro ainda não tem páginas.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Card de Informações - Direita */}
        <div className="hidden w-80 lg:block">
          <Card className="sticky top-6 border shadow-lg">
            <CardContent className="p-4">
              <h3 className="mb-6 text-lg font-semibold" style={{ color: '#262626' }}>
                Informações do Livro
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Título</p>
                  <p className="text-base font-semibold">{book.title}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Tema</p>
                  <p className="text-base">{book.theme}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Público-Alvo</p>
                  <p className="text-base">{book.audience}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Linguagem</p>
                  <p className="text-base capitalize">{book.language}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Total de Páginas</p>
                  <p className="text-base">{totalPages} páginas</p>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t pt-4">
                <Button variant="outline" className="w-full bg-transparent" onClick={() => navigate("/criar-livro")}>
                  Criar Outro Livro
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => navigate("/meus-livros")}>
                  Ver Meus Livros
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
