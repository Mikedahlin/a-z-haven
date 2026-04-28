import type { RoomDefinition } from "@/lib/types";

export const ROOMS: RoomDefinition[] = [
  {
    id: "sleeping",
    name: "Cozy Sleeping Nook",
    description: "Soft lamp-glow, folded blankets, and the quiet hush where dreams get extra soft.",
    unlockCost: { coins: 0, stars: 0 },
    flavor: "Archie loves a tidy pillow stack; Zeke claims the warmest corner.",
  },
  {
    id: "living",
    name: "Living Room",
    description: "Heart-of-the-home energy: sunlight, a good rug, and room for zoomies between naps.",
    unlockCost: { coins: 0, stars: 0 },
    flavor: "Movie-night cuddles, gentle play, and the best tail wags.",
  },
  {
    id: "backyard",
    name: "Backyard Play Zone",
    description: "Grass-soft mornings, bird sounds, and space for happy chaos.",
    unlockCost: { coins: 120, stars: 2 },
    flavor: "Zeke wants fetch; Archie wants to supervise with dignity.",
  },
  {
    id: "kitchen",
    name: "Treat Kitchen",
    description: "Warm counters, little rituals, and the sacred sound of a treat jar.",
    unlockCost: { coins: 90, stars: 1 },
    flavor: "Archie performs polite patience. Zeke performs enthusiasm.",
  },
  {
    id: "bath",
    name: "Bath & Grooming",
    description: "Sparkle time, soft towels, and the brave little shake-off dance.",
    unlockCost: { coins: 70, stars: 1 },
    flavor: "Zeke splashes. Archie negotiates.",
  },
  {
    id: "seasonal",
    name: "Seasonal Holiday Room",
    description: "Twinkle lights, cocoa steam, and cozy sweaters hung with care.",
    unlockCost: { coins: 150, stars: 3 },
    flavor: "Both dogs agree: ornaments taste suspicious, joy tastes wonderful.",
  },
  {
    id: "birthday",
    name: "Birthday Celebration Room",
    description: "Confetti-soft, candle-warm, and full of gentle celebration.",
    unlockCost: { coins: 200, stars: 4 },
    flavor: "Archie savors the moment. Zeke savors the cake-adjacent air.",
  },
  {
    id: "memory",
    name: "Memory Gallery",
    description: "A hushed gallery for scrapbook pages, little milestones, and love made visible.",
    unlockCost: { coins: 60, stars: 2 },
    flavor: "Stories live here—only Archie and Zeke, always.",
  },
];
