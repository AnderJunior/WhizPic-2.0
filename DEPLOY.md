# Deploy WhizPic na VPS (Docker + Portainer)

Este guia descreve como subir o WhizPic na sua VPS usando Docker e Portainer, com o domínio **app.whizpic.com**.

## Pré-requisitos

- VPS com Docker e Portainer instalados
- Domínio **app.whizpic.com** apontando para o IP da VPS (registro A ou CNAME)
- Projeto Supabase já configurado (URL e chave anon/publishable)

## 1. Variáveis de ambiente

As variáveis são usadas **no momento do build** da imagem (o Vite injeta no bundle).

Crie um arquivo **`.env`** na raiz do projeto (ou no servidor, na pasta onde está o `docker-compose.yml`) com:

```env
# Obrigatório
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Opcional (IA)
VITE_OPENAI_API_KEY=sk-...
VITE_FAL_API_KEY=...
VITE_IMGBB_API_KEY=...
```

Use o ficheiro **env.example** como modelo (copie para `.env` e preencha).

## 2. Deploy no Portainer

### Opção A: Stack a partir do repositório (recomendado)

1. No Portainer: **Stacks** → **Add stack**.
2. Nome da stack: por exemplo `whizpic`.
3. **Build method**: escolha **Repository** e informe:
   - URL do repositório Git (ou use **Upload** se for enviar os ficheiros manualmente).
4. Em **Environment variables** (ou **Load from .env**), carregue o `.env` ou defina as variáveis manualmente.
5. **Deploy the stack**.

O Portainer vai fazer o build da imagem e subir o container. A app fica disponível na porta **80** (ou na porta que configurar no `docker-compose.yml`).

### Opção B: Stack só com YAML + build da imagem no Portainer (Images)

Se preferires criar a stack só com o YAML (sem ligar ao Git na stack) e construir a imagem à parte:

1. **Cria a rede** (se ainda não existir): no Portainer, **Networks** → **Add network** → nome `WhizPicNet` → **Create**.
2. **Stack**: **Stacks** → **Add stack** → nome `whizpic` → cola o conteúdo do `docker-compose.yml` → **Deploy**. O serviço ficará 0/1 até existir a imagem.
3. **Build da imagem**: **Images** → **Build a new image** → **Build from Git**:
   - URL do repositório, branch (ex.: `main`).
   - **Image name**: coloca exatamente **`whizpic:latest`** (é o nome que a stack usa).
   - Em **Build options** → **Build arguments**, adiciona:
     - `VITE_SUPABASE_URL` = tua URL Supabase
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = tua chave
   - **Build**. Quando terminar, a imagem `whizpic:latest` fica disponível.
4. **Redeploy da stack**: **Stacks** → `whizpic` → **Update the stack** → **Pull and redeploy** (ou **Redeploy**). O serviço deve passar a 1/1.

**Importante:** A imagem tem de se chamar **`whizpic:latest`** e o build tem de passar as variáveis `VITE_SUPABASE_*`, senão a app não liga ao Supabase ou o container pode falhar ao iniciar.

### Opção C: Build no PC e importar na VPS

1. Na máquina onde está o código (ou no servidor):
   ```bash
   cd /caminho/para/WhizPic
   # Crie o .env com as variáveis
   docker build -t whizpic:latest \
     --build-arg VITE_SUPABASE_URL="https://..." \
     --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..." \
     .
   docker save whizpic:latest -o whizpic.tar
   ```
2. Envie `whizpic.tar` para a VPS e no Portainer: **Images** → **Import** (ou carregue o tar).
3. **Stacks** → `whizpic` → **Update the stack** → **Redeploy**.

## 3. Domínio app.whizpic.com

- **Sem proxy reverso**: Se o Docker expõe a porta 80 e nada mais usa essa porta na VPS, aponte **app.whizpic.com** para o IP da VPS. O tráfego em `http://app.whizpic.com` vai direto para o container.
- **Com proxy reverso (Traefik / Caddy / Nginx)**:
  - Remova ou comente a secção `ports` do serviço no `docker-compose.yml`.
  - Configure o proxy para encaminhar `Host: app.whizpic.com` para o container (por rede interna ou porta exposta só em localhost). No `docker-compose.yml` há comentários de exemplo para Traefik.

Para HTTPS, use o proxy reverso com Let’s Encrypt (por exemplo Caddy ou Traefik com certificados automáticos).

## 4. Atualizar a aplicação

Sempre que quiser atualizar o sistema:

1. No Portainer, abra a stack **whizpic**.
2. Se usar **Repository**: atualize o código no Git (ou faça upload da nova versão) e clique em **Pull and redeploy** (ou **Update the stack** com **Re-pull image** / **Rebuild**).
3. Se fizer **build na stack**: use **Rebuild** e depois **Redeploy** para recriar o container com a nova imagem.

Assim você sobe e atualiza sempre pela mesma stack no Portainer.

## 5. Resumo dos ficheiros

| Ficheiro           | Função                                              |
|--------------------|-----------------------------------------------------|
| `Dockerfile`       | Build da app Vite + servir com Nginx                |
| `docker-compose.yml` | Stack para Portainer (build + serviço)          |
| `nginx.conf`       | Configuração Nginx (SPA, cache, segurança)         |
| `.dockerignore`    | Reduz contexto do build                             |
| `.env` / `.env.example` | Variáveis de ambiente (build)                  |

Se algo falhar, verifique os **logs** do container da stack no Portainer e confirme que as variáveis `VITE_*` foram passadas no build.
