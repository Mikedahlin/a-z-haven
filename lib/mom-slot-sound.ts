import { playSound } from "@/lib/audio";

/** Drop your downloaded file here: `public/sounds/mom-slot.mp3` */
export const MOM_SLOT_SFX = "/sounds/mom-slot.mp3";

export function playMomSlotSound(soundEnabled: boolean, volume = 0.5): void {
  playSound(MOM_SLOT_SFX, { enabled: soundEnabled, volume });
}
