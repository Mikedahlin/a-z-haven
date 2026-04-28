import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Puzzle, Sparkles, BookOpen, MessagesSquare, Notebook, Apple } from "lucide-react";
import { useEffect } from "react";
import { useHaven } from "@/lib/store";
import RewardStrip from "@/components/RewardStrip";
import PetCard from "@/components/PetCard";
import { ROOMS } from "@/lib/content";

export default function Hub() {
    const { state, adjustStat } = useHaven();
    const room = ROOMS.find((r) => r.id === state.selected_room) || ROOMS[1];

    // gentle stat decay every minute spent on hub
    useEffect(() => {
        const id = setInterval(() => {
            adjustStat("happiness", -1);
            adjustStat("energy", -1);
        }, 60_000);
        return () => clearInterval(id);
    }, [adjustStat]);

    return (
        <div className="space-y-6" data-testid="hub-page">
            <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs uppercase tracking-[0.22em] text-ink2/70">welcome back</p>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">A soft afternoon at the haven</h1>
                <p className="text-ink2 mt-1.5">{room.flavor}</p>
            </motion.header>

            <RewardStrip state={state} />

            <section className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4" data-testid="dog-portraits">
                    <DogPortrait
                        who="Archie"
                        breed="Boston Terrier · 3 yrs"
                        desc="Sharp-eyed, never misses a thing — and 100% running the treat-trick on mom."
                        img={state.archie_photo_url || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?crop=entropy&cs=srgb&fm=jpg&w=900&q=85"}
                        testid="archie-card"
                    />
                    <DogPortrait
                        who="Zeke"
                        breed="Frenchton · 1.5 yrs"
                        desc="Blue-eyed, a touch bigger than Archie, doesn't realize it. Loves dad Mike the most."
                        img={state.zeke_photo_url || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?crop=entropy&cs=srgb&fm=jpg&w=900&q=85"}
                        testid="zeke-card"
                    />
                </div>
                <div data-testid="my-pet-block">
                    <PetCard profile={state.pet_profile} presentation={state.pet} />
                </div>
            </section>

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
    { id: "scrapbook", to: "/scrapbook", title: "Scrapbook", sub: "Memories made visible.", icon: Notebook, color: "moss" },
    { id: "chat", to: "/chat", title: "Chat", sub: "Say hi — Archie, Zeke, or BMO.", icon: MessagesSquare, color: "terracotta" },
];
