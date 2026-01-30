import { supabase } from "@/lib/supabase"

export interface ReferenceImageInput {
  file: File
  descricao: string
  papel: string
}

export interface BookCreationInput {
  titulo: string
  categoria: string
  publicoAlvo: string
  linguagem: string
  historia: string
  estiloImagem: string
  referencias: ReferenceImageInput[]
  baseImageIndex: number
  userId?: string
}

interface StoryPage {
  texto: string
  imagem?: string
  "imagem(em ingles)"?: string
}

interface StoryResult {
  pagina1: StoryPage
  pagina2: StoryPage
  pagina3: StoryPage
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY

const OPENAI_MODEL = "gpt-4.1-mini"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function ensureRequiredEnv() {
  const missing: string[] = []
  if (!OPENAI_API_KEY) missing.push("VITE_OPENAI_API_KEY")
  if (!FAL_API_KEY) missing.push("VITE_FAL_API_KEY")
  if (!IMGBB_API_KEY) missing.push("VITE_IMGBB_API_KEY")
  return missing
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }
  return text.trim()
}

function buildReferenceSummary(referencias: ReferenceImageInput[]) {
  return referencias
    .map((ref, index) => {
      const label = ref.descricao?.trim() || `Pessoa ${index + 1}`
      const papel = ref.papel?.trim() ? ` (${ref.papel.trim()})` : ""
      return `- ${label}${papel}`
    })
    .join("\n")
}

function buildCharacterIdentityRule() {
  return [
    "Preserve the exact facial identity from the reference image (face shape, eyes, nose, mouth, eyebrows, hair, skin tone).",
    "Keep the same apparent age and proportions.",
    "Keep hairstyle, eye color, skin tone, and facial features consistent across all pages.",
    "Maintain the same outfit, color palette, and signature accessories in every scene unless the story explicitly says the character changed clothes or context.",
    "Full body visible in frame, no cropping.",
    "No text, watermark, logo, or borders.",
    "Illustration only, not photo or hyper-realism."
  ].join(" ")
}

function shouldAllowOutfitChange(pageText: string, imageDescription: string) {
  const combined = `${pageText}\n${imageDescription}`.toLowerCase()
  const keywords = [
    "troca de roupa",
    "mudou de roupa",
    "trocou de roupa",
    "roupa de dormir",
    "pijama",
    "fantasia",
    "fantasiado",
    "uniforme",
    "traje",
    "roupa especial",
    "armadura",
    "capacete",
    "roupa de inverno",
    "casaco",
    "jaqueta",
    "agasalho",
    "roupa de verao",
    "roupa de verão",
    "praia",
    "nadar",
    "roupa esportiva",
    "roupa de banho",
    "swimsuit",
    "uniform",
    "pajamas",
    "costume",
    "disguise",
    "armor",
    "helmet",
    "winter coat",
    "jacket",
    "sports outfit",
    "change clothes",
    "changed clothes",
    "outfit change",
  ]
  return keywords.some((keyword) => combined.includes(keyword))
}

async function uploadImageToImgBB(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)
  formData.append("key", IMGBB_API_KEY)

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Falha ao enviar imagem para o ImgBB.")
  }

  const data = await response.json()
  const url = data?.data?.url
  if (!url) {
    throw new Error("Resposta inválida do ImgBB.")
  }
  return url
}

async function callOpenAI(systemMessage: string, userMessage: string, temperature = 0.4) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao chamar OpenAI: ${errorText}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("Resposta vazia da OpenAI.")
  }
  return content
}

async function generateImagePrompts(historia: string, estiloImagem: string, referencias: ReferenceImageInput[]) {
  const systemMessage = [
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
  ].join(" ")

  const userMessage = [
    "Historia base:",
    historia,
    "",
    "Personagens e papeis:",
    buildReferenceSummary(referencias),
    "",
    `Estilo desejado: ${estiloImagem}`,
    "",
    "IMPORTANTE: Se o estilo for 'Ilustração Digital' ou 'Ilustracao Digital', o prompt_estilo_imagem deve especificar um estilo mais realista e fotográfico, similar a uma foto profissional, não um desenho animado ou ilustração estilizada.",
    "",
    "Formato de resposta obrigatorio:",
    "{",
    '  "prompt_personagem": "..."',
    '  "prompt_estilo_imagem": "..."',
    '  "ficha_personagem": "..."',
    "}",
  ].join("\n")

  const content = await callOpenAI(systemMessage, userMessage, 0.5)
  const json = extractJson(content)
  return JSON.parse(json) as {
    prompt_personagem: string
    prompt_estilo_imagem: string
    ficha_personagem: string
  }
}

async function generateStoryCartoon(historia: string, estiloImagem: string, referencias: ReferenceImageInput[], linguagem: string) {
  const systemMessage = [
    "Crie uma historia infantil curta seguindo as regras abaixo.",
    "Nao inclua titulo.",
    "A historia deve ter 3 paginas, maximo 400 caracteres por pagina.",
    "Linguagem simples, acolhedora e educativa em PT-BR.",
    "Use os personagens fornecidos e seus papeis.",
    "A descricao da imagem deve estar em ingles.",
    "Retorne APENAS JSON valido.",
  ].join(" ")

  const userMessage = [
    "Personagens e papeis:",
    buildReferenceSummary(referencias),
    "",
    `Estilo da historia: ${linguagem}. Texto final obrigatoriamente em PT-BR.`,
    `Estilo da imagem: ${estiloImagem}`,
    "",
    "Se houver troca de roupa, isso deve estar EXPLICITO no texto e na descricao da imagem.",
    "Regras para o campo imagem:",
    "- Cartoon-style illustration with clean lines, balanced lighting.",
    `- ${buildCharacterIdentityRule()}`,
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
    historia,
  ].join("\n")

  const content = await callOpenAI(systemMessage, userMessage, 0.6)
  const json = extractJson(content)
  return JSON.parse(json) as StoryResult
}

async function generateStoryWithImageBase(
  historia: string,
  promptEstiloImagem: string,
  referencias: ReferenceImageInput[],
  linguagem: string,
  fichaPersonagem: string | null,
  estiloOriginal: string | null = null
) {
  const systemMessage = [
    "Crie uma historia infantil curta seguindo as regras abaixo.",
    "Nao inclua titulo.",
    "A historia deve ter 3 paginas, maximo 400 caracteres por pagina.",
    "Linguagem simples, acolhedora e educativa em PT-BR.",
    "Use os personagens fornecidos e seus papeis.",
    "A descricao da imagem deve estar em ingles.",
    "IMPORTANTE: Cada pagina deve ter uma acao ou situacao diferente, com poses e movimentos variados dos personagens conectados a narrativa. Evite poses repetitivas ou genericas como 'caminhando de maos dadas' em todas as paginas.",
    "Retorne APENAS JSON valido.",
  ].join(" ")

  const userMessage = [
    "Personagens e papeis:",
    buildReferenceSummary(referencias),
    "",
    `Estilo da historia: ${linguagem}. Texto final obrigatoriamente em PT-BR.`,
    "Estilo da imagem (use como guia):",
    promptEstiloImagem,
    fichaPersonagem ? "Ficha do personagem (seguir fielmente):" : "",
    fichaPersonagem ? fichaPersonagem : "",
    "",
    "Se houver troca de roupa, isso deve estar EXPLICITO no texto e na descricao da imagem.",
    "Regras para o campo imagem:",
    estiloOriginal && (estiloOriginal.toLowerCase().includes("ilustracao") || estiloOriginal.toLowerCase().includes("ilustração"))
      ? "- Realistic digital illustration, photorealistic style, natural lighting, detailed textures, life-like appearance, not cartoon or stylized."
      : "- Stylized digital illustration, animated cinematic look, dynamic lighting.",
    `- ${buildCharacterIdentityRule()}`,
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
    historia,
  ].join("\n")

  const content = await callOpenAI(systemMessage, userMessage, 0.6)
  const json = extractJson(content)
  return JSON.parse(json) as StoryResult
}

async function createImageWithFalAI(prompt: string, imageUrl: string) {
  const response = await fetch("https://queue.fal.run/fal-ai/nano-banana/edit", {
    method: "POST",
    headers: {
      Authorization: `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_urls: [imageUrl],
      num_images: 1,
      output_format: "png",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao criar imagem (Fal.ai): ${errorText}`)
  }

  const data = await response.json()
  const requestId = data?.request_id || data?.data?.request_id
  if (!requestId) {
    throw new Error("Fal.ai nao retornou request_id.")
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    await delay(5000)
    const resultResponse = await fetch(`https://queue.fal.run/fal-ai/nano-banana/requests/${requestId}`, {
      headers: {
        Authorization: `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!resultResponse.ok) {
      continue
    }

    const resultData = await resultResponse.json()
    const status = resultData?.status || resultData?.data?.status
    const images = resultData?.images || resultData?.data?.images
    if (status === "FAILED") {
      throw new Error("Fal.ai falhou ao gerar a imagem.")
    }
    if (images?.length > 0) {
      return images[0].url as string
    }
  }

  throw new Error("Timeout ao gerar imagem no Fal.ai.")
}

function buildPagePrompt(
  pageImageDescription: string,
  promptPersonagem: string | null,
  promptEstiloImagem: string | null,
  fichaPersonagem: string | null,
  allowOutfitChange: boolean
) {
  const parts = [
    pageImageDescription,
    "",
    promptPersonagem ? `Character details: ${promptPersonagem}` : "",
    promptEstiloImagem ? `Visual style: ${promptEstiloImagem}` : "",
    fichaPersonagem ? `Character bible (follow exactly): ${fichaPersonagem}` : "",
    buildCharacterIdentityRule(),
    allowOutfitChange
      ? "Allow outfit change only as explicitly described; keep identity and key accessories consistent."
      : "Do not change clothing across pages unless the page text explicitly states an outfit change.",
    "Maintain IDENTICAL art style, rendering technique, color palette, lighting style, and visual aesthetic across ALL pages. Do not change from digital illustration to cartoon or vice versa.",
    "IMPORTANT: Create dynamic, varied poses for characters that match the specific action and narrative of this page. Avoid static or repetitive poses. Show characters engaged in the specific action described, with expressive body language, gestures, and movements that tell the story.",
  ].filter(Boolean)

  return parts.join("\n")
}

async function createBookRecord(input: BookCreationInput, baseImageUrl: string) {
  const { data, error } = await supabase
    .from("books")
    .insert({
      titulo: input.titulo,
      categoria_livro: input.categoria,
      estilo_das_imagens: input.estiloImagem,
      lingaguem_livro: input.linguagem,
      status: "Em Criação",
      publico_alvo: input.publicoAlvo,
      historia_livro: input.historia,
      is_public: true,
      user_id: input.userId || null,
      imagens_referencia: baseImageUrl,
    })
    .select("id")
    .single()

  if (error) {
    throw error
  }

  return data.id as number
}

async function createBookPage(bookId: number, storyDescription: string, coverImageUrl: string) {
  const { error } = await supabase
    .from("pages_livro")
    .insert({
      book_id: bookId,
      story_description: storyDescription,
      cover_image_url: coverImageUrl,
    })

  if (error) {
    throw error
  }
}

async function updateBookStatus(bookId: number, status: string) {
  const { error } = await supabase.from("books").update({ status }).eq("id", bookId)
  if (error) {
    console.warn("Erro ao atualizar status do livro:", error)
  }
}

export async function createBookWithAI(input: BookCreationInput, onProgress?: (value: number) => void) {
  const missingEnv = ensureRequiredEnv()
  if (missingEnv.length > 0) {
    throw new Error(`Configure as variaveis: ${missingEnv.join(", ")}`)
  }

  onProgress?.(5)

  const baseImageFile = input.referencias[input.baseImageIndex]?.file
  if (!baseImageFile) {
    throw new Error("Imagem base nao encontrada.")
  }

  const baseImageUrl = await uploadImageToImgBB(baseImageFile)
  onProgress?.(15)

  const bookId = await createBookRecord(input, baseImageUrl)
  onProgress?.(20)

  const styleLower = input.estiloImagem.toLowerCase()
  const isIllustration = styleLower.includes("ilustracao") || styleLower.includes("ilustração")
  const isCartoon = styleLower.includes("cartoon")

  let promptPersonagem: string | null = null
  let promptEstiloImagem: string | null = null
  let fichaPersonagem: string | null = null
  if (isIllustration) {
    const prompts = await generateImagePrompts(input.historia, input.estiloImagem, input.referencias)
    promptPersonagem = prompts.prompt_personagem
    promptEstiloImagem = prompts.prompt_estilo_imagem
    fichaPersonagem = prompts.ficha_personagem
  }

  onProgress?.(35)

  const story = isCartoon
    ? await generateStoryCartoon(input.historia, input.estiloImagem, input.referencias, input.linguagem)
    : await generateStoryWithImageBase(
        input.historia,
        promptEstiloImagem || input.estiloImagem,
        input.referencias,
        input.linguagem,
        fichaPersonagem,
        input.estiloImagem
      )

  onProgress?.(50)

  const pages = [story.pagina1, story.pagina2, story.pagina3]
  let previousImageUrl = baseImageUrl // Começa com a imagem base
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index]
    const imageDescription = page["imagem(em ingles)"] || page.imagem || ""
    const safeDescription =
      imageDescription.trim() || "Children's storybook illustration that matches the page text."
    const allowOutfitChange = shouldAllowOutfitChange(page.texto, safeDescription)
    const prompt = buildPagePrompt(
      safeDescription,
      promptPersonagem,
      promptEstiloImagem,
      fichaPersonagem,
      allowOutfitChange
    )
    const imageUrl = await createImageWithFalAI(prompt, previousImageUrl) // Usa imagem anterior como base
    await createBookPage(bookId, page.texto, imageUrl)
    previousImageUrl = imageUrl // Atualiza para próxima iteração
    onProgress?.(60 + Math.round(((index + 1) / pages.length) * 35))
  }

  await updateBookStatus(bookId, "Finalizado")
  onProgress?.(100)

  return { bookId }
}
