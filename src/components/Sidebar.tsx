"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Library, Plus, Settings, TrendingUp, ChevronLeft, ChevronRight, ChevronDown, BookOpen, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { getMonthlyProgress } from "@/lib/books-api"

interface NavigationItem {
  name: string
  href?: string
  icon: any
  subItems?: { name: string; href: string; icon?: any }[]
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  {
    name: "Livros",
    icon: BookOpen,
    subItems: [
      { name: "Novo Livro", href: "/criar-livro", icon: Plus },
      { name: "Meus Livros", href: "/meus-livros", icon: Library },
    ],
  },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Geração IA", href: "/geracao-ia", icon: WandSparkles },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["Livros"]))
  const [progress, setProgress] = useState({ current: 0, limit: 50 })
  const [loadingProgress, setLoadingProgress] = useState(true)
  const location = useLocation()
  const { user, signOut } = useAuth()

  const userInitial = user?.email?.[0]?.toUpperCase() || "U"

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuName)) {
        newSet.delete(menuName)
      } else {
        newSet.add(menuName)
      }
      return newSet
    })
  }

  // Verifica se algum subitem está ativo
  const isMenuActive = (item: NavigationItem) => {
    if (item.href) {
      return location.pathname === item.href
    }
    if (item.subItems) {
      // Verifica se o pathname está em algum subItem ou se começa com /livro (para páginas de visualização)
      return item.subItems.some((subItem) => location.pathname === subItem.href) || 
             (item.name === "Livros" && location.pathname.startsWith("/livro"))
    }
    return false
  }

  useEffect(() => {
    async function loadProgress() {
      if (!user?.id) {
        setLoadingProgress(false)
        return
      }

      try {
        const progressData = await getMonthlyProgress(user.id)
        setProgress(progressData)
      } catch (error) {
        console.error("Erro ao carregar progresso:", error)
      } finally {
        setLoadingProgress(false)
      }
    }

    loadProgress()
  }, [user?.id])

  return (
    <div className={cn(
      "relative flex h-full flex-col border-r bg-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-72"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute z-10 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50",
          isCollapsed 
            ? "-right-3 top-4 h-6 w-6" 
            : "-right-3 top-4 h-6 w-6"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center justify-center transition-all",
        isCollapsed ? "p-3" : "p-2"
      )}>
        {isCollapsed ? (
          <img src="/logo-sidebar-reduzido.png" alt="WhizPic" className="h-auto w-full max-w-[40px]" />
        ) : (
          <img src="/logo-principal-whizpic.png" alt="WhizPic" className="h-auto w-full max-w-[160px]" />
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 transition-all", isCollapsed ? "px-2" : "px-3")}>
        {navigation.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isActive = isMenuActive(item)
          const isExpanded = expandedMenus.has(item.name)

          if (isCollapsed) {
            // Versão colapsada - apenas ícones
            if (hasSubItems) {
              return (
                <button
                  key={item.name}
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors",
                    "px-2",
                    isActive ? "bg-[#6D56AB]/10 text-[#4a3b75]" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  title={item.name}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#6D56AB]" : "text-gray-500")} />
                </button>
              )
            } else {
              return (
                <Link
                  key={item.name}
                  to={item.href || "#"}
                  className={cn(
                    "flex items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors",
                    "px-2",
                    isActive ? "bg-[#6D56AB]/10 text-[#4a3b75]" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  title={item.name}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#6D56AB]" : "text-gray-500")} />
                </Link>
              )
            }
          }

          // Versão expandida
          if (hasSubItems) {
            return (
              <div key={item.name} className="space-y-1">
                {/* Menu principal com subitens */}
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-colors",
                    isActive ? "bg-[#6D56AB]/10 text-[#4a3b75]" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#6D56AB]" : "text-gray-500")} />
                  <span className="flex-1 text-left">{item.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded ? "rotate-180" : "",
                      isActive ? "text-[#6D56AB]" : "text-gray-400",
                    )}
                  />
                </button>

                {/* Subitens */}
                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l-2 border-[#6D56AB]/20 pl-3">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = location.pathname === subItem.href
                      const SubIcon = subItem.icon || item.icon

                      // Todos os subitens seguem o mesmo estilo quando ativos
                      return (
                        <Link key={subItem.name} to={subItem.href}>
                          <div
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg py-2 px-3 text-sm font-medium transition-colors",
                              isSubActive
                                ? "bg-[#6D56AB] text-white hover:bg-[#5a4789]"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full",
                                isSubActive ? "bg-white" : "bg-gray-100",
                              )}
                            >
                              <SubIcon
                                className={cn("h-3 w-3", isSubActive ? "text-[#6D56AB]" : "text-gray-600")}
                              />
                            </div>
                            <span>{subItem.name}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Menu simples sem subitens
          return (
            <Link
              key={item.name}
              to={item.href || "#"}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-colors",
                isActive ? "bg-[#6D56AB]/10 text-[#4a3b75]" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[#6D56AB]" : "text-gray-500")} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Progress Card */}
      {!isCollapsed && (
        <div className="mx-3 mb-4 rounded-xl bg-gradient-to-br from-[#6D56AB]/10 to-[#9982fc]/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#6D56AB]" />
            <h3 className="text-sm font-semibold text-[#4a3b75]">Seu Progresso</h3>
          </div>
          <p className="mb-3 text-xs text-[#4a3b75]">Este mês</p>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-[#4a3b75]">Livros criados</span>
            <span className="font-bold text-[#4a3b75]">
              {loadingProgress ? "..." : `${progress.current} / ${progress.limit}`}
            </span>
          </div>
          <Progress 
            value={loadingProgress ? 0 : (progress.current / progress.limit) * 100} 
            className="h-2" 
          />
        </div>
      )}

      {/* User Footer */}
      <div className={cn("border-t transition-all", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <Avatar className={cn("border-2 border-[#6D56AB]/20 flex-shrink-0", isCollapsed ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarFallback className="bg-gradient-to-br from-[#6D56AB] to-[#4a3b75] text-white">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">Plano Gratuito</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-gray-500 hover:text-gray-900">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
