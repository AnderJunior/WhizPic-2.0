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

### Opção B: Build manual da imagem e depois Stack

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
3. Crie uma **Stack** só com o serviço `web` usando a imagem `whizpic:latest` (sem secção `build`), ou use o `docker-compose.yml` ajustado para não fazer build (apenas `image: whizpic:latest`).

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
