import { OnboardingForm } from "@/components/game/OnboardingForm";

export default function OnboardPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 pb-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-cozy-cocoa/45">
          Begin
        </p>
        <h1 className="font-display text-3xl text-cozy-cocoa sm:text-4xl">
          Meet your companion
        </h1>
        <p className="text-sm leading-relaxed text-cozy-cocoa/75">
          Like Neko Atsume’s gentle collecting or Neopets’ dress-up dreams—this is
          your pet’s soul sheet. Name them, choose their vibe, and optional photo.
          We’ll remember everything for warm chat and cozy hub moments.
        </p>
      </header>
      <OnboardingForm />
    </main>
  );
}
