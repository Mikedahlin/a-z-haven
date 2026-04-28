"use client";

import { motion } from "framer-motion";

export function ChatFab({
  onClick,
  reducedMotion,
}: {
  onClick: () => void;
  reducedMotion: boolean;
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      className="fixed bottom-24 right-4 z-30 rounded-full bg-cozy-cocoa px-5 py-3 text-sm font-semibold text-cozy-cream shadow-glow transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 sm:bottom-28"
      aria-label="Open A-Z Haven chat"
    >
      Chat
    </motion.button>
  );
}
