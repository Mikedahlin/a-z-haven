import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPostcard } from "@/lib/postcard";

export default function PostcardModal({ open, onClose, chapter, petName }) {
    const wrap = useRef(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open || !chapter) return;
        let alive = true;
        setBusy(true);
        (async () => {
            try {
                const src = chapter.image_base64
                    ? `data:image/png;base64,${chapter.image_base64}`
                    : null;
                const canvas = await createPostcard({
                    imageUrl: src,
                    title: chapter.title,
                    body: chapter.body,
                    petName,
                });
                if (!alive) return;
                wrap.current && (wrap.current.innerHTML = "");
                canvas.style.width = "100%";
                canvas.style.height = "auto";
                canvas.style.borderRadius = "1rem";
                canvas.dataset.testid = "postcard-canvas";
                wrap.current && wrap.current.appendChild(canvas);
            } catch (e) {
                toast.error("Could not paint the postcard.");
            } finally {
                alive && setBusy(false);
            }
        })();
        return () => { alive = false; };
    }, [open, chapter, petName]);

    const download = () => {
        const c = wrap.current?.querySelector("canvas");
        if (!c) return;
        const link = document.createElement("a");
        link.download = `archie-zeke-postcard-${chapter?.chapter_index ?? 0}.png`;
        link.href = c.toDataURL("image/png");
        link.click();
        toast.success("Postcard saved.");
    };

    const shareNative = async () => {
        const c = wrap.current?.querySelector("canvas");
        if (!c) return;
        c.toBlob(async (blob) => {
            const file = new File([blob], "haven-postcard.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: chapter.title, text: "From A–Z Haven 🐾" });
                } catch {}
            } else {
                download();
            }
        });
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
                        <p className="text-sm text-ink2 mt-1">Save it. Send it to someone who'd smile at it.</p>
                        <div ref={wrap} className="mt-5 min-h-[260px] flex items-center justify-center bg-stone/30 rounded-2xl">
                            {busy && <Loader2 className="w-7 h-7 animate-spin text-terracotta" data-testid="postcard-loading" />}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3 justify-end">
                            <button onClick={shareNative} className="btn-ghost inline-flex items-center gap-2" data-testid="postcard-share"><Share2 className="w-4 h-4" />Share</button>
                            <button onClick={download} className="btn-primary inline-flex items-center gap-2" data-testid="postcard-download"><Download className="w-4 h-4" />Download PNG</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
