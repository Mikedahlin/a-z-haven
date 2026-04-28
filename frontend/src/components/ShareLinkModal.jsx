import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, Twitter, Facebook, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function ShareLinkModal({ open, onClose, postcardEntry }) {
    // postcardEntry = {chapter_index, title, body_excerpt, thumb, ...}
    const [busy, setBusy] = useState(false);
    const [shareUrl, setShareUrl] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open || !postcardEntry) { setShareUrl(null); setCopied(false); return; }
        let alive = true;
        setBusy(true);
        (async () => {
            try {
                const res = await api.post("/share/postcard", {
                    chapter_index: postcardEntry.chapter_index,
                    title: postcardEntry.title,
                    body_excerpt: postcardEntry.body_excerpt || "",
                    thumb: postcardEntry.thumb,
                });
                if (!alive) return;
                const fullUrl = `${window.location.origin}/share/${res.data.short_id}`;
                setShareUrl(fullUrl);
            } catch (e) {
                toast.error(e?.response?.data?.detail || "Could not create the link.");
                onClose?.();
            } finally {
                alive && setBusy(false);
            }
        })();
        return () => { alive = false; };
    }, [open, postcardEntry, onClose]);

    const copyUrl = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied.");
            setTimeout(() => setCopied(false), 1800);
        } catch {
            toast.error("Couldn't copy. Long-press the link to copy.");
        }
    };

    const shareText = postcardEntry ? `“${postcardEntry.title}” — a soft postcard from A–Z Haven 🐾` : "A postcard from A–Z Haven 🐾";

    const links = shareUrl ? [
        { id: "twitter", icon: Twitter, label: "X", color: "#000",
          href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
        { id: "facebook", icon: Facebook, label: "Facebook", color: "#1877F2",
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
        { id: "whatsapp", icon: MessageCircle, label: "WhatsApp", color: "#25D366",
          href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}` },
        { id: "email", icon: Mail, label: "Email", color: "#5B7B53",
          href: `mailto:?subject=${encodeURIComponent("A postcard from A–Z Haven")}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}` },
    ] : [];

    const tryNativeShare = async () => {
        if (!shareUrl || !navigator.share) return copyUrl();
        try {
            await navigator.share({ title: postcardEntry?.title || "A–Z Haven", text: shareText, url: shareUrl });
        } catch {}
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-ink/50 backdrop-blur flex items-center justify-center p-4"
                    onClick={onClose}
                    data-testid="share-modal"
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
                        className="cozy-card max-w-lg w-full p-6 sm:p-7 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-stone/70 hover:bg-stone flex items-center justify-center" data-testid="share-close">
                            <X className="w-4 h-4" />
                        </button>
                        <h3 className="font-heading text-2xl text-ink">Share this postcard</h3>
                        <p className="text-sm text-ink2 mt-1">Anyone with the link can view it (no sign-in needed).</p>

                        {busy ? (
                            <div className="py-10 flex justify-center" data-testid="share-loading">
                                <Loader2 className="w-7 h-7 animate-spin text-terracotta" />
                            </div>
                        ) : shareUrl ? (
                            <>
                                <div className="mt-5 flex items-center gap-2 bg-stone/40 rounded-full pl-4 pr-1 py-1" data-testid="share-link-row">
                                    <span className="flex-1 truncate text-sm font-mono text-ink2 select-all" data-testid="share-url">{shareUrl}</span>
                                    <button onClick={copyUrl} className="btn-primary !py-2 !px-3 inline-flex items-center gap-1.5 text-sm" data-testid="share-copy">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>

                                <div className="mt-6">
                                    <div className="text-xs uppercase tracking-[0.22em] text-ink2/70 mb-3">or send via</div>
                                    <div className="grid grid-cols-4 gap-2.5">
                                        {links.map((l) => (
                                            <a
                                                key={l.id}
                                                href={l.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cozy-card p-3 flex flex-col items-center gap-1.5 hover:-translate-y-0.5 transition"
                                                style={{ color: l.color }}
                                                data-testid={`share-${l.id}`}
                                            >
                                                <l.icon className="w-5 h-5" />
                                                <span className="text-[11px] font-semibold text-ink2">{l.label}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {typeof navigator !== "undefined" && navigator.share && (
                                    <button onClick={tryNativeShare} className="btn-ghost w-full mt-4" data-testid="share-native">
                                        Open share sheet…
                                    </button>
                                )}
                            </>
                        ) : null}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
