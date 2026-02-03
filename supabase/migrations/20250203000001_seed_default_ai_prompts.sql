-- Cadastra os prompts atuais do sistema em todas as contas (profiles).
-- Use este script para preencher ai_prompts, ai_model e temperaturas com os valores padrão.
--
-- Opções:
-- 1) Apenas perfis que ainda NÃO têm prompts (não sobrescreve personalizações):
--    Deixe o WHERE ai_prompts IS NULL no final.
-- 2) Atualizar TODOS os perfis com os prompts padrão (cuidado: apaga personalizações):
--    Remova a linha WHERE ai_prompts IS NULL.

UPDATE public.profiles
SET
  ai_model = 'gpt-4.1-mini',
  ai_temperature_default = 0.4,
  ai_temperature_image_prompts = 0.5,
  ai_temperature_story = 0.6,
  ai_prompts = jsonb_build_object(
    'imagePromptsSystem', $img_sys$Voce e um especialista em prompts para ilustracoes digitais modernas. Retorne APENAS JSON valido, sem markdown e sem explicacoes. Os prompts devem estar em ingles. Gere tres chaves: prompt_personagem, prompt_estilo_imagem e ficha_personagem. prompt_personagem: apenas o personagem principal, identidade visual e traços fisicos, sem cenario. prompt_estilo_imagem: apenas o estilo visual (tecnica, paleta, luz, atmosfera), sem personagem. ficha_personagem: um character bible detalhado com TODOS os personagens principais da historia, incluindo identidade visual, roupas iniciais, cores, acessorios e detalhes fisicos consistentes para cada um. Sempre preserve a identidade do rosto com base na imagem de referencia. Evite estilo infantil, chibi ou proporcoes de bebe. Busque um visual animado, estilizado e com toque futurista discreto quando fizer sentido. Inclua diretrizes de consistencia visual (paleta, textura e iluminacao).$img_sys$,
    'imagePromptsUser', $img_usr$Historia base:
{{HISTORIA}}

Personagens e papeis:
{{REFERENCIAS_SUMMARY}}

Estilo desejado: {{ESTILO_IMAGEM}}

IMPORTANTE: Se o estilo for 'Ilustração Digital' ou 'Ilustracao Digital', o prompt_estilo_imagem deve especificar um estilo mais realista e fotográfico, similar a uma foto profissional, não um desenho animado ou ilustração estilizada.

Formato de resposta obrigatorio:
{
  "prompt_personagem": "..."
  "prompt_estilo_imagem": "..."
  "ficha_personagem": "..."
}$img_usr$,
    'storyCartoonSystem', $cart_sys$Crie uma historia infantil curta seguindo as regras abaixo. Nao inclua titulo. A historia deve ter 3 paginas, maximo 400 caracteres por pagina. Linguagem simples, acolhedora e educativa em PT-BR. Use os personagens fornecidos e seus papeis. A descricao da imagem deve estar em ingles. Retorne APENAS JSON valido.$cart_sys$,
    'storyCartoonUser', $cart_usr$Personagens e papeis:
{{REFERENCIAS_SUMMARY}}

Estilo da historia: {{LINGUAGEM}}. Texto final obrigatoriamente em PT-BR.
Estilo da imagem: {{ESTILO_IMAGEM}}

Se houver troca de roupa, isso deve estar EXPLICITO no texto e na descricao da imagem.
Regras para o campo imagem:
- Cartoon-style illustration with clean lines, balanced lighting.
- {{CHARACTER_IDENTITY_RULE}}
- No animals or extra characters unless in story.

Formato de saida OBRIGATORIO:
{
  "pagina1": { "texto": "...", "imagem": "..." },
  "pagina2": { "texto": "...", "imagem": "..." },
  "pagina3": { "texto": "...", "imagem": "..." }
}

Historia base:
{{HISTORIA}}$cart_usr$,
    'storyWithImageBaseSystem', $base_sys$Crie uma historia infantil curta seguindo as regras abaixo. Nao inclua titulo. A historia deve ter 3 paginas, maximo 400 caracteres por pagina. Linguagem simples, acolhedora e educativa em PT-BR. Use os personagens fornecidos e seus papeis. A descricao da imagem deve estar em ingles. IMPORTANTE: Cada pagina deve ter uma acao ou situacao diferente, com poses e movimentos variados dos personagens conectados a narrativa. Evite poses repetitivas ou genericas como 'caminhando de maos dadas' em todas as paginas. Retorne APENAS JSON valido.$base_sys$,
    'storyWithImageBaseUser', $base_usr$Personagens e papeis:
{{REFERENCIAS_SUMMARY}}

Estilo da historia: {{LINGUAGEM}}. Texto final obrigatoriamente em PT-BR.
Estilo da imagem (use como guia):
{{PROMPT_ESTILO_IMAGEM}}
{{FICHA_PERSONAGEM}}

Se houver troca de roupa, isso deve estar EXPLICITO no texto e na descricao da imagem.
Regras para o campo imagem:
- Stylized digital illustration, animated cinematic look, dynamic lighting. (Para estilo realista use: Realistic digital illustration, photorealistic style, natural lighting.)
- {{CHARACTER_IDENTITY_RULE}}
- No animals or extra characters unless in story.
- CRITICAL: Each page must show characters in DIFFERENT, DYNAMIC poses connected to the story action. Avoid static or repetitive poses like 'walking hand-in-hand' across multiple pages. Describe specific actions, movements, gestures, and body positions that match the narrative of each page.

Formato de saida OBRIGATORIO:
{
  "pagina1": { "texto": "...", "imagem(em ingles)": "..." },
  "pagina2": { "texto": "...", "imagem(em ingles)": "..." },
  "pagina3": { "texto": "...", "imagem(em ingles)": "..." }
}

Historia base:
{{HISTORIA}}$base_usr$,
    'characterIdentityRule', $char_rule$Preserve the exact facial identity from the reference image (face shape, eyes, nose, mouth, eyebrows, hair, skin tone). Keep the same apparent age and proportions. Keep hairstyle, eye color, skin tone, and facial features consistent across all pages. Maintain the same outfit, color palette, and signature accessories in every scene unless the story explicitly says the character changed clothes or context. Full body visible in frame, no cropping. No text, watermark, logo, or borders. Illustration only, not photo or hyper-realism.$char_rule$
  ),
  updated_at = now()
WHERE ai_prompts IS NULL;
