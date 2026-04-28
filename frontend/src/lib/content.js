// Game content shared with the original A–Z Haven repo (ported)

export const ROOMS = [
    { id: "sleeping", name: "Cozy Sleeping Nook", description: "Soft lamp-glow, folded blankets, and the quiet hush where dreams get extra soft.", unlock: { coins: 0, stars: 0 }, flavor: "Archie loves a tidy pillow stack; Zeke claims the warmest corner." },
    { id: "living", name: "Living Room", description: "Heart-of-the-home energy: sunlight, a good rug, and room for zoomies between naps.", unlock: { coins: 0, stars: 0 }, flavor: "Movie-night cuddles, gentle play, and the best tail wags." },
    { id: "kitchen", name: "Treat Kitchen", description: "Warm counters, little rituals, and the sacred sound of a treat jar.", unlock: { coins: 90, stars: 1 }, flavor: "Archie performs polite patience. Zeke performs enthusiasm." },
    { id: "backyard", name: "Backyard Play Zone", description: "Grass-soft mornings, bird sounds, and space for happy chaos.", unlock: { coins: 120, stars: 2 }, flavor: "Zeke wants fetch; Archie wants to supervise with dignity." },
    { id: "bath", name: "Bath & Grooming", description: "Sparkle time, soft towels, and the brave little shake-off dance.", unlock: { coins: 70, stars: 1 }, flavor: "Zeke splashes. Archie negotiates." },
    { id: "memory", name: "Memory Gallery", description: "A hushed gallery for scrapbook pages, little milestones, and love made visible.", unlock: { coins: 60, stars: 2 }, flavor: "Stories live here—only Archie and Zeke, always." },
    { id: "seasonal", name: "Seasonal Holiday Room", description: "Twinkle lights, cocoa steam, and cozy sweaters hung with care.", unlock: { coins: 150, stars: 3 }, flavor: "Both dogs agree: ornaments taste suspicious, joy tastes wonderful." },
    { id: "birthday", name: "Birthday Celebration Room", description: "Confetti-soft, candle-warm, and full of gentle celebration.", unlock: { coins: 200, stars: 4 }, flavor: "Archie savors the moment. Zeke savors the cake-adjacent air." },
];

export const DECOR = [
    { id: "woven-bed", name: "Woven Bed", roomId: "living", cost: 0, slot: "floor" },
    { id: "star-lamp", name: "Star Lamp", roomId: "sleeping", cost: 1, slot: "accent" },
    { id: "sunny-rug", name: "Sunny Rug", roomId: "living", cost: 2, slot: "floor" },
    { id: "herb-window", name: "Herb Window", roomId: "kitchen", cost: 2, slot: "wall" },
    { id: "rope-toy-basket", name: "Rope Toy Basket", roomId: "living", cost: 3, slot: "floor" },
    { id: "bubble-mat", name: "Bubble Mat", roomId: "bath", cost: 2, slot: "floor" },
    { id: "garden-bowl", name: "Garden Water Bowl", roomId: "backyard", cost: 2, slot: "floor" },
    { id: "blanket-nest", name: "Layered Blanket Nest", roomId: "sleeping", cost: 1, slot: "floor" },
    { id: "memory-runner", name: "Starlit Memory Runner", roomId: "memory", cost: 2, slot: "floor" },
];

export const SCRAPBOOK = [
    { id: "first-tail-wag", title: "The First Hello", body: "Some companions announce themselves with a wag; others with a quiet lean. Yours chose you.", unlockStars: 0, roomHint: "living" },
    { id: "kitchen-patience", title: "Kitchen Patience Academy", body: "Treats teach patience—or at least teach adorable staring. Both count.", unlockStars: 2, roomHint: "kitchen" },
    { id: "backyard-breeze", title: "Backyard Breeze", body: "Sky overhead, grass underfoot, and the feeling that the day can be gentle.", unlockStars: 3, roomHint: "backyard" },
    { id: "memory-lane", title: "Soft Memory Lane", body: "Not every treasure is a toy. Some are moments you can feel in your chest.", unlockStars: 5, roomHint: "memory" },
    { id: "starlit-night", title: "Starlit Night", body: "Two dogs, one window, and a sky full of small lights. Quiet enough to hear them breathe.", unlockStars: 8, roomHint: "memory" },
];

export const PET_PHOTOS = [
    { id: "az01", url: "/images/pets/01.webp", label: "Archie & Zeke #1" },
    { id: "az02", url: "/images/pets/02.webp", label: "Archie & Zeke #2" },
    { id: "az03", url: "/images/pets/03.webp", label: "Archie & Zeke #3" },
    { id: "az04", url: "/images/pets/04.webp", label: "Archie & Zeke #4" },
    { id: "az05", url: "/images/pets/05.webp", label: "Archie & Zeke #5" },
    { id: "az06", url: "/images/pets/06.webp", label: "Archie & Zeke #6" },
    { id: "az07", url: "/images/pets/07.webp", label: "Archie & Zeke #7" },
    { id: "az08", url: "/images/pets/08.webp", label: "Archie & Zeke #8" },
    { id: "az09", url: "/images/pets/09.webp", label: "Archie & Zeke #9" },
    { id: "az10", url: "/images/pets/10.webp", label: "Archie & Zeke #10" },
    { id: "az11", url: "/images/pets/11.webp", label: "Archie & Zeke #11" },
    { id: "az12", url: "/images/pets/12.webp", label: "Archie & Zeke #12" },
];

export const PERSONALITY_TAGS = [
    "playful", "calm", "brave", "snuggly", "snack radar", "supervisor",
    "zoomies", "gentle", "curious", "treat-loving", "cuddler", "couch potato",
];

export const PERSONAS = [
    { id: "assistant", label: "Narrator", emoji: "✦", desc: "Gentle host who adores Archie & Zeke." },
    { id: "archie", label: "Archie", emoji: "🐕", desc: "Quietly devoted, observant, soft." },
    { id: "zeke", label: "Zeke", emoji: "🐶", desc: "Bouncy, bright, play-forward." },
    { id: "bmo", label: "BMO", emoji: "🤖", desc: "Sweet little robot pal." },
    { id: "pet", label: "My Pet", emoji: "🌿", desc: "Speaks as your own companion." },
];

export const INITIAL_STATE = {
    version: 3,
    coins: 50,
    treats: 5,
    bones: 0,
    decor_tokens: 1,
    stars: 0,
    puzzle_level: 1,
    puzzle_best_score: 0,
    unlocked_rooms: ["sleeping", "living"],
    selected_room: "living",
    placed_decor: {},
    owned_decor_ids: ["woven-bed"],
    scrapbook_unlocked_ids: ["first-tail-wag"],
    pet: { mood: "idle", last_reaction_at: 0, happiness: 70, energy: 80 },
    pet_profile: { pet_type: "Dog", pet_name: "", bio: null, personality: "", age_vibe: "younger", tags: [], image_url: null, onboarding_complete: false },
    sound_enabled: true,
    music_enabled: false,
    reduced_motion: false,
    has_seen_welcome: false,
    snake_high_score: 0,
    archie_photo_url: null,
    zeke_photo_url: null,
    ambient_enabled: false,
    postcards: [],
    daily_greeting: null,
    last_daily_greeting_at: null,
};
