/**
 * Shared helpers for API route handlers (IP extraction, redirect URL safety).
 */

export function getClientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function normalizeOrigin(url: string): string {
  return new URL(url).origin;
}

function allowedAppOrigins(): Set<string> {
  const set = new Set<string>();
  const primary = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (primary) {
    try {
      set.add(normalizeOrigin(primary));
    } catch {
      /* ignore invalid env */
    }
  }
  const extra = process.env.ALLOWED_APP_ORIGINS?.trim();
  if (extra) {
    for (const part of extra.split(",")) {
      const p = part.trim();
      if (!p) continue;
      try {
        set.add(normalizeOrigin(p));
      } catch {
        /* skip invalid entry */
      }
    }
  }
  if (set.size === 0 && process.env.NODE_ENV !== "production") {
    set.add("http://localhost:3000");
    set.add("http://127.0.0.1:3000");
  }
  return set;
}

/**
 * Base URL for Stripe `success_url` / `cancel_url`. Uses `Origin` only when it
 * matches the allowlist (from `NEXT_PUBLIC_APP_URL` and optional
 * `ALLOWED_APP_ORIGINS`); otherwise uses the canonical app URL so redirect
 * targets cannot be chosen by a spoofed `Origin` header.
 */
export function resolveStripeRedirectOrigin(request: Request): string | null {
  const allowed = allowedAppOrigins();
  const header = request.headers.get("origin");
  if (header) {
    try {
      const o = normalizeOrigin(header);
      if (allowed.has(o)) return o;
    } catch {
      /* malformed Origin */
    }
  }

  const primary = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (primary) {
    try {
      return normalizeOrigin(primary);
    } catch {
      /* invalid */
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return null;
}
