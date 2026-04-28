"use client";

import { motion } from "framer-motion";
import { SCRAPBOOK } from "@/lib/content/scrapbook";
import { useGameStore } from "@/store/game-store";

export function ScrapbookClient() {
  const stars = useGameStore((s) => s.stars);
  const unlocked = useGameStore((s) => s.scrapbookUnlockedIds);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  return (
    <div className="space-y-4">
      {SCRAPBOOK.map((e) => {
        const isOpen = unlocked.includes(e.id);
        return (
          <motion.article
            key={e.id}
            className={`rounded-3xl border p-5 shadow-sm ${
              isOpen
                ? "border-white/70 bg-white/80"
                : "border-cozy-cocoa/10 bg-cozy-cream/60"
            }`}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-xl text-cozy-cocoa">{e.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-cozy-cocoa/80">
                  {isOpen ? e.body : "Soft ink waits—collect a few more stars."}
                </p>
              </div>
              <p className="text-xs text-cozy-cocoa/55">
                Unlocks at {e.unlockStars} stars · you have {stars}
              </p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
