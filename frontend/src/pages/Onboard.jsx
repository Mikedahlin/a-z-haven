import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Wand2, ArrowRight, Loader2 } from "lucide-react";
import { useHaven } from "@/lib/store";
import { api } from "@/lib/api";
import { PET_PHOTOS, PERSONALITY_TAGS, SCRAPBOOK } from "@/lib/content";

const SPECIES = ["Dog", "Cat", "Bunny", "Dragon", "Fox", "Bird"];

export default function Onboard() {
    const nav = useNavigate();
    const { state, setPetProfile, update } = useHaven();
    const initial = state.pet_profile || {};
    const [petName, setPetName] = useState(initial.pet_name || "");
    const [petType, setPetType] = useState(initial.pet_type || "Dog");
    const [bio, setBio] = useState(initial.bio || "");
    const [ageVibe, setAgeVibe] = useState(initial.age_vibe || "younger");
    const [tags, setTags] = useState(initial.tags || []);
    const [personality, setPersonality] = useState(initial.personality || "");
    const [imageUrl, setImageUrl] = useState(initial.image_url || PET_PHOTOS[0].url);
    const [generating, setGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");

    const toggleTag = (t) => setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].slice(0, 6));

    const generateImage = async () => {
        if (!aiPrompt.trim()) { toast.error("Describe your pet first."); return; }
        setGenerating(true);
        try {
            const res = await api.post("/image/generate", { prompt: aiPrompt, purpose: "pet" });
            setImageUrl(`data:image/png;base64,${res.data.image_base64}`);
            toast.success("Portrait painted ✨");
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Image gen failed");
        } finally {
            setGenerating(false);
        }
    };

    const save = () => {
        if (!petName.trim()) { toast.error("Give your friend a name."); return; }
        const profile = {
            pet_type: petType, pet_name: petName.trim(), bio: bio.trim() || null,
            personality: personality.trim() || `${ageVibe} ${petType}, tags: ${tags.join(", ")}`,
            age_vibe: ageVibe, tags, image_url: imageUrl, onboarding_complete: true,
        };
        setPetProfile(profile);
        update({ has_seen_welcome: true, scrapbook_unlocked_ids: Array.from(new Set([...(state.scrapbook_unlocked_ids || []), SCRAPBOOK[0].id])) });
        toast.success(`${petName} is home.`);
        nav("/hub");
    };

    return (
        <div className="space-y-7" data-testid="onboard-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Bring a friend home</h1>
                <p className="mt-2 text-ink2 max-w-2xl">Pick a real photo, generate a portrait, or both. Then name your companion and tell us who they are.</p>
            </header>

            <section className="cozy-card p-5 sm:p-7" data-testid="photo-picker">
                <h3 className="font-heading text-2xl text-ink">Pick a portrait</h3>
                <p className="text-ink2 text-sm mt-1">Real photos to start — make it your own with AI below.</p>
                <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {PET_PHOTOS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setImageUrl(p.url)}
                            data-testid={`photo-${p.id}`}
                            className={`relative aspect-square rounded-2xl overflow-hidden ring-2 transition ${imageUrl === p.url ? "ring-terracotta scale-[1.03]" : "ring-transparent hover:ring-ink/15"}`}
                        >
                            <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
                <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-3 items-stretch">
                    <input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe your pet, e.g. ‘a sleepy cinnamon Shiba on a moss-green rug’"
                        className="w-full rounded-full px-5 py-3 bg-paper border border-ink/10 focus:border-terracotta outline-none font-body text-ink placeholder:text-ink2/60"
                        data-testid="ai-prompt-input"
                    />
                    <button
                        onClick={generateImage}
                        disabled={generating}
                        className="btn-accent inline-flex items-center justify-center gap-2 disabled:opacity-60"
                        data-testid="generate-image-btn"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {generating ? "painting…" : "Paint with AI"}
                    </button>
                </div>
            </section>

            <section className="grid md:grid-cols-2 gap-5">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="cozy-card p-5 sm:p-7 space-y-4">
                    <h3 className="font-heading text-2xl text-ink">Who are they?</h3>
                    <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-ink2/80">Name</label>
                        <input value={petName} onChange={(e) => setPetName(e.target.value)} className="w-full mt-1.5 rounded-full px-5 py-3 bg-paper border border-ink/10 focus:border-terracotta outline-none" placeholder="e.g. Biscuit" data-testid="pet-name-input" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-ink2/80">Type</label>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                            {SPECIES.map((s) => (
                                <button key={s} onClick={() => setPetType(s)} data-testid={`species-${s.toLowerCase()}`} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition ${petType === s ? "bg-ink text-paper border-ink" : "bg-paper border-ink/10 text-ink2 hover:border-ink/30"}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-ink2/80">Energy</label>
                        <div className="mt-1.5 flex gap-2">
                            {[["younger", "Bouncy"], ["older", "Calm"]].map(([id, label]) => (
                                <button key={id} onClick={() => setAgeVibe(id)} data-testid={`vibe-${id}`} className={`flex-1 py-3 rounded-2xl text-sm font-semibold border transition ${ageVibe === id ? "bg-moss text-paper border-moss" : "bg-paper border-ink/10 text-ink2 hover:border-ink/30"}`}>{label}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-ink2/80">Tags · pick up to 6</label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {PERSONALITY_TAGS.map((t) => {
                                const on = tags.includes(t);
                                return (
                                    <button key={t} onClick={() => toggleTag(t)} data-testid={`tag-${t.replace(/\s+/g, '-')}`} className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold border transition ${on ? "bg-terracotta text-paper border-terracotta" : "bg-paper border-ink/10 text-ink2 hover:border-ink/30"}`}>{t}</button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="cozy-card p-5 sm:p-7 space-y-4">
                    <h3 className="font-heading text-2xl text-ink">Their story</h3>
                    <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-ink2/80">Tiny bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="One soft sentence about them." className="w-full mt-1.5 rounded-2xl px-4 py-3 bg-paper border border-ink/10 focus:border-terracotta outline-none resize-none font-body" data-testid="bio-input" />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-[0.18em] text-ink2/80">Personality notes (optional)</label>
                        <textarea value={personality} onChange={(e) => setPersonality(e.target.value)} rows={4} placeholder="Quirks, favorite toys, sleeping spots…" className="w-full mt-1.5 rounded-2xl px-4 py-3 bg-paper border border-ink/10 focus:border-terracotta outline-none resize-none font-body" data-testid="personality-input" />
                    </div>
                    <div className="cozy-card !shadow-none p-3 mt-3 bg-stone/40">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-stone">
                            {imageUrl && <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />}
                        </div>
                        <div className="mt-3 px-1">
                            <div className="font-heading text-xl text-ink">{petName || "your pet"}</div>
                            <div className="text-[11px] uppercase tracking-[0.18em] text-ink2/70">{petType} · {ageVibe}</div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <div className="flex justify-end">
                <button onClick={save} className="btn-primary inline-flex items-center gap-2" data-testid="save-onboarding-btn">
                    Open the haven <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
