import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Check } from "lucide-react";
import { ROOMS } from "@/lib/content";
import { useHaven } from "@/lib/store";

export default function Rooms() {
    const { state, unlockRoom, setSelectedRoom } = useHaven();

    return (
        <div className="space-y-5" data-testid="rooms-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Rooms</h1>
                <p className="text-ink2 mt-1">Open another soft corner with coins and stars.</p>
            </header>
            <div className="grid sm:grid-cols-2 gap-4">
                {ROOMS.map((r, i) => {
                    const owned = state.unlocked_rooms.includes(r.id);
                    const isSel = state.selected_room === r.id;
                    const canUnlock = state.coins >= r.unlock.coins && state.stars >= r.unlock.stars;
                    return (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`cozy-card p-5 flex flex-col gap-3 ${isSel ? "ring-2 ring-terracotta" : ""}`}
                            data-testid={`room-${r.id}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <div className="font-heading text-2xl text-ink">{r.name}</div>
                                    <p className="text-sm text-ink2 mt-1">{r.description}</p>
                                </div>
                                {owned ? <Check className="w-5 h-5 text-moss" /> : <Lock className="w-5 h-5 text-stoneGrey" />}
                            </div>
                            <p className="text-xs italic text-ink2/80">{r.flavor}</p>
                            <div className="flex items-center gap-2 text-xs">
                                {r.unlock.coins > 0 && <span className="px-2.5 py-1 rounded-full bg-moss/15 text-moss font-semibold">{r.unlock.coins}◎</span>}
                                {r.unlock.stars > 0 && <span className="px-2.5 py-1 rounded-full bg-ochre/15 text-ochre font-semibold">{r.unlock.stars}★</span>}
                            </div>
                            <div className="flex gap-2 pt-1">
                                {!owned ? (
                                    <button
                                        onClick={() => {
                                            const ok = unlockRoom(r.id);
                                            if (ok) toast.success(`${r.name} opened.`);
                                            else toast.error("Not enough coins or stars yet.");
                                        }}
                                        disabled={!canUnlock}
                                        className="btn-primary disabled:opacity-50"
                                        data-testid={`unlock-${r.id}`}
                                    >Unlock</button>
                                ) : (
                                    <button onClick={() => { setSelectedRoom(r.id); toast(`Visiting ${r.name}.`); }} className="btn-ghost" data-testid={`visit-${r.id}`}>Visit</button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
