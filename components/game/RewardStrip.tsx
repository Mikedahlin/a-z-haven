"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/game-store";
import { sounds, resumeAudioContext } from "@/lib/audio";

export function RewardStrip() {
  const coins = useGameStore((s) => s.coins);
  const treats = useGameStore((s) => s.treats);
  const bones = useGameStore((s) => s.bones);
  const decorTokens = useGameStore((s) => s.decorTokens);
  const stars = useGameStore((s) => s.stars);
  const lastDaily = useGameStore((s) => s.lastDailyGreetingAt);
  const claimDailyBonus = useGameStore((s) => s.claimDailyBonus);
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  const [dailyMsg, setDailyMsg] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const canDaily = lastDaily !== today;

  const items = [
    { k: "Coins", v: coins, emoji: "✦" },
    { k: "Treats", v: treats, emoji: "🍪" },
    { k: "Bones", v: bones, emoji: "🦴" },
    { k: "Decor", v: decorTokens, emoji: "🪴" },
    { k: "Stars", v: stars, emoji: "★" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <motion.div
            key={it.k}
            layout
            className="flex min-w-[7.5rem] items-center justify-between rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-xs text-cozy-cocoa shadow-sm"
          >
            <span className="text-cozy-cocoa/60">{it.emoji}</span>
            <span className="font-semibold tabular-nums">{it.v}</span>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canDaily}
          onClick={async () => {
            await resumeAudioContext();
            const r = claimDailyBonus();
            if (r.ok) {
              sounds.reward(soundEnabled);
              setDailyMsg("Daily warmth claimed—see you tomorrow.");
            } else {
              setDailyMsg("Already tucked in for today.");
            }
          }}
          className="min-h-[48px] rounded-full border border-cozy-honey/50 bg-cozy-honey/20 px-4 text-sm font-semibold text-cozy-cocoa shadow-sm disabled:opacity-40"
        >
          {canDaily ? "Claim daily warmth" : "Daily warmth claimed"}
        </button>
        {dailyMsg && (
          <p className="text-xs text-cozy-cocoa/65" role="status">
            {dailyMsg}
          </p>
        )}
      </div>
    </div>
  );
}
