"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Optional soft loop. Set `NEXT_PUBLIC_AMBIENT_AUDIO=/audio/ambient-cozy.mp3` in `.env`
 * after you add the file under `public/audio/`. If unset, nothing loads (no 404s).
 */
const AMBIENT_SRC = process.env.NEXT_PUBLIC_AMBIENT_AUDIO?.trim() ?? "";

/**
 * Optional soft loop — only mounts when `NEXT_PUBLIC_AMBIENT_AUDIO` is set.
 */
export function AmbientAudio({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [srcOk, setSrcOk] = useState(true);

  useEffect(() => {
    if (!AMBIENT_SRC) return;
    const el = ref.current;
    if (!el || !srcOk) return;
    el.volume = 0.12;
    if (enabled) {
      void el.play().catch(() => {
        /* autoplay policies / missing file */
      });
    } else {
      el.pause();
    }
  }, [enabled, srcOk]);

  if (!AMBIENT_SRC || !srcOk) return null;

  return (
    <audio
      ref={ref}
      src={AMBIENT_SRC}
      loop
      preload="none"
      className="hidden"
      onError={() => setSrcOk(false)}
    />
  );
}
