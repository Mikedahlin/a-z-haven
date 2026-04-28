/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                // Cozy A-Z Haven palette
                cream: "#F7F3EB",
                paper: "#FFFCF8",
                stone: "#EBE5D9",
                ink: "#2C3627",
                ink2: "#5C584E",
                terracotta: "#D9735A",
                moss: "#5B7B53",
                ochre: "#DDA752",
                sky: "#7CA3B5",
                stoneGrey: "#8E8B82",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                heading: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
                body: ["'Nunito'", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            boxShadow: {
                cozy: "0 6px 24px -8px rgba(70, 60, 40, 0.18), 0 2px 6px -2px rgba(70, 60, 40, 0.08)",
                "cozy-lg": "0 18px 50px -16px rgba(70, 60, 40, 0.25), 0 6px 16px -8px rgba(70, 60, 40, 0.12)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
