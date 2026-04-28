"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game-store";

export function WelcomeClient() {
  const hasSeenWelcome = useGameStore((s) => s.hasSeenWelcome);
  const setWelcomeSeen = useGameStore((s) => s.setWelcomeSeen);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  useEffect(() => {
    if (!hasSeenWelcome) setWelcomeSeen();
  }, [hasSeenWelcome, setWelcomeSeen]);

  return (
    <motion.div
      className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-card backdrop-blur"
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-sm leading-relaxed text-cozy-cocoa/85">
        A-Z Haven is a soft place to design one beloved companion. Name them,
        shape their personality, and let the world feel a little kinder. Take
        your time. There is no rush here.
      </p>
    </motion.div>
  );
}
