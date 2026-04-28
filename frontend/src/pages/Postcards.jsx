import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, X, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useHaven } from "@/lib/store";
import ShareLinkModal from "@/components/ShareLinkModal";

export default function Postcards() {
    const { state, update } = useHaven();
    const cards = state.postcards || [];
    const [open, setOpen] = useState(null);
    const [shareEntry, setShareEntry] = useState(null);
    const [confetti, setConfetti] = useState(false);

    useEffect(() => {
        if (cards.length > 0 && cards.length % 10 === 0) {
            setConfetti(true);
            const t = setTimeout(() => setConfetti(false), 2400);
            return () => clearTimeout(t);
        }
    }, [cards.length]);

    const remove = (id) => {
        update({ postcards: cards.filter((c) => c.id !== id) });
        toast("Card lifted from the wall.");
    };

    const downloadCard = (entry) => {
        const link = document.createElement("a");
        link.download = `archie-zeke-postcard-${entry.chapter_index}.jpg`;
        link.href = entry.thumb;
        link.click();
    };

    return (
        <div className="space-y-5 relative" data-testid="postcards-page">
            <header>
                <p className="text-xs uppercase tracking-[0.22em] text-ink2/70">stamp album</p>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Postcards</h1>
                <p className="text-ink2 mt-1">A wall of every postcard you've tucked away. {Math.min(cards.length, 30)}/30.</p>
            </header>

            {cards.length === 0 ? (
                <div className="cozy-card p-10 text-center" data-testid="postcards-empty">
                    <div className="text-5xl mb-3">🌿</div>
                    <p className="font-heading text-2xl text-ink">No postcards yet</p>
                    <p className="text-ink2 mt-1.5">Open Story Mode → read a chapter → "Send a postcard" → "Save to album".</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="postcards-grid">
                    {cards.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="cozy-card overflow-hidden group relative"
                            data-testid={`postcard-${c.chapter_index}`}
                        >
                            <button
                                onClick={() => setOpen(c)}
                                className="block w-full text-left"
                            >
                                <div className="aspect-[16/10] bg-stone/40 overflow-hidden">
                                    <img src={c.thumb} alt={c.title} className="w-full h-full object-cover transition-transform group-hover:scale-[1.03]" />
                                </div>
                                <div className="px-3.5 py-3">
                                    <div className="font-heading text-base text-ink truncate">{c.title}</div>
                                    <div className="text-[10.5px] uppercase tracking-widest text-ink2/70 mt-0.5">Ch. {c.chapter_index + 1} · {new Date(c.saved_at).toLocaleDateString()}</div>
                                </div>
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShareEntry(c); }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-paper/95 hover:bg-paper flex items-center justify-center shadow-cozy text-ink2 hover:text-terracotta opacity-0 group-hover:opacity-100 transition"
                                title="Share this postcard"
                                data-testid={`share-${c.chapter_index}`}
                            >
                                <Share2 className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-ink/50 backdrop-blur p-4 flex items-center justify-center"
                        onClick={() => setOpen(null)}
                        data-testid="postcard-detail"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
                            className="cozy-card max-w-3xl w-full p-5 sm:p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setOpen(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone/70 hover:bg-stone flex items-center justify-center" data-testid="detail-close">
                                <X className="w-4 h-4" />
                            </button>
                            <img src={open.thumb} alt={open.title} className="w-full rounded-2xl" />
                            <div className="mt-4">
                                <div className="font-heading text-2xl text-ink">{open.title}</div>
                                <p className="text-ink2 mt-1.5 italic">"{open.body_excerpt}…"</p>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3 justify-end">
                                <button onClick={() => remove(open.id)} className="btn-ghost !text-terracotta !border-terracotta/30 hover:!bg-terracotta/10 inline-flex items-center gap-2" data-testid="detail-remove">
                                    <Trash2 className="w-4 h-4" /> Remove
                                </button>
                                <button onClick={() => { setShareEntry(open); setOpen(null); }} className="btn-ghost inline-flex items-center gap-2" data-testid="detail-share">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                                <button onClick={() => downloadCard(open)} className="btn-primary inline-flex items-center gap-2" data-testid="detail-download">
                                    <Download className="w-4 h-4" /> Download
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ShareLinkModal
                open={!!shareEntry}
                onClose={() => setShareEntry(null)}
                postcardEntry={shareEntry}
            />

            {confetti && <Confetti />}
        </div>
    );
}

function Confetti() {
    const items = Array.from({ length: 36 }).map((_, i) => i);
    const colors = ["#D9735A", "#5B7B53", "#DDA752", "#7CA3B5", "#FFFCF8"];
    return (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" data-testid="confetti">
            {items.map((i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 0.6;
                const duration = 1.6 + Math.random() * 1.2;
                const color = colors[i % colors.length];
                return (
                    <motion.span
                        key={i}
                        initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
                        animate={{ y: "110vh", rotate: 360 + Math.random() * 360, opacity: 0 }}
                        transition={{ duration, delay, ease: "easeIn" }}
                        className="absolute top-0 w-2.5 h-3 rounded-sm"
                        style={{ background: color }}
                    />
                );
            })}
        </div>
    );
}
