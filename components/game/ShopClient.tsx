"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SHOP_ITEMS } from "@/lib/content/shop";
import { useGameStore } from "@/store/game-store";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatUsd(cents: number) {
  return usdFormatter.format(cents / 100);
}

export function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const coins = useGameStore((s) => s.coins);
  const spend = useGameStore((s) => s.spend);
  const unlockPremiumCosmetic = useGameStore((s) => s.unlockPremiumCosmetic);
  const premiumUnlockedIds = useGameStore((s) => s.premiumUnlockedIds);

  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const clearStripeQuery = useCallback(() => {
    startTransition(() => {
      router.replace("/shop", { scroll: false });
    });
  }, [router]);

  const verifyStripeReturn = useCallback(async () => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    if (success !== "1" || !sessionId?.startsWith("cs_")) return;

    setNotice(null);
    setBusyId("__stripe__");

    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        unlockedItemId?: string;
        error?: string;
      };
      if (!res.ok || !data.unlockedItemId) {
        setNotice(data.error ?? "Could not verify purchase.");
        return;
      }
      unlockPremiumCosmetic(data.unlockedItemId);
      setNotice(
        `Unlocked: ${data.unlockedItemId.replace(/-/g, " ")}. Thanks for supporting the cozy extras.`,
      );
    } catch {
      setNotice("Network error verifying checkout.");
    } finally {
      setBusyId(null);
      clearStripeQuery();
    }
  }, [clearStripeQuery, searchParams, unlockPremiumCosmetic]);

  useEffect(() => {
    void verifyStripeReturn();
  }, [verifyStripeReturn]);

  useEffect(() => {
    if (searchParams.get("canceled") === "1") {
      setNotice("Checkout canceled. Your coins are safe.");
      clearStripeQuery();
    }
  }, [clearStripeQuery, searchParams]);

  async function buyWithCoins(itemId: string, price: number) {
    setNotice(null);
    setBusyId(itemId);
    try {
      if (premiumUnlockedIds.includes(itemId)) {
        setNotice("You already own this set.");
        return;
      }
      if (!spend({ coins: price })) {
        setNotice("Not enough coins. Play puzzles or visit again tomorrow.");
        return;
      }
      unlockPremiumCosmetic(itemId);
      setNotice("Purchased with coins. Your nest feels cozier.");
    } finally {
      setBusyId(null);
    }
  }

  async function buyWithStripe(itemId: string) {
    setNotice(null);
    setBusyId(itemId);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setNotice(data.error ?? "Stripe is not configured yet.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setNotice("Could not start checkout.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-card">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cozy-cocoa/45">
            Your purse
          </p>
          <p className="mt-1 font-display text-2xl text-cozy-cocoa">
            {coins} coins
          </p>
          <p className="mt-1 text-xs text-cozy-cocoa/55">
            Earned in game. Soft care loop, no pressure.
          </p>
        </div>
        <p className="max-w-xs text-right text-xs text-cozy-cocoa/55">
          Paid items are{" "}
          <span className="font-semibold text-cozy-cocoa/80">cosmetic only</span>
          , never power.
        </p>
      </div>

      {notice && (
        <p
          className="rounded-2xl border border-cozy-honey/40 bg-cozy-honey/15 px-4 py-3 text-sm text-cozy-cocoa/90"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {notice}
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {SHOP_ITEMS.map((item) => {
          const owned = premiumUnlockedIds.includes(item.id);
          const busy = busyId === item.id || busyId === "__stripe__";
          return (
            <li
              key={item.id}
              aria-busy={busy}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 pt-7 shadow-card"
            >
              {owned && (
                <span className="absolute right-4 top-3 rounded-full bg-cozy-sage/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cozy-cocoa">
                  Owned
                </span>
              )}
              <p className="text-xs uppercase tracking-[0.2em] text-cozy-cocoa/45">
                {item.category}
              </p>
              <h2 className="mt-1 font-display text-xl text-cozy-cocoa">
                {item.name}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-cozy-cocoa/75">
                {item.description}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={owned || busy}
                  onClick={() => void buyWithCoins(item.id, item.coinPrice)}
                  className="min-h-[48px] rounded-full bg-cozy-cocoa px-4 text-sm font-semibold text-cozy-cream transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 disabled:opacity-40"
                >
                  {owned
                    ? "Owned"
                    : busy
                      ? "Processing..."
                      : `Buy with ${item.coinPrice} coins`}
                </button>
                <button
                  type="button"
                  disabled={owned || busy}
                  onClick={() => void buyWithStripe(item.id)}
                  className="min-h-[48px] rounded-full border border-cozy-cocoa/20 bg-white/90 px-4 text-sm font-semibold text-cozy-cocoa transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 disabled:opacity-40"
                >
                  {owned
                    ? "Owned"
                    : busy
                      ? "Processing..."
                      : `Buy with ${formatUsd(item.usdCents)}`}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
