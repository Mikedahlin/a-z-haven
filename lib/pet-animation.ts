import type { AgeVibe } from "@/lib/types";

/** Map free-text tags + age vibe to motion personality for PetCanvas / UI. */
export function motionPersonalityFromProfile(input: {
  tags: string[];
  ageVibe: AgeVibe;
}): "bouncy" | "gentle" | "balanced" {
  const blob = input.tags.join(" ").toLowerCase();
  const wantsPlay =
    /play|zoom|energetic|bouncy|hyper|wants to play/.test(blob);
  const calm = /calm|sleep|gentle|older|wise|soft/.test(blob);
  if (wantsPlay || input.ageVibe === "younger") return "bouncy";
  if (calm || input.ageVibe === "older") return "gentle";
  return "balanced";
}
