import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Heart, Eye } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SharedCard() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);

    useEffect(() => {
        document.title = "A postcard from A–Z Haven";
        axios.get(`${API}/share/${token}`)
            .then((r) => setData(r.data))
            .catch((e) => setErr(e?.response?.data?.detail || "Postcard not found."));
    }, [token]);

    return (
        <div className="relative min-h-screen warm-halo bg-grain" data-testid="shared-page">
            <header className="max-w-5xl mx-auto px-6 sm:px-10 pt-7 flex items-center">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-terracotta/15 flex items-center justify-center">
                        <span className="font-heading text-terracotta text-2xl leading-none">a–z</span>
                    </div>
                    <div>
                        <div className="font-heading text-xl text-ink leading-tight">A–Z Haven</div>
                        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink2/70">a cozy little world</div>
                    </div>
                </Link>
            </header>

            <main className="relative max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-20">
                {err && (
                    <div className="cozy-card p-10 text-center" data-testid="shared-error">
                        <div className="text-5xl mb-3">🌿</div>
                        <p className="font-heading text-2xl text-ink">{err}</p>
                        <p className="text-ink2 mt-1.5">The link may have expired or been removed.</p>
                        <Link to="/" className="btn-primary inline-block mt-6">Visit the haven →</Link>
                    </div>
                )}

                {!err && !data && (
                    <div className="flex justify-center pt-20" data-testid="shared-loading">
                        <Loader2 className="w-8 h-8 animate-spin text-terracotta" />
                    </div>
                )}

                {data && (
                    <motion.article
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="cozy-card overflow-hidden"
                        data-testid="shared-card"
                    >
                        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                            <div className="flex items-center gap-3">
                                {data.user_picture ? (
                                    <img src={data.user_picture} alt={data.author_name} className="w-9 h-9 rounded-full ring-2 ring-ink/10" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-terracotta/20 flex items-center justify-center text-terracotta font-heading">{(data.author_name || "?").charAt(0)}</div>
                                )}
                                <div>
                                    <div className="text-sm font-semibold text-ink">{data.author_name}</div>
                                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink2/70">sent you a postcard</div>
                                </div>
                                <div className="flex-1" />
                                <span className="inline-flex items-center gap-1.5 text-xs text-ink2/70" data-testid="shared-views"><Eye className="w-3.5 h-3.5" /> {data.views}</span>
                            </div>
                        </div>
                        {data.thumb && (
                            <img src={data.thumb} alt={data.title} className="w-full mt-3" data-testid="shared-image" />
                        )}
                        <div className="p-6 sm:p-8">
                            <p className="text-xs uppercase tracking-[0.22em] text-ink2/70">Chapter {data.chapter_index + 1}</p>
                            <h1 className="font-heading text-3xl sm:text-4xl text-ink mt-1.5" data-testid="shared-title">{data.title}</h1>
                            <p className="mt-4 text-ink2 leading-relaxed italic" data-testid="shared-body">"{data.body_excerpt}"</p>
                        </div>
                        <footer className="px-6 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t border-ink/5 pt-5">
                            <div className="text-sm text-ink2 flex-1">
                                <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-terracotta" /> Made with warmth on A–Z Haven</span>
                                <div className="text-xs text-ink2/70 mt-0.5">Cozy with Archie & Zeke.</div>
                            </div>
                            <Link to="/" className="btn-primary" data-testid="shared-cta">Make your own →</Link>
                        </footer>
                    </motion.article>
                )}
            </main>
        </div>
    );
}
