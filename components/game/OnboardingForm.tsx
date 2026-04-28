"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game-store";
import type { AgeVibe } from "@/lib/types";

const PRESET_TYPES = [
  "Dog",
  "Cat",
  "Rabbit",
  "Bird",
  "Dragon",
  "Other",
] as const;

const TAG_PRESETS = [
  "energetic",
  "calm",
  "playful",
  "sleepy",
  "always wants to play",
] as const;

export function OnboardingForm() {
  const router = useRouter();
  const setPetProfile = useGameStore((s) => s.setPetProfile);
  const completePetOnboarding = useGameStore((s) => s.completePetOnboarding);
  const bumpHappiness = useGameStore((s) => s.bumpHappiness);

  const [petType, setPetType] = useState("");
  const [presetType, setPresetType] = useState<string>(PRESET_TYPES[0]);
  const [petName, setPetName] = useState("");
  const [bio, setBio] = useState("");
  const [ageVibe, setAgeVibe] = useState<AgeVibe>("younger");
  const [tags, setTags] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenNote, setAiGenNote] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag].slice(0, 12),
    );
  }

  async function generateAiPortrait() {
    const typeResolved = presetType === "Other" ? petType.trim() : presetType;
    if (!petName.trim() || !typeResolved) {
      setAiGenNote("Add a pet name and type first.");
      return;
    }
    setAiGenNote(null);
    setFileNote(null);
    setAiGenLoading(true);
    try {
      const res = await fetch("/api/pet-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petName: petName.trim(),
          petType: typeResolved,
          tags,
        }),
      });
      const data = (await res.json()) as {
        dataUrl?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const parts = [data.error, data.detail].filter(Boolean);
        setAiGenNote(parts.length ? parts.join(" — ") : "Could not create image.");
        return;
      }
      if (data.dataUrl) {
        setImageUrl(data.dataUrl);
        setAiGenNote("AI portrait added. You can still replace it with a URL or upload.");
      } else {
        setAiGenNote("No image in response.");
      }
    } catch {
      setAiGenNote("Network error. Try again.");
    } finally {
      setAiGenLoading(false);
    }
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileNote("Please choose an image file.");
      return;
    }
    if (file.size > 800_000) {
      setFileNote("Image is large. Try a smaller photo or use a URL instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImageUrl(result);
        setFileNote("Preview stored locally. This is fine for the first version.");
      }
    };
    reader.readAsDataURL(file);
  }

  function buildPersonality() {
    return JSON.stringify({
      ageVibe,
      tags,
      bio: bio.trim(),
      flavor: "a-z-onboard-v1",
    });
  }

  function submit() {
    const typeResolved = presetType === "Other" ? petType.trim() : presetType;
    if (!petName.trim() || !typeResolved) return;

    setPetProfile({
      petType: typeResolved,
      petName: petName.trim(),
      bio: bio.trim() || null,
      personality: buildPersonality(),
      ageVibe,
      tags,
      imageUrl: imageUrl.trim() || null,
      onboardingComplete: true,
    });
    completePetOnboarding();
    bumpHappiness(12);
    router.push("/hub");
  }

  return (
    <form
      className="space-y-8 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div>
        <label className="text-sm font-semibold text-cozy-cocoa" htmlFor="ptype">
          Pet type
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESET_TYPES.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPresetType(preset)}
              className={`min-h-[48px] rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 ${
                presetType === preset
                  ? "bg-cozy-cocoa text-cozy-cream"
                  : "bg-white/80 text-cozy-cocoa/80"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        {presetType === "Other" && (
          <input
            id="ptype"
            name="petType"
            value={petType}
            onChange={(event) => setPetType(event.target.value)}
            autoComplete="off"
            placeholder="Example: Axolotl or robot pup..."
            className="mt-3 min-h-[52px] w-full rounded-2xl border border-cozy-cocoa/10 bg-white px-4 py-3 text-cozy-cocoa focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
          />
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-cozy-cocoa" htmlFor="pname">
          Pet name
        </label>
        <input
          id="pname"
          name="petName"
          value={petName}
          onChange={(event) => setPetName(event.target.value)}
          maxLength={40}
          autoComplete="off"
          className="mt-2 min-h-[52px] w-full rounded-2xl border border-cozy-cocoa/10 bg-white px-4 py-3 text-lg text-cozy-cocoa focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
          placeholder="Their name"
        />
      </div>

      <div>
        <span className="text-sm font-semibold text-cozy-cocoa">Age vibe</span>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setAgeVibe("younger")}
            className={`min-h-[56px] rounded-2xl border px-4 py-3 text-left text-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 ${
              ageVibe === "younger"
                ? "border-cozy-honey bg-cozy-honey/20"
                : "border-cozy-cocoa/10 bg-white/80"
            }`}
          >
            <span className="font-semibold text-cozy-cocoa">
              Younger / bigger energy
            </span>
            <span className="mt-1 block text-xs text-cozy-cocoa/65">
              Bouncy, playful, zoomie-friendly
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAgeVibe("older")}
            className={`min-h-[56px] rounded-2xl border px-4 py-3 text-left text-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 ${
              ageVibe === "older"
                ? "border-cozy-honey bg-cozy-honey/20"
                : "border-cozy-cocoa/10 bg-white/80"
            }`}
          >
            <span className="font-semibold text-cozy-cocoa">Older / calmer</span>
            <span className="mt-1 block text-xs text-cozy-cocoa/65">
              Soft steps, cozy rituals, gentle eyes
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-cozy-cocoa" htmlFor="bio">
          Short bio / personality
        </label>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={500}
          rows={4}
          autoComplete="off"
          placeholder="What makes them unmistakably them?"
          className="mt-2 w-full rounded-2xl border border-cozy-cocoa/10 bg-white px-4 py-3 text-sm text-cozy-cocoa focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        />
      </div>

      <div>
        <span className="text-sm font-semibold text-cozy-cocoa">Tags</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_PRESETS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 ${
                tags.includes(tag)
                  ? "bg-cozy-cocoa text-cozy-cream"
                  : "bg-white/80 text-cozy-cocoa/75"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-cozy-cocoa" htmlFor="imgurl">
          Photo (URL or upload preview)
        </label>
        <p className="mt-1 text-xs text-cozy-cocoa/55">
          Use an HTTPS link, a small local preview, or generate a soft illustrated portrait
          (needs <code className="rounded bg-cozy-cocoa/5 px-1">OPENAI_API_KEY</code> on
          the server). You can skip this for now.
        </p>
        <input
          id="imgurl"
          name="imageUrl"
          value={imageUrl.startsWith("data:") ? "" : imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="https://example.com/pet-photo.jpg"
          className="mt-2 min-h-[48px] w-full rounded-2xl border border-cozy-cocoa/10 bg-white px-3 text-sm text-cozy-cocoa focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        />
        <input
          type="file"
          accept="image/*"
          aria-label="Upload a pet photo from your device"
          className="mt-3 block w-full text-sm text-cozy-cocoa/80 file:mr-4 file:rounded-full file:border-0 file:bg-cozy-cocoa file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cozy-cream hover:file:opacity-95"
          onChange={onFileChange}
        />
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              void generateAiPortrait();
            }}
            disabled={
              aiGenLoading ||
              !petName.trim() ||
              (presetType === "Other" && !petType.trim())
            }
            className="min-h-[48px] rounded-full border border-cozy-cocoa/20 bg-white/90 px-5 text-sm font-semibold text-cozy-cocoa shadow-sm transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 disabled:opacity-40"
          >
            {aiGenLoading ? "Generating…" : "Generate AI portrait"}
          </button>
        </div>
        {aiGenNote && (
          <p className="mt-2 text-xs text-cozy-cocoa/70" role="status" aria-live="polite">
            {aiGenNote}
          </p>
        )}
        {fileNote && (
          <p className="mt-2 text-xs text-cozy-cocoa/65" role="status" aria-live="polite">
            {fileNote}
          </p>
        )}
        {imageUrl.startsWith("data:") && (
          <p className="mt-2 text-xs text-emerald-700/80" role="status" aria-live="polite">
            Image preview ready.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!petName.trim() || (presetType === "Other" && !petType.trim())}
        className="min-h-[56px] w-full rounded-full bg-cozy-cocoa px-6 text-base font-semibold text-cozy-cream shadow-glow transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 disabled:opacity-40"
      >
        Create My Pet &amp; Enter Home
      </button>
    </form>
  );
}
