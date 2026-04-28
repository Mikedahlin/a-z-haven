/** Rotating micro-stories every 10 puzzle tiers — personalized with pet name & type. */

export type PuzzleStoryBeat = {
  title: string;
  lines: string[];
  kicker: string;
};

function nameOf(petName: string, fallback: string) {
  const t = petName.trim();
  return t.length ? t : fallback;
}

export function getPuzzleStoryBeat(
  milestone: number,
  petName: string,
  petType: string,
): PuzzleStoryBeat {
  const n = nameOf(petName, "your companion");
  const species = petType.trim() || "friend";
  const chapter = Math.max(1, Math.floor(milestone / 10));
  const script = (chapter - 1) % 5;

  const beats: PuzzleStoryBeat[] = [
    {
      title: `Chapter ${chapter} · First light`,
      lines: [
        `Dawn spills across A–Z Haven, and ${n}—your ${species}—notices everything: the hush, the hope, the soft place you saved for them.`,
        `They test the floor with one careful paw, then another, as if the world were a gift that might vanish if rushed.`,
        `This is where their story becomes yours: not loud, not hurried—only true.`,
      ],
      kicker: "Rest here. The next ten levels are just more pages of the same love.",
    },
    {
      title: `Chapter ${chapter} · The cozy map`,
      lines: [
        `${n} memorizes the corners: where sunlight lands, where your footsteps sound kindest, where treats might appear like tiny miracles.`,
        `They are part Tamagotchi patience, part Neopets daydream—collecting moments instead of clutter.`,
        `Every match you make on the board is a small promise kept: “I’m still here, and I’m building something gentle for us.”`,
      ],
      kicker: "The haven grows when you do. Keep going—softly, steadily.",
    },
    {
      title: `Chapter ${chapter} · Zoomies & trust`,
      lines: [
        `Sometimes ${n} runs simply because joy has nowhere else to go—then collapses into a heap of fluff and certainty.`,
        `They learn that return is safe: that you’ll be there when the spinning stops.`,
        `If love had a sound, it would be this: breath slowing, tail settling, eyes closing in daylight.`,
      ],
      kicker: "Play is sacred too. The next stretch of levels is pure heart.",
    },
    {
      title: `Chapter ${chapter} · Seasons turn`,
      lines: [
        `The rooms change like Neko Atsume afternoons—new light, new shadows, the same old tenderness.`,
        `${n} watches leaves, ribbons, snowflakes—whatever the seasonal room imagines—and decides: you are home, no matter the weather.`,
        `Even when the world outside is loud, the haven stays a whisper.`,
      ],
      kicker: "Change is decoration. Bond is the foundation.",
    },
    {
      title: `Chapter ${chapter} · Stars & memory`,
      lines: [
        `Night brings constellations only you two can read—little victories hung like lanterns.`,
        `${n} does not need perfection; they need presence. You’ve been giving exactly that.`,
        `Tomorrow, the board will wait. Tonight, ${n} dreams in colors you unlocked together.`,
      ],
      kicker: "This milestone is a scrapbook page. Thank you for staying.",
    },
  ];

  return beats[script] ?? beats[0];
}
