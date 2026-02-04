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

### Opção B (recomendada): Clonar na VPS → Build na VPS → Criar a Stack

Fluxo principal: repositório fica na VPS; o build é feito na VPS com as variáveis; a Stack no Portainer só usa a imagem já construída.

#### Passo 1: Rede e repositório na VPS

1. **Cria a rede** no Portainer (se ainda não existir): **Networks** → **Add network** → nome `WhizPicNet` → **Create**.
2. Na **VPS** (SSH ou consola), clona o repositório e entra na pasta:
   ```bash
   cd /opt   # ou outro diretório à tua escolha
   git clone https://github.com/AnderJunior/WhizPic-2.0.git WhizPic
   cd WhizPic
   ```
3. Cria o ficheiro `.env` na pasta do projeto (copiar de `env.example`) e preenche:
   ```bash
   cp env.example .env
   nano .env   # ou vim .env
   ```
   Coloca pelo menos:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

#### Passo 2: Build da imagem na VPS

4. Na mesma pasta (`WhizPic`), faz o build. **O ponto (`.`)** no fim é o contexto de build (pasta atual). Para evitar erros no terminal, escreve o ponto **na mesma linha** do último `--build-arg`:
   ```bash
   docker build -t whizpic:latest --build-arg VITE_SUPABASE_URL="https://teu-projeto.supabase.co" --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..." .
   ```
   Ou, com quebras de linha (cada `\` junta a linha seguinte; o `.` tem de ficar na última linha):
   ```bash
   docker build -t whizpic:latest \
     --build-arg VITE_SUPABASE_URL="https://teu-projeto.supabase.co" \
     --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..." .
   ```
   Se tiveres o `.env` na pasta:
   ```bash
   export $(grep -v '^#' .env | xargs)
   docker build -t whizpic:latest --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" .
   ```
5. Confirma que a imagem existe: `docker images | grep whizpic` → deve aparecer `whizpic` com tag `latest`.

#### Passo 3: Criar a Stack no Portainer

6. No **Portainer**: **Stacks** → **Add stack** → nome: `whizpic`.
7. **Build method**: **Web editor** (só YAML, sem repositório).
8. Cola o conteúdo do ficheiro **`docker-compose.stack-only.yml`** do projeto (ou o YAML abaixo).
9. **Deploy the stack**.

A stack usa a imagem `whizpic:latest` que já está na VPS; não faz build.

**Para atualizar no futuro:** na VPS, na pasta do repo: `git pull`, depois repetir o `docker build -t whizpic:latest ...` e no Portainer **Stacks** → `whizpic` → **Update the stack** → **Redeploy**.

---

### Opção A: Stack com repositório (build feito pelo Portainer)

O build é feito pelo Portainer ao fazer deploy da stack (repositório + variáveis na stack).

1. **Networks** → **Add network** → nome `WhizPicNet` → **Create**.
2. **Stacks** → **Add stack** → nome `whizpic` → **Build method**: **Repository** → URL do Git (ex. `https://github.com/AnderJunior/WhizPic-2.0.git`).
3. Em **Environment variables** da stack, adiciona `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. No editor, cola o **docker-compose.yml** do projeto (o que tem secção `build`).
5. **Deploy the stack**. Para atualizar: **Update the stack** → **Rebuild** e redeploy.

### Opção C: Build no PC e importar na VPS

Build no teu PC com `docker build --build-arg ...`, depois `docker save`, envia o `.tar` para a VPS e no Portainer **Images** → **Import**. A stack usa o ficheiro **docker-compose.stack-only.yml** (só `image: whizpic:latest`, sem `build`).

## 3. Domínio app.whizpic.com

- **Sem proxy reverso**: Se o Docker expõe a porta 80 e nada mais usa essa porta na VPS, aponte **app.whizpic.com** para o IP da VPS. O tráfego em `http://app.whizpic.com` vai direto para o container.
- **Com proxy reverso (Traefik / Caddy / Nginx)**:
  - Remova ou comente a secção `ports` do serviço no `docker-compose.yml`.
  - Configure o proxy para encaminhar `Host: app.whizpic.com` para o container (por rede interna ou porta exposta só em localhost). No `docker-compose.yml` há comentários de exemplo para Traefik.

Para HTTPS, use o proxy reverso com Let’s Encrypt (por exemplo Caddy ou Traefik com certificados automáticos).

## 4. Atualizar a aplicação

- **Se usas Opção B (clonar + build na VPS):** Na VPS, na pasta do repo (`/opt/WhizPic` ou onde clonaste): `git pull`, depois volta a correr o `docker build -t whizpic:latest ...` com os mesmos `--build-arg`. No Portainer: **Stacks** → **whizpic** → **Update the stack** → **Redeploy**.
- **Se usas Opção A (stack com repositório):** No Portainer, **Stacks** → **whizpic** → **Update the stack** → **Rebuild** (e redeploy). O código é obtido do Git pelo Portainer.
- **Se usas Opção C (build no PC):** Volta a fazer build no PC, importar a nova imagem na VPS e **Redeploy** na stack.

## 5. Resumo dos ficheiros

| Ficheiro                        | Função                                                       |
|---------------------------------|--------------------------------------------------------------|
| `Dockerfile`                    | Build da app Vite + servir com Nginx                         |
| `docker-compose.yml`           | Stack com build (usado na Opção A)                           |
| `docker-compose.stack-only.yml`| Stack só com imagem (usado na Opção B e C – sem build)       |
| `nginx.conf`                   | Configuração Nginx (SPA, cache, segurança)                   |
| `.dockerignore`                | Reduz contexto do build                                      |
| `env.example`                  | Modelo para `.env` (variáveis de build)                      |

Se algo falhar, verifique os **logs** do container da stack no Portainer e confirme que as variáveis `VITE_*` foram passadas no build.
