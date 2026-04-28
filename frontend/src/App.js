import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useHaven } from "@/lib/store";

import Landing from "@/pages/Landing";
import Onboard from "@/pages/Onboard";
import Hub from "@/pages/Hub";
import Puzzle from "@/pages/Puzzle";
import Snake from "@/pages/Snake";
import Rooms from "@/pages/Rooms";
import Decor from "@/pages/Decor";
import Story from "@/pages/Story";
import Scrapbook from "@/pages/Scrapbook";
import Chat from "@/pages/Chat";
import Settings from "@/pages/Settings";
import Postcards from "@/pages/Postcards";
import SharedCard from "@/pages/SharedCard";
import GameLayout from "@/components/GameLayout";

function RequireAuth({ children }) {
    const { user, authLoading } = useHaven();
    const loc = useLocation();
    if (authLoading) return <div className="min-h-screen flex items-center justify-center text-ink2 font-body" data-testid="auth-loading">a moment…</div>;
    if (!user) return <Navigate to="/" state={{ from: loc }} replace />;
    return children;
}

export default function App() {
    return (
        <div className="App bg-cream text-ink min-h-screen bg-grain">
            <Toaster position="top-center" richColors />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/share/:token" element={<SharedCard />} />
                    <Route element={<RequireAuth><GameLayout /></RequireAuth>}>
                        <Route path="/onboard" element={<Onboard />} />
                        <Route path="/hub" element={<Hub />} />
                        <Route path="/puzzle" element={<Puzzle />} />
                        <Route path="/snake" element={<Snake />} />
                        <Route path="/rooms" element={<Rooms />} />
                        <Route path="/decor" element={<Decor />} />
                        <Route path="/story" element={<Story />} />
                        <Route path="/scrapbook" element={<Scrapbook />} />
                        <Route path="/postcards" element={<Postcards />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}
