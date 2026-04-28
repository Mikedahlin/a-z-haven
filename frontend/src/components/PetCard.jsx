import { motion } from "framer-motion";

export default function PetCard({ profile, presentation }) {
    const name = profile?.pet_name || "your pet";
    const type = profile?.pet_type || "Dog";
    const happiness = presentation?.happiness ?? 70;
    const energy = presentation?.energy ?? 80;

    return (
        <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="cozy-card overflow-hidden relative"
            data-testid="pet-card"
        >
            <div className="aspect-[5/4] w-full bg-stone/50 relative">
                {profile?.image_url ? (
                    <img src={profile.image_url} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-7xl">🐾</div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2">
                    <Stat label="happy" value={happiness} color="terracotta" testid="stat-happiness" />
                    <Stat label="energy" value={energy} color="moss" testid="stat-energy" />
                </div>
            </div>
            <div className="px-5 py-4">
                <div className="font-heading text-2xl text-ink leading-tight" data-testid="pet-name">{name}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-ink2/70 mt-0.5">{type} · {profile?.age_vibe || "younger"}</div>
                {profile?.bio && <p className="mt-3 text-sm text-ink2 leading-relaxed">{profile.bio}</p>}
                {profile?.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {profile.tags.slice(0, 6).map((t) => (
                            <span key={t} className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone/70 text-ink2 font-semibold">{t}</span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function Stat({ label, value, color, testid }) {
    return (
        <div className="flex-1 bg-paper/85 backdrop-blur rounded-xl px-2.5 py-1.5 shadow-cozy" data-testid={testid}>
            <div className="text-[9.5px] uppercase tracking-widest text-ink2/80">{label}</div>
            <div className="h-1.5 mt-1 rounded-full bg-stone overflow-hidden">
                <div className={`h-full rounded-full bg-${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}
