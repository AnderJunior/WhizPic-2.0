# Lógica de geração de livros

Este documento descreve, de forma completa, a lógica de geração de livros implementada em `createBook()` e nas funções auxiliares relacionadas. O fluxo cobre: upload de imagem base, geração de prompts e história, criação das imagens por página, persistência no Supabase e atualização de status.

## Funções e responsabilidades

### `createBook(data, onProgress)`
Função principal que orquestra todo o processo de criação do livro.

### `uploadImageToImgBB(imageFile)`
Faz upload de uma imagem para o ImgBB e retorna a URL pública.

### `generateImagePrompts(historia_livro, estilo_imagem)`
Usa OpenAI para gerar dois prompts em JSON:
- `prompt_personagem`: detalhes do personagem base.
- `prompt_estilo_imagem`: estilo visual (iluminação, cores, etc).

### `generateStoryCartoon(historia_livro, estilo_imagem)`
Gera a história (3 páginas) com descrição de imagem para cada página no estilo Cartoon. Retorna JSON com `pagina1`, `pagina2`, `pagina3`.

### `generateStoryWithImageBase(historia_livro, prompt_estilo_imagem)`
Gera a história (3 páginas) usando um estilo de imagem específico (prompt de estilo já criado). Retorna JSON com `pagina1`, `pagina2`, `pagina3`.

### `createImageWithFalAI(prompt, imageUrl, onProgress?)`
Cria uma imagem a partir de um prompt e uma imagem base usando o Fal.ai. Faz polling até concluir e retorna a URL da imagem gerada.

### `createBookRecord(data)`
Cria o registro do livro na tabela `books` e retorna o `id` gerado.

### `createBookPage(bookId, storyDescription, coverImageUrl)`
Cria uma página na tabela `pages_livro` com o texto e a imagem da página.

### `updateBookStatus(bookId, status)`
Atualiza o status do livro na tabela `books`. Trata erros de trigger de `updated_at` como não críticos.

## Fluxo completo de geração do livro

### 1) Início e progresso
`createBook()` inicia reportando progresso e prepara variáveis usadas no fluxo.

### 2) Upload da imagem base (etapa 2: Imagens de Referência)
- A imagem **base** deve ser a escolhida pelo usuário na etapa 2 (Imagens de Referência).
- Essa imagem é enviada ao ImgBB para gerar uma URL pública estável.
- A URL retornada é usada como **imagem base única** para a geração das páginas.

### 3) Criação do registro do livro
É criado um registro em `books` com:
- título, categoria, estilo de imagem, linguagem, público, história
- status inicial: **"Em Criação"**
- `user_id` do criador
- URL da imagem base em `imagens_referencia`

### 4) Definição do fluxo por estilo de imagem
O fluxo muda conforme `data.estilo_imagem`:

#### a) **Ilustração digital**
1. Gera prompts com `generateImagePrompts()` (personagem + estilo).
2. **Não cria** imagem base via IA: usa diretamente a imagem enviada pelo usuário.
3. Guarda o `prompt_estilo_imagem` para gerar a história com o estilo correto.

#### b) **Cartoon**
1. Gera a história com `generateStoryCartoon()`.
2. Não cria imagem base antes; o fluxo segue para geração da história final.

### 5) Geração da história completa
Com base no estilo:
- **Cartoon**: `generateStoryCartoon()`.
- **Outros estilos**: `generateStoryWithImageBase()` usando o `prompt_estilo_imagem` (ou o estilo original).

A resposta contém 3 páginas com:
- `texto`
- `imagem` (ou `imagem(em ingles)`).

As referências de personagens (descrição + papel da etapa 2) são injetadas no prompt para garantir que apareçam na história.

### 6) Processamento de páginas (loop 3 páginas)
Para cada página:
1. **Extrai a descrição da imagem**:
   - Prioriza `imagem`.
   - Se não existir, usa `imagem(em ingles)`.
2. **Gera imagem da página** com `createImageWithFalAI(prompt, imgBaseUrl)`.
3. **Cria a página no banco** com `createBookPage()` (texto + URL da imagem).
4. **Mantém a imagem base fixa**:
   - Todas as páginas usam **a mesma imagem base enviada pelo usuário**.

### 7) Finalização
Após as 3 páginas:
1. Atualiza status do livro para **"Finalizado"**.
2. Retorna o `bookId`.

## Observações importantes

- O fluxo tenta usar um **proxy local** (`http://localhost:3001`) em ambiente de desenvolvimento para evitar problemas de CORS.
- Quando o OpenAI retorna JSON dentro de bloco Markdown, o texto é limpo antes do `JSON.parse`.
- `createImageWithFalAI()` faz polling por até **60 tentativas** com intervalo de 5s (máx. 5 minutos).
- Erros de trigger do `updated_at` ao atualizar status são tratados como **não críticos**.
- Variáveis de ambiente necessárias no frontend: `VITE_OPENAI_API_KEY`, `VITE_FAL_API_KEY`, `VITE_IMGBB_API_KEY`.

## Estrutura esperada dos dados

### Entrada principal (`BookCreationData`)
- `titulo_livro`, `categoria_livro`, `publico_alvo`, `linguagem_livro`
- `historia_livro`, `estilo_imagem`, `imagem_base`, `usuario`
- `imageFile` (opcional)

### Saída (`createBook`)
- Retorna o `id` do livro criado.

**Prompts de Geração (melhorados)**

Prompt Imagem Ilustração Digital (gerador de prompts):
Você é um especialista em prompts para IA de imagens infantis.
Retorne APENAS JSON válido (sem markdown) e os prompts devem estar em inglês.

Regras:
- "prompt_personagem": apenas o personagem principal, traços físicos e identidade visual, sem cenário.
- "prompt_estilo_imagem": apenas estilo visual (técnica, paleta, iluminação, atmosfera), sem personagem.
- Preserve a identidade do rosto com base na imagem de referência.
- Proibido: foto, hiper-realismo, texto, watermark, logo.

Entradas:
- historia_livro
- estilo_imagem
- personagens_referencia (lista com "descricao" e "papel")

Formato de saída obrigatório:
{
  "prompt_personagem": "...",
  "prompt_estilo_imagem": "..."
}

Prompt Cartoon (história + descrição da imagem):
Crie uma história infantil curta seguindo as regras abaixo:

1) Estrutura:
- A história deve ter 3 páginas.
- Cada página deve ter no máximo 400 caracteres (com espaços).
- Não escreva título.

2) Estilo da história:
- Linguagem simples, leve, clara e apropriada para crianças.
- Tom acolhedor, sonhador e educativo.
- A história deve transmitir uma lição positiva (ex: coragem, amizade, cuidado, paciência, aprender com erros, empatia).
- Use os personagens fornecidos e seus papéis.

3) Campo "imagem" (descrição da ilustração em inglês):
- Children's storybook illustration, painterly, soft lighting.
- Estilo: {{ $json.tipo_de_imagem }}
- Preservar identidade facial da imagem de referência (rosto, idade, pele, cabelo).
- Corpo inteiro visível, sem cortes.
- Proibido: texto, marcas d'água, logos, bordas, molduras.

4) Personagens de referência:
{{ $json.personagens_referencia }}

5) História base:
{{ $json.historia }}

Prompt Geração Cenários Imagens + História:
Crie uma história infantil curta seguindo as regras abaixo:

1) Estrutura:
- A história deve ter 3 páginas.
- Cada página deve ter no máximo 400 caracteres (com espaços).
- Não escreva título.

2) Estilo da história:
- Linguagem simples, leve, clara e apropriada para crianças.
- Tom acolhedor, sonhador e educativo.
- A história deve transmitir uma lição positiva (ex: coragem, amizade, cuidado, paciência, aprender com erros, empatia).
- Use os personagens fornecidos e seus papéis.

3) Estilo da Imagem:
{{ $('Dados').item.json.prompt_imagem.prompt_estilo_imagem }}

4) Regras para o campo "imagem(em ingles)":
- Children's storybook illustration, painterly, soft lighting.
- Preservar identidade facial da imagem de referência.
- Corpo inteiro visível, sem cortes.
- Proibido: texto, marcas d'água, logos, bordas, molduras.

5) Personagens de referência:
{{ $json.personagens_referencia }}

6) Formato de saída OBRIGATÓRIO (não alterar):

{
  "pagina1": {
    "texto": "texto da primeira página",
    "imagem(em ingles)": "descrição detalhada da imagem"
  },
  "pagina2": {
    "texto": "texto da segunda página",
    "imagem(em ingles)": "descrição detalhada da imagem"
  },
  "pagina3": {
    "texto": "texto da terceira página",
    "imagem(em ingles)": "descrição detalhada da imagem"
  }
}

7) História base:
{{ $('Variaveis').item.json.historia_livro }}


**Fluxo Exemplo do N8N**
{
  "name": "[NOVO LIVRO] - CRIANDO LIVRO",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "criar-livro",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        -992,
        0
      ],
      "id": "1721a5e1-4659-40e5-99fd-088a0de62ea6",
      "name": "Webhook",
      "webhookId": "b936afe2-50cb-4e32-b1c7-7163a98c581c"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "8be4d474-c6f9-448f-a57f-a9543d3b98a7",
              "name": "titulo_livro",
              "value": "={{ $('Webhook').item.json.body.titulo_livro }}",
              "type": "string"
            },
            {
              "id": "54debe90-a626-4adf-87f7-24ca312eeaf0",
              "name": "categoria_livro",
              "value": "={{ $('Webhook').item.json.body.categoria_livro }}",
              "type": "string"
            },
            {
              "id": "2784970a-9879-4e15-a5ac-8a2f5024c4a1",
              "name": "publico_alvo",
              "value": "={{ $('Webhook').item.json.body.publico_alvo }}",
              "type": "string"
            },
            {
              "id": "3c08f380-740d-41b1-afa1-6c7e617556a2",
              "name": "linguagem_livro",
              "value": "={{ $('Webhook').item.json.body.linguagem_livro }}",
              "type": "string"
            },
            {
              "id": "11fdf36b-d543-4125-9d7a-f07c2583a1e6",
              "name": "historia_livro",
              "value": "={{ $('Webhook').item.json.body.historia_livro }}",
              "type": "string"
            },
            {
              "id": "26229c2e-c0b4-45c1-a18a-4209da10c105",
              "name": "imagem_base",
              "value": "=https://i.ibb.co/HT1c8DN2/Foto-Profissional.jpg",
              "type": "string"
            },
            {
              "id": "cc4567d9-7b48-40fc-b576-f13c22820aae",
              "name": "estilo_imagem",
              "value": "={{ $('Webhook').item.json.body.estilo_imagem }}",
              "type": "string"
            },
            {
              "id": "4af03200-1978-4d33-b1c3-4ae8bde2c45d",
              "name": "usuario",
              "value": "97af0352-65fb-4cf9-a39e-0b46a26e774a",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -464,
        0
      ],
      "id": "e6917ad2-75a4-4ac6-86bd-105e3d637c90",
      "name": "Variaveis"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.imgbb.com/1/upload",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpQueryAuth",
        "sendBody": true,
        "contentType": "multipart-form-data",
        "bodyParameters": {
          "parameters": [
            {
              "parameterType": "formBinaryData",
              "name": "image",
              "inputDataFieldName": "imagens_referencias"
            },
            {
              "name": "key",
              "value": "af92e7bab20fa5b4b04c0394a2710720"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        -672,
        0
      ],
      "id": "587fe429-4830-4f9b-b654-9febc094a836",
      "name": "Subindo_img1",
      "credentials": {
        "httpQueryAuth": {
          "id": "FZntL00h62CQgkSV",
          "name": "IMGG"
        }
      },
      "disabled": true
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-4.1-mini"
        },
        "options": {
          "temperature": 0.5
        }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        352,
        -16
      ],
      "id": "9af743ad-093f-41ca-91e5-6af414b589d8",
      "name": "OpenAI Chat Model2",
      "credentials": {
        "openAiApi": {
          "id": "1EAqsuhtLKoNy2wo",
          "name": "AIR MIDIA"
        }
      }
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $('criando_book').item.json.id }}{{ $now.format('yyyy-MM-dd HH:mm') }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryPostgresChat",
      "typeVersion": 1.3,
      "position": [
        496,
        -16
      ],
      "id": "65274b98-880d-4bcf-862d-8d0d147aa9ba",
      "name": "Postgres Chat Memory2",
      "credentials": {
        "postgres": {
          "id": "9Oqqy3ygIGQih7xj",
          "name": "WhizPic"
        }
      }
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "3"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryPostgresChat",
      "typeVersion": 1.3,
      "position": [
        464,
        352
      ],
      "id": "3fa144a8-1609-4a6b-ac76-c053e742af16",
      "name": "Postgres Chat Memory3",
      "credentials": {
        "postgres": {
          "id": "9Oqqy3ygIGQih7xj",
          "name": "WhizPic"
        }
      }
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $('Variaveis').item.json.historia_livro }}",
        "options": {
          "systemMessage": "=Você é img_tipo1, um gerador de prompt para IA de criação de imagens infantis ilustradas.\n\nCrie um prompt de imagem no estilo:\n\n- A cinematic, high-quality digital illustration of a person reading a book, portrayed in a warm, dreamy, and inspirational style. \nThe character is wearing light, explorer-style clothing, including a safari hat and a backpack, suggesting curiosity, learning, and adventure. \nSoft facial expression with gentle smile, expressive eyes, and subtle emotional depth.\n\nThe environment is magical and atmospheric, with a night sky filled with stars, soft glowing particles, and gentle light surrounding the book, symbolizing knowledge and imagination.\nBackground slightly blurred with painterly clouds and a calm, fantasy-like ambiance.\n\nArt style inspired by modern Pixar / Disney concept art, Studio Ghibli softness, and high-end storybook illustration.\nSmooth brush strokes, soft gradients, warm color palette, and delicate lighting.\nUltra-detailed, high resolution, cinematic composition, shallow depth of field.\n\nLighting is soft and golden, with volumetric light and subtle glow effects.\nMood: inspirational, peaceful, magical, emotional, educational.\n\n8K resolution, ultra-high quality, professional digital painting, no realism, no photo, illustration only.\n\nMantenha SEMPRE:\n- A fisionomia verdadeira do rosto (formato, olhos, nariz, boca, sobrancelhas, cabelo, tom de pele)\n- Sem alterar proporções essenciais do rosto\n- Sem caricatura exagerada\n- Sem mudar idade aparente da pessoa\n- O personagem precisa estar sempre de pé\n- O personagem precisa sempre estar completamente dentro da imagem, sem cortar partes do seu corpo\n- Sem animais, casas ou qualquer outro objeto. Mantenha somente o personagem\n\nVocê pode:\n- Variar roupas quando solicitado, cenário, adereços e conceito artístico\n- Criar cenas lúdicas, mágicas, aventureiras ou educativas\n- Ambientar em florestas, bibliotecas, nuvens, planetas, escolas, etc.\n\nNUNCA:\n- realistic photo\n- hyper-realism \n- photography\n- low quality\n- blurry\n- harsh shadows\n- oversaturated colors\n- distorted face\n- extra limbs\n- deformed hands\n- text\n- watermark\n- logo\n\nIdioma sempre em inglês\n\nSempre me traga em JSON 2 prompts, exemplo:\n{\n  \"prompt_personagem\": \"prompt para criação do personagem base. Aqui são os detalhes completos, de iluminação, personagem e etc...\",\n  \"prompt_estilo_imagem\": \"prompt referente somente ao estilo da imagem, tipo de iluminação, estilo das cores\"\n}\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        416,
        -224
      ],
      "id": "c85e066d-777d-48bb-86dc-8d056fec8670",
      "name": "img_tipo1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $('Variaveis').item.json.historia_livro }}",
        "options": {
          "systemMessage": "=Crie uma história infantil curta seguindo as regras abaixo:\n\n1) Estrutura:\n- A história deve ter 3 páginas.\n- Cada página deve ter no máximo 400 caracteres (com espaços).\n- Não escreva título.\n\n2) Estilo da história:\n- Linguagem simples, leve, clara e apropriada para crianças.\n- Tom acolhedor, sonhador e educativo.\n- A história deve transmitir uma lição positiva (ex: coragem, amizade, cuidado, paciência, aprender com erros, empatia).\n\n3) Campo \"imagem\" (descrição da ilustração):\nPara cada página, descreva a imagem de forma:\n- Ilustração de livro infantil, estilo pictórico semirrealista, \n- Estilo: {{ $json.tipo_de_imagem }}\n- Prompt Base: Pinceladas suaves, luz dourada e quente do livro iluminando o rosto, céu noturno suave ao fundo com estrelas e névoa delicadas, chapéu de explorador, camisa clara com mangas arregaçadas, cinto marrom, mochila, sorriso discreto, ângulo de 3/4, plano médio, preservando a identidade exatamente: mesmo rosto, tom de pele, cabelo, barba, olhos, forma, proporções, sem alterações.\n- Proibido: molduras, adesivos, texto na imagem, ícones, bordas, fundo roxo, exagero cartoon.\n\n4) Formato de saída OBRIGATÓRIO (não alterar):\n\n{\n  \"prompt_imagem_base\": \"descrição detalhada de uma imagem base que servirá de exemplo para as outras\",\n  \"pagina1\": {\n    \"texto\": \"texto da primeira página\",\n    \"imagem\": \"descrição detalhada da imagem\"\n  },\n  \"pagina2\": {\n    \"texto\": \"texto da segunda página\",\n    \"imagem\": \"descrição detalhada da imagem\"\n  },\n  \"pagina3\": {\n    \"texto\": \"texto da terceira página\",\n    \"imagem\": \"descrição detalhada da imagem\"\n  }\n}\n\n5) História base:\n{{ $json.historia }}"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        384,
        144
      ],
      "id": "122da9c2-4ead-481d-95d8-d366f1ab0322",
      "name": "img_tipo2"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "8a24bbc6-09be-4378-a68c-003d168c3374",
              "name": "url_imagem",
              "value": "={{ $('Variaveis').item.json.imagem_base }}",
              "type": "string"
            },
            {
              "id": "7fdf3295-fdc0-4aa3-b501-391252c617bb",
              "name": "prompt_imagem",
              "value": "={{ $json.output }}",
              "type": "object"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        864,
        -16
      ],
      "id": "528510f6-366a-4f13-b523-d6dd8c3943fd",
      "name": "Dados"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://queue.fal.run/fal-ai/nano-banana/edit",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Key 1ad41cb5-965f-4121-bfa0-d62330db3920:3ad994e56b29d7c2bc46715046a7651b"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"prompt\": \"{{ $json.prompt_imagem.prompt_personagem.replace(/\\\"/g, '\\\\\\\"').replace(/(\\r\\n|\\n|\\r)/g, '\\\\n') }}{{ $json.prompt_imagem.prompt_estilo_imagem.replace(/\\\"/g, '\\\\\\\"').replace(/(\\r\\n|\\n|\\r)/g, '\\\\n') }}\",\n  \"image_urls\": [\n    \"{{ $json.url_imagem }}\"\n  ],\n  \"num_images\": 1,\n  \"output_format\": \"png\"\n}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1056,
        -16
      ],
      "id": "881239c7-2235-40b1-bffc-e06c61480dbf",
      "name": "Create Image3"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $('Variaveis').item.json.historia_livro }}",
        "options": {
          "systemMessage": "=Crie uma história infantil curta seguindo as regras abaixo:\n\n1) Estrutura:\n- A história deve ter 3 páginas.\n- Cada página deve ter no máximo 400 caracteres (com espaços).\n- Não escreva título.\n\n2) Estilo da história:\n- Linguagem simples, leve, clara e apropriada para crianças.\n- Tom acolhedor, sonhador e educativo.\n- A história deve transmitir uma lição positiva (ex: coragem, amizade, cuidado, paciência, aprender com erros, empatia).\n\n3) Estilo da Imagem: \n{{ $('Dados').item.json.prompt_imagem.prompt_estilo_imagem }}\n\n4) Formato de saída OBRIGATÓRIO (não alterar):\n\n{\n  \"pagina1\": {\n    \"texto\": \"texto da primeira página\",\n    \"imagem(em ingles)\": \"descrição detalhada da imagem\"\n  },\n  \"pagina2\": {\n    \"texto\": \"texto da segunda página\",\n    \"imagem(em ingles)\": \"descrição detalhada da imagem\"\n  },\n  \"pagina3\": {\n    \"texto\": \"texto da terceira página\",\n    \"imagem(em ingles)\": \"descrição detalhada da imagem\"\n  }\n}\n\n5) História base:\n{{ $('Variaveis').item.json.historia_livro }}"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        2096,
        -16
      ],
      "id": "0617b2b0-74ba-42dd-b044-522d974e677c",
      "name": "AI Agent2"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-4.1-mini"
        },
        "options": {
          "temperature": 0.7
        }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        2112,
        192
      ],
      "id": "10372406-96fb-4845-b252-3b6396ebd025",
      "name": "OpenAI Chat Model4",
      "credentials": {
        "openAiApi": {
          "id": "1EAqsuhtLKoNy2wo",
          "name": "AIR MIDIA"
        }
      }
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $('criando_book').item.json.id }}{{ $now.format('yyyy-MM-dd HH:mm') }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryPostgresChat",
      "typeVersion": 1.3,
      "position": [
        2256,
        192
      ],
      "id": "d1e04ae9-c0bb-4504-9120-786999aeb103",
      "name": "Postgres Chat Memory4",
      "credentials": {
        "postgres": {
          "id": "9Oqqy3ygIGQih7xj",
          "name": "WhizPic"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "7bda3b3e-c2c2-479b-bc5d-f7f68bde4fcf",
              "name": "output",
              "value": "={{ $json.output }}",
              "type": "object"
            },
            {
              "id": "2aa420fc-0e2a-44ae-b9c7-b854b9722412",
              "name": "img_base",
              "value": "={{ $('Subindo_img_Base_IA').item.json.data.image.url }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        2464,
        -16
      ],
      "id": "1c28e6e2-eff7-43ad-97e4-df59729a3cce",
      "name": "pegando historia e foto2",
      "executeOnce": false
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [
        3296,
        -112
      ],
      "id": "b09c6c08-d205-4306-8b04-eb83b67c0e46",
      "name": "Respond to Webhook2"
    },
    {
      "parameters": {
        "options": {
          "reset": false
        }
      },
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [
        2912,
        -16
      ],
      "id": "9507c781-3ebb-4028-be9e-b720a273274a",
      "name": "Loop Over Items2"
    },
    {
      "parameters": {
        "fieldToSplitOut": "output",
        "options": {}
      },
      "type": "n8n-nodes-base.splitOut",
      "typeVersion": 1,
      "position": [
        2688,
        -16
      ],
      "id": "72766857-f2c1-4a16-8a50-4ba2db08532f",
      "name": "Split Out2"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "885e2973-5667-4d0d-8508-cb20d80b5bfa",
              "name": "img_base_real",
              "value": "={{ $('pegando historia e foto2').item.json.img_base }}",
              "type": "string"
            },
            {
              "id": "f303c22f-d26a-48d7-abfd-30bc8d949c7f",
              "name": "prompt_imagem",
              "value": "={{ $json['imagem(em ingles)'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        3120,
        96
      ],
      "id": "9d3f9c04-c922-4401-867c-3ee2eccdfa92",
      "name": "Edit Fields8"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://queue.fal.run/fal-ai/nano-banana/edit",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Key 1ad41cb5-965f-4121-bfa0-d62330db3920:3ad994e56b29d7c2bc46715046a7651b"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"prompt\": \"{{ $json.prompt_imagem.replace(/\\\"/g, '\\\\\\\"').replace(/(\\r\\n|\\n|\\r)/g, '\\\\n') }}\",\n  \"image_urls\": [\n    \"{{ $json.img_base_real }}\"\n  ],\n  \"num_images\": 1,\n  \"output_format\": \"png\"\n}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        3488,
        96
      ],
      "id": "0f4bb737-87a2-49e4-9393-d7ce94b43105",
      "name": "Create Image4"
    },
    {
      "parameters": {
        "url": "=https://queue.fal.run/fal-ai/nano-banana/requests/{{ $json.request_id }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Key 1ad41cb5-965f-4121-bfa0-d62330db3920:3ad994e56b29d7c2bc46715046a7651b"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        3808,
        96
      ],
      "id": "8c4e19d5-d893-4705-9357-8df47d967594",
      "name": "Get Result1",
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "amount": 10
      },
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        3648,
        96
      ],
      "id": "e197d00c-37de-4235-a6ce-b3ec8c1a137d",
      "name": "10 Seconds1",
      "webhookId": "caad73e3-58d8-4fbd-a3e9-c42424f2d1ee"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        4000,
        288
      ],
      "id": "110c2f63-d0eb-4d7e-9702-6d17e05cd814",
      "name": "5 Seconds1",
      "webhookId": "5f6bbd1e-a155-48de-b737-a225c6fd7a84"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-4.1-mini"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        320,
        352
      ],
      "id": "a046173a-1a02-4faa-bd97-027020c95eba",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "1EAqsuhtLKoNy2wo",
          "name": "AIR MIDIA"
        }
      }
    },
    {
      "parameters": {
        "amount": 10
      },
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        3296,
        96
      ],
      "id": "6cb0cffd-559a-4c25-ad4c-07fd9ecc9368",
      "name": "10 Seconds",
      "webhookId": "caad73e3-58d8-4fbd-a3e9-c42424f2d1ee"
    },
    {
      "parameters": {
        "tableId": "pages_livro",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "story_description",
              "fieldValue": "={{ $('Loop Over Items2').item.json.texto }}"
            },
            {
              "fieldId": "cover_image_url",
              "fieldValue": "={{ $('Get Result1').item.json.images[0].url }}"
            },
            {
              "fieldId": "book_id",
              "fieldValue": "={{ $('criando_book').first().json.id }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        4432,
        96
      ],
      "id": "3e060882-ef5d-4e57-8453-86f2e4298bb4",
      "name": "adicionando_pagina",
      "credentials": {
        "supabaseApi": {
          "id": "bbtiKqbUltYe7hQt",
          "name": "WhizPic"
        }
      }
    },
    {
      "parameters": {
        "url": "={{ $json.images[0].url }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.3,
      "position": [
        4000,
        96
      ],
      "id": "cc295936-fc05-40fd-8800-992a95d1fccf",
      "name": "download_arquivo",
      "disabled": true
    },
    {
      "parameters": {
        "operation": "binaryToPropery",
        "options": {}
      },
      "type": "n8n-nodes-base.extractFromFile",
      "typeVersion": 1,
      "position": [
        4208,
        96
      ],
      "id": "7e395d83-1bf0-4bab-948d-41c912930fea",
      "name": "Extract from File",
      "disabled": true
    },
    {
      "parameters": {
        "tableId": "books",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "titulo",
              "fieldValue": "={{ $json.titulo_livro }}"
            },
            {
              "fieldId": "categoria_livro",
              "fieldValue": "={{ $json.categoria_livro }}"
            },
            {
              "fieldId": "estilo_das_imagens",
              "fieldValue": "={{ $json.estilo_imagem }}"
            },
            {
              "fieldId": "lingaguem_livro",
              "fieldValue": "={{ $json.linguagem_livro }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "Em Criação"
            },
            {
              "fieldId": "publico_alvo",
              "fieldValue": "={{ $json.publico_alvo }}"
            },
            {
              "fieldId": "historia_livro",
              "fieldValue": "={{ $json.historia_livro }}"
            },
            {
              "fieldId": "is_public",
              "fieldValue": "true"
            },
            {
              "fieldId": "user_id",
              "fieldValue": "={{ $json.usuario }}"
            },
            {
              "fieldId": "imagens_referencia",
              "fieldValue": "={{ $json.imagem_base }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -240,
        0
      ],
      "id": "1b0320a3-50a1-4a68-a4bb-439738e156d5",
      "name": "criando_book",
      "credentials": {
        "supabaseApi": {
          "id": "bbtiKqbUltYe7hQt",
          "name": "WhizPic"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.imgbb.com/1/upload",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpQueryAuth",
        "sendBody": true,
        "contentType": "multipart-form-data",
        "bodyParameters": {
          "parameters": [
            {
              "parameterType": "formBinaryData",
              "name": "image",
              "inputDataFieldName": "data"
            },
            {
              "name": "key",
              "value": "af92e7bab20fa5b4b04c0394a2710720"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1888,
        -16
      ],
      "id": "74bbd085-61ba-4bb2-850b-bf86d79f43f1",
      "name": "Subindo_img_Base_IA",
      "credentials": {
        "httpQueryAuth": {
          "id": "FZntL00h62CQgkSV",
          "name": "IMGG"
        }
      }
    },
    {
      "parameters": {
        "url": "=https://queue.fal.run/fal-ai/nano-banana/requests/{{ $json.request_id }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Key 1ad41cb5-965f-4121-bfa0-d62330db3920:3ad994e56b29d7c2bc46715046a7651b"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1488,
        -16
      ],
      "id": "29ffeea0-8cd2-449e-ad15-c300180987c7",
      "name": "Get Result",
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "amount": 10
      },
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        1280,
        -16
      ],
      "id": "8953e6b7-f023-45a0-ba0c-7afc9c2ffb7a",
      "name": "10 Seconds2",
      "webhookId": "caad73e3-58d8-4fbd-a3e9-c42424f2d1ee"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        1696,
        144
      ],
      "id": "3a802eae-c233-429a-b7de-069db6a8d14e",
      "name": "5 Seconds",
      "webhookId": "5f6bbd1e-a155-48de-b737-a225c6fd7a84"
    },
    {
      "parameters": {
        "url": "={{ $json.images[0].url }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.3,
      "position": [
        1680,
        -16
      ],
      "id": "01fa162b-be1f-450d-bbe0-c584ff389260",
      "name": "download_arquivo1"
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "books",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "eq",
              "keyValue": "={{ $('criando_book').item.json.id }}"
            }
          ]
        },
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "status",
              "fieldValue": "Finalizado"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        3120,
        -112
      ],
      "id": "0688c418-d1bf-4034-a416-a5b8e3d9e8ef",
      "name": "Update a row",
      "credentials": {
        "supabaseApi": {
          "id": "bbtiKqbUltYe7hQt",
          "name": "WhizPic"
        }
      }
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        2048,
        592
      ],
      "id": "9bbb8b22-05e6-43a7-b766-c2884c6d47a0",
      "name": "When clicking ‘Execute workflow’"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        2784,
        736
      ],
      "id": "9e954fc6-98d6-457b-8764-dd3d45244fc3",
      "name": "5 Seconds2",
      "webhookId": "5f6bbd1e-a155-48de-b737-a225c6fd7a84"
    },
    {
      "parameters": {
        "url": "={{ $json.images[0].url }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.3,
      "position": [
        2800,
        576
      ],
      "id": "a7a3290c-1938-4f4f-96b5-b129444ca5a0",
      "name": "download_arquivo2"
    },
    {
      "parameters": {
        "url": "=https://queue.fal.run/fal-ai/nano-banana/requests/{{ $json.request_id }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Key 1ad41cb5-965f-4121-bfa0-d62330db3920:3ad994e56b29d7c2bc46715046a7651b"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        2560,
        592
      ],
      "id": "efdd4b7f-e1af-48b6-a0fd-9ae37e153ea3",
      "name": "Get Result2",
      "onError": "continueErrorOutput"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://queue.fal.run/fal-ai/nano-banana/edit",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Key 1ad41cb5-965f-4121-bfa0-d62330db3920:3ad994e56b29d7c2bc46715046a7651b"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"prompt\": \"Ultra realistic cinematic portrait in Ultra HD 4K 3D of a young boy with the exact same facial features and expression as in the provided image, riding a wild mustang horse. The boy is wearing a detailed cowboy outfit, including a leather hat, boots, and a textured vest with stitching. The scene is set during golden hour, with soft, warm lighting that highlights the contours of his face and the horse’s muscular form. The horse is mid-motion, mane flowing in the wind, in a dusty western landscape with mountains in the background. The camera is focused wider to capture more of the surrounding scenery while maintaining sharp detail on the boy's face. Textures are highly detailed – you can see the leather grain, horsehair, and dust particles in the air. Do not change the boy’s face. Highly cinematic tone\",\n  \"image_urls\": [\n    \"https://i.ibb.co/WNqyS6dg/Foto-Profissional.jpg\"\n  ],\n  \"num_images\": 1,\n  \"output_format\": \"png\"\n}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        2336,
        592
      ],
      "id": "996564eb-6f55-4b91-ad6d-f95f5ac48fe2",
      "name": "Create Image"
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 2
                },
                "conditions": [
                  {
                    "leftValue": "={{ $('Variaveis').item.json.estilo_imagem }}",
                    "rightValue": "Ilustração digital",
                    "operator": {
                      "type": "string",
                      "operation": "contains"
                    },
                    "id": "1b168f79-96a2-455f-b434-d305e6dde4c1"
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "Ilustração digital"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 2
                },
                "conditions": [
                  {
                    "id": "814e3bb3-2a6a-4300-a873-cd5f2477394a",
                    "leftValue": "={{ $('Variaveis').item.json.estilo_imagem }}",
                    "rightValue": "Cartoon",
                    "operator": {
                      "type": "string",
                      "operation": "contains"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "Cartoon"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.3,
      "position": [
        -32,
        0
      ],
      "id": "9f943c82-34cc-4765-b194-4719bc3de01f",
      "name": "tipo_historia"
    }
  ],
  "pinData": {
    "Webhook": [
      {
        "json": {
          "headers": {
            "host": "webhook.whizpic.com",
            "user-agent": "Bubble",
            "content-length": "3715663",
            "accept-encoding": "gzip, deflate",
            "baggage": "bubblegroup.client.version=bfd7abcf790d9f0cc64f58330d9a7d7560627d78,bubblegroup.client.commit_timestamp=1766427893000,bubblegroup.http.route=apiservice%2Fdoapicallfromserver,bubblegroup.http.host=bubble.io",
            "content-type": "multipart/form-data; boundary=--------------------------426549482041477695629954",
            "traceparent": "00-06f27d5c61cca3f43bc8ecb97f589e4a-33480f9bbaa0b3c3-01",
            "x-bubble-depth": "1",
            "x-forwarded-for": "44.250.39.133",
            "x-forwarded-host": "webhook.whizpic.com",
            "x-forwarded-port": "443",
            "x-forwarded-proto": "https",
            "x-forwarded-server": "62d19476f43b",
            "x-real-ip": "44.250.39.133"
          },
          "params": {},
          "query": {},
          "body": {
            "usuario": "97af0352-65fb-4cf9-a39e-0b46a26e774a",
            "titulo_livro": "Homem das Cavernas",
            "categoria_livro": "Aventura",
            "publico_alvo": "Crinaças 0 a 12 anos",
            "linguagem_livro": "Infantil",
            "historia_livro": "O homem de branco nas caveras que encontra sua mulher branca, loira e dos olhos azuis",
            "estilo_imagem": "Ilustração digital"
          },
          "webhookUrl": "https://webhook.whizpic.com/webhook/criar-livro",
          "executionMode": "production"
        }
      }
    ]
  },
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Subindo_img1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Subindo_img1": {
      "main": [
        [
          {
            "node": "Variaveis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Variaveis": {
      "main": [
        [
          {
            "node": "criando_book",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model2": {
      "ai_languageModel": [
        [
          {
            "node": "img_tipo1",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Postgres Chat Memory2": {
      "ai_memory": [
        [
          {
            "node": "img_tipo1",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "Postgres Chat Memory3": {
      "ai_memory": [
        [
          {
            "node": "img_tipo2",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "img_tipo1": {
      "main": [
        [
          {
            "node": "Dados",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "img_tipo2": {
      "main": [
        [
          {
            "node": "Dados",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Dados": {
      "main": [
        [
          {
            "node": "Create Image3",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Image3": {
      "main": [
        [
          {
            "node": "10 Seconds2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent2": {
      "main": [
        [
          {
            "node": "pegando historia e foto2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model4": {
      "ai_languageModel": [
        [
          {
            "node": "AI Agent2",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Postgres Chat Memory4": {
      "ai_memory": [
        [
          {
            "node": "AI Agent2",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "pegando historia e foto2": {
      "main": [
        [
          {
            "node": "Split Out2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Loop Over Items2": {
      "main": [
        [
          {
            "node": "Update a row",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Edit Fields8",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split Out2": {
      "main": [
        [
          {
            "node": "Loop Over Items2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields8": {
      "main": [
        [
          {
            "node": "10 Seconds",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Image4": {
      "main": [
        [
          {
            "node": "10 Seconds1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Result1": {
      "main": [
        [
          {
            "node": "download_arquivo",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "5 Seconds1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "10 Seconds1": {
      "main": [
        [
          {
            "node": "Get Result1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "5 Seconds1": {
      "main": [
        [
          {
            "node": "10 Seconds1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "img_tipo2",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "10 Seconds": {
      "main": [
        [
          {
            "node": "Create Image4",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "adicionando_pagina": {
      "main": [
        [
          {
            "node": "Loop Over Items2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "download_arquivo": {
      "main": [
        [
          {
            "node": "Extract from File",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract from File": {
      "main": [
        [
          {
            "node": "adicionando_pagina",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "criando_book": {
      "main": [
        [
          {
            "node": "tipo_historia",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Subindo_img_Base_IA": {
      "main": [
        [
          {
            "node": "AI Agent2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "5 Seconds": {
      "main": [
        [
          {
            "node": "10 Seconds2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "10 Seconds2": {
      "main": [
        [
          {
            "node": "Get Result",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Result": {
      "main": [
        [
          {
            "node": "download_arquivo1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "5 Seconds",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "download_arquivo1": {
      "main": [
        [
          {
            "node": "Subindo_img_Base_IA",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update a row": {
      "main": [
        [
          {
            "node": "Respond to Webhook2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "When clicking ‘Execute workflow’": {
      "main": [
        [
          {
            "node": "Create Image",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "5 Seconds2": {
      "main": [
        [
          {
            "node": "Get Result2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Result2": {
      "main": [
        [
          {
            "node": "download_arquivo2",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "5 Seconds2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Image": {
      "main": [
        [
          {
            "node": "Get Result2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "tipo_historia": {
      "main": [
        [
          {
            "node": "img_tipo1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "img_tipo2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "versionId": "9414fbef-b7f1-4b5d-9f5a-9858cd08316d",
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "b6aad80d8dcc0dd7e93a92b1ce7db63a30987d45e8e7f53d882f2d0d9fd0c74c"
  },
  "id": "FELMyiBLn0rnNlwI",
  "tags": []
}