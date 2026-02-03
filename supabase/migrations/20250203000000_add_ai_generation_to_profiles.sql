-- Configurações de Geração IA por usuário (profiles)
-- Execute no SQL Editor do Supabase ou via CLI: supabase db push

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_model text NOT NULL DEFAULT 'gpt-4.1-mini',
  ADD COLUMN IF NOT EXISTS ai_temperature_default real NOT NULL DEFAULT 0.4,
  ADD COLUMN IF NOT EXISTS ai_temperature_image_prompts real NOT NULL DEFAULT 0.5,
  ADD COLUMN IF NOT EXISTS ai_temperature_story real NOT NULL DEFAULT 0.6,
  ADD COLUMN IF NOT EXISTS ai_prompts jsonb NULL;

COMMENT ON COLUMN public.profiles.ai_model IS 'Modelo OpenAI usado (ex: gpt-4.1-mini, gpt-4o-mini)';
COMMENT ON COLUMN public.profiles.ai_temperature_default IS 'Temperatura padrão para chamadas à IA (0-2)';
COMMENT ON COLUMN public.profiles.ai_temperature_image_prompts IS 'Temperatura para geração de prompts de imagem';
COMMENT ON COLUMN public.profiles.ai_temperature_story IS 'Temperatura para geração de história';
COMMENT ON COLUMN public.profiles.ai_prompts IS 'Prompts editáveis em JSON: imagePromptsSystem, imagePromptsUser, storyCartoonSystem, storyCartoonUser, storyWithImageBaseSystem, storyWithImageBaseUser, characterIdentityRule';
