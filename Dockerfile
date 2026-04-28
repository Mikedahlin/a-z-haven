# A–Z Haven — Next.js + Prisma
#
#   docker build -t a-z-haven .
#   docker run -p 3000:3000 --env-file .env a-z-haven
#
# For database: run Postgres first (`docker compose up -d`) and set DATABASE_URL in `.env`.

FROM node:20-bookworm-slim
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# postinstall runs `prisma generate` — schema must exist first
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["npx", "next", "start"]
