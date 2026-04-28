# A–Z Haven (Moms_Games + BMO Tamagotchi merged) — PRD

## Original Problem Statement
> Build this and integrate my Moms_Games features: git clone https://github.com/RidwanHaque/BMO-Embedded-Fullstack-AI-Tamagotchi.git
>
> User clarified: "Moms_Games" is the user's a-z-haven repo (https://github.com/Mikedahlin/a-z-haven). Wants real dog/animal photos to choose from, OpenAI image generation for custom portraits, AI-driven storyline about Archie & Zeke with lots of images, premium vibe. Use own OpenAI key + Google OAuth.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). Routes: /api/auth/google, /api/auth/me, /api/auth/logout, /api/gamestate, /api/chat, /api/image/generate, /api/story/chapter, /api/story/outline, /api/pet, /api/health
- **Frontend**: React 19 + Tailwind + Framer Motion + react-router + sonner + @react-oauth/google
- **AI**: OpenAI gpt-4o-mini (chat) + gpt-image-1 (images) via emergentintegrations using user's own OPENAI_API_KEY
- **Auth**: Google OAuth 2.0 with user's own Client ID/Secret. Backend verifies ID token, issues HS256 JWT cookie + Bearer

## User Personas
- Casual cozy-game players ("cozy evening on the couch")
- Dog lovers; the named pet is always the star

## Core Requirements (static)
1. Pet picker with real dog/animal photos + AI-generated portraits
2. AI-driven storyline about Archie & Zeke with images per chapter
3. Multi-persona chat (Assistant / Archie / Zeke / BMO / your-pet) with safety + ≤90 word brevity tenets
4. Calm 6×6 match-3 puzzle and BMO Snake minigame
5. Currency system (coins/treats/bones/decor tokens/stars), rooms unlocking, decor placement
6. Tamagotchi stats (happiness/energy) with gentle decay
7. Scrapbook of memory entries unlocked by stars
8. Google sign-in, server-side persistence with local-first save
9. Premium cozy aesthetic: warm earthy palette, Fraunces + Nunito, grain texture, Framer Motion reveals

## Implemented (2026-04-28)
- Backend: full server.py + routes (auth, gamestate, chat, image, story, pet, health), personas with pet canon, JWT helpers, Google ID token verification
- Frontend: Landing (Google sign-in), Onboard (photo picker + AI gen + name/personality), Hub (reward strip + dog portraits + my pet card + shortcuts), Puzzle (match-3 with cascade scoring & rewards), Snake (BMO classic with high-score), Rooms (unlocking), Decor (buy + place), Story (AI chapters with generated images), Scrapbook (star-locked memories), Chat (4 persona modes), Settings (toggles + reset + signout)
- Design: warm cream/terracotta/moss/ochre palette, Fraunces serif headings, Nunito body, grain texture, soft float animations, asymmetric bento Hub
- Persistence: localStorage local-first + debounced server sync via /api/gamestate

## Backlog (P1)
- Stripe shop for premium decor packs (skipped v1)
- Voice input (browser mic + Whisper)
- ESP32 hardware bridge endpoints
- Dog SFX bundles (mp3 files in public/sounds)
- More polished puzzle interstitial story moments
- Personality slider (0 calm → 100 bouncy) UI

## Backlog (P2)
- Per-chapter image regeneration
- Daily greeting at sign-in via /api/chat with mode=narrator
- Friend/sharing
- Mobile install prompt (PWA)

## Next Tasks
- Run testing_agent_v3 end-to-end
- Address any failures
- Finish & deliver
