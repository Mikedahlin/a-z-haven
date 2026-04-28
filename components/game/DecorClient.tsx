"use client";

import Link from "next/link";
import { DECOR } from "@/lib/content/decor";
import { ROOMS } from "@/lib/content/rooms";
import { getShopItem } from "@/lib/content/shop";
import { useGameStore } from "@/store/game-store";
import { sounds, resumeAudioContext } from "@/lib/audio";

export function DecorClient() {
  const unlocked = useGameStore((s) => s.unlockedRooms);
  const placed = useGameStore((s) => s.placedDecor);
  const decorTokens = useGameStore((s) => s.decorTokens);
  const ownedDecorIds = useGameStore((s) => s.ownedDecorIds);
  const premiumUnlockedIds = useGameStore((s) => s.premiumUnlockedIds);
  const placeDecor = useGameStore((s) => s.placeDecor);
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  return (
    <div className="space-y-8">
      {ROOMS.filter((r) => unlocked.includes(r.id)).map((room) => {
        const items = DECOR.filter((d) => d.roomId === room.id);
        return (
          <section
            key={room.id}
            className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-card"
          >
            <h2 className="font-display text-xl text-cozy-cocoa">{room.name}</h2>
            <p className="mt-1 text-sm text-cozy-cocoa/65">
              Placed:{" "}
              <span className="font-semibold text-cozy-cocoa">
                {items.find((i) => i.id === placed[room.id])?.name ?? "—"}
              </span>
            </p>
            <p className="mt-3 text-xs text-cozy-cocoa/55">
              Decor tokens available: {decorTokens}
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((d) => {
                const placedHere = placed[room.id] === d.id;
                const owned = ownedDecorIds.includes(d.id);
                const premId = d.requiresPremiumId;
                const hasPremium =
                  !premId || premiumUnlockedIds.includes(premId);
                const shopItem = premId ? getShopItem(premId) : undefined;
                const canTry =
                  hasPremium &&
                  (d.costDecorTokens === 0 ||
                    owned ||
                    decorTokens >= d.costDecorTokens);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      disabled={!canTry}
                      onClick={async () => {
                        await resumeAudioContext();
                        const ok = placeDecor(d.id);
                        if (ok) sounds.reward(soundEnabled);
                        else sounds.tap(soundEnabled);
                      }}
                      className={`flex w-full flex-col rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        placedHere
                          ? "border-cozy-honey/70 bg-cozy-honey/15"
                          : "border-cozy-cocoa/10 bg-white/80 hover:border-cozy-cocoa/25"
                      } disabled:opacity-40`}
                    >
                      <span className="flex flex-wrap items-center gap-2 font-semibold text-cozy-cocoa">
                        {d.name}
                        {premId && hasPremium && (
                          <span className="rounded-full bg-cozy-honey/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cozy-cocoa/80">
                            Boutique
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-cozy-cocoa/55">
                        {d.slot} ·{" "}
                        {!hasPremium && shopItem
                          ? `Unlock “${shopItem.name}” in the shop`
                          : d.costDecorTokens === 0
                            ? premId
                              ? "included with boutique unlock"
                              : "included"
                            : `${d.costDecorTokens} decor token(s) first time`}
                        {owned ? " · owned" : ""}
                      </span>
                    </button>
                    {!hasPremium && shopItem && (
                      <Link
                        href="/shop"
                        className="mt-2 inline-flex text-xs font-semibold text-cozy-cocoa underline-offset-2 hover:underline"
                      >
                        Open shop · {shopItem.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
