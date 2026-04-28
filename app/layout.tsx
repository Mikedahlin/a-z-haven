import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "A-Z Haven | Cozy Virtual Pet Home",
  description:
    "A-Z Haven lets you name your pet, shape their story, decorate cozy rooms, play gentle puzzles, and chat in their voice.",
  applicationName: "A-Z Haven",
};

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} min-h-dvh bg-cozy-cream font-sans text-cozy-cocoa antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only absolute left-4 top-4 z-[100] rounded-full bg-cozy-cocoa px-4 py-2 text-sm font-semibold text-cozy-cream focus:not-sr-only focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
