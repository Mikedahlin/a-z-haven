"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/hub", label: "Home" },
  { href: "/puzzle", label: "Play" },
  { href: "/decor", label: "Decor" },
  { href: "/chat", label: "Chat" },
  { href: "/shop", label: "Shop" },
  { href: "/scrapbook", label: "Scrapbook" },
];

export function GameNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-cozy-cocoa/10 bg-cozy-cream/90 backdrop-blur-md"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-3xl items-center justify-between gap-1 overflow-x-auto px-2 py-3">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative block rounded-2xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cozy-honey/60 ${
                  active
                    ? "text-cozy-cocoa"
                    : "text-cozy-cocoa/55 hover:text-cozy-cocoa/80"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-2xl bg-white/80 shadow-card"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
