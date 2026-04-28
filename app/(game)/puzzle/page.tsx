"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const CalmPuzzle = dynamic(
  () =>
    import("@/components/game/CalmPuzzle").then((m) => m.CalmPuzzle),
  { ssr: false, loading: () => <PuzzleLoading /> },
);

function PuzzleLoading() {
  return (
    <motion.div
      className="mx-auto flex h-72 max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-white/70 bg-white/60 text-sm text-cozy-cocoa/60"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    >
      <motion.span
        className="h-10 w-10 rounded-full border-2 border-cozy-honey/50 border-t-cozy-cocoa/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        aria-hidden
      />
      Softening the board…
    </motion.div>
  );
}

export default function PuzzlePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pb-12">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Memory match
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Cozy pairs
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Flip two cards at a time and find every matching pair—pet art and
          little icons. Treats and a note from your companion when you clear
          the board.
        </p>
      </header>
      <CalmPuzzle />
    </main>
  );
}
