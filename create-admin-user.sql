-- Script para criar um usuário admin master no Supabase
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase (https://app.supabase.com -> SQL Editor)
-- 2. Substitua 'admin@whizpic.com' pelo email desejado do admin master
-- 3. Substitua 'SenhaSegura123!' pela senha desejada (mínimo 6 caracteres)
-- 
-- OU use a função helper abaixo que cria o usuário e define o role automaticamente

-- Opção 1: Criar usuário manualmente e depois definir como admin master
-- Passo 1: Crie o usuário através da interface do Supabase Auth ou use a função auth.users
-- Passo 2: Execute este UPDATE substituindo o email:

-- UPDATE public.profiles 
-- SET role = 'admin_master' 
-- WHERE email = 'admin@whizpic.com';

-- Opção 2: Usar função helper (requer privilégios de admin do Supabase)
-- Esta função cria o usuário e define como admin_master automaticamente

CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT DEFAULT 'Admin Master'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Criar usuário no auth.users (requer extensão específica)
  -- Nota: Em produção, você deve criar o usuário através da API do Supabase ou interface web
  -- Este é apenas um exemplo conceitual
  
  -- Após criar o usuário (através de outra ferramenta), atualizar o profile:
  -- UPDATE public.profiles 
  -- SET role = 'admin_master',
  --     full_name = user_full_name
  -- WHERE email = user_email;
  
  -- Retornar ID do usuário (se já existir)
  SELECT id INTO new_user_id FROM public.profiles WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET role = 'admin_master',
        full_name = user_full_name
    WHERE id = new_user_id;
    
    RETURN new_user_id;
  ELSE
    RAISE EXCEPTION 'Usuário com email % não encontrado. Por favor, crie o usuário primeiro através da interface de autenticação.', user_email;
  END IF;
END;
$$;

-- Exemplo de uso da função (após criar o usuário):
-- SELECT create_admin_user('admin@whizpic.com', 'SenhaSegura123!', 'Admin Master');

-- MÉTODO RECOMENDADO (Mais Simples):
-- 1. Acesse https://app.supabase.com -> Authentication -> Users
-- 2. Clique em "Add User" e crie um novo usuário com email e senha
-- 3. Copie o User ID do usuário criado
-- 4. Execute este comando SQL substituindo o UUID:

-- UPDATE public.profiles 
-- SET role = 'admin_master',
--     full_name = 'Admin Master'
-- WHERE id = 'UUID_DO_USUARIO_AQUI';

-- OU se o profile não foi criado automaticamente:

-- INSERT INTO public.profiles (id, email, full_name, role)
-- VALUES (
--   'UUID_DO_USUARIO_AQUI',
--   'admin@whizpic.com',
--   'Admin Master',
--   'admin_master'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin_master',
--     full_name = 'Admin Master';
