# Archie & Zeke — Product strategy, design, and technical architecture

This document satisfies Phases 1–2 of the MVP build and points to the implemented code in this repository.

---

## 1. PRODUCT STRATEGY

### Title ideas (8–12)

1. Archie & Zeke: The Soft House  
2. Two Dogs, One Home  
3. Cozy Paws & Warm Floors  
4. The Archie & Zeke Hour  
5. Home With Archie & Zeke  
6. Little Barks, Big Love  
7. The Gentle Yard  
8. Starlight for Two Dogs  
9. Archie & Zeke’s Memory Nook  
10. Warm Rugs & Wagging Hearts  

### One-sentence pitch

A premium, web-first cozy world built **only** around Archie and Zeke—puzzles, rooms, memories, and a warm AI companion that keeps their story emotionally close.

### Full concept

An emotionally comforting, non-technical-friendly experience for adults who love dogs, cozy games, decorating, and gentle ChatGPT-style help. Every screen reinforces Archie and Zeke as the **only** stars: no other pets, no substitutes.

### Core gameplay loop

Complete a short relaxing tile match → earn treats, bones, coins, decor tokens, and stars → unlock rooms and decor → see moods shift → unlock scrapbook pages → chat for greetings, guidance, and stories **about Archie and Zeke only**.

### Archie — personality profile

- Gentle-hearted, observant, quietly devoted; loves tidy comfort and soft light.  
- Favorite toys: soft tug rope, quiet squeaky.  
- Rooms: warm neutrals, tidy corners, calm lamps.  
- Reactions: polite tail thumps, slow head tilts, steady lean-ins.  
- Idle: soft breathing, content side-eye toward Zeke.  
- AI voice: sincere, poetic-brief, calm, never loud.

### Zeke — personality profile

- Bright, affectionate, play-forward; celebrates small wins like championships.  
- Favorite toys: bouncy ball, anything suspiciously round.  
- Rooms: open floors, sunny patches, zoomie-friendly space.  
- Reactions: full-body wag, play bows, dramatic flops.  
- Idle: anticipatory wiggles, one eye on Archie.  
- AI voice: effervescent, sweetly chaotic, sincere sparkle.

### AI chat concept

Server-side OpenAI only; warm, safe, Archie/Zeke-themed; can answer as Archie or Zeke on request; daily greetings and bedtime messages; unlock suggestions without pressure.

### MVP feature list (implemented)

Landing, hub, puzzle, rewards strip, room unlocks, decor placement, dog moods, scrapbook, AI chat panel, settings with save reset, local persist + optional DB sync.

### Premium graphics direction

Cinematic cozy lighting, warm interiors, card UI, soft glow, elegant gradients—placeholder SVG portraits in `public/images/` with clear upgrade path via `<picture>` (`ResponsiveImage`).

### Wireframe ideas (text)

- **Landing:** title, warm paragraph, two large CTAs (Enter / Puzzle).  
- **Hub:** reward strip, current room card, two large dog portrait cards, shortcuts.  
- **Puzzle:** header + 6×6 board + score/moves + new board.  
- **Rooms:** vertical list of room cards; unlock or visit.  
- **Decor:** grouped by room; tap to place.  
- **Scrapbook:** list of entries; locked state copy.  
- **Settings:** toggles + reset.  
- **Chat:** floating “Chat” button; full-screen dialog with modes.

### Reward & currency system

**Coins, treats, bones, decor tokens, stars** — granted from puzzle clears; rooms cost coins + stars; decor costs decor tokens (first purchase only per item, then “owned”).

### Emotional retention

Scrapbook unlocks by stars; room flavor text; dog moods after play; gentle AI tone; no timers or pressure.

### Soft monetization (future)

Cosmetic decor packs, seasonal packs, premium memory packs, optional themes, optional subscription for expanded AI—**never** dark patterns or pay-to-win.

### First 30 progression beats (summary)

Unlock sleeping/living → first puzzle runs → earn coins/stars → unlock kitchen/backyard/bath → place decor → unlock memory gallery → seasonal/birthday rooms → deepen scrapbook → repeat with new decor and chat prompts.

### What makes Archie & Zeke unforgettable

Specificity: every line of copy names **them**; two distinct voices; rituals (treat kitchen, backyard fetch vs dignified supervision); memories that feel like real love, not generic “pet game” filler.

---

## 2. GAME DESIGN

See `lib/content/dogs.ts`, `lib/content/rooms.ts`, `lib/content/decor.ts`, `lib/content/scrapbook.ts` for authoritative copy and numbers.

---

## 3. UX / UI DIRECTION

Large tap targets (min ~48px), bottom navigation, persistent chat FAB, readable type (DM Sans + Fraunces), reduced-motion toggle, cozy palette in `tailwind.config.ts`.

---

## 4. PROGRESSION DESIGN

- Puzzle score feeds `recordPuzzleScore` → `puzzleLevel` derived from best score curve.  
- `grantRewards` updates currencies and auto-reconciles scrapbook unlocks by star count.  
- Rooms gate decor lists.

---

## 5. TECH ARCHITECTURE

- **Framework:** Next.js App Router, TypeScript, Tailwind.  
- **Motion:** Framer Motion.  
- **State:** Zustand + `persist` to `localStorage` (`archie-zeke-save`).  
- **Data:** Prisma + **PostgreSQL** (Docker locally, Railway Postgres in production); `GameSave` JSON blob. See `DEPLOY_RAILWAY.md`.  
- **AI:** `POST /api/chat` — OpenAI on server only; rate limit per IP; validation in `lib/validation.ts`.  
- **Sync:** `GET/POST /api/gamestate` — optional; local save wins if present; server hydrates only when no local key.

---

## 6. DATABASE SCHEMA

See `prisma/schema.prisma`: `GameSave` (id `default`, JSON `data`), optional `ChatAudit` when `CHAT_AUDIT_LOG=1`.

---

## 7. API DESIGN

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/chat` | POST | `{ messages: {role, content}[], mode?: "assistant"\|"archie"\|"zeke" }` | `{ reply }` or `{ error, retryAfterMs? }` |
| `/api/gamestate` | GET | — | `{ state: ClientGameState, warning?: "db_unavailable" }` |
| `/api/gamestate` | POST | `{ state: ClientGameState }` | `{ ok: boolean }` |

Shared types: `lib/types.ts` (`ClientGameState`).

---

## 8. FILE TREE (high level)

```
app/
  layout.tsx, page.tsx, globals.css
  (game)/layout.tsx, hub|puzzle|rooms|decor|scrapbook|settings/page.tsx
  api/chat/route.ts, api/gamestate/route.ts
components/
  game/*   ui/ResponsiveImage.tsx
lib/
  types.ts, game-state.ts, prisma.ts, audio.ts, puzzle.ts, rate-limit.ts, validation.ts, chat-prompt.ts, media.ts
  content/rooms.ts, decor.ts, scrapbook.ts, dogs.ts
store/game-store.ts
prisma/schema.prisma, seed.ts
public/images/*.svg, audio/README.md
```

---

## 9. IMPLEMENTATION PLAN (done for MVP)

1. Scaffold Next + Tailwind + Prisma.  
2. Types + Zustand + content modules.  
3. Game shell (nav, chat, sync, ambient).  
4. Screens: landing, hub, puzzle, rooms, decor, scrapbook, settings.  
5. APIs: chat + gamestate + env validation.  
6. Build + lint + document env and art/audio swap.

---

## 10. CODE

The codebase in this folder **is** the implementation. Key entry points:

- `app/page.tsx` — landing  
- `app/(game)/hub/page.tsx` — main hub  
- `components/game/PuzzleBoard.tsx` — match-3 style puzzle  
- `components/game/ChatPanel.tsx` — AI UI  
- `app/api/chat/route.ts` — secure OpenAI  
- `components/ui/ResponsiveImage.tsx` — `<picture>` + Next `Image`  
- `lib/audio.ts` — procedural UI sounds (no asset required)  

---

## Outside resources — exact setup

### A. OpenAI (required for chat)

1. Create an account at [OpenAI](https://platform.openai.com/).  
2. Open **API keys** → **Create new secret key**.  
3. In the project folder, copy `.env.example` to `.env` (or edit `.env`).  
4. Set `OPENAI_API_KEY="sk-..."` (server-only; never put this in client code).  
5. Optional: set `OPENAI_CHAT_MODEL` (defaults to `gpt-4o-mini`).  
6. Run `npm run dev` and open the app → **Chat** → send a message.  
7. For production (e.g. **Railway**): add the same env vars on the service → **Variables** → redeploy. See `DEPLOY_RAILWAY.md`.

### B. AVIF/WebP dog art (`<picture>`)

1. Export portraits (e.g. 800×800) as `archie.avif`, `archie.webp`, `zeke.avif`, `zeke.webp` (plus optional PNG fallback).  
2. Place files in `public/images/`.  
3. Set `NEXT_PUBLIC_ENABLE_DOG_SOURCES=1` in `.env`.  
4. Restart `npm run dev`. `DogCard` will serve modern formats via `lib/media.ts` + `ResponsiveImage`.

### C. Ambient music loop

1. Add a calm MP3 as `public/audio/ambient-cozy.mp3`.  
2. Enable **Ambient music** in Settings (and UI sounds).  
3. The `AmbientAudio` component will play at low volume; if the file is missing, it disables itself quietly.

### D. PostgreSQL (production DB)

1. **Railway:** Add the Postgres plugin → reference `DATABASE_URL` into your app service (`DEPLOY_RAILWAY.md`).  
2. **Local:** `docker compose up -d` then `npx prisma migrate deploy`.  
3. `schema.prisma` uses `provider = "postgresql"`; migrations live in `prisma/migrations/`.

---

## Security checklist (MVP)

- API key only in server env ✓  
- Chat via `POST /api/chat` only ✓  
- Rate limiting (`lib/rate-limit.ts`) ✓  
- Input length limits (`sanitizeChatMessage`) ✓  
- System prompt not exposed to client ✓  
- Optional audit rows with `CHAT_AUDIT_LOG=1` ✓  
