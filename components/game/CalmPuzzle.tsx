"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { sounds, resumeAudioContext } from "@/lib/audio";
import { playDogSfx } from "@/lib/dog-sounds";

const PAIRS = 6;

/** Public pet art (each appears on two cards). */
const IMG_FACES: readonly { src: string; label: string }[] = [
  { src: "/images/placeholder-pet.svg", label: "Cloud pet" },
  { src: "/images/archie.svg", label: "Archie" },
  { src: "/images/zeke.svg", label: "Zeke" },
];

/** Simple icons for pairs 3–5 (clear shapes, matchable). */
function IconFace({ id }: { id: "paw" | "heart" | "ball" }) {
  const common = "h-14 w-14 text-amber-800/90";
  if (id === "paw") {
    return (
      <svg className={common} viewBox="0 0 64 64" fill="currentColor" aria-hidden>
        <path d="M20 28c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7zm12-4c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5zm12 0c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5zM20 40c-4 0-7-3-7-7h38c0 4-3 7-7 7H20z" />
      </svg>
    );
  }
  if (id === "heart") {
    return (
      <svg className={common} viewBox="0 0 64 64" fill="currentColor" aria-hidden>
        <path d="M32 52S8 36 8 22c0-6 4-10 10-10 4 0 8 2 10 5 2-3 6-5 10-5 6 0 10 4 10 10 0 14-24 30-24 30z" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 64 64" fill="currentColor" aria-hidden>
      <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M20 20h6v6h-6zm18 0h6v6h-6zm-18 18h6v6h-6zm18 0h6v6h-6z" />
    </svg>
  );
}

type PairId = 0 | 1 | 2 | 3 | 4 | 5;

function buildShuffledDeck(): PairId[] {
  const order: PairId[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = order[i]!;
    order[i] = order[j]!;
    order[j] = a;
  }
  return order;
}

function CardContent({ pairId }: { pairId: PairId }) {
  if (pairId < 3) {
    const f = IMG_FACES[pairId]!;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={f.src}
        alt=""
        className="h-[72px] w-[72px] object-contain drop-shadow-sm"
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (pairId === 3) return <IconFace id="paw" />;
  if (pairId === 4) return <IconFace id="heart" />;
  return <IconFace id="ball" />;
}

function pairLabel(pairId: PairId): string {
  if (pairId < 3) return IMG_FACES[pairId]!.label;
  return ["Paw", "Heart", "Ball"][pairId - 3] ?? "card";
}

export function CalmPuzzle() {
  const petProfile = useGameStore((s) => s.petProfile);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const grantRewards = useGameStore((s) => s.grantRewards);
  const applyPetReaction = useGameStore((s) => s.applyPetReaction);
  const setPetMood = useGameStore((s) => s.setPetMood);
  const recordPuzzleScore = useGameStore((s) => s.recordPuzzleScore);

  const [deck, setDeck] = useState<PairId[]>(buildShuffledDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [lockBoard, setLockBoard] = useState(false);
  const [won, setWon] = useState(false);
  const [aiLine, setAiLine] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const winRewardsApplied = useRef(false);

  const petName = petProfile.petName.trim() || "your friend";

  const matchCount = useMemo(
    () => matched.size / 2,
    [matched],
  );

  const fetchWinMessage = useCallback(async () => {
    setLoadingAi(true);
    setAiLine(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "pet",
          petProfile,
          messages: [
            {
              role: "user",
              content: `Memory puzzle win! ${petName}'s human just matched all the pairs. Reply as ${petName} with exactly one short warm sentence (under 22 words): happy zoomies or cozy thank-you—no tech talk.`,
            },
          ],
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (data.reply?.trim()) setAiLine(data.reply.trim());
      else setAiLine(`${petName} does a joyful little wiggle—you made their day softer.`);
    } catch {
      setAiLine(`${petName} wags so hard the room feels brighter.`);
    } finally {
      setLoadingAi(false);
    }
  }, [petProfile, petName]);

  useEffect(() => {
    if (matchCount < PAIRS) return;
    if (winRewardsApplied.current) return;
    winRewardsApplied.current = true;
    setWon(true);
    grantRewards({ treats: 1, stars: 1, coins: 8 });
    applyPetReaction("puzzle");
    setPetMood("playful");
    recordPuzzleScore(220);
    sounds.reward(soundEnabled);
    playDogSfx("win", soundEnabled, 0.45);
    void fetchWinMessage();
  }, [
    matchCount,
    soundEnabled,
    grantRewards,
    applyPetReaction,
    setPetMood,
    recordPuzzleScore,
    fetchWinMessage,
  ]);

  const tryFlip = useCallback(
    async (index: number) => {
      if (lockBoard || won) return;
      if (matched.has(index)) return;
      if (flipped.includes(index)) return;
      if (flipped.length >= 2) return;

      await resumeAudioContext();
      sounds.tap(soundEnabled);

      if (flipped.length === 0) {
        setFlipped([index]);
        return;
      }

      const a = flipped[0]!;
      const b = index;
      setFlipped([a, b]);
      setLockBoard(true);

      if (deck[a] === deck[b]) {
        setMatched((m) => new Set(m).add(a).add(b));
        setFlipped([]);
        setLockBoard(false);
        sounds.success(soundEnabled);
      } else {
        if (!soundEnabled) {
          // still brief pause so user can see both
        }
        const delay = reducedMotion ? 400 : 900;
        window.setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, delay);
      }
    },
    [lockBoard, won, matched, flipped, deck, soundEnabled, reducedMotion],
  );

  const nextRound = useCallback(() => {
    winRewardsApplied.current = false;
    setDeck(buildShuffledDeck());
    setFlipped([]);
    setMatched(new Set());
    setLockBoard(false);
    setWon(false);
    setAiLine(null);
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-cozy-cocoa/75">
        Flip two cards at a time. When both show the <strong>same picture</strong>, they
        stay. Find all {PAIRS} pairs—no timer, no rush.
      </p>
      <p className="text-center text-xs text-cozy-cocoa/55">
        Pairs: {matchCount} / {PAIRS}
      </p>

      <div className="relative mx-auto max-w-md">
        <div className="grid grid-cols-3 gap-3 p-2 sm:grid-cols-4 sm:gap-3">
          {deck.map((pairId, i) => {
            const isUp = flipped.includes(i) || matched.has(i);
            const isMatched = matched.has(i);
            return (
              <motion.button
                key={i}
                type="button"
                disabled={
                  isMatched || (lockBoard && flipped.length === 2 && !isUp)
                }
                onClick={() => void tryFlip(i)}
                className="relative aspect-square min-h-[80px] overflow-hidden rounded-2xl border-2 border-amber-200/90 bg-amber-50/80 shadow-md outline-none transition focus-visible:ring-4 focus-visible:ring-cozy-honey/55 disabled:cursor-wait"
                whileTap={reducedMotion || isMatched ? undefined : { scale: 0.95 }}
                aria-label={
                  isUp
                    ? `${pairLabel(pairId)}${
                        isMatched ? "—matched" : ""
                      }`
                    : "Hidden card, tap to flip"
                }
                aria-pressed={isUp}
              >
                <div className="absolute inset-0 flex items-center justify-center p-1 [perspective:800px]">
                  {isUp ? (
                    <motion.div
                      key="face"
                      initial={reducedMotion ? false : { rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={
                        isMatched
                          ? "flex h-full w-full items-center justify-center rounded-xl bg-amber-100/90 ring-2 ring-amber-300/80"
                          : "flex h-full w-full items-center justify-center rounded-xl bg-white/90"
                      }
                    >
                      <CardContent pairId={pairId} />
                    </motion.div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-200/95 via-orange-100/90 to-rose-100/90 ring-1 ring-amber-300/50">
                      <span className="text-2xl text-amber-800/50" aria-hidden>
                        ?
                      </span>
                      <span className="mt-1 text-[0.65rem] font-medium tracking-wide text-amber-900/40">
                        tap
                      </span>
                    </div>
                  )}
                </div>
                {isMatched && !reducedMotion && (
                  <motion.span
                    className="pointer-events-none absolute -right-1 -top-1 text-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {won && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {["💛", "✨", "💛", "✨", "🌸"].map((emoji, idx) => (
                <motion.span
                  key={idx}
                  className="absolute text-2xl sm:text-3xl"
                  initial={{ opacity: 0, y: 40, x: (idx - 2) * 18, rotate: -8 + idx * 5 }}
                  animate={{
                    opacity: [0, 1, 0.9],
                    y: [-20 - idx * 8, -90 - idx * 5],
                    x: [(idx - 2) * 22, (idx - 2) * 28],
                  }}
                  transition={{ duration: 1.6 + idx * 0.08, ease: "easeOut", delay: idx * 0.05 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3 text-center">
        {won && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-cozy-cocoa shadow-sm"
          >
            <p className="font-display text-lg text-amber-900/95">
              All pairs found — treats for {petName}!
            </p>
            {loadingAi && (
              <p className="mt-2 text-sm text-cozy-cocoa/65">Whisking up a message…</p>
            )}
            {!loadingAi && aiLine && (
              <p className="mt-2 text-base leading-relaxed text-cozy-cocoa/90">
                “{aiLine}”
              </p>
            )}
            <button
              type="button"
              onClick={nextRound}
              className="mt-4 inline-flex min-h-[52px] min-w-[200px] items-center justify-center rounded-full bg-cozy-cocoa px-6 text-base font-semibold text-cozy-cream transition hover:opacity-95"
            >
              Play again
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <Link
          href="/hub"
          className="rounded-full border border-cozy-cocoa/25 bg-white/70 px-5 py-2.5 font-medium text-cozy-cocoa transition hover:bg-white"
        >
          ← Back home
        </Link>
      </div>
    </div>
  );
}
