/**
 * Set `NEXT_PUBLIC_ENABLE_DOG_SOURCES=1` after you add AVIF/WebP hero art to `public/images/`.
 * Prevents 404s during development.
 */
export const ENABLE_PET_HERO_SOURCES =
  process.env.NEXT_PUBLIC_ENABLE_DOG_SOURCES === "1";

/** Generic hero `<picture>` sources for stylized placeholder art. */
export function petHeroSources(hasCustomPhoto: boolean) {
  if (hasCustomPhoto || !ENABLE_PET_HERO_SOURCES) return [];
  return [
    { srcSet: "/images/placeholder-pet.avif", type: "image/avif" },
    { srcSet: "/images/placeholder-pet.webp", type: "image/webp" },
  ];
}
