import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useEffect } from "react";
import { useHaven } from "@/lib/store";
import { ArrowRight, Sparkles, Heart, BookOpen } from "lucide-react";

export default function Landing() {
    const nav = useNavigate();
    const { user, signInWithGoogleCredential, state } = useHaven();

    useEffect(() => {
        if (user) {
            nav(state.pet_profile?.onboarding_complete ? "/hub" : "/onboard", { replace: true });
        }
    }, [user, state.pet_profile?.onboarding_complete, nav]);

    return (
        <div className="relative min-h-screen warm-halo bg-grain" data-testid="landing-page">
            <header className="max-w-6xl mx-auto px-6 sm:px-10 pt-7 flex items-center">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-terracotta/15 flex items-center justify-center">
                        <span className="font-heading text-terracotta text-2xl leading-none">a–z</span>
                    </div>
                    <div>
                        <div className="font-heading text-xl text-ink leading-tight">A–Z Haven</div>
                        <div className="text-[10.5px] uppercase tracking-[0.18em] text-ink2/70">a cozy little world</div>
                    </div>
                </div>
                <div className="flex-1" />
                <div className="hidden sm:flex items-center gap-4 text-sm text-ink2 font-body">
                    <a className="hover:text-ink transition" href="#about">About</a>
                    <a className="hover:text-ink transition" href="#features">Features</a>
                </div>
            </header>

            <section className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-12 sm:pt-20 pb-10 grid lg:grid-cols-12 gap-10 items-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="lg:col-span-7"
                >
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs uppercase tracking-[0.2em] font-semibold mb-6" data-testid="hero-eyebrow">
                        <Sparkles className="w-3.5 h-3.5" /> Premium cozy game
                    </span>
                    <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-ink">
                        Two dogs.
                        <br />
                        <span className="text-terracotta italic">One soft</span> little home.
                    </h1>
                    <p className="mt-6 text-lg text-ink2 max-w-xl leading-relaxed">
                        Meet <b className="text-ink">Archie</b> &amp; <b className="text-ink">Zeke</b> — quietly devoted, sweetly bouncy, always
                        the stars of A–Z Haven. Play calm puzzles, decorate cozy rooms, and follow an
                        AI-driven storyline made just for them.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <div className="rounded-full overflow-hidden shadow-cozy" data-testid="google-login-wrap">
                            <GoogleLogin
                                onSuccess={async (resp) => {
                                    try {
                                        await signInWithGoogleCredential(resp.credential);
                                        toast.success("Welcome home.");
                                    } catch (e) {
                                        toast.error("Sign-in failed. Try again.");
                                    }
                                }}
                                onError={() => toast.error("Google sign-in cancelled")}
                                shape="pill"
                                theme="filled_black"
                                size="large"
                                text="continue_with"
                            />
                        </div>
                        <a href="#features" className="btn-ghost inline-flex items-center gap-1.5" data-testid="learn-more-btn">
                            Learn more <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                    <div className="mt-10 flex items-center gap-6 text-xs text-ink2/80 uppercase tracking-[0.2em]">
                        <span>· Cozy puzzle</span>
                        <span>· AI storyline</span>
                        <span>· Real pet pics</span>
                        <span className="hidden sm:inline">· BMO mode</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                    className="lg:col-span-5 grid grid-cols-2 gap-4"
                >
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="cozy-card overflow-hidden col-span-2 aspect-[4/3]"
                    >
                        <img
                            src="/images/pets/02.webp"
                            alt="Archie or Zeke"
                            className="w-full h-full object-cover"
                            data-testid="hero-image-1"
                        />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        className="cozy-card overflow-hidden aspect-square"
                    >
                        <img
                            src="/images/pets/06.webp"
                            alt="The boys"
                            className="w-full h-full object-cover"
                            data-testid="hero-image-2"
                        />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                        className="cozy-card overflow-hidden aspect-square"
                    >
                        <img
                            src="/images/pets/09.webp"
                            alt="Cozy moment"
                            className="w-full h-full object-cover"
                            data-testid="hero-image-3"
                        />
                    </motion.div>
                </motion.div>
            </section>

            <section id="features" className="relative max-w-6xl mx-auto px-6 sm:px-10 py-14 grid sm:grid-cols-3 gap-5">
                {FEATURES.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="cozy-card p-6"
                        data-testid={`feature-card-${i}`}
                    >
                        <f.icon className="w-6 h-6 text-terracotta" />
                        <h3 className="mt-3 font-heading text-2xl text-ink">{f.title}</h3>
                        <p className="mt-2 text-ink2 leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </section>

            <footer className="max-w-6xl mx-auto px-6 sm:px-10 py-10 text-xs text-ink2/70 font-body" id="about">
                Made with warmth — for everyone who loves a quiet evening with a great dog. <br />
                The named pet is the star, every line.
            </footer>
        </div>
    );
}

const FEATURES = [
    { title: "A calm puzzle", desc: "A 6×6 match of soft, organic shapes. No timers. Just a gentle round.", icon: Sparkles },
    { title: "AI storyline", desc: "Chapters about Archie & Zeke, illustrated as you read — generated just for your evening.", icon: BookOpen },
    { title: "Pet you love", desc: "Real pet photos, your custom AI-generated portrait, and a chat that knows their name.", icon: Heart },
];
