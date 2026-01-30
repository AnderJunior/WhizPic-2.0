"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Eye, Share, Trash2, Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const books = [
  {
    id: 1,
    title: "A Aventura do Pequeno Explorador",
    status: "Publicado",
    target: "Crianças",
    pages: 24,
    views: 1250,
    createdAt: "2024-01-15",
    cover: "/children-adventure-book.jpg",
  },
  {
    id: 2,
    title: "Mistérios da Floresta Encantada",
    status: "Em Edição",
    target: "Adolescentes",
    pages: 18,
    views: 0,
    createdAt: "2024-01-10",
    cover: "/mystery-forest-book.jpg",
  },
  {
    id: 3,
    title: "Reflexões sobre a Vida Moderna",
    status: "Rascunho",
    target: "Adultos",
    pages: 32,
    views: 0,
    createdAt: "2024-01-08",
    cover: "/modern-philosophy-book.jpg",
  },
  {
    id: 4,
    title: "Contos de Fadas Modernos",
    status: "Publicado",
    target: "Crianças",
    pages: 20,
    views: 890,
    createdAt: "2024-01-05",
    cover: "/fairy-tales-book.jpg",
  },
  {
    id: 5,
    title: "Guia de Programação para Iniciantes",
    status: "Em Edição",
    target: "Adultos",
    pages: 45,
    views: 0,
    createdAt: "2024-01-03",
    cover: "/programming-guide-book.jpg",
  },
]

export default function MeusLivros() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Meus Livros</h1>
                <p className="text-lg text-muted-foreground mt-1">Gerencie e organize todos os seus projetos</p>
              </div>
            </div>
            <Button size="lg" asChild className="gap-2">
              <Link href="/criar-livro">
                <Plus className="h-4 w-4" />
                Novo Livro
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Buscar por título, tema ou público..." className="pl-10 h-11" />
                </div>
              </div>
              <div className="flex gap-3">
                <Select defaultValue="todos">
                  <SelectTrigger className="w-[160px] h-11">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="edicao">Em Edição</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-[160px] h-11">
                    <SelectValue placeholder="Público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="criancas">Crianças</SelectItem>
                    <SelectItem value="adolescentes">Adolescentes</SelectItem>
                    <SelectItem value="adultos">Adultos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="border-0 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
              <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push(`/livro/${book.id}`)}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Edit className="h-3 w-3" />
                  </Button>
                  {book.status === "Publicado" && (
                    <Button size="sm" variant="secondary">
                      <Share className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-base line-clamp-2 text-balance">{book.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      book.status === "Publicado" ? "default" : book.status === "Em Edição" ? "secondary" : "outline"
                    }
                  >
                    {book.status}
                  </Badge>
                  <Badge variant="outline">{book.target}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>{book.pages} páginas</span>
                  {book.views > 0 && <span>{book.views} visualizações</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Estatísticas Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Total de Livros</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Publicados</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">2.1k</div>
                <div className="text-sm text-muted-foreground">Visualizações</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold">139</div>
                <div className="text-sm text-muted-foreground">Páginas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
