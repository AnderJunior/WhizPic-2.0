"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Plus, TrendingUp, Eye, Download } from "lucide-react"
import { Loading } from "@/components/Loading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { getUserBooks, getBookPages } from "@/lib/books-api"

interface RecentBook {
  id: number
  title: string
  cover: string
  status: string
  pages: number
  createdAt: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [totalBooks, setTotalBooks] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [publishedBooks, setPublishedBooks] = useState(0)
  const [recentBooks, setRecentBooks] = useState<RecentBook[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userBooks = await getUserBooks(user.id)

        // Calcula estatísticas
        setTotalBooks(userBooks.length)
        setPublishedBooks(userBooks.filter((b) => b.status === "published" || b.status === "Publicado").length)

        // Busca total de páginas de todos os livros
        let pagesCount = 0
        for (const book of userBooks) {
          const pages = await getBookPages(book.id)
          pagesCount += pages.length
        }

        // Busca dados dos 3 livros mais recentes para exibição
        const booksWithPages = await Promise.all(
          userBooks.slice(0, 3).map(async (book) => {
            const pages = await getBookPages(book.id)

            // Busca a primeira imagem de capa
            const firstPage = pages.find((p) => p.cover_image_url)
            const cover = firstPage?.cover_image_url || "/placeholder.svg"

            // Formata data relativa
            const createdAt = new Date(book.created_at)
            const now = new Date()
            const diffTime = Math.abs(now.getTime() - createdAt.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            let createdAtText = ""
            if (diffDays === 0) {
              createdAtText = "Hoje"
            } else if (diffDays === 1) {
              createdAtText = "1 dia atrás"
            } else if (diffDays < 7) {
              createdAtText = `${diffDays} dias atrás`
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7)
              createdAtText = `${weeks} ${weeks === 1 ? "semana" : "semanas"} atrás`
            } else {
              const months = Math.floor(diffDays / 30)
              createdAtText = `${months} ${months === 1 ? "mês" : "meses"} atrás`
            }

            return {
              id: book.id,
              title: book.titulo || "Sem título",
              cover,
              status: book.status || "Rascunho",
              pages: pages.length,
              createdAt: createdAtText,
            }
          })
        )

        setTotalPages(pagesCount)
        setRecentBooks(booksWithPages)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id])

  const stats = [
    {
      title: "Total de Livros",
      value: totalBooks.toString(),
      change: "",
      icon: BookOpen,
      trend: "up",
    },
    {
      title: "Páginas Geradas",
      value: totalPages.toString(),
      change: "",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Livros Publicados",
      value: publishedBooks.toString(),
      change: "",
      icon: Eye,
      trend: "up",
    },
    {
      title: "Total de Páginas",
      value: totalPages.toString(),
      change: "",
      icon: Download,
      trend: "up",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
        <Loading message="Carregando dashboard..." />
      </div>
    )
  }
  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-[#6D56AB]/5">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold" style={{ color: '#262626' }}>Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo dos seus livros.</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link to="/criar-livro" className="flex-1">
            <Card className="group cursor-pointer border-2 border-dashed border-[#6D56AB]/30 bg-gradient-to-br from-[#6D56AB]/10 to-white transition-all hover:border-[#6D56AB] hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6D56AB] to-[#4a3b75] text-white shadow-md transition-transform group-hover:scale-110">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Criar Novo Livro</h3>
                  <p className="text-sm text-muted-foreground">Comece uma nova história</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/meus-livros" className="flex-1">
            <Card className="group cursor-pointer border-2 transition-all hover:border-[#6D56AB]/30 hover:shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 transition-transform group-hover:scale-110">
                  <BookOpen className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Meus Livros</h3>
                  <p className="text-sm text-muted-foreground">Ver todos os livros</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-md transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="rounded-lg bg-[#6D56AB]/10 p-2">
                  <stat.icon className="h-4 w-4 text-[#6D56AB]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-1 text-2xl font-bold text-primary">{stat.value}</div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Books */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Livros Recentes</CardTitle>
            <CardDescription>Seus últimos livros criados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBooks.length === 0 ? (
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">Você ainda não tem livros criados.</p>
                <Link to="/criar-livro">
                  <Button>Criar Primeiro Livro</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentBooks.map((book) => (
                    <Link key={book.id} to={`/livro/${book.id}`}>
                      <Card className="group overflow-hidden transition-all hover:shadow-lg">
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={book.cover || "/placeholder.svg"}
                            alt={book.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="mb-1 line-clamp-1 font-semibold text-primary">{book.title}</h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{book.pages} páginas</span>
                            <span
                              className={
                                book.status === "Publicado" || book.status === "published"
                                  ? "rounded-full bg-green-100 px-2 py-0.5 text-green-700"
                                  : "rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700"
                              }
                            >
                              {book.status === "published" || book.status === "Publicado" ? "Publicado" : "Rascunho"}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{book.createdAt}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link to="/meus-livros">
                    <Button variant="outline">Ver Todos os Livros</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
