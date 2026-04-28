import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Puzzle, Sparkles, BookOpen, MessagesSquare, Notebook, Apple, Stamp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useHaven } from "@/lib/store";
import { api } from "@/lib/api";
import RewardStrip from "@/components/RewardStrip";
import PetCard from "@/components/PetCard";
import { ROOMS } from "@/lib/content";

export default function Hub() {
    const { state, update, adjustStat } = useHaven();
    const room = ROOMS.find((r) => r.id === state.selected_room) || ROOMS[1];
    const [greeting, setGreeting] = useState(state.daily_greeting || null);
    const [greetingDismissed, setGreetingDismissed] = useState(false);

    // Fetch today's greeting if not cached
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        if (state.last_daily_greeting_at === today && state.daily_greeting) {
            setGreeting(state.daily_greeting);
            return;
        }
        let alive = true;
        api.get("/daily/greeting").then((r) => {
            if (!alive) return;
            setGreeting(r.data.greeting);
            update({ daily_greeting: r.data.greeting, last_daily_greeting_at: r.data.date });
        }).catch(() => {});
        return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // gentle stat decay every minute spent on hub
    useEffect(() => {
        const id = setInterval(() => {
            adjustStat("happiness", -1);
            adjustStat("energy", -1);
        }, 60_000);
        return () => clearInterval(id);
    }, [adjustStat]);

    const cards = state.postcards || [];

    return (
        <div className="space-y-6" data-testid="hub-page">
            <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs uppercase tracking-[0.22em] text-ink2/70">welcome back</p>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">A soft afternoon at the haven</h1>
                <p className="text-ink2 mt-1.5">{room.flavor}</p>
            </motion.header>

            <AnimatePresence>
                {greeting && !greetingDismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="cozy-card p-5 relative overflow-hidden bg-gradient-to-br from-paper to-ochre/10"
                        data-testid="daily-greeting"
                    >
                        <button
                            onClick={() => setGreetingDismissed(true)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone/60 hover:bg-stone flex items-center justify-center"
                            data-testid="greeting-dismiss"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-ochre/20 text-ochre flex items-center justify-center font-heading text-xl shrink-0">✦</div>
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-ochre font-semibold">A note from the haven</div>
                                <p className="text-ink mt-1.5 leading-relaxed font-body" data-testid="greeting-text">{greeting}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <RewardStrip state={state} />

            <section className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4" data-testid="dog-portraits">
                    <DogPortrait
                        who="Archie"
                        breed="Boston Terrier · 3 yrs"
                        desc="Sharp-eyed, never misses a thing — and 100% running the treat-trick on mom."
                        img={state.archie_photo_url || "/images/pets/02.webp"}
                        testid="archie-card"
                    />
                    <DogPortrait
                        who="Zeke"
                        breed="Frenchton · 1.5 yrs"
                        desc="Blue-eyed, a touch bigger than Archie, doesn't realize it. Loves dad Mike the most."
                        img={state.zeke_photo_url || "/images/pets/06.webp"}
                        testid="zeke-card"
                    />
                </div>
                <div data-testid="my-pet-block">
                    <PetCard profile={state.pet_profile} presentation={state.pet} />
                </div>
            </section>

            {cards.length > 0 && (
                <section data-testid="hub-album-preview">
                    <div className="flex items-baseline justify-between mb-3">
                        <h3 className="font-heading text-2xl text-ink inline-flex items-center gap-2"><Stamp className="w-5 h-5 text-terracotta" /> Stamp album</h3>
                        <Link to="/postcards" className="text-sm font-semibold text-terracotta hover:text-terracotta/80" data-testid="album-see-all">See all → {cards.length}</Link>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {cards.slice(0, 5).map((c, i) => (
                            <Link
                                key={c.id}
                                to="/postcards"
                                className="cozy-card overflow-hidden aspect-[16/10] hover:-translate-y-0.5 transition"
                                data-testid={`hub-album-${c.chapter_index}`}
                            >
                                <img src={c.thumb} alt={c.title} className="w-full h-full object-cover" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h3 className="font-heading text-2xl text-ink mb-3">Today’s soft rituals</h3>
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    initial="hidden" animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
                >
                    {SHORTCUTS.map((s) => (
                        <motion.div
                            key={s.to}
                            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                        >
                            <Link to={s.to} data-testid={`shortcut-${s.id}`} className="cozy-card p-5 flex items-center gap-4 group hover:-translate-y-1 transition-all">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${s.color}/15 text-${s.color}`}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-heading text-xl text-ink">{s.title}</div>
                                    <div className="text-sm text-ink2">{s.sub}</div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}

function DogPortrait({ who, breed, desc, img, testid }) {
    return (
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="cozy-card overflow-hidden" data-testid={testid}>
            <div className="aspect-[4/3] bg-stone/70">
                <img src={img} alt={who} className="w-full h-full object-cover" />
            </div>
            <div className="px-5 py-4">
                <div className="flex items-baseline gap-2">
                    <div className="font-heading text-2xl text-ink">{who}</div>
                    {breed && <div className="text-[11px] uppercase tracking-[0.16em] text-ink2/70">{breed}</div>}
                </div>
                <p className="text-sm text-ink2 mt-1">{desc}</p>
            </div>
        </motion.div>
    );
}

const SHORTCUTS = [
    { id: "puzzle", to: "/puzzle", title: "Calm puzzle", sub: "A 6×6 match for the heart.", icon: Puzzle, color: "moss" },
    { id: "snake", to: "/snake", title: "BMO Snake", sub: "A tiny robot’s favorite arcade.", icon: Apple, color: "terracotta" },
    { id: "rooms", to: "/rooms", title: "Rooms", sub: "Open new soft corners.", icon: Sparkles, color: "ochre" },
    { id: "story", to: "/story", title: "Story mode", sub: "AI-painted chapters of A & Z.", icon: BookOpen, color: "sky" },
    { id: "postcards", to: "/postcards", title: "Stamp album", sub: "Every postcard you've kept.", icon: Stamp, color: "terracotta" },
    { id: "scrapbook", to: "/scrapbook", title: "Scrapbook", sub: "Memories made visible.", icon: Notebook, color: "moss" },
    { id: "chat", to: "/chat", title: "Chat", sub: "Say hi — Archie, Zeke, or BMO.", icon: MessagesSquare, color: "terracotta" },
];
