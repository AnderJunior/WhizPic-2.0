import { Home, BookOpen, Settings, Library, Sparkles, TrendingUp, Menu, WandSparkles } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Meus Livros",
    url: "/meus-livros",
    icon: Library,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
  {
    title: "Geração IA",
    url: "/geracao-ia",
    icon: WandSparkles,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-foreground">BookAI</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Criação Inteligente</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
        <div className="mb-6 px-2">
          <Link
            href="/criar-livro"
            className="group relative flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <BookOpen className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Criar Livro</span>
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
                    >
                      <item.icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-8 mx-2 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-sm">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-0.5">Seu Progresso</h3>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium text-muted-foreground">Livros criados</span>
              <span className="text-2xl font-bold text-foreground">12</span>
            </div>
            <div className="h-2 bg-white/80 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-full shadow-sm transition-all duration-500"
                style={{ width: "60%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground">8 de 20 livros do plano gratuito</p>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Usuário</p>
            <p className="text-xs text-muted-foreground">Plano Gratuito</p>
          </div>
          <Menu className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}
