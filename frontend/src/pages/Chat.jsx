import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useHaven } from "@/lib/store";
import { PERSONAS } from "@/lib/content";
import { bark, setSoundEnabled } from "@/lib/audio";

export default function Chat() {
    const { state } = useHaven();
    const [mode, setMode] = useState("assistant");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const scrollRef = useRef();

    useEffect(() => { setSoundEnabled(state.sound_enabled); }, [state.sound_enabled]);
    useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

    const send = async () => {
        const text = input.trim();
        if (!text || busy) return;
        const next = [...messages, { role: "user", content: text }];
        setMessages(next); setInput(""); setBusy(true);
        try {
            const res = await api.post("/chat", {
                messages: next,
                mode,
                pet_profile: state.pet_profile?.pet_name ? state.pet_profile : null,
            });
            setMessages([...next, { role: "assistant", content: res.data.reply }]);
            // Soft bark on dog personas
            if (mode === "archie" || mode === "zeke" || (mode === "pet" && state.pet_profile?.pet_type === "Dog")) {
                bark();
            }
        } catch (e) {
            toast.error(e?.response?.data?.detail || "Chat hiccup — try again.");
        } finally {
            setBusy(false);
        }
    };

    const persona = PERSONAS.find((p) => p.id === mode);

    return (
        <div className="space-y-5" data-testid="chat-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Chat</h1>
                <p className="text-ink2 mt-1">Pick a voice — Archie, Zeke, BMO, or your own pet.</p>
            </header>

            <div className="flex flex-wrap gap-2" data-testid="persona-bar">
                {PERSONAS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setMode(p.id)}
                        data-testid={`persona-${p.id}`}
                        className={`text-sm font-semibold px-4 py-2 rounded-full border transition inline-flex items-center gap-2 ${mode === p.id ? "bg-ink text-paper border-ink" : "bg-paper border-ink/10 text-ink2 hover:border-ink/30"}`}
                    >
                        <span className="text-base leading-none">{p.emoji}</span> {p.label}
                    </button>
                ))}
            </div>

            <div className="cozy-card flex flex-col h-[60vh] overflow-hidden">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3" data-testid="chat-messages">
                    {messages.length === 0 && (
                        <div className="text-ink2/80 text-sm italic">
                            <span className="font-semibold text-ink">{persona?.label}:</span> {persona?.desc} Try saying hi.
                        </div>
                    )}
                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[85%] rounded-3xl px-4 py-2.5 leading-relaxed ${m.role === "user" ? "bg-ink text-paper rounded-br-md" : "bg-stone/80 text-ink rounded-bl-md"}`} data-testid={`msg-${i}`}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {busy && (
                        <div className="flex justify-start">
                            <div className="rounded-3xl px-4 py-2.5 bg-stone/80 text-ink2 inline-flex items-center gap-2" data-testid="chat-typing">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> typing…
                            </div>
                        </div>
                    )}
                </div>
                <div className="border-t border-ink/5 p-3 flex items-center gap-2 bg-paper/80">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder={`Message ${persona?.label.toLowerCase()}…`}
                        className="flex-1 px-4 py-2.5 rounded-full bg-stone/40 outline-none focus:bg-paper border border-transparent focus:border-terracotta font-body"
                        data-testid="chat-input"
                    />
                    <button onClick={send} disabled={busy || !input.trim()} className="btn-accent !py-2.5 !px-4 disabled:opacity-50" data-testid="chat-send">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
