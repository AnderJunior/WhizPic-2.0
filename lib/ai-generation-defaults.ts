/**
 * Valores padrão dos prompts e configurações de IA.
 * Usado na página Geração IA e como fallback em book-creation.
 */

export const DEFAULT_AI_MODEL = "gpt-4.1-mini"
export const DEFAULT_TEMPERATURE = 0.4
export const DEFAULT_TEMPERATURE_IMAGE_PROMPTS = 0.5
export const DEFAULT_TEMPERATURE_STORY = 0.6

export interface AIPromptsConfig {
  imagePromptsSystem?: string
  imagePromptsUser?: string
  storyCartoonSystem?: string
  storyCartoonUser?: string
  storyWithImageBaseSystem?: string
  storyWithImageBaseUser?: string
  characterIdentityRule?: string
}

export const DEFAULT_AI_PROMPTS: AIPromptsConfig = {
  imagePromptsSystem: [
    "Voce e um especialista em prompts para ilustracoes digitais modernas.",
    "Retorne APENAS JSON valido, sem markdown e sem explicacoes.",
    "Os prompts devem estar em ingles.",
    "Gere tres chaves: prompt_personagem, prompt_estilo_imagem e ficha_personagem.",
    "prompt_personagem: apenas o personagem principal, identidade visual e traços fisicos, sem cenario.",
    "prompt_estilo_imagem: apenas o estilo visual (tecnica, paleta, luz, atmosfera), sem personagem.",
    "ficha_personagem: um character bible detalhado com TODOS os personagens principais da historia, incluindo identidade visual, roupas iniciais, cores, acessorios e detalhes fisicos consistentes para cada um.",
    "Sempre preserve a identidade do rosto com base na imagem de referencia.",
    "Evite estilo infantil, chibi ou proporcoes de bebe.",
    "Busque um visual animado, estilizado e com toque futurista discreto quando fizer sentido.",
    "Inclua diretrizes de consistencia visual (paleta, textura e iluminacao).",
  ].join(" "),

  imagePromptsUser: [
    "Historia base:",
    "{{HISTORIA}}",
    "",
    "Personagens e papeis:",
    "{{REFERENCIAS_SUMMARY}}",
    "",
    "Estilo desejado: {{ESTILO_IMAGEM}}",
    "",
    "IMPORTANTE: Se o estilo for 'Ilustração Digital' ou 'Ilustracao Digital', o prompt_estilo_imagem deve especificar um estilo mais realista e fotográfico, similar a uma foto profissional, não um desenho animado ou ilustração estilizada.",
    "",
    "Formato de resposta obrigatorio:",
    "{",
    '  "prompt_personagem": "..."',
    '  "prompt_estilo_imagem": "..."',
    '  "ficha_personagem": "..."',
    "}",
  ].join("\n"),

  storyCartoonSystem: [
    "Crie uma historia infantil curta seguindo as regras abaixo.",
    "Nao inclua titulo.",
    "A historia deve ter 3 paginas, maximo 400 caracteres por pagina.",
    "Linguagem simples, acolhedora e educativa em PT-BR.",
    "Use os personagens fornecidos e seus papeis.",
    "A descricao da imagem deve estar em ingles.",
    "Retorne APENAS JSON valido.",
  ].join(" "),

  storyCartoonUser: [
    "Personagens e papeis:",
    "{{REFERENCIAS_SUMMARY}}",
    "",
    "Estilo da historia: {{LINGUAGEM}}. Texto final obrigatoriamente em PT-BR.",
    "Estilo da imagem: {{ESTILO_IMAGEM}}",
    "",
    "Se houver troca de roupa, isso deve estar EXPLICITO no texto e na descricao da imagem.",
    "Regras para o campo imagem:",
    "- Cartoon-style illustration with clean lines, balanced lighting.",
    "- {{CHARACTER_IDENTITY_RULE}}",
    "- No animals or extra characters unless in story.",
    "",
    "Formato de saida OBRIGATORIO:",
    "{",
    '  "pagina1": { "texto": "...", "imagem": "..." },',
    '  "pagina2": { "texto": "...", "imagem": "..." },',
    '  "pagina3": { "texto": "...", "imagem": "..." }',
    "}",
    "",
    "Historia base:",
    "{{HISTORIA}}",
  ].join("\n"),

  storyWithImageBaseSystem: [
    "Crie uma historia infantil curta seguindo as regras abaixo.",
    "Nao inclua titulo.",
    "A historia deve ter 3 paginas, maximo 400 caracteres por pagina.",
    "Linguagem simples, acolhedora e educativa em PT-BR.",
    "Use os personagens fornecidos e seus papeis.",
    "A descricao da imagem deve estar em ingles.",
    "IMPORTANTE: Cada pagina deve ter uma acao ou situacao diferente, com poses e movimentos variados dos personagens conectados a narrativa. Evite poses repetitivas ou genericas como 'caminhando de maos dadas' em todas as paginas.",
    "Retorne APENAS JSON valido.",
  ].join(" "),

  storyWithImageBaseUser: [
    "Personagens e papeis:",
    "{{REFERENCIAS_SUMMARY}}",
    "",
    "Estilo da historia: {{LINGUAGEM}}. Texto final obrigatoriamente em PT-BR.",
    "Estilo da imagem (use como guia):",
    "{{PROMPT_ESTILO_IMAGEM}}",
    "{{FICHA_PERSONAGEM}}",
    "",
    "Se houver troca de roupa, isso deve estar EXPLICITO no texto e na descricao da imagem.",
    "Regras para o campo imagem:",
    "- Stylized digital illustration, animated cinematic look, dynamic lighting. (Para estilo realista use: Realistic digital illustration, photorealistic style, natural lighting.)",
    "- {{CHARACTER_IDENTITY_RULE}}",
    "- No animals or extra characters unless in story.",
    "- CRITICAL: Each page must show characters in DIFFERENT, DYNAMIC poses connected to the story action. Avoid static or repetitive poses like 'walking hand-in-hand' across multiple pages. Describe specific actions, movements, gestures, and body positions that match the narrative of each page.",
    "",
    "Formato de saida OBRIGATORIO:",
    "{",
    '  "pagina1": { "texto": "...", "imagem(em ingles)": "..." },',
    '  "pagina2": { "texto": "...", "imagem(em ingles)": "..." },',
    '  "pagina3": { "texto": "...", "imagem(em ingles)": "..." }',
    "}",
    "",
    "Historia base:",
    "{{HISTORIA}}",
  ].join("\n"),

  characterIdentityRule: [
    "Preserve the exact facial identity from the reference image (face shape, eyes, nose, mouth, eyebrows, hair, skin tone).",
    "Keep the same apparent age and proportions.",
    "Keep hairstyle, eye color, skin tone, and facial features consistent across all pages.",
    "Maintain the same outfit, color palette, and signature accessories in every scene unless the story explicitly says the character changed clothes or context.",
    "Full body visible in frame, no cropping.",
    "No text, watermark, logo, or borders.",
    "Illustration only, not photo or hyper-realism.",
  ].join(" "),
}

export const OPENAI_MODELS = [
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini (padrão)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
] as const
