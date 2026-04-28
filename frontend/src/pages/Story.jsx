import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useHaven } from "@/lib/store";

export default function Story() {
    const { state, grantRewards } = useHaven();
    const [outline, setOutline] = useState([]);
    const [idx, setIdx] = useState(0);
    const [chapter, setChapter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cache, setCache] = useState({});

    useEffect(() => {
        api.get("/story/outline").then((r) => setOutline(r.data.outline)).catch(() => {});
    }, []);

    const loadChapter = async (i) => {
        setIdx(i);
        if (cache[i]) { setChapter(cache[i]); return; }
        setLoading(true);
        try {
            const res = await api.post("/story/chapter", { chapter_index: i, pet_name: state.pet_profile?.pet_name || null });
            setChapter(res.data);
            setCache((c) => ({ ...c, [i]: res.data }));
            // Reward for reading new chapter
            grantRewards({ coins: 6, stars: 1 });
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Story is brewing — try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5" data-testid="story-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Story mode</h1>
                <p className="text-ink2 mt-1">An AI-painted bedtime tale of Archie & Zeke. New every read.</p>
            </header>

            <div className="flex flex-wrap gap-2" data-testid="chapter-list">
                {outline.map((o) => (
                    <button
                        key={o.index}
                        onClick={() => loadChapter(o.index)}
                        data-testid={`chapter-${o.index}`}
                        className={`text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border font-semibold transition ${idx === o.index ? "bg-terracotta text-paper border-terracotta" : "bg-paper border-ink/10 text-ink2 hover:border-ink/30"}`}
                    >Ch. {o.index + 1}</button>
                ))}
            </div>

            <article className="cozy-card overflow-hidden">
                {chapter?.image_base64 ? (
                    <motion.img
                        key={chapter.id}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        src={`data:image/png;base64,${chapter.image_base64}`}
                        alt={chapter.title}
                        className="w-full h-72 sm:h-96 object-cover"
                        data-testid="story-image"
                    />
                ) : (
                    <div className="h-64 sm:h-80 bg-stone/50 flex items-center justify-center">
                        {loading ? <Loader2 className="w-7 h-7 animate-spin text-terracotta" data-testid="story-loading" /> : <Sparkles className="w-7 h-7 text-stoneGrey" />}
                    </div>
                )}
                <div className="p-6 sm:p-8 max-w-3xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-ink2/70">Chapter {idx + 1}</p>
                    <h2 className="font-heading text-3xl sm:text-4xl text-ink mt-1.5" data-testid="story-title">{chapter?.title || "Begin a chapter"}</h2>
                    {chapter?.body ? (
                        <div className="mt-4 space-y-3 text-ink2 leading-relaxed text-[1.02rem]" data-testid="story-body">
                            {chapter.body.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    ) : (
                        <p className="mt-4 text-ink2 leading-relaxed">Pick a chapter above to begin. Each one is freshly painted with words and pictures, just for you.</p>
                    )}
                </div>
                <div className="px-6 pb-6 sm:px-8 sm:pb-8 flex items-center gap-3">
                    <button disabled={loading || idx === 0} onClick={() => loadChapter(idx - 1)} className="btn-ghost disabled:opacity-50" data-testid="prev-chapter">
                        <ChevronLeft className="w-4 h-4 inline mr-1" />Previous
                    </button>
                    <button disabled={loading || idx >= outline.length - 1} onClick={() => loadChapter(idx + 1)} className="btn-primary disabled:opacity-50" data-testid="next-chapter">
                        {loading ? <><Loader2 className="w-4 h-4 inline animate-spin mr-1" />Painting…</> : <>Next chapter<ChevronRight className="w-4 h-4 inline ml-1" /></>}
                    </button>
                </div>
            </article>
        </div>
    );
}
