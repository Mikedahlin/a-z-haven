import { Suspense } from "react";
import { ShopClient } from "@/components/game/ShopClient";

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pb-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Collect
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Cozy Boutique
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Decor packs, tiny toys, and seasonal backdrops. Coins are free to
          earn, and card checkout is only for optional flair.
        </p>
      </header>
      <Suspense
        fallback={
          <p className="text-center text-sm text-cozy-cocoa/55">Loading shop...</p>
        }
      >
        <ShopClient />
      </Suspense>
    </main>
  );
}
