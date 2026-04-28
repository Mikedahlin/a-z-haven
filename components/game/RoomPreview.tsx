"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ROOMS } from "@/lib/content/rooms";
import {
  premiumRoomOverlayClass,
  premiumRoomSparkleCount,
} from "@/lib/content/premium-room-themes";
import { useGameStore } from "@/store/game-store";

export function RoomPreview() {
  const selected = useGameStore((s) => s.selectedRoom);
  const unlocked = useGameStore((s) => s.unlockedRooms);
  const reducedMotion = useGameStore((s) => s.reducedMotion);
  const premiumUnlockedIds = useGameStore((s) => s.premiumUnlockedIds);
  const room = ROOMS.find((r) => r.id === selected)!;

  const overlay = premiumRoomOverlayClass(selected, premiumUnlockedIds);
  const sparkles = premiumRoomSparkleCount(selected, premiumUnlockedIds);

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-cozy-blush/50 via-white/70 to-cozy-sky/30 p-6 shadow-card"
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {overlay && (
        <div
          className={`pointer-events-none absolute inset-0 rounded-3xl ${overlay}`}
          aria-hidden
        />
      )}
      {sparkles > 0 && !reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {Array.from({ length: sparkles }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-[10px] text-cozy-honey/80"
              style={{
                left: `${(i * 73) % 100}%`,
                top: `${(i * 41) % 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.9, 0.2],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: i * 0.12,
              }}
              aria-hidden
            >
              ✦
            </motion.span>
          ))}
        </div>
      )}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cozy-cocoa/45">
            Current room
          </p>
          <h2 className="font-display text-2xl text-cozy-cocoa">{room.name}</h2>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-cozy-cocoa/75">
            {room.description}
          </p>
          {sparkles > 0 && (
            <p className="mt-2 text-xs font-medium text-cozy-cocoa/60">
              Premium mood active—your boutique unlock is painting the air.
            </p>
          )}
        </div>
        <Link
          href="/rooms"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-cozy-cocoa px-5 py-2 text-sm font-semibold text-cozy-cream shadow-sm"
        >
          Rooms &amp; unlocks
        </Link>
      </div>
      <p className="relative mt-4 text-xs text-cozy-cocoa/55">
        Unlocked spaces: {unlocked.length}/{ROOMS.length}
      </p>
    </motion.section>
  );
}
