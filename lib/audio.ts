let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

export const sounds = {
  tap(enabled: boolean) {
    if (!enabled) return;
    playTone(520, 0.06, 0.04, "sine");
  },
  success(enabled: boolean) {
    if (!enabled) return;
    playTone(660, 0.08, 0.05, "triangle");
    setTimeout(() => playTone(880, 0.1, 0.045, "triangle"), 70);
  },
  reward(enabled: boolean) {
    if (!enabled) return;
    playTone(440, 0.09, 0.05, "sine");
    setTimeout(() => playTone(554, 0.09, 0.05, "sine"), 90);
    setTimeout(() => playTone(659, 0.12, 0.055, "sine"), 180);
  },
  softChime(enabled: boolean) {
    if (!enabled) return;
    playTone(784, 0.2, 0.035, "sine");
  },
  wag(enabled: boolean) {
    if (!enabled) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => playTone(300 + i * 40, 0.05, 0.03, "triangle"), i * 45);
    }
  },
};

const htmlAudioCache = new Map<string, HTMLAudioElement>();

/**
 * Play a sound from a public URL (e.g. `/sounds/chime.mp3`).
 * Good for Mixkit/Pixabay files dropped into `public/sounds/`.
 */
export function playSound(
  src: string,
  options?: { volume?: number; enabled?: boolean },
): void {
  if (typeof window === "undefined") return;
  if (options?.enabled === false) return;
  const volume = options?.volume ?? 0.45;
  try {
    let el = htmlAudioCache.get(src);
    if (!el) {
      el = new Audio(src);
      el.preload = "auto";
      htmlAudioCache.set(src, el);
    }
    el.volume = Math.min(1, Math.max(0, volume));
    void el.play().catch(() => {
      /* autoplay blocked until gesture */
    });
  } catch {
    /* ignore */
  }
}

export async function resumeAudioContext() {
  const ctx = getCtx();
  if (ctx?.state === "suspended") await ctx.resume();
}
