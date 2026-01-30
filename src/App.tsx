import type React from "react"

import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/hooks/use-auth"
import Login from "@/pages/Login"
import ResetPassword from "@/pages/ResetPassword"
import Dashboard from "@/pages/Dashboard"
import MeusLivros from "@/pages/MeusLivros"
import CriarLivro from "@/pages/CriarLivro"
import VisualizarLivro from "@/pages/VisualizarLivro"
import Configuracoes from "@/pages/Configuracoes"
import Layout from "@/components/Layout"
import { Loading } from "@/components/Loading"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meus-livros"
          element={
            <ProtectedRoute>
              <Layout>
                <MeusLivros />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/criar-livro"
          element={
            <ProtectedRoute>
              <Layout>
                <CriarLivro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/livro/preview"
          element={
            <ProtectedRoute>
              <Layout>
                <VisualizarLivro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/livro/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <VisualizarLivro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute>
              <Layout>
                <Configuracoes />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
