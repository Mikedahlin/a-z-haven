# Deploy with GitHub + Railway

This app is configured for **Railway** (build + run) and **PostgreSQL** (Railway plugin or Docker locally).

## 1. Push the repo to GitHub

1. Create a new repository on GitHub (empty, no README required).
2. In your project folder:

```bash
git init
git add .
git commit -m "Initial commit: Archie & Zeke cozy game"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

## 2. Create a Railway project

1. Open [Railway](https://railway.app/) and sign in (you can use **Login with GitHub**).
2. **New project** → **Deploy from GitHub repo** → authorize Railway and select your repository.
3. Railway will detect Node and use `railway.toml` for build/start.

## 3. Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**.
2. Open the Postgres service → **Variables** (or **Connect**) and copy **`DATABASE_URL`** (or use **Reference variable** from the Postgres plugin into your app service).

## 4. Wire `DATABASE_URL` into the web service

1. Open your **Next.js app service** (the one built from the repo).
2. Go to **Variables**.
3. Add **`DATABASE_URL`**:
   - Click **Add Variable** → **Add Reference** → select the Postgres service → **`DATABASE_URL`** (Railway injects the connection string).

## 5. Add secrets for chat (optional but recommended)

In the **same app service** → **Variables**:

| Name | Value |
|------|--------|
| `OPENAI_API_KEY` | Your OpenAI API key (server-only) |
| `OPENAI_CHAT_MODEL` | Optional, e.g. `gpt-4o-mini` |
| `NODE_ENV` | `production` (often set automatically) |

Do **not** put `OPENAI_API_KEY` in any `NEXT_PUBLIC_*` variable.

## 6. Deploy

1. Railway runs **`npm run build:railway`** (see `railway.toml`), which runs `prisma migrate deploy` then `next build`.
2. After the first successful deploy, optionally run the seed **once** (see below) or rely on client `localStorage` + optional `POST /api/gamestate`.

### One-time database seed on Railway

From your machine (with Railway CLI or a one-off shell), or add a temporary **Run command** in Railway:

```bash
npx prisma db seed
```

(Ensure `DATABASE_URL` points at the same DB.) Or use **Prisma Studio** against the production URL for manual checks.

## 7. Custom domain (optional)

In the app service → **Settings** → **Networking** → generate a Railway URL or attach your domain.

## 8. GitHub → auto deploy

With the repo connected, every push to the tracked branch triggers a new deploy. Use **Settings → Service → Source** to pick branch (e.g. `main`).

## Troubleshooting

- **Build fails on `prisma migrate deploy`**: Ensure `DATABASE_URL` is set **before** build, or that migrations exist under `prisma/migrations/` (they do in this repo).
- **Chat returns 503**: `OPENAI_API_KEY` missing in Railway variables.
- **App listens on wrong port**: Next.js `next start` respects the `PORT` env var Railway sets automatically.

## Files involved

- `railway.toml` — build (`build:railway`) and start command  
- `package.json` — `build:railway` runs migrations + Next build  
- `prisma/schema.prisma` — `provider = "postgresql"`  
- `prisma/migrations/` — initial tables for `GameSave` and `ChatAudit`
