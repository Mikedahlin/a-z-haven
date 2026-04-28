import type { RoomId } from "@/lib/types";

/**
 * When a premium shop item is owned, the matching room gets a soft animated
 * wash in the hub preview (cosmetic only).
 */
export function premiumRoomOverlayClass(
  roomId: RoomId,
  premiumIds: string[],
): string {
  const p = new Set(premiumIds);
  if (roomId === "sleeping" && p.has("cozy-blanket-set")) {
    return "bg-gradient-to-br from-cozy-rose/25 via-transparent to-cozy-honey/20 animate-twinkle";
  }
  if (roomId === "living" && p.has("zoomie-toy-pack")) {
    return "bg-gradient-to-tr from-cozy-sky/30 via-transparent to-cozy-honey/15 animate-drift";
  }
  if (roomId === "seasonal" && p.has("seasonal-backdrop")) {
    return "bg-gradient-to-b from-cozy-dusk/20 via-cozy-blush/25 to-cozy-sky/20 animate-twinkle";
  }
  if (roomId === "memory" && p.has("starlit-rug")) {
    return "bg-gradient-to-br from-cozy-dusk/25 via-transparent to-cozy-honey/10 animate-twinkle";
  }
  return "";
}

export function premiumRoomSparkleCount(roomId: RoomId, premiumIds: string[]): number {
  const p = new Set(premiumIds);
  if (roomId === "sleeping" && p.has("cozy-blanket-set")) return 14;
  if (roomId === "living" && p.has("zoomie-toy-pack")) return 12;
  if (roomId === "seasonal" && p.has("seasonal-backdrop")) return 16;
  if (roomId === "memory" && p.has("starlit-rug")) return 18;
  return 0;
}
