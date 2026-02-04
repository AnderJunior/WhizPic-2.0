"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Filter, Eye, Edit, Share2, Trash2, Grid3x3, List, AlertTriangle } from "lucide-react"
import { Loading } from "@/components/Loading"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { getUserBooks, getBookPages, deleteBook } from "@/lib/books-api"

interface BookDisplay {
  id: number
  title: string
  cover: string
  status: string
  audience: string
  audienceKey: "children" | "teens" | "adults" | "all"
  theme?: string
  pages: number
  views: number
  likes: number
  createdAt: string
}

export default function MeusLivros() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [audienceFilter, setAudienceFilter] = useState<string>("all")
  const [books, setBooks] = useState<BookDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"card" | "list">("card")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<{ id: number; title: string } | null>(null)

  const normalizeAudience = (value?: string | null): BookDisplay["audienceKey"] => {
    const text = (value || "").toLowerCase()
    if (text.includes("crian") || text.includes("child")) return "children"
    if (text.includes("adolesc") || text.includes("teen")) return "teens"
    if (text.includes("adult")) return "adults"
    return "all"
  }

  const normalizeStatus = (value?: string | null) => {
    const text = (value || "").toLowerCase()
    if (text.includes("final") || text.includes("public") || text.includes("publish")) return "published"
    return "draft"
  }

  useEffect(() => {
    async function loadBooks() {
      if (!user?.id) {
        setBooks([])
        setLoading(false)
        return
      }

      try {
        const userBooks = await getUserBooks(user.id)

        // Busca o número de páginas para cada livro
        const booksWithPages = await Promise.all(
          userBooks.map(async (book) => {
            const pages = await getBookPages(book.id)
            // Busca a primeira imagem de capa (se houver)
            const firstPage = pages.find((p) => p.cover_image_url)
            const cover = firstPage?.cover_image_url || "/placeholder.svg"
            const audienceKey = normalizeAudience(book.publico_alvo)

            return {
              id: book.id,
              title: book.titulo || "Sem título",
              cover,
              status: normalizeStatus(book.status),
              audience: book.publico_alvo || "Não especificado",
              audienceKey,
              theme: book.categoria_livro || undefined,
              pages: pages.length || 0,
              views: 0,
              likes: 0,
              createdAt: book.created_at,
            }
          })
        )

        setBooks(booksWithPages)
      } catch (error) {
        console.error("Erro ao carregar livros:", error)
        toast.error("Erro ao carregar seus livros. Tente novamente.")
        setBooks([])
      } finally {
        setLoading(false)
      }
    }

    loadBooks()
  }, [user?.id])

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || book.status === statusFilter
    const matchesAudience = audienceFilter === "all" || book.audienceKey === audienceFilter
    return matchesSearch && matchesStatus && matchesAudience
  })

  const handleDeleteClick = (bookId: number, bookTitle: string) => {
    setBookToDelete({ id: bookId, title: bookTitle })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookToDelete || !user?.id) {
      toast.error("Usuário não autenticado")
      setDeleteDialogOpen(false)
      setBookToDelete(null)
      return
    }

    try {
      await deleteBook(bookToDelete.id, user.id)
      toast.success(`"${bookToDelete.title}" foi excluído com sucesso`)
      // Remove o livro da lista local
      setBooks(books.filter((b) => b.id !== bookToDelete.id))
    } catch (error) {
      console.error("Erro ao excluir livro:", error)
      toast.error("Erro ao excluir o livro. Tente novamente.")
    } finally {
      setDeleteDialogOpen(false)
      setBookToDelete(null)
    }
  }

  const handleShare = (bookTitle: string) => {
    const url = `${window.location.origin}/livro/${books.find((b) => b.title === bookTitle)?.id}`
    navigator.clipboard.writeText(url)
    toast.success(`Link de compartilhamento copiado para "${bookTitle}"`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
        <Loading message="Carregando seus livros..." />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#262626' }}>Meus Livros</h1>
          <p className="text-muted-foreground">Gerencie todos os seus livros criados</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar livros..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="children">Crianças</SelectItem>
                    <SelectItem value="teens">Adolescentes</SelectItem>
                    <SelectItem value="adults">Adultos</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "card" ? "default" : "ghost"}
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setViewMode("card")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{books.length}</div>
              <p className="text-sm text-muted-foreground">Total de Livros</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {books.filter((b) => b.status === "published" || b.status === "Publicado").length}
              </div>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {books.reduce((acc, b) => acc + b.pages, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total de Páginas</p>
            </CardContent>
          </Card>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-6">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-primary">Nenhum livro encontrado</h3>
              <p className="mb-6 text-muted-foreground">Tente ajustar os filtros ou criar um novo livro</p>
              <Link to="/criar-livro">
                <Button>Criar Novo Livro</Button>
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === "card" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card 
                key={book.id} 
                className="group overflow-hidden border-0 shadow-md transition-all hover:shadow-xl"
              >
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 
                    className="mb-3 line-clamp-2 font-semibold text-primary transition-colors hover:text-[#6D56AB] cursor-pointer"
                    onClick={() => navigate(`/livro/${book.id}`)}
                  >
                    {book.title}
                  </h3>
                  
                  {/* Tags e Informações */}
                  <div className="mb-4 space-y-2">
                    <div>
                      <span className="inline-block rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium">
                        {book.audience === "children" || book.audience === "Crianças" 
                          ? "Crianças 0 a 12 anos" 
                          : book.audience === "teens" || book.audience === "Adolescentes"
                          ? "Adolescentes 13 a 17 anos"
                          : "Adultos 18+ anos"}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{book.pages} páginas</p>
                      <p className="capitalize">{book.theme || "Aventura"}</p>
                      <p>Criado em {new Date(book.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}</p>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-white hover:opacity-90"
                      style={{ backgroundColor: '#6D56AB' }}
                      onClick={() => navigate(`/livro/${book.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert("Editar em desenvolvimento")
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(book.title)
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(book.id, book.title)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <Card 
                key={book.id} 
                className="group overflow-hidden border-0 shadow-md transition-all hover:shadow-xl"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Imagem */}
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Conteúdo - Título, Tags e Informações */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="mb-2 text-base font-semibold text-primary transition-colors hover:text-[#6D56AB] cursor-pointer"
                      onClick={() => navigate(`/livro/${book.id}`)}
                    >
                      {book.title}
                    </h3>
                    
                    {/* Tags e Informações */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-block rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium">
                        {book.audience === "children" || book.audience === "Crianças" 
                          ? "Crianças 0 a 12 anos" 
                          : book.audience === "teens" || book.audience === "Adolescentes"
                          ? "Adolescentes 13 a 17 anos"
                          : "Adultos 18+ anos"}
                      </span>
                      <span className="text-sm text-muted-foreground">{book.pages} páginas</span>
                      <span className="text-sm text-muted-foreground capitalize">{book.theme || "Aventura"}</span>
                      <span className="text-sm text-muted-foreground">
                        Criado em {new Date(book.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Botões de ação - À direita, centralizados verticalmente */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: '#6D56AB' }}
                      onClick={() => navigate(`/livro/${book.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert("Editar em desenvolvimento")
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(book.title)
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(book.id, book.title)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Confirmar Exclusão</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-base">
              Tem certeza que deseja excluir o livro <strong>"{bookToDelete?.title}"</strong>?
              <br />
              <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setBookToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Livro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
