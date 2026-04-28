# A–Z Haven — Premium cozy virtual pet (MVP)

Web-first cozy game: **create any pet** (species + personality energy + traits), optional **photo URL** (UploadThing-ready later), puzzles, rooms, decor, scrapbook, **server-only OpenAI** chat + insights, Zustand + Prisma `PetProfile`, procedural UI sound, optional ambient audio.

## Quick start (local Postgres)

Database is **PostgreSQL** (same as Railway). Easiest local option:

```bash
docker compose up -d
npm install
copy .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a pet at **`/pet`**, then use **`/hub`**, **`/puzzle`**, **`/rooms`**, **`/decor`**, **`/scrapbook`**, **`/settings`**, and **Chat**.

## Deploy (GitHub + Railway)

Step-by-step: **`DEPLOY_RAILWAY.md`**. Summary: connect the GitHub repo in Railway, add the **PostgreSQL** plugin, reference **`DATABASE_URL`** into the web service, set **`OPENAI_API_KEY`**, and push to deploy (`railway.toml` runs `npm run build:railway`).

## Docs

- Full product + architecture: `PRODUCT_STRATEGY.md` (may still mention older naming in places)
- Env vars: `.env.example`
- Art/audio swap notes: `public/images/README.md`, `public/audio/README.md`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:push` | `prisma db push` (emergency schema sync; prefer migrations) |
| `npm run db:migrate` | `prisma migrate deploy` (use for Railway / prod DB) |
| `npm run db:seed` | Seed sample `PetProfile` + `GameSave` |
| `npm run db:studio` | Prisma Studio |

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, Prisma, PostgreSQL (Docker locally / Railway in prod), OpenAI (server-only for chat + insights).
