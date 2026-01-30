# Configuração do Supabase

## Problema: "Invalid API key"

Se você está recebendo o erro "Invalid API key" ao tentar criar uma conta, isso significa que as credenciais do Supabase no arquivo `.env` estão incorretas ou expiradas.

## Como resolver:

### 1. Acesse seu projeto Supabase
- Vá para: https://app.supabase.com
- Faça login na sua conta
- Selecione o projeto (ou crie um novo)

### 2. Obtenha as credenciais corretas
- No menu lateral, clique em **Settings** (Configurações)
- Clique em **API** ou **API Keys**
- Você verá duas informações importantes:
  - **Project URL** (URL do Projeto)
  - **Publishable key** (Chave publicável) - **USE ESTA!** É a nova nomenclatura
  - Ou **anon public** key (Chave pública anônima) - apenas se não houver Publishable key

> **Nota:** O Supabase agora usa **Publishable Key** em vez de "anon key". Use a Publishable Key se disponível.

### 3. Atualize o arquivo `.env`
Abra o arquivo `.env` na raiz do projeto e atualize com as credenciais corretas:

**Opção 1 - Usando Publishable Key (recomendado):**
```env
VITE_SUPABASE_URL=sua_url_do_projeto_aqui
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key_aqui
```

**Opção 2 - Usando anon key (legado, se não houver Publishable key):**
```env
VITE_SUPABASE_URL=sua_url_do_projeto_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 4. Reinicie o servidor de desenvolvimento
Após atualizar o arquivo `.env`, você precisa reiniciar o servidor:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente:
npm run dev
```

## Criar um novo projeto Supabase (se necessário)

Se você não tem um projeto Supabase:

1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Preencha os dados:
   - Nome do projeto
   - Senha do banco de dados
   - Região (escolha a mais próxima)
4. Aguarde a criação do projeto (pode levar alguns minutos)
5. Siga os passos acima para obter as credenciais

## Verificar se está funcionando

Após atualizar as credenciais e reiniciar o servidor, tente criar uma conta novamente. O erro "Invalid API key" deve desaparecer.

