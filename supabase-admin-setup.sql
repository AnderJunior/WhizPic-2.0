-- Script SQL para configurar sistema de administração no Supabase

-- 1. Criar tabela de perfis de usuário com role
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'admin_master')),
  plan_id UUID REFERENCES public.plans(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de planos
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  max_books INTEGER DEFAULT 0,
  max_pages_per_book INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de livros (se não existir)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT,
  target_audience TEXT,
  language TEXT,
  story_content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'published')),
  pages_count INTEGER DEFAULT 0,
  images_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de custos de criação de livros
CREATE TABLE IF NOT EXISTS public.book_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ai_usage_cost DECIMAL(10, 4) DEFAULT 0,
  image_generation_cost DECIMAL(10, 4) DEFAULT 0,
  text_generation_cost DECIMAL(10, 4) DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  images_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de métricas de consumo de IA
CREATE TABLE IF NOT EXISTS public.ai_usage_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('text_generation', 'image_generation', 'embedding')),
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_metrics ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'admin_master')
    )
  );

CREATE POLICY "Admin masters can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin_master'
    )
  );

-- 8. Criar políticas RLS para plans
CREATE POLICY "Anyone can view active plans" ON public.plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'admin_master')
    )
  );

-- 9. Criar políticas RLS para books
CREATE POLICY "Users can view own books" ON public.books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own books" ON public.books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON public.books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all books" ON public.books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'admin_master')
    )
  );

-- 10. Criar políticas RLS para book_costs
CREATE POLICY "Users can view own book costs" ON public.book_costs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all book costs" ON public.book_costs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'admin_master')
    )
  );

-- 11. Criar políticas RLS para ai_usage_metrics
CREATE POLICY "Users can view own AI usage" ON public.ai_usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI usage" ON public.ai_usage_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'admin_master')
    )
  );

-- 12. Criar função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Criar trigger para executar função quando novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Criar triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Inserir planos padrão
INSERT INTO public.plans (name, description, price, max_books, max_pages_per_book, features) VALUES
  ('Gratuito', 'Plano básico para começar', 0, 5, 20, '{"ai_generation": true, "basic_templates": true}'::jsonb),
  ('Básico', 'Para criadores casuais', 29.90, 20, 30, '{"ai_generation": true, "templates": true, "export_pdf": true}'::jsonb),
  ('Profissional', 'Para criadores sérios', 99.90, 100, 50, '{"ai_generation": true, "premium_templates": true, "export_pdf": true, "priority_support": true}'::jsonb),
  ('Enterprise', 'Soluções personalizadas', 299.90, -1, 100, '{"ai_generation": true, "custom_templates": true, "export_pdf": true, "api_access": true, "dedicated_support": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- NOTA: Para criar o usuário admin master, você precisa:
-- 1. Criar um usuário através da interface do Supabase Auth ou através do código
-- 2. Depois executar este UPDATE (substitua 'seu-email-admin@exemplo.com' pelo email do admin):
-- UPDATE public.profiles SET role = 'admin_master' WHERE email = 'seu-email-admin@exemplo.com';
