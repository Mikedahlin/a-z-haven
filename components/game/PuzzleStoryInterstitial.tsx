"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getPuzzleStoryBeat } from "@/lib/content/puzzle-story";
import { sounds } from "@/lib/audio";

type Props = {
  open: boolean;
  milestone: number;
  petName: string;
  petType: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
  onClose: () => void;
};

export function PuzzleStoryInterstitial({
  open,
  milestone,
  petName,
  petType,
  soundEnabled,
  reducedMotion,
  onClose,
}: Props) {
  const prefersReduced = useReducedMotion();
  const motionOff = reducedMotion || prefersReduced;
  const beat = getPuzzleStoryBeat(milestone, petName, petType);

  useEffect(() => {
    if (!open || motionOff) return;
    const t = window.setTimeout(() => {
      sounds.softChime(soundEnabled);
    }, 400);
    return () => clearTimeout(t);
  }, [open, motionOff, soundEnabled]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-cozy-cocoa/55 backdrop-blur-md"
            aria-label="Close story"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="puzzle-story-title"
            initial={motionOff ? false : { scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={motionOff ? undefined : { scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative z-10 max-h-[min(560px,85vh)] w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/50 bg-cozy-cream/95 shadow-glow"
          >
            <div className="absolute inset-0 bg-story-aurora opacity-90" />
            {!motionOff && (
              <>
                <motion.div
                  className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-cozy-honey/30 blur-2xl"
                  animate={{ x: [0, 12, 0], opacity: [0.35, 0.55, 0.35] }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -right-6 bottom-12 h-40 w-40 rounded-full bg-cozy-sky/35 blur-3xl"
                  animate={{ y: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 9, repeat: Infinity }}
                />
              </>
            )}
            <div className="relative max-h-[inherit] overflow-y-auto p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-cozy-cocoa/50">
                Milestone · Level {milestone}
              </p>
              <h2
                id="puzzle-story-title"
                className="mt-3 font-display text-2xl leading-snug text-cozy-cocoa"
              >
                {beat.title}
              </h2>
              <div className="mt-6 space-y-4">
                {beat.lines.map((line, i) => (
                  <motion.p
                    key={i}
                    className="text-sm leading-relaxed text-cozy-cocoa/85"
                    initial={motionOff ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: motionOff ? 0 : 0.15 + i * 0.22,
                      duration: 0.45,
                    }}
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
              <motion.p
                className="mt-6 rounded-2xl border border-cozy-honey/35 bg-white/50 px-4 py-3 text-sm italic text-cozy-cocoa/80"
                initial={motionOff ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: motionOff ? 0 : 0.85 }}
              >
                {beat.kicker}
              </motion.p>
              <motion.div
                className="mt-8 flex justify-center"
                initial={motionOff ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: motionOff ? 0 : 1.05 }}
              >
                <motion.span
                  className="inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-cozy-cocoa/15 bg-gradient-to-br from-cozy-blush/60 to-cozy-sky/40 text-4xl shadow-inner"
                  animate={
                    motionOff
                      ? {}
                      : { scale: [1, 1.06, 1], rotate: [0, -4, 4, 0] }
                  }
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  aria-hidden
                >
                  ✨
                </motion.span>
              </motion.div>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 w-full min-h-[52px] rounded-full bg-cozy-cocoa px-6 text-base font-semibold text-cozy-cream shadow-glow"
              >
                Continue playing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
