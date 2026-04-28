# Optional HTML5 sounds

**Mom’s dog (single clip):** add `moms-dog.mp3` in this folder and set `NEXT_PUBLIC_USE_MOMS_DOG_SFX=1` in env. Pet tap / puzzle SFX will use that file instead of the 13-clip set or built-in tones.

**Dog SFX (random clips):** use `dogs/` — see `dogs/README.md`. The hub and puzzle can pull random clips from there when `NEXT_PUBLIC_ENABLE_DOG_SFX_FILES=1` (and mom’s-dog is off).

For other one-off files, call `playSound("/sounds/your-file.mp3")` from `lib/audio.ts`.

The app still plays built-in Web Audio tones if optional files are missing or fail to load.
