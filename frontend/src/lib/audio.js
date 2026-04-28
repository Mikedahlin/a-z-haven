// Procedural cozy audio + dog SFX with optional real-file fallback.
// Drop real .mp3s in /public/sounds/dogs/01.mp3 .. 06.mp3 to use real bark sounds.

let _ctx = null;
function ctx() {
    if (!_ctx) {
        const Klass = window.AudioContext || window.webkitAudioContext;
        if (!Klass) return null;
        _ctx = new Klass();
    }
    if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
    return _ctx;
}

let _enabled = true;
export function setSoundEnabled(v) { _enabled = !!v; }

// ----- soft UI click -----
export function clickSound() {
    if (!_enabled) return;
    const c = ctx(); if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(880, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.08);
    g.gain.setValueAtTime(0.001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12);
    o.connect(g).connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.13);
}

// ----- celebratory chime (puzzle clear) -----
export function chimeSound() {
    if (!_enabled) return;
    const c = ctx(); if (!c) return;
    [880, 1320, 1760].forEach((freq, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        const t0 = c.currentTime + i * 0.08;
        g.gain.setValueAtTime(0.001, t0);
        g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        o.connect(g).connect(c.destination);
        o.start(t0); o.stop(t0 + 0.65);
    });
}

// ----- soft synthesized woof (fallback when no real bark file) -----
export function woofSynth() {
    if (!_enabled) return;
    const c = ctx(); if (!c) return;
    const o = c.createOscillator();
    const lp = c.createBiquadFilter();
    const g = c.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(160, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.18);
    lp.type = "lowpass";
    lp.frequency.value = 700;
    g.gain.setValueAtTime(0.001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.32, c.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.22);
    o.connect(lp).connect(g).connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.25);
}

// ----- real bark file or synth fallback -----
let _barkAudio = null;
let _barkFilesAvailable = null;
async function detectBarkFiles() {
    if (_barkFilesAvailable !== null) return _barkFilesAvailable;
    try {
        const res = await fetch(`/sounds/dogs/01.mp3`, { method: "HEAD" });
        _barkFilesAvailable = res.ok;
    } catch {
        _barkFilesAvailable = false;
    }
    return _barkFilesAvailable;
}

export async function bark() {
    if (!_enabled) return;
    const has = await detectBarkFiles();
    if (has) {
        const idx = String(1 + Math.floor(Math.random() * 6)).padStart(2, "0");
        try {
            _barkAudio?.pause();
            _barkAudio = new Audio(`/sounds/dogs/${idx}.mp3`);
            _barkAudio.volume = 0.55;
            await _barkAudio.play();
        } catch {
            woofSynth();
        }
    } else {
        woofSynth();
    }
}

// ----- ambient cozy pad (toggleable) -----
let _ambient = null;
export function startAmbient() {
    if (!_enabled) return;
    stopAmbient();
    const c = ctx(); if (!c) return;
    const master = c.createGain();
    master.gain.value = 0.0;
    master.gain.linearRampToValueAtTime(0.08, c.currentTime + 4);
    master.connect(c.destination);

    // 3 slow detuned sines
    const oscs = [];
    [220, 330, 277].forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        const lfo = c.createOscillator();
        const lfoG = c.createGain();
        o.type = "sine";
        o.frequency.value = f * (i === 0 ? 1 : 1 + (i - 1) * 0.005);
        g.gain.value = 0.18;
        lfo.frequency.value = 0.07 + i * 0.015;
        lfoG.gain.value = 0.04;
        lfo.connect(lfoG).connect(g.gain);
        o.connect(g).connect(master);
        o.start(); lfo.start();
        oscs.push(o, lfo);
    });

    // gentle low pad
    const sub = c.createOscillator();
    const subG = c.createGain();
    sub.type = "sine";
    sub.frequency.value = 110;
    subG.gain.value = 0.10;
    sub.connect(subG).connect(master);
    sub.start();
    oscs.push(sub);

    _ambient = { master, oscs, ctxRef: c };
}

export function stopAmbient() {
    if (!_ambient) return;
    const { master, oscs, ctxRef } = _ambient;
    try {
        master.gain.cancelScheduledValues(ctxRef.currentTime);
        master.gain.linearRampToValueAtTime(0, ctxRef.currentTime + 1.2);
        oscs.forEach((o) => { try { o.stop(ctxRef.currentTime + 1.4); } catch {} });
    } catch {}
    _ambient = null;
}

export function isAmbientPlaying() { return !!_ambient; }
