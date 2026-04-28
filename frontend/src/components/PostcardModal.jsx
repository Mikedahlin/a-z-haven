import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share2, Loader2, BookmarkPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { createPostcard } from "@/lib/postcard";
import { useHaven } from "@/lib/store";

export default function PostcardModal({ open, onClose, chapter, petName, onSavedMilestone }) {
    const wrap = useRef(null);
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState(false);
    const { state, update } = useHaven();

    useEffect(() => {
        if (!open || !chapter) return;
        setSaved((state.postcards || []).some((p) => p.chapter_index === chapter.chapter_index));
        let alive = true;
        setBusy(true);
        (async () => {
            try {
                const src = chapter.image_base64 ? `data:image/png;base64,${chapter.image_base64}` : null;
                const canvas = await createPostcard({ imageUrl: src, title: chapter.title, body: chapter.body, petName });
                if (!alive) return;
                wrap.current && (wrap.current.innerHTML = "");
                canvas.style.width = "100%";
                canvas.style.height = "auto";
                canvas.style.borderRadius = "1rem";
                canvas.dataset.testid = "postcard-canvas";
                wrap.current && wrap.current.appendChild(canvas);
            } catch {
                toast.error("Could not paint the postcard.");
            } finally {
                alive && setBusy(false);
            }
        })();
        return () => { alive = false; };
    }, [open, chapter, petName, state.postcards]);

    const getCanvas = () => wrap.current?.querySelector("canvas");

    const download = () => {
        const c = getCanvas(); if (!c) return;
        const link = document.createElement("a");
        link.download = `archie-zeke-postcard-${chapter?.chapter_index ?? 0}.png`;
        link.href = c.toDataURL("image/png");
        link.click();
        toast.success("Postcard saved.");
    };

    const shareNative = async () => {
        const c = getCanvas(); if (!c) return;
        c.toBlob(async (blob) => {
            const file = new File([blob], "haven-postcard.png", { type: "image/png" });
            if (navigator.canShare?.({ files: [file] })) {
                try { await navigator.share({ files: [file], title: chapter.title, text: "From A–Z Haven 🐾" }); } catch {}
            } else {
                download();
            }
        });
    };

    const saveToAlbum = () => {
        const c = getCanvas(); if (!c) return;
        // Compress to JPEG ~quality 0.7 for smaller storage
        const thumb = c.toDataURL("image/jpeg", 0.72);
        const entry = {
            id: `pc-${chapter.chapter_index}-${Date.now()}`,
            chapter_index: chapter.chapter_index,
            title: chapter.title,
            body_excerpt: (chapter.body || "").slice(0, 240),
            saved_at: new Date().toISOString(),
            thumb,
        };
        const cards = (state.postcards || []).filter((p) => p.chapter_index !== chapter.chapter_index);
        const next = [entry, ...cards].slice(0, 30);
        update({ postcards: next });
        setSaved(true);
        toast.success("Tucked into the album.");
        // Notify parent for confetti at milestones
        if (next.length > 0 && next.length % 5 === 0) onSavedMilestone?.(next.length);
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-ink/45 backdrop-blur flex items-center justify-center p-4"
                    onClick={onClose}
                    data-testid="postcard-modal"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
                        className="cozy-card max-w-3xl w-full p-5 sm:p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone/70 hover:bg-stone flex items-center justify-center" data-testid="postcard-close">
                            <X className="w-4 h-4" />
                        </button>
                        <h3 className="font-heading text-2xl text-ink">A soft postcard</h3>
                        <p className="text-sm text-ink2 mt-1">Save to your album. Send it to someone who'd smile at it.</p>
                        <div ref={wrap} className="mt-5 min-h-[260px] flex items-center justify-center bg-stone/30 rounded-2xl">
                            {busy && <Loader2 className="w-7 h-7 animate-spin text-terracotta" data-testid="postcard-loading" />}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3 justify-end">
                            <button onClick={saveToAlbum} disabled={saved || busy} className="btn-ghost inline-flex items-center gap-2 disabled:opacity-50" data-testid="postcard-save-album">
                                {saved ? <><Check className="w-4 h-4" />In album</> : <><BookmarkPlus className="w-4 h-4" />Save to album</>}
                            </button>
                            <button onClick={shareNative} className="btn-ghost inline-flex items-center gap-2" data-testid="postcard-share"><Share2 className="w-4 h-4" />Share</button>
                            <button onClick={download} className="btn-primary inline-flex items-center gap-2" data-testid="postcard-download"><Download className="w-4 h-4" />Download</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
