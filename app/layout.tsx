import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from "@/hooks/use-auth-next"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BookAI - Crie Livros com Inteligência Artificial",
  description: "Plataforma moderna para criar livros incríveis usando o poder da inteligência artificial",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">
        <AuthProvider>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className="flex-1 overflow-auto bg-background">{children}</main>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
