"use client";

import { motion } from "framer-motion";
import { ROOMS } from "@/lib/content/rooms";
import { useGameStore } from "@/store/game-store";
import type { RoomId } from "@/lib/types";
import { sounds, resumeAudioContext } from "@/lib/audio";

export function RoomsClient() {
  const unlocked = useGameStore((s) => s.unlockedRooms);
  const selected = useGameStore((s) => s.selectedRoom);
  const coins = useGameStore((s) => s.coins);
  const stars = useGameStore((s) => s.stars);
  const unlockRoom = useGameStore((s) => s.unlockRoom);
  const setRoom = useGameStore((s) => s.setRoom);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const reducedMotion = useGameStore((s) => s.reducedMotion);

  async function tryUnlock(id: RoomId) {
    await resumeAudioContext();
    const ok = unlockRoom(id);
    if (ok) sounds.reward(soundEnabled);
    else sounds.tap(soundEnabled);
  }

  return (
    <div className="space-y-4">
      {ROOMS.map((r) => {
        const isOpen = unlocked.includes(r.id);
        const isSel = selected === r.id;
        return (
          <motion.article
            key={r.id}
            layout
            className={`rounded-3xl border p-5 shadow-sm ${
              isSel
                ? "border-cozy-honey/60 bg-white/85 shadow-glow"
                : "border-white/70 bg-white/70"
            }`}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-display text-xl text-cozy-cocoa">{r.name}</h2>
                <p className="mt-1 text-sm text-cozy-cocoa/75">{r.description}</p>
                <p className="mt-2 text-xs text-cozy-cocoa/55">{r.flavor}</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {!isOpen && (
                  <p className="text-xs text-cozy-cocoa/55">
                    Cost: {r.unlockCost.coins} coins · {r.unlockCost.stars} stars
                  </p>
                )}
                {!isOpen ? (
                  <button
                    type="button"
                    onClick={() => void tryUnlock(r.id)}
                    className="min-h-[48px] rounded-full bg-cozy-cocoa px-5 py-2 text-sm font-semibold text-cozy-cream disabled:opacity-40"
                    disabled={
                      coins < r.unlockCost.coins || stars < r.unlockCost.stars
                    }
                  >
                    Unlock
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void resumeAudioContext();
                      setRoom(r.id);
                      sounds.softChime(soundEnabled);
                    }}
                    className={`min-h-[48px] rounded-full px-5 py-2 text-sm font-semibold ${
                      isSel
                        ? "bg-cozy-honey text-cozy-cocoa"
                        : "bg-white/80 text-cozy-cocoa shadow-sm"
                    }`}
                  >
                    {isSel ? "Selected" : "Visit"}
                  </button>
                )}
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
