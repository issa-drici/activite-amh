# Dockerfile pour Activités AMH Été 2025
FROM node:18-alpine AS base

# Installer les dépendances nécessaires pour better-sqlite3
RUN apk add --no-cache python3 make g++

# Étape de dépendances
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Étape de build
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Créer le dossier data pour la base de données
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/config.json ./
COPY --from=deps /app/node_modules ./node_modules

# Changer les permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"] 