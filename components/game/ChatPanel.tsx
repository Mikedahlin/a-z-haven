"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "@/lib/types";
import { useGameStore } from "@/store/game-store";

type ChatMode = "narrator" | "pet";

const QUICK_PROMPTS = [
  {
    label: "Daily Greeting",
    text: "Please give me a gentle daily greeting for my pet and me.",
  },
  {
    label: "Bedtime",
    text: "A soft bedtime message: calm, comforting, and about my companion.",
  },
  {
    label: "What Next?",
    text: "What should I unlock or work toward next? No pressure, just cozy ideas.",
  },
] as const;

export function ChatPanel({
  open,
  onClose,
  soundEnabled,
  layout = "modal",
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  layout?: "modal" | "inline";
  closeLabel?: string;
}) {
  const petProfile = useGameStore((s) => s.petProfile);
  const [mode, setMode] = useState<ChatMode>("narrator");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsBusyId, setTtsBusyId] = useState<string | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to A-Z Haven, your pet's little universe. Ask for a greeting, a bedtime whisper, or what to unlock next.",
      createdAt: Date.now(),
    },
  ]);

  const canSend = input.trim().length > 0 && !loading;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setError(null);
    setLoading(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    const nextThread = [...messages, userMsg];
    setMessages(nextThread);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          petProfile,
          messages: nextThread
            .filter((message) => message.role !== "system")
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (!data.reply) {
        setError("Empty reply.");
        return;
      }
      const reply = data.reply;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          createdAt: Date.now(),
        },
      ]);
      if (soundEnabled && typeof window !== "undefined") {
        const { sounds } = await import("@/lib/audio");
        sounds.softChime(true);
      }
    } catch {
      setError("Could not reach the chat service.");
    } finally {
      setLoading(false);
    }
  }

  const shellClassName =
    layout === "modal"
      ? "fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      : "relative z-0 w-full";

  const panelClassName =
    layout === "modal"
      ? "relative z-10 flex max-h-[min(720px,92vh)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/70 bg-cozy-cream shadow-glow overscroll-contain"
      : "relative mx-auto flex min-h-[min(720px,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/70 bg-cozy-cream shadow-glow";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={shellClassName}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {layout === "modal" && (
            <button
              type="button"
              className="absolute inset-0 bg-cozy-cocoa/35 backdrop-blur-sm"
              aria-label="Close chat"
              onClick={onClose}
            />
          )}
          <motion.div
            role="dialog"
            aria-modal={layout === "modal"}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={panelClassName}
          >
            <header className="flex items-center justify-between border-b border-cozy-cocoa/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cozy-cocoa/45">
                  Cozy companion
                </p>
                <h2 id={titleId} className="font-display text-xl text-cozy-cocoa">
                  A-Z Haven
                </h2>
                <p id={descriptionId} className="sr-only">
                  Send kind messages to your companion or ask the guide what to
                  do next.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/70 px-3 py-1 text-sm text-cozy-cocoa shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
              >
                {closeLabel ?? (layout === "inline" ? "Home" : "Close")}
              </button>
            </header>

            <div className="flex gap-2 border-b border-cozy-cocoa/10 px-4 py-3">
              {(
                [
                  ["narrator", "Guide"],
                  ["pet", petProfile.petName.trim() ? petProfile.petName : "Pet"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  aria-pressed={mode === key}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 ${
                    mode === key
                      ? "bg-cozy-cocoa text-cozy-cream"
                      : "bg-white/60 text-cozy-cocoa/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] space-y-2 rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "ml-auto bg-cozy-sky/35 text-cozy-cocoa"
                      : "mr-auto bg-white/80 text-cozy-cocoa/90"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && message.content.trim().length > 0 && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        disabled={ttsBusyId !== null}
                        onClick={() => {
                          void (async () => {
                            setError(null);
                            setTtsBusyId(message.id);
                            try {
                              const { playElevenTts } = await import(
                                "@/lib/eleven-tts-client"
                              );
                              await playElevenTts(message.content);
                            } catch (e) {
                              setError(
                                e instanceof Error
                                  ? e.message
                                  : "Could not play speech.",
                              );
                            } finally {
                              setTtsBusyId(null);
                            }
                          })();
                        }}
                        className="text-xs font-semibold text-amber-900/80 underline decoration-amber-700/30 underline-offset-2 transition hover:text-amber-950 disabled:opacity-50"
                      >
                        {ttsBusyId === message.id ? "Preparing…" : "Listen"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <p className="text-xs text-cozy-cocoa/50">Thinking softly...</p>
              )}
              {error && (
                <p className="text-sm text-red-700/80" role="alert">
                  {error}
                </p>
              )}
            </div>

            <form
              className="border-t border-cozy-cocoa/10 px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
            >
              <div className="mb-2 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => void send(prompt.text)}
                    className="rounded-full bg-white/70 px-3 py-1 text-xs text-cozy-cocoa/80 shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="chat-input">
                  Message
                </label>
                <input
                  id="chat-input"
                  name="chatMessage"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  autoComplete="off"
                  placeholder="Say something kind..."
                  className="flex-1 rounded-2xl border border-cozy-cocoa/10 bg-white/80 px-4 py-3 text-sm text-cozy-cocoa ring-cozy-honey/40 focus:outline-none focus-visible:ring-2"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="rounded-2xl bg-cozy-cocoa px-4 py-3 text-sm font-semibold text-cozy-cream shadow-card transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
