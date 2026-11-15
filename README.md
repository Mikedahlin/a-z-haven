# A–Z Haven

An interactive virtual pet application built for the browser. Users can create a pet, explore rooms, complete puzzles, collect decor, maintain a scrapbook, and interact with optional AI-assisted features.

## Technical overview

- Next.js 15 App Router
- TypeScript and Tailwind CSS
- Framer Motion and Zustand
- Prisma with PostgreSQL
- Docker for local database development
- Server-only OpenAI integration for chat and insights

## Run locally

Start the local PostgreSQL service, install dependencies, configure the environment, and apply the database schema:

```bash
docker compose up -d
npm install
copy .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The primary application routes include `/pet`, `/hub`, `/puzzle`, `/rooms`, `/decor`, `/scrapbook`, and `/settings`.

## Deployment

See [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) for the Railway deployment process, database configuration, and environment variables. API keys are intended to remain server-side.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Apply production database migrations |
| `npm run db:seed` | Seed sample application data |
| `npm run db:studio` | Open Prisma Studio |

Supporting product and architecture notes are available in `PRODUCT_STRATEGY.md`.
