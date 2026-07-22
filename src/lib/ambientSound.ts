// Procedural ambient soundscapes via WebAudio — no external assets.
// Each sound returns a stop() to tear down all nodes.

export type AmbientId =
  | "rain" | "thunderstorm" | "ocean" | "wind" | "forest"
  | "fireplace" | "white" | "brown" | "lofi";

export const AMBIENT_SOUNDS: { id: AmbientId; label: string; emoji: string; desc: string }[] = [
  { id: "rain",         label: "Rain",         emoji: "🌧️", desc: "gentle downpour" },
  { id: "thunderstorm", label: "Thunderstorm", emoji: "⛈️", desc: "distant rumble" },
  { id: "ocean",        label: "Ocean",        emoji: "🌊", desc: "slow waves" },
  { id: "wind",         label: "Wind",         emoji: "🍃", desc: "airy breeze" },
  { id: "forest",       label: "Forest",       emoji: "🌲", desc: "birds & leaves" },
  { id: "fireplace",    label: "Fireplace",    emoji: "🔥", desc: "warm crackle" },
  { id: "white",        label: "White Noise",  emoji: "⚪", desc: "focus static" },
  { id: "brown",        label: "Brown Noise",  emoji: "🟤", desc: "deep hush" },
  { id: "lofi",         label: "Lofi Pad",     emoji: "🎧", desc: "dreamy chord" },
];

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

function makeNoiseBuffer(ac: AudioContext, seconds = 4, kind: "white" | "pink" | "brown" = "white") {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w;
    else if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else {
      // pink (Voss-McCartney)
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }
  return buf;
}

interface Playing { master: GainNode; stop: () => void }

export function startAmbient(id: AmbientId, volume: number): Playing {
  const ac = getCtx();
  const master = ac.createGain();
  master.gain.value = volume;
  master.connect(ac.destination);
  const stops: (() => void)[] = [];

  const src = (buf: AudioBuffer) => {
    const s = ac.createBufferSource();
    s.buffer = buf; s.loop = true; s.start();
    stops.push(() => { try { s.stop(); } catch {} });
    return s;
  };

  if (id === "white" || id === "brown") {
    const n = src(makeNoiseBuffer(ac, 5, id));
    n.connect(master);
  } else if (id === "rain") {
    const n = src(makeNoiseBuffer(ac, 6, "pink"));
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 500;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
    n.connect(hp).connect(lp).connect(master);
  } else if (id === "thunderstorm") {
    // rain layer
    const n = src(makeNoiseBuffer(ac, 6, "pink"));
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 400;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5000;
    n.connect(hp).connect(lp).connect(master);
    // rumble layer
    const rumble = src(makeNoiseBuffer(ac, 6, "brown"));
    const rlp = ac.createBiquadFilter(); rlp.type = "lowpass"; rlp.frequency.value = 120;
    const rg = ac.createGain(); rg.gain.value = 0.15;
    rumble.connect(rlp).connect(rg).connect(master);
    // periodic thunder cracks
    let t = ac.currentTime + 4;
    const scheduleThunder = () => {
      for (let i = 0; i < 6; i++) {
        const g = ac.createGain();
        const bs = ac.createBufferSource();
        bs.buffer = makeNoiseBuffer(ac, 1.5, "brown");
        const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 200;
        bs.connect(f).connect(g).connect(master);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.7, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
        bs.start(t); bs.stop(t + 1.5);
        t += 8 + Math.random() * 18;
      }
    };
    scheduleThunder();
    const iv = setInterval(scheduleThunder, 60000);
    stops.push(() => clearInterval(iv));
  } else if (id === "ocean") {
    const n = src(makeNoiseBuffer(ac, 6, "pink"));
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const g = ac.createGain(); g.gain.value = 0.4;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.12;
    const lfoG = ac.createGain(); lfoG.gain.value = 0.35;
    lfo.connect(lfoG).connect(g.gain); lfo.start();
    n.connect(lp).connect(g).connect(master);
    stops.push(() => { try { lfo.stop(); } catch {} });
  } else if (id === "wind") {
    const n = src(makeNoiseBuffer(ac, 6, "pink"));
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 0.6;
    const g = ac.createGain(); g.gain.value = 0.5;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.08;
    const lfoG = ac.createGain(); lfoG.gain.value = 600;
    lfo.connect(lfoG).connect(bp.frequency); lfo.start();
    n.connect(bp).connect(g).connect(master);
    stops.push(() => { try { lfo.stop(); } catch {} });
  } else if (id === "forest") {
    // wind bed
    const n = src(makeNoiseBuffer(ac, 6, "pink"));
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 0.5;
    const g = ac.createGain(); g.gain.value = 0.25;
    n.connect(bp).connect(g).connect(master);
    // bird chirps
    const chirp = () => {
      const t = ac.currentTime + Math.random() * 0.2;
      const o = ac.createOscillator(); o.type = "sine";
      const base = 1800 + Math.random() * 1600;
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * (1.5 + Math.random()), t + 0.08);
      const cg = ac.createGain();
      cg.gain.setValueAtTime(0, t);
      cg.gain.linearRampToValueAtTime(0.15, t + 0.02);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.connect(cg).connect(master);
      o.start(t); o.stop(t + 0.22);
    };
    const iv = setInterval(() => { if (Math.random() < 0.6) chirp(); if (Math.random() < 0.3) setTimeout(chirp, 120); }, 1400);
    stops.push(() => clearInterval(iv));
  } else if (id === "fireplace") {
    const n = src(makeNoiseBuffer(ac, 6, "brown"));
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 350;
    const g = ac.createGain(); g.gain.value = 0.5;
    n.connect(lp).connect(g).connect(master);
    // crackles
    const crackle = () => {
      const t = ac.currentTime;
      const bs = ac.createBufferSource();
      bs.buffer = makeNoiseBuffer(ac, 0.1, "white");
      const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2000;
      const cg = ac.createGain();
      cg.gain.setValueAtTime(0.4 + Math.random() * 0.3, t);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.08 + Math.random() * 0.12);
      bs.connect(hp).connect(cg).connect(master);
      bs.start(t); bs.stop(t + 0.2);
    };
    const iv = setInterval(() => { const n = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) setTimeout(crackle, i * 40 + Math.random() * 200); }, 350);
    stops.push(() => clearInterval(iv));
  } else if (id === "lofi") {
    // slow major-7th pad
    const freqs = [174.61, 220.00, 261.63, 329.63]; // F3 A3 C4 E4
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(); o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      const g = ac.createGain(); g.gain.value = 0.08;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.1 + i * 0.03;
      const lfoG = ac.createGain(); lfoG.gain.value = 0.04;
      lfo.connect(lfoG).connect(g.gain); lfo.start();
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
      o.connect(lp).connect(g).connect(master);
      o.start();
      stops.push(() => { try { o.stop(); lfo.stop(); } catch {} });
    });
    // vinyl hiss
    const hiss = src(makeNoiseBuffer(ac, 4, "pink"));
    const hg = ac.createGain(); hg.gain.value = 0.05;
    hiss.connect(hg).connect(master);
  }

  return {
    master,
    stop: () => {
      try { master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.15); } catch {}
      setTimeout(() => { stops.forEach(fn => fn()); try { master.disconnect(); } catch {} }, 200);
    },
  };
}
