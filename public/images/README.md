# Hub background

- `cozy-hub-bg.svg` — default soft “living room” placeholder. Replace with your own **`cozy-hub-bg.jpg`** or **`cozy-hub-bg.webp`** (same path/name) for a photo from e.g. Unsplash/Pexels—warm light, sofa or backyard; keep it wide (~1600×1000).
- Update `HubClient` `Image` `src` if you use a different filename.

# Art swap (Archie & Zeke)

Drop production art into this folder:

- `archie.avif`, `archie.webp`, `archie.png` (or keep `archie.svg`)
- `zeke.avif`, `zeke.webp`, `zeke.png` (or keep `zeke.svg`)

Then update `ResponsiveImage` `sources` where used (for example in `components/game/DogCard.tsx`) to point at your AVIF/WebP sets. The `<picture>` element will prefer modern formats and fall back safely.

Recommended export sizes for hero cards: **800×800** (1×) and optional `1600×1600` (`srcSet` with descriptors).
