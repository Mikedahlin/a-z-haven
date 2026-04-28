import { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function MicButton({ onTranscript, disabled }) {
    const recRef = useRef(null);
    const chunksRef = useRef([]);
    const [recording, setRecording] = useState(false);
    const [busy, setBusy] = useState(false);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : MediaRecorder.isTypeSupported("audio/webm")
                ? "audio/webm"
                : "audio/mp4";
            const rec = new MediaRecorder(stream, { mimeType: mime });
            chunksRef.current = [];
            rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
            rec.onstop = async () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunksRef.current, { type: mime });
                if (blob.size < 1500) {
                    toast.error("Too short — hold to talk a bit longer.");
                    setBusy(false);
                    return;
                }
                setBusy(true);
                try {
                    const fd = new FormData();
                    const ext = mime.includes("mp4") ? "mp4" : "webm";
                    fd.append("audio", blob, `voice.${ext}`);
                    const res = await api.post("/voice/transcribe", fd, { headers: { "Content-Type": "multipart/form-data" } });
                    const text = (res.data?.text || "").trim();
                    if (text) onTranscript(text);
                    else toast.error("Couldn't catch that — try once more.");
                } catch (e) {
                    toast.error(e?.response?.data?.detail || "Voice failed.");
                } finally {
                    setBusy(false);
                }
            };
            recRef.current = rec;
            rec.start();
            setRecording(true);
        } catch (e) {
            toast.error("Mic permission denied.");
        }
    };

    const stop = () => {
        if (!recRef.current) return;
        try { recRef.current.stop(); } catch {}
        setRecording(false);
    };

    const toggle = () => (recording ? stop() : start());

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={disabled || busy}
            className={`!py-2.5 !px-3 rounded-full font-semibold transition inline-flex items-center justify-center disabled:opacity-50 ${
                recording ? "bg-terracotta text-paper shadow-cozy animate-pulse" : busy ? "bg-stone text-ink2" : "bg-stone hover:bg-stone/80 text-ink"
            }`}
            title={recording ? "Stop & transcribe" : "Hold to talk"}
            data-testid="mic-button"
        >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : recording ? <Square className="w-4 h-4 fill-paper" /> : <Mic className="w-4 h-4" />}
        </button>
    );
}
