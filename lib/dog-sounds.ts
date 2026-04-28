import { playSound, sounds } from "@/lib/audio";

/**
 * Single clip for "mom's dog" — put `moms-dog.mp3` in `public/sounds/`.
 * When set, `playDogSfx` uses it for taps/wins (no 13-file set needed).
 */
const USE_MOMS_DOG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_MOMS_DOG_SFX === "1";

export const MOMS_DOG_SFX = "/sounds/moms-dog.mp3";

/**
 * File-based SFX under `public/sounds/dogs/` — only used when
 * `NEXT_PUBLIC_ENABLE_DOG_SFX_FILES=1` (avoids 404s before you add clips).
 * Otherwise uses built-in soft tones from `sounds`.
 * Ignored when `NEXT_PUBLIC_USE_MOMS_DOG_SFX=1`.
 */
const USE_FILE_SFX =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_ENABLE_DOG_SFX_FILES === "1";

/**
 * Mixkit dog SFX live under `public/sounds/dogs/`.
 * Copy your 13 downloads here and name them **01** … **13** with the same extension.
 * If Mixkit only gave `.wav`, set `DOG_SFX_EXT` to `"wav"`.
 */
export const DOG_SFX_EXT = "mp3" as const;

const n = (i: number) =>
  `/sounds/dogs/${String(i).padStart(2, "0")}.${DOG_SFX_EXT}`;

/** All 13 files — order matches your numbered filenames. */
export const DOG_SFX_PATHS: readonly string[] = Array.from(
  { length: 13 },
  (_, idx) => n(idx + 1),
);

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Pet portrait taps — random from these indices (default: all 13).
 * Narrow to `[0,1,2]` etc. once you know which files are short yips vs long barks.
 */
export const TAP_INDICES: readonly number[] = [...Array(13).keys()];

/** Puzzle round complete — same idea; edit to prefer “happy” clips. */
export const WIN_INDICES: readonly number[] = [...Array(13).keys()];

export function playDogSfx(
  which: "tap" | "win",
  enabled: boolean,
  volume = 0.42,
): void {
  if (!enabled) return;
  if (USE_MOMS_DOG) {
    playSound(MOMS_DOG_SFX, { volume, enabled: true });
    return;
  }
  if (!USE_FILE_SFX) {
    if (which === "tap") sounds.tap(true);
    else sounds.reward(true);
    return;
  }
  const pool = which === "tap" ? TAP_INDICES : WIN_INDICES;
  const i = pickRandom([...pool]);
  playSound(DOG_SFX_PATHS[i]!, { volume, enabled: true });
}
