"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { petHeroSources } from "@/lib/media";
import { motionPersonalityFromProfile } from "@/lib/pet-animation";
import { sounds, resumeAudioContext } from "@/lib/audio";
import { playDogSfx } from "@/lib/dog-sounds";
import { useGameStore } from "@/store/game-store";
import type { PetMood } from "@/lib/types";

type Props = {
  petName: string;
  petType: string;
  imageUrl: string | null;
  mood: PetMood;
  happiness: number;
  tags: string[];
  ageVibe: "younger" | "older";
  reducedMotion: boolean;
};

/** Living portrait — idle breathing, tail overlay, head tilt, tap = zoomies or gentle sway. */
export function PetCanvas({
  petName,
  petType,
  imageUrl,
  mood,
  happiness,
  tags,
  ageVibe,
  reducedMotion,
}: Props) {
  const prefersReduced = useReducedMotion();
  const motionOff = reducedMotion || prefersReduced;
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const applyPetReaction = useGameStore((s) => s.applyPetReaction);
  const setPetMood = useGameStore((s) => s.setPetMood);
  const bumpHappiness = useGameStore((s) => s.bumpHappiness);

  const style = motionPersonalityFromProfile({ tags, ageVibe });
  const energetic = style === "bouncy";
  const calm = style === "gentle";

  const [burst, setBurst] = useState<"none" | "zoomies" | "soft">("none");

  const fallback = "/images/placeholder-pet.svg";
  const sources = petHeroSources(!!imageUrl);

  const onPetTap = useCallback(async () => {
    await resumeAudioContext();
    playDogSfx("tap", soundEnabled, 0.4);
    if (energetic) {
      setBurst("zoomies");
      sounds.wag(soundEnabled);
      applyPetReaction("play");
      setPetMood("excited");
    } else if (calm) {
      setBurst("soft");
      sounds.softChime(soundEnabled);
      bumpHappiness(5);
      setPetMood("snuggly");
    } else {
      setBurst("zoomies");
      sounds.reward(soundEnabled);
      applyPetReaction("play");
      setPetMood("happy");
    }
    window.setTimeout(() => setBurst("none"), 900);
  }, [
    energetic,
    calm,
    soundEnabled,
    applyPetReaction,
    setPetMood,
    bumpHappiness,
  ]);

  const breathe = !motionOff;
  const tailFast = energetic || mood === "playful" || mood === "excited";

  return (
    <div className="relative mx-auto w-full max-w-md">
      <motion.div
        className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-b from-cozy-blush/40 to-cozy-sky/25 shadow-[0_20px_60px_rgba(74,55,40,0.12)]"
        animate={
          breathe
            ? {
                scale: [1, 1.018, 1],
              }
            : {}
        }
        transition={{
          duration: 4.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.button
          type="button"
          onClick={() => void onPetTap()}
          aria-label={`Spend a moment with ${petName}`}
          className="relative h-full w-full overflow-hidden text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 focus-visible:ring-offset-2"
          animate={
            motionOff
              ? {}
              : burst === "zoomies"
                ? {
                    y: [0, -14, -6, -12, 0],
                    rotate: [0, -3, 2, -2, 0],
                    scale: [1, 1.04, 1.02, 1],
                  }
                : burst === "soft"
                  ? {
                      y: [0, -4, -2, 0],
                      rotate: [0, -2, 1, 0],
                    }
                  : {}
          }
          transition={{
            duration: burst === "zoomies" ? 0.85 : 0.9,
            ease: "easeOut",
          }}
          whileTap={motionOff ? undefined : { scale: 0.97 }}
        >
          {/* Portrait layer + subtle head tilt */}
          <motion.div
            className="relative h-full w-full"
            animate={
              motionOff
                ? {}
                : {
                    rotateZ: burst === "none" ? [0.8, -0.8, 0.6, -0.4, 0] : 0,
                  }
            }
            transition={{
              duration: burst === "none" ? 8 : 0.3,
              repeat: burst === "none" ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={petName}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ResponsiveImage
                sources={sources}
                fallbackSrc={fallback}
                alt={`${petType} art`}
                width={800}
                height={800}
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            )}

            {/* Warm vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cozy-cocoa/35 via-transparent to-amber-100/15" />

            {/* “Tail” — abstract wag along the edge */}
            {!motionOff && (
              <motion.div
                className="pointer-events-none absolute bottom-[8%] right-[6%] h-28 w-10 origin-top rounded-full bg-gradient-to-b from-cozy-cocoa/35 to-cozy-cocoa/10 blur-[1px]"
                animate={{
                  rotate: tailFast ? [12, -18, 10, -14, 12] : [6, -8, 5, -6, 6],
                }}
                transition={{
                  duration: tailFast ? 0.55 : 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Idle sparkle */}
            {!motionOff && (
              <motion.div
                className="pointer-events-none absolute left-[12%] top-[18%] h-3 w-3 rounded-full bg-white/50 blur-[1px]"
                animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.15, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Foreground label */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-cozy-cocoa/70 via-cozy-cocoa/25 to-transparent px-5 pb-5 pt-16 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/90">
              {petType} · {Math.round(happiness)}% warmth
            </p>
            <p className="mt-2 text-sm text-white/90">Tap for love</p>
          </div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {burst === "zoomies" && !motionOff && (
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-start justify-center pt-8"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-cozy-cocoa shadow-lg">
              Zoomies!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
