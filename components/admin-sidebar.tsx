"use client"

import { LayoutDashboard, Users, Package, DollarSign, BookOpen, Settings, Sparkles, LogOut } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth-next"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/admin/clientes",
    icon: Users,
  },
  {
    title: "Planos",
    url: "/admin/planos",
    icon: Package,
  },
  {
    title: "Métricas de Custos",
    url: "/admin/metricas",
    icon: DollarSign,
  },
  {
    title: "Consumo de IA",
    url: "/admin/ia-usage",
    icon: Sparkles,
  },
]

export function AdminSidebar() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-6">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Admin Panel</h2>
            <p className="text-[11px] text-muted-foreground font-medium">WhizPic</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6">
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

        <div className="mt-8 mx-2 p-5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center shadow-sm">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-0.5">Acesso Admin</h3>
              <p className="text-xs text-muted-foreground">
                {profile?.role === 'admin_master' ? 'Admin Master' : 'Administrador'}
              </p>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <SidebarMenuButton
            onClick={handleSignOut}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
