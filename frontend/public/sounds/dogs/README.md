// Drop real-recording bark / pant / whine MP3s here as 01.mp3 .. 06.mp3
// to replace the synthesized fallback woofs.
//
// Recommended specs:
// - 0.3–1.5 seconds each
// - 44.1 kHz, mono or stereo
// - <80 KB per file ideally
// - Royalty-free / your own recordings of Archie & Zeke
//
// Files expected (any subset works — randomly chosen):
//   /public/sounds/dogs/01.mp3
//   /public/sounds/dogs/02.mp3
//   ...
//   /public/sounds/dogs/06.mp3
//
// The app auto-detects the first file via HEAD request and switches from
// synthesized fallback to real audio with no code change required.
