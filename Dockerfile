# ---------- Stage 1: build ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Build-time env only needed for compilation; runtime values come from compose
ENV NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55321
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=build-placeholder
RUN npm run build

# ---------- Stage 2: run (standalone output) ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next standalone output: minimal production server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
