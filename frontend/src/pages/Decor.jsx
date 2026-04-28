import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Hammer } from "lucide-react";
import { DECOR, ROOMS } from "@/lib/content";
import { useHaven } from "@/lib/store";

export default function Decor() {
    const { state, buyDecor, placeDecor } = useHaven();

    const grouped = ROOMS.map((r) => ({ room: r, items: DECOR.filter((d) => d.roomId === r.id) }));

    return (
        <div className="space-y-7" data-testid="decor-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Decor</h1>
                <p className="text-ink2 mt-1">Buy with decor tokens, then place — one piece per room.</p>
            </header>
            {grouped.map(({ room, items }) => {
                const isUnlocked = state.unlocked_rooms.includes(room.id);
                if (items.length === 0) return null;
                return (
                    <section key={room.id} className="space-y-3">
                        <div className="flex items-baseline gap-3">
                            <h2 className="font-heading text-2xl text-ink">{room.name}</h2>
                            {!isUnlocked && <span className="text-xs uppercase tracking-widest text-stoneGrey">locked</span>}
                            {state.placed_decor[room.id] && <span className="text-xs text-moss font-semibold">placed: {DECOR.find((d) => d.id === state.placed_decor[room.id])?.name}</span>}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {items.map((d, i) => {
                                const owned = state.owned_decor_ids.includes(d.id);
                                const placed = state.placed_decor[room.id] === d.id;
                                const canBuy = state.decor_tokens >= d.cost && isUnlocked;
                                return (
                                    <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`cozy-card p-4 flex items-center justify-between gap-3 ${placed ? "ring-2 ring-moss" : ""}`} data-testid={`decor-${d.id}`}>
                                        <div>
                                            <div className="font-heading text-lg text-ink">{d.name}</div>
                                            <div className="text-[11px] uppercase tracking-widest text-ink2/70">{d.slot} · {d.cost}◇</div>
                                        </div>
                                        {!owned ? (
                                            <button
                                                disabled={!canBuy}
                                                onClick={() => { const ok = buyDecor(d.id); toast[ok ? "success" : "error"](ok ? `Owned: ${d.name}` : "Need decor tokens or unlocked room."); }}
                                                className="btn-accent !py-2 !px-4 text-sm disabled:opacity-50"
                                                data-testid={`buy-${d.id}`}
                                            ><Hammer className="w-4 h-4 inline mr-1" />Buy</button>
                                        ) : placed ? (
                                            <span className="text-moss font-semibold inline-flex items-center gap-1 text-sm"><Check className="w-4 h-4" />Placed</span>
                                        ) : (
                                            <button onClick={() => { placeDecor(room.id, d.id); toast.success(`Placed in ${room.name}`); }} className="btn-ghost !py-2 !px-4 text-sm" data-testid={`place-${d.id}`}>Place</button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
