export type ShopItem = {
  id: string;
  name: string;
  description: string;
  coinPrice: number;
  usdCents: number;
  category: "decor" | "toy" | "theme" | "story" | "outfit";
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "cozy-blanket-set",
    name: "Cozy Blanket Set",
    description: "Layered throws and soft folds for the sleeping nook.",
    coinPrice: 220,
    usdCents: 499,
    category: "decor",
  },
  {
    id: "zoomie-toy-pack",
    name: "Zoomie Toy Pack",
    description: "Squeaks and rolls for pets who always want to play.",
    coinPrice: 180,
    usdCents: 399,
    category: "toy",
  },
  {
    id: "seasonal-backdrop",
    name: "Seasonal Backdrop",
    description: "A gentle seasonal wash for your hub. No timers, just mood.",
    coinPrice: 260,
    usdCents: 599,
    category: "theme",
  },
  {
    id: "starlit-rug",
    name: "Starlit Rug",
    description: "Tiny constellations woven in for extra comfort.",
    coinPrice: 200,
    usdCents: 449,
    category: "decor",
  },
  {
    id: "premium-story-vol-1",
    name: "Whispered Tales Vol. 1",
    description:
      "Extra cozy milestone narration beats for the puzzle. Same warmth, new verses. Cosmetic narrative unlock.",
    coinPrice: 320,
    usdCents: 699,
    category: "story",
  },
  {
    id: "outfit-cozy-bandana",
    name: "Cozy Bandana Set",
    description:
      "Soft palette swaps for your pet portrait frame. Purely visual flair.",
    coinPrice: 140,
    usdCents: 299,
    category: "outfit",
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((item) => item.id === id);
}
