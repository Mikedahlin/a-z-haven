import { useState } from "react";
import { toast } from "sonner";
import { useHaven } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import PetPhotoUpload from "@/components/PetPhotoUpload";

export default function Settings() {
    const { state, update, resetSave, signOut } = useHaven();
    const nav = useNavigate();
    const [confirm, setConfirm] = useState(false);

    const onReset = () => {
        if (!confirm) { setConfirm(true); return; }
        resetSave();
        setConfirm(false);
        toast.success("Save reset.");
    };

    return (
        <div className="space-y-7" data-testid="settings-page">
            <header>
                <h1 className="font-heading text-4xl sm:text-5xl text-ink leading-tight">Settings</h1>
                <p className="text-ink2 mt-1">Tune the haven to your evening.</p>
            </header>

            <section className="space-y-3 max-w-2xl" data-testid="real-pets-section">
                <h2 className="font-heading text-2xl text-ink">Real Archie & Zeke photos</h2>
                <p className="text-sm text-ink2">Upload your own photos — they'll show up across the Hub, Pet picker, and Story postcards. Anytime, swap or remove.</p>
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <PetPhotoUpload
                        label="Archie · Boston Terrier"
                        value={state.archie_photo_url}
                        onChange={(v) => update({ archie_photo_url: v })}
                        testid="archie-upload"
                    />
                    <PetPhotoUpload
                        label="Zeke · Frenchton"
                        value={state.zeke_photo_url}
                        onChange={(v) => update({ zeke_photo_url: v })}
                        testid="zeke-upload"
                    />
                </div>
            </section>

            <div className="cozy-card p-6 space-y-4 max-w-2xl">
                <h2 className="font-heading text-2xl text-ink">Sounds & motion</h2>
                <Toggle label="UI sounds" desc="Soft click feedback (when supported)." checked={state.sound_enabled} onChange={(v) => update({ sound_enabled: v })} testid="toggle-sound" />
                <Toggle label="Cozy ambient hum" desc="A gentle pad while you read Story Mode (start it on the Story page)." checked={state.ambient_enabled} onChange={(v) => update({ ambient_enabled: v })} testid="toggle-music" />
                <Toggle label="Reduced motion" desc="Calmer animations everywhere." checked={state.reduced_motion} onChange={(v) => update({ reduced_motion: v })} testid="toggle-motion" />

                <div className="pt-3 border-t border-ink/10 flex flex-wrap gap-3">
                    <button onClick={() => nav("/onboard")} className="btn-ghost" data-testid="edit-pet-btn">Edit my pet</button>
                    <button onClick={onReset} className="btn-accent" data-testid="reset-save-btn">{confirm ? "Tap again to confirm" : "Reset save"}</button>
                    <button onClick={async () => { await signOut(); nav("/"); }} className="btn-ghost" data-testid="settings-signout">Sign out</button>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, desc, checked, onChange, testid }) {
    return (
        <div className="flex items-start justify-between gap-4" data-testid={testid}>
            <div>
                <div className="font-heading text-lg text-ink">{label}</div>
                <div className="text-sm text-ink2">{desc}</div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-7 rounded-full p-1 transition relative ${checked ? "bg-moss" : "bg-stone"}`}
                aria-pressed={checked}
            >
                <span className={`block w-5 h-5 rounded-full bg-paper shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
            </button>
        </div>
    );
}
