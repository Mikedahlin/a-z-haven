# Dog sounds (Mixkit)

**Alternative:** a single `moms-dog.mp3` in `public/sounds/` with `NEXT_PUBLIC_USE_MOMS_DOG_SFX=1` (see `../README.md`) — no files needed here.

1. Copy your **13** Mixkit files into this folder (`public/sounds/dogs/`).
2. Rename them exactly:

   `01.mp3`, `02.mp3`, … `13.mp3`

   (If Mixkit gave `.wav` only, use `01.wav` … `13.wav` and set `DOG_SFX_EXT` to `"wav"` in `lib/dog-sounds.ts`.)

3. Mixkit license: keep their attribution in your app credits if required by the asset license you chose.

Nothing else is required — the game picks random clips for pet taps and puzzle wins.
