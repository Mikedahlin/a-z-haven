import { motion } from "framer-motion";

export default function RewardStrip({ state }) {
    const items = [
        { key: "coins", label: "coins", value: state.coins, glyph: "◎", color: "moss" },
        { key: "treats", label: "treats", value: state.treats, glyph: "✿", color: "terracotta" },
        { key: "bones", label: "bones", value: state.bones, glyph: "❉", color: "ochre" },
        { key: "decor_tokens", label: "decor", value: state.decor_tokens, glyph: "◇", color: "sky" },
        { key: "stars", label: "stars", value: state.stars, glyph: "★", color: "ochre" },
    ];
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-5 gap-2.5 sm:gap-4"
            data-testid="reward-strip"
        >
            {items.map((it) => (
                <motion.div
                    key={it.key}
                    variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                    className="cozy-card px-3 py-3 sm:py-4 text-center"
                    data-testid={`reward-${it.key}`}
                >
                    <div className={`text-${it.color} text-2xl font-heading leading-none`}>{it.glyph}</div>
                    <div className="text-xl font-heading text-ink mt-1">{it.value}</div>
                    <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink2/70 mt-0.5">{it.label}</div>
                </motion.div>
            ))}
        </motion.div>
    );
}
