"use client";

import Link from "next/link";
import { PetCanvas } from "@/components/game/PetCanvas";
import { playMomSlotSound } from "@/lib/mom-slot-sound";
import { useGameStore } from "@/store/game-store";
import type { AgeVibe, PetMood } from "@/lib/types";

function moodEmoji(mood: PetMood): string {
  const map: Record<PetMood, string> = {
    idle: "~",
    happy: ":)",
    playful: "o/",
    sleepy: "zZ",
    excited: "**",
    snuggly: "<3",
  };
  return map[mood];
}

function moodLabel(mood: PetMood): string {
  const map: Record<PetMood, string> = {
    idle: "Calm",
    happy: "Happy",
    playful: "Playful",
    sleepy: "Sleepy",
    excited: "Excited",
    snuggly: "Snuggly",
  };
  return map[mood];
}

function welcomeBlurb(
  petName: string,
  mood: PetMood,
  tags: string[],
  ageVibe: AgeVibe,
  happiness: number,
): string {
  const tagLine = tags.length ? ` - ${tags.slice(0, 3).join(" | ")}` : "";
  const era =
    ageVibe === "older"
      ? "A gentle, wise soul beside you."
      : "Bright little moments all day.";
  return `${petName} feels ${moodLabel(mood).toLowerCase()}${tagLine}. ${era} Warmth: ${Math.round(happiness)}%.`;
}

export function HubClient() {
  const petProfile = useGameStore((s) => s.petProfile);
  const mood = useGameStore((s) => s.pet.mood);
  const happiness = useGameStore((s) => s.pet.happiness);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const displayName = petProfile.petName.trim() || "Your companion";
  const displayType = petProfile.petType.trim() || "friend";

  return (
    <div className="space-y-8 pb-8">
      <section className="relative min-h-[480px] overflow-hidden rounded-[2rem] border border-amber-200/60 bg-amber-50/40 shadow-[0_24px_80px_rgba(120,80,40,0.08)] sm:min-h-[520px] sm:rounded-[2.5rem]">
        {/* Native img: public assets must load as /images/... (not /_next/image). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cozy-hub-bg.svg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/85 via-orange-50/35 to-amber-100/55" />
        <div className="relative z-10 space-y-8 px-4 py-10 sm:px-8">
          <header className="space-y-3 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-cozy-cocoa/50">
              Home
            </p>
            <h1 className="font-display text-3xl text-cozy-cocoa text-pretty sm:text-4xl">
              Welcome Home
            </h1>
            {petProfile.onboardingComplete && (
              <p className="text-lg font-medium text-cozy-cocoa/90 sm:text-xl">
                <span className="font-display text-4xl tracking-tight text-amber-950/90 sm:text-5xl">
                  {displayName}
                </span>
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 text-base">
              <span className="text-3xl" aria-hidden>
                {moodEmoji(mood)}
              </span>
              <span className="rounded-full bg-white/75 px-4 py-1.5 text-sm font-medium text-cozy-cocoa shadow-sm backdrop-blur-sm">
                {moodLabel(mood)}
              </span>
            </div>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-cozy-cocoa/80">
              {petProfile.onboardingComplete
                ? welcomeBlurb(
                    displayName,
                    mood,
                    petProfile.tags,
                    petProfile.ageVibe,
                    happiness,
                  )
                : "Create a companion to unlock puzzles, cozy chat, and this little home."}
            </p>
          </header>

          {!petProfile.onboardingComplete && (
            <div className="rounded-3xl border border-cozy-honey/50 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm">
              <p className="text-sm text-cozy-cocoa/85">
                A few taps and you will have a name, a face, and a personality
                to chat with.
              </p>
              <Link
                href="/onboard"
                className="mt-5 inline-flex min-h-[56px] min-w-[220px] items-center justify-center rounded-full bg-cozy-cocoa px-8 text-base font-semibold text-cozy-cream shadow-md transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
              >
                Create Your Pet
              </Link>
            </div>
          )}

          {petProfile.onboardingComplete && (
            <>
              <PetCanvas
                petName={displayName}
                petType={displayType}
                imageUrl={petProfile.imageUrl}
                mood={mood}
                happiness={happiness}
                tags={petProfile.tags}
                ageVibe={petProfile.ageVibe}
                reducedMotion={reducedMotion}
              />

              {petProfile.bio && (
                <p className="text-center text-sm italic leading-relaxed text-cozy-cocoa/75">
                  &quot;{petProfile.bio}&quot;
                </p>
              )}

              <div className="flex flex-col gap-4 sm:mx-auto sm:max-w-md">
                <Link
                  href="/puzzle"
                  onClick={() => playMomSlotSound(soundEnabled)}
                  className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-400 px-8 text-lg font-semibold text-white shadow-[0_16px_40px_rgba(234,88,12,0.35)] transition duration-300 hover:brightness-[1.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 active:scale-[0.99]"
                >
                  Play Puzzle
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full border-2 border-amber-300/90 bg-white/90 px-8 text-lg font-semibold text-amber-950 shadow-sm backdrop-blur-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
                >
                  Chat with {displayName}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <p className="text-center text-sm text-cozy-cocoa/55">
        <Link
          href="/onboard"
          className="font-medium text-cozy-cocoa underline-offset-2 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        >
          Edit Companion
        </Link>
        {" | "}
        <Link
          href="/settings"
          className="font-medium text-cozy-cocoa underline-offset-2 hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        >
          Settings
        </Link>
      </p>
    </div>
  );
}
