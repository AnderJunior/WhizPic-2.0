# ============================================
# Stage 1: Build da aplicação Vite + React
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências (apenas package.json e lock para melhor cache)
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Instala dependências (usa npm se não tiver pnpm-lock)
RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; else npm ci 2>/dev/null || npm install; fi

# Código fonte
COPY . .

# Variáveis de ambiente em tempo de build (Vite injeta no bundle)
# Passe via --build-arg no build ou via env no docker-compose
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_PUBLISHABLE_KEY=""
ARG VITE_OPENAI_API_KEY=""
ARG VITE_FAL_API_KEY=""
ARG VITE_IMGBB_API_KEY=""

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY \
    VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY \
    VITE_FAL_API_KEY=$VITE_FAL_API_KEY \
    VITE_IMGBB_API_KEY=$VITE_IMGBB_API_KEY

RUN npm run build

# ============================================
# Stage 2: Servir com Nginx
# ============================================
FROM nginx:alpine

# Remove config padrão e usa a nossa (SPA + segurança)
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Corrige fins de linha (CRLF do Windows causam exit 2 no nginx)
RUN sed -i 's/\r$//' /etc/nginx/conf.d/default.conf

# Usuário não-root (segurança)
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
