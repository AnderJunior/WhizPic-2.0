"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth-next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Plus, Book, TrendingUp, Users, Clock, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

const recentBooks = [
  {
    id: 1,
    title: "A Aventura do Pequeno Explorador",
    status: "Publicado",
    target: "Crianças",
    pages: 24,
    createdAt: "2024-01-15",
    cover: "/children-adventure-book-cover.jpg",
  },
  {
    id: 2,
    title: "Mistérios da Floresta Encantada",
    status: "Em Edição",
    target: "Adolescentes",
    pages: 18,
    createdAt: "2024-01-10",
    cover: "/mystery-forest-book-cover.jpg",
  },
  {
    id: 3,
    title: "Reflexões sobre a Vida Moderna",
    status: "Rascunho",
    target: "Adultos",
    pages: 32,
    createdAt: "2024-01-08",
    cover: "/modern-life-reflection-book.jpg",
  },
]

const stats = [
  { label: "Livros Criados", value: "12", icon: Book, change: "+2 este mês" },
  { label: "Páginas Geradas", value: "284", icon: TrendingUp, change: "+48 esta semana" },
  { label: "Leitores Alcançados", value: "1.2k", icon: Users, change: "+120 este mês" },
  { label: "Tempo Economizado", value: "48h", icon: Clock, change: "vs escrita manual" },
]

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && isAdmin) {
      router.push("/admin")
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight text-balance">Bem-vindo de volta</h1>
                <p className="text-lg text-muted-foreground">Continue criando histórias incríveis com o poder da IA</p>
              </div>
            </div>
            <Button size="lg" asChild className="gap-2">
              <Link href="/criar-livro">
                <Sparkles className="h-4 w-4" />
                Criar Novo Livro
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold">Pronto para criar algo novo?</h3>
                <p className="text-white/90 text-balance">
                  Use o poder da IA para transformar suas ideias em livros completos em minutos
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/criar-livro" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Criar Livro
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Projetos Recentes</CardTitle>
                <CardDescription className="text-base mt-1">Continue trabalhando em seus livros</CardDescription>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/meus-livros" className="gap-2">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBooks.map((book) => (
                <Link key={book.id} href={`/livro/${book.id}`}>
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer">
                    <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                      <img
                        src={book.cover || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-base line-clamp-2 text-balance group-hover:text-accent transition-colors">
                          {book.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            book.status === "Publicado"
                              ? "default"
                              : book.status === "Em Edição"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {book.status}
                        </Badge>
                        <Badge variant="outline">{book.target}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>{book.pages} páginas</span>
                        <span>{new Date(book.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
