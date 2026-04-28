"use client";

import { motion } from "framer-motion";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { petHeroSources } from "@/lib/media";
import type { PetMood } from "@/lib/types";

const moodLabel: Record<PetMood, string> = {
  idle: "Softly present",
  happy: "Warm glow",
  playful: "Playful spark",
  sleepy: "Sleepy-soft",
  excited: "Bright delight",
  snuggly: "Snuggle mode",
};

export function PetCard({
  name,
  species,
  mood,
  photoUrl,
  blurb,
  reducedMotion,
}: {
  name: string;
  species: string;
  mood: PetMood;
  photoUrl: string | null;
  blurb: string;
  reducedMotion: boolean;
}) {
  const fallback = "/images/placeholder-pet.svg";
  const sources = petHeroSources(!!photoUrl);

  return (
    <motion.article
      className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-card backdrop-blur"
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="relative aspect-square w-full bg-gradient-to-b from-cozy-blush/40 to-cozy-sky/20">
        {photoUrl ? (
          // User-supplied HTTPS URLs; optimize later via UploadThing + next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ResponsiveImage
            sources={sources}
            fallbackSrc={fallback}
            alt={`Stylized ${species}`}
            width={800}
            height={800}
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-cozy-cocoa/35 to-transparent p-4">
          <p className="text-sm font-medium text-white drop-shadow">
            {moodLabel[mood]}
          </p>
        </div>
      </div>
      <div className="space-y-2 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cozy-cocoa/45">
          {species}
        </p>
        <h3 className="font-display text-2xl text-cozy-cocoa">{name}</h3>
        <p className="text-sm leading-relaxed text-cozy-cocoa/80">{blurb}</p>
      </div>
    </motion.article>
  );
}
