import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          cream: "#faf6f0",
          blush: "#f3e4dc",
          cocoa: "#4a3728",
          sage: "#8fa894",
          dusk: "#6b5b7a",
          honey: "#e8c468",
          rose: "#c98b8b",
          sky: "#a8c4d4",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 32px rgba(74, 55, 40, 0.12)",
        glow: "0 0 40px rgba(232, 196, 104, 0.25)",
      },
      backgroundImage: {
        "warm-radial":
          "radial-gradient(ellipse at top, rgba(243,228,220,0.9) 0%, rgba(250,246,240,1) 55%, rgba(168,196,212,0.35) 100%)",
        "floor-wood":
          "linear-gradient(90deg, rgba(74,55,40,0.06) 1px, transparent 1px), linear-gradient(rgba(74,55,40,0.06) 1px, transparent 1px)",
        "story-aurora":
          "radial-gradient(ellipse 120% 80% at 50% 120%, rgba(232,196,104,0.35) 0%, transparent 50%), radial-gradient(ellipse 80% 60% at 20% 20%, rgba(168,196,212,0.4) 0%, transparent 45%), radial-gradient(ellipse 70% 50% at 80% 30%, rgba(201,139,139,0.3) 0%, transparent 40%)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-10px) scale(1.03)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "33%": { transform: "translate(6px, -4px)" },
          "66%": { transform: "translate(-4px, 6px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        floaty: "floaty 5.5s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        shimmer: "shimmer 18s ease linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
