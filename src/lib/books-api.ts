import { supabase } from "./supabase"

export interface Book {
  id: number
  created_at: string
  titulo: string | null
  categoria_livro: string | null
  estilo_das_imagens: string | null
  lingaguem_livro: string | null
  status: string | null
  publico_alvo: string | null
  historia_livro: string | null
  is_public: boolean | null
  user_id: string | null
  imagens_referencia: string | null
}

export interface PageLivro {
  id: number
  created_at: string
  book_id: number | null
  story_description: string | null
  cover_image_url: string | null
}

export interface BookWithPages extends Book {
  pages: PageLivro[]
}

/**
 * Busca todos os livros do usuário autenticado
 */
export async function getUserBooks(userId: string): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar livros:", error)
    throw error
  }

  return data || []
}

/**
 * Busca um livro específico por ID (apenas se pertencer ao usuário)
 */
export async function getBookById(bookId: number, userId: string): Promise<Book | null> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // Livro não encontrado
      return null
    }
    console.error("Erro ao buscar livro:", error)
    throw error
  }

  return data
}

/**
 * Busca todas as páginas de um livro
 */
export async function getBookPages(bookId: number): Promise<PageLivro[]> {
  const { data, error } = await supabase
    .from("pages_livro")
    .select("*")
    .eq("book_id", bookId)
    .order("id", { ascending: true })

  if (error) {
    console.error("Erro ao buscar páginas do livro:", error)
    throw error
  }

  return data || []
}

/**
 * Busca um livro completo com suas páginas (apenas se pertencer ao usuário)
 */
export async function getBookWithPages(bookId: number, userId: string): Promise<BookWithPages | null> {
  const book = await getBookById(bookId, userId)
  if (!book) {
    return null
  }

  const pages = await getBookPages(bookId)

  return {
    ...book,
    pages,
  }
}

/**
 * Deleta um livro (apenas se pertencer ao usuário)
 */
export async function deleteBook(bookId: number, userId: string): Promise<void> {
  // Primeiro verifica se o livro pertence ao usuário
  const book = await getBookById(bookId, userId)
  if (!book) {
    throw new Error("Livro não encontrado ou você não tem permissão para deletá-lo")
  }

  // Deleta as páginas primeiro (devido à foreign key)
  const { error: pagesError } = await supabase.from("pages_livro").delete().eq("book_id", bookId)

  if (pagesError) {
    console.error("Erro ao deletar páginas:", pagesError)
    throw pagesError
  }

  // Deleta o livro
  const { error: bookError } = await supabase.from("books").delete().eq("id", bookId).eq("user_id", userId)

  if (bookError) {
    console.error("Erro ao deletar livro:", bookError)
    throw bookError
  }
}

/**
 * Busca o progresso de livros criados no mês atual
 */
export async function getMonthlyProgress(userId: string): Promise<{ current: number; limit: number }> {
  // Data de início do mês atual
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfMonthISO = startOfMonth.toISOString()

  // Conta os livros criados no mês atual
  const { count, error } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonthISO)

  if (error) {
    console.error("Erro ao buscar progresso mensal:", error)
    throw error
  }

  // Limite baseado no plano (50 para plano gratuito)
  const limit = 50

  return {
    current: count || 0,
    limit,
  }
}

