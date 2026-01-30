# Guia de Configuração do Sistema de Administração

Este guia explica como configurar e usar o sistema de administração da plataforma WhizPic.

## 📋 Pré-requisitos

1. Projeto Supabase configurado e funcionando
2. Variáveis de ambiente configuradas (NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

## 🗄️ Configuração do Banco de Dados

### Passo 1: Executar Script SQL

1. Acesse o **SQL Editor** no Supabase: https://app.supabase.com → Seu Projeto → SQL Editor
2. Copie o conteúdo do arquivo `supabase-admin-setup.sql`
3. Cole no SQL Editor e execute o script
4. Isso criará todas as tabelas necessárias:
   - `profiles` - Perfis de usuário com roles
   - `plans` - Planos de assinatura
   - `books` - Livros criados
   - `book_costs` - Custos de criação de livros
   - `ai_usage_metrics` - Métricas de consumo de IA

### Passo 2: Criar Usuário Admin Master

#### Opção A: Através da Interface do Supabase (Recomendado)

1. Acesse **Authentication** → **Users** no Supabase
2. Clique em **"Add User"**
3. Preencha:
   - Email: `admin@whizpic.com` (ou o email desejado)
   - Password: Escolha uma senha segura
   - Auto Confirm User: ✅ (marcar)
4. Clique em **"Create User"**
5. Copie o **User ID** do usuário criado
6. Execute este SQL no SQL Editor:

```sql
UPDATE public.profiles 
SET role = 'admin_master',
    full_name = 'Admin Master'
WHERE id = 'USER_ID_AQUI';
```

#### Opção B: Usando o Script SQL

1. Primeiro crie o usuário via interface (passo 1-4 da Opção A)
2. Execute o script `create-admin-user.sql` modificando o email no comando SQL

## 🎯 Funcionalidades do Painel Admin

### 1. Dashboard Administrativo (`/admin`)
- Visão geral da plataforma
- Estatísticas de usuários, livros, receita e custos
- Métricas de crescimento
- Atividades recentes

### 2. Gerenciamento de Clientes (`/admin/clientes`)
- Listar todos os clientes
- Adicionar novos clientes
- Editar informações de clientes
- Atribuir planos
- Definir roles (user, admin, admin_master)

### 3. Gerenciamento de Planos (`/admin/planos`)
- Criar novos planos
- Editar planos existentes
- Ativar/desativar planos
- Definir limites de livros e páginas
- Configurar preços

### 4. Métricas de Custos (`/admin/metricas`)
- Visualizar custos totais de criação de livros
- Breakdown por tipo (texto, imagens, etc)
- Histórico de custos
- Filtros por período (7d, 30d, 90d, tudo)

### 5. Consumo de IA (`/admin/ia-usage`)
- Métricas detalhadas de uso de IA
- Custos por tipo de serviço (texto, imagens, embeddings)
- Histórico completo de requisições
- Análise de tokens e requisições

## 🔐 Sistema de Permissões

O sistema possui três níveis de acesso:

### Usuário Normal (`user`)
- Acesso padrão à plataforma
- Pode criar livros
- Ver próprios livros
- Acessar configurações pessoais

### Administrador (`admin`)
- Acesso ao painel administrativo
- Pode gerenciar clientes e planos
- Visualizar métricas

### Admin Master (`admin_master`)
- Todos os privilégios de admin
- Pode criar outros admins
- Acesso total ao sistema

## 🔄 Fluxo de Redirecionamento

Quando um usuário faz login:
- Se for **admin** ou **admin_master**: Redirecionado para `/admin`
- Se for **user**: Permanece na página normal da aplicação

## 📝 Notas Importantes

1. **Segurança**: Apenas usuários com role `admin` ou `admin_master` podem acessar `/admin`
2. **RLS (Row Level Security)**: As políticas RLS foram configuradas para proteger os dados
3. **Criação de Admin**: Para criar um admin master, você precisa acessar o banco diretamente (SQL) ou usar a interface de clientes no painel admin (se já for admin)
4. **Variáveis de Ambiente**: Certifique-se de que as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` estão configuradas

## 🐛 Resolução de Problemas

### Erro: "Acesso negado ao painel admin"
- Verifique se o usuário tem role `admin` ou `admin_master` na tabela `profiles`
- Verifique se o perfil foi criado corretamente

### Erro: "Tabela não encontrada"
- Execute novamente o script `supabase-admin-setup.sql`
- Verifique se as tabelas foram criadas no Supabase

### Erro: "Variáveis de ambiente não encontradas"
- Crie um arquivo `.env.local` na raiz do projeto
- Adicione: `NEXT_PUBLIC_SUPABASE_URL=...` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`
- Reinicie o servidor de desenvolvimento

## 🚀 Próximos Passos

Após configurar:
1. Faça login com o usuário admin master
2. Acesse o painel em `/admin`
3. Explore as funcionalidades
4. Crie planos e gerencie clientes conforme necessário
