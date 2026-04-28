import { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export default function PetPhotoUpload({ label, value, onChange, testid }) {
    const inputRef = useRef(null);

    const handlePick = () => inputRef.current?.click();

    const handleFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED.includes(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
            toast.error("Please pick a JPG, PNG, WEBP, or HEIC image.");
            return;
        }
        if (file.size > MAX_BYTES) {
            toast.error("That image is over 4MB. Try a smaller one.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result);
            toast.success(`${label} portrait saved.`);
        };
        reader.onerror = () => toast.error("Could not read that image.");
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    return (
        <div className="cozy-card p-4 flex items-center gap-4" data-testid={testid}>
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone shrink-0">
                {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🐾</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-heading text-lg text-ink">{label}</div>
                <div className="text-xs text-ink2/80">{value ? "Looking great." : "No photo yet — drop one in."}</div>
                <div className="mt-2 flex gap-2">
                    <button onClick={handlePick} className="btn-ghost !py-1.5 !px-3 text-sm inline-flex items-center gap-1.5" data-testid={`${testid}-upload`}>
                        <Upload className="w-3.5 h-3.5" /> {value ? "Replace" : "Upload"}
                    </button>
                    {value && (
                        <button onClick={() => onChange(null)} className="btn-ghost !py-1.5 !px-3 text-sm inline-flex items-center gap-1.5 !text-terracotta !border-terracotta/30 hover:!bg-terracotta/10" data-testid={`${testid}-remove`}>
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                    )}
                </div>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={handleFile} data-testid={`${testid}-input`} />
        </div>
    );
}
