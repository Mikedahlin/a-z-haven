import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { SCRAPBOOK, ROOMS } from "@/lib/content";
import { useHaven } from "@/lib/store";

export default function Scrapbook() {
    const { state } = useHaven();
    return (
        <div className="space-y-5" data-testid="scrapbook-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Scrapbook</h1>
                <p className="text-ink2 mt-1">Memories unlocked by stars. Stories live here — only Archie and Zeke, always.</p>
            </header>
            <div className="grid md:grid-cols-2 gap-5">
                {SCRAPBOOK.map((s, i) => {
                    const room = ROOMS.find((r) => r.id === s.roomHint);
                    const unlocked = state.scrapbook_unlocked_ids.includes(s.id) || state.stars >= s.unlockStars;
                    return (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`cozy-card p-6 ${unlocked ? "" : "opacity-70"}`}
                            data-testid={`scrap-${s.id}`}
                        >
                            <div className="text-xs uppercase tracking-[0.22em] text-ink2/70">{room?.name}</div>
                            <div className="font-heading text-2xl text-ink mt-1">{unlocked ? s.title : "A future memory"}</div>
                            {unlocked ? (
                                <p className="mt-3 text-ink2 leading-relaxed italic">“{s.body}”</p>
                            ) : (
                                <p className="mt-3 text-ink2 inline-flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> {s.unlockStars}★ to open</p>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
