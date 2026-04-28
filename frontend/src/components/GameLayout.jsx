import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Puzzle, Sparkles, BookOpen, Notebook, MessagesSquare, Settings as SettingsIcon, LogOut, Apple } from "lucide-react";
import { useHaven } from "@/lib/store";

const NAV = [
    { to: "/hub", icon: Home, label: "Hub", id: "nav-hub" },
    { to: "/puzzle", icon: Puzzle, label: "Puzzle", id: "nav-puzzle" },
    { to: "/snake", icon: Apple, label: "Snake", id: "nav-snake" },
    { to: "/rooms", icon: Sparkles, label: "Rooms", id: "nav-rooms" },
    { to: "/story", icon: BookOpen, label: "Story", id: "nav-story" },
    { to: "/scrapbook", icon: Notebook, label: "Scrap", id: "nav-scrapbook" },
    { to: "/chat", icon: MessagesSquare, label: "Chat", id: "nav-chat" },
    { to: "/settings", icon: SettingsIcon, label: "Settings", id: "nav-settings" },
];

export default function GameLayout() {
    const { user, signOut, state } = useHaven();
    const nav = useNavigate();

    const onLogout = async () => { await signOut(); nav("/"); };

    return (
        <div className="relative min-h-screen warm-halo">
            <header className="sticky top-0 z-30 backdrop-blur bg-cream/80 border-b border-ink/5" data-testid="app-header">
                <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-3">
                    <NavLink to="/hub" className="flex items-center gap-2.5" data-testid="brand-link">
                        <div className="w-9 h-9 rounded-2xl bg-terracotta/15 flex items-center justify-center">
                            <span className="font-heading text-terracotta text-xl leading-none">a–z</span>
                        </div>
                        <div className="leading-tight">
                            <div className="font-heading text-lg text-ink">A–Z Haven</div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-ink2/70">cozy with archie & zeke</div>
                        </div>
                    </NavLink>
                    <div className="flex-1" />
                    <div className="hidden md:flex items-center gap-3 text-sm font-body text-ink2">
                        <span data-testid="hud-coins" className="px-3 py-1 rounded-full bg-ochre/15 text-ochre font-semibold">★ {state.stars}</span>
                        <span className="px-3 py-1 rounded-full bg-moss/15 text-moss font-semibold">◎ {state.coins}</span>
                    </div>
                    {user?.picture && (
                        <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-ink/10" data-testid="user-avatar" />
                    )}
                    <button onClick={onLogout} className="btn-ghost !py-1.5 !px-3 text-sm hidden sm:inline-flex" data-testid="logout-btn">
                        <LogOut className="w-4 h-4 mr-1 inline" /> Sign out
                    </button>
                </div>
            </header>

            <motion.main
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-6 pb-28 min-h-[calc(100vh-220px)]"
            >
                <Outlet />
            </motion.main>

            <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30" data-testid="bottom-nav">
                <div className="cozy-card px-2 py-2 flex gap-1 backdrop-blur bg-paper/95 shadow-cozy-lg">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            data-testid={item.id}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all min-w-[58px]
                                ${isActive ? "bg-terracotta text-paper shadow-cozy" : "text-ink2 hover:bg-stone/60"}`
                            }
                        >
                            <item.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                            <span className="text-[10.5px] font-semibold tracking-wide">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
