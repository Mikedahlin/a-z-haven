import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PuzzleBoard from "@/components/PuzzleBoard";
import { useHaven } from "@/lib/store";

export default function Puzzle() {
    const { grantRewards, update, state } = useHaven();
    const [last, setLast] = useState(null);

    const handleResult = ({ score }) => {
        const stars = score >= 800 ? 3 : score >= 500 ? 2 : score >= 250 ? 1 : 0;
        const grants = {
            coins: Math.round(score / 10),
            treats: Math.max(1, Math.floor(score / 200)),
            decor_tokens: stars >= 2 ? 1 : 0,
            stars,
        };
        grantRewards(grants);
        update({
            puzzle_best_score: Math.max(state.puzzle_best_score, score),
            puzzle_level: state.puzzle_level + (stars > 0 ? 1 : 0),
            pet: { ...state.pet, happiness: Math.min(100, state.pet.happiness + 8), mood: "happy" },
        });
        setLast({ score, ...grants, stars });
        toast.success(`A gentle round · +${grants.coins}◎ · +${stars}★`);
    };

    return (
        <div className="space-y-5" data-testid="puzzle-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">A calm match</h1>
                <p className="text-ink2 mt-1">Swap two neighbors. Make 3+ in a row. Cascades count more.</p>
            </header>
            <PuzzleBoard onResult={handleResult} />
            {last && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="cozy-card p-5" data-testid="puzzle-result">
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-3 py-1 rounded-full bg-moss/15 text-moss font-semibold">+{last.coins}◎ coins</span>
                        <span className="px-3 py-1 rounded-full bg-terracotta/15 text-terracotta font-semibold">+{last.treats}✿ treats</span>
                        {last.decor_tokens > 0 && <span className="px-3 py-1 rounded-full bg-sky/15 text-sky font-semibold">+{last.decor_tokens}◇ decor</span>}
                        <span className="px-3 py-1 rounded-full bg-ochre/15 text-ochre font-semibold">+{last.stars}★ stars</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
