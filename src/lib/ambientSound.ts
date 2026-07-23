// Peaceful, procedural ambient soundscapes via WebAudio — no external assets.
// All sources use soft envelopes, gentle filters, and slow LFOs.
// Each sound returns a stop() to tear down all nodes.

export type AmbientId =
  | "rain" | "thunderstorm" | "ocean" | "wind" | "forest"
  | "fireplace" | "white" | "brown" | "lofi";

export const AMBIENT_SOUNDS: { id: AmbientId; label: string; emoji: string; desc: string }[] = [
  { id: "rain",         label: "Soft Rain",     emoji: "🌧️", desc: "gentle drizzle" },
  { id: "thunderstorm", label: "Distant Storm", emoji: "⛈️", desc: "faint rumble" },
  { id: "ocean",        label: "Ocean",         emoji: "🌊", desc: "slow waves" },
  { id: "wind",         label: "Breeze",        emoji: "🍃", desc: "airy hush" },
  { id: "forest",       label: "Forest",        emoji: "🌲", desc: "soft birds" },
  { id: "fireplace",    label: "Fireplace",     emoji: "🔥", desc: "warm hush" },
  { id: "white",        label: "White Hush",    emoji: "⚪", desc: "focus veil" },
  { id: "brown",        label: "Brown Hush",    emoji: "🟤", desc: "deep calm" },
  { id: "lofi",         label: "Lofi Pad",      emoji: "🎧", desc: "dreamy chord" },
];

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
};

function makeNoiseBuffer(ac: AudioContext, seconds = 6, kind: "white" | "pink" | "brown" = "pink") {
  const buf = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "white") d[i] = w * 0.5;
    else if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.0; }
    else {
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.10;
      b6 = w * 0.115926;
    }
  }
  return buf;
}

interface Playing { master: GainNode; stop: () => void }

export function startAmbient(id: AmbientId, volume: number): Playing {
  const ac = getCtx();
  const master = ac.createGain();
  // Soft-start to avoid pops
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.6);
  master.connect(ac.destination);
  const stops: (() => void)[] = [];

  const src = (buf: AudioBuffer) => {
    const s = ac.createBufferSource();
    s.buffer = buf; s.loop = true; s.start();
    stops.push(() => { try { s.stop(); } catch {} });
    return s;
  };

  if (id === "white" || id === "brown") {
    const n = src(makeNoiseBuffer(ac, 6, id));
    const lp = ac.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.value = id === "white" ? 3500 : 500;
    const g = ac.createGain(); g.gain.value = id === "white" ? 0.35 : 0.6;
    n.connect(lp).connect(g).connect(master);
  } else if (id === "rain") {
    // Soft, high-passed pink noise + slow LFO for gentle undulation
    const n = src(makeNoiseBuffer(ac, 8, "pink"));
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 700;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
    const g = ac.createGain(); g.gain.value = 0.5;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.08;
    const lfoG = ac.createGain(); lfoG.gain.value = 0.08;
    lfo.connect(lfoG).connect(g.gain); lfo.start();
    n.connect(hp).connect(lp).connect(g).connect(master);
    stops.push(() => { try { lfo.stop(); } catch {} });
  } else if (id === "thunderstorm") {
    // Rain bed
    const n = src(makeNoiseBuffer(ac, 8, "pink"));
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 600;
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3800;
    const rg = ac.createGain(); rg.gain.value = 0.45;
    n.connect(hp).connect(lp).connect(rg).connect(master);
    // Very distant rumble - continuous, no sudden cracks
    const rumble = src(makeNoiseBuffer(ac, 8, "brown"));
    const rlp = ac.createBiquadFilter(); rlp.type = "lowpass"; rlp.frequency.value = 90;
    const rgain = ac.createGain(); rgain.gain.value = 0.18;
    // Slow rumble swell
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.05;
    const lfoG = ac.createGain(); lfoG.gain.value = 0.12;
    lfo.connect(lfoG).connect(rgain.gain); lfo.start();
    rumble.connect(rlp).connect(rgain).connect(master);
    stops.push(() => { try { lfo.stop(); } catch {} });
  } else if (id === "ocean") {
    const n = src(makeNoiseBuffer(ac, 8, "pink"));
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
    const g = ac.createGain(); g.gain.value = 0.45;
    // Slow wave swell
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.09;
    const lfoG = ac.createGain(); lfoG.gain.value = 0.35;
    lfo.connect(lfoG).connect(g.gain); lfo.start();
    n.connect(lp).connect(g).connect(master);
    stops.push(() => { try { lfo.stop(); } catch {} });
  } else if (id === "wind") {
    const n = src(makeNoiseBuffer(ac, 8, "pink"));
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 700; bp.Q.value = 0.5;
    const g = ac.createGain(); g.gain.value = 0.45;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.06;
    const lfoG = ac.createGain(); lfoG.gain.value = 400;
    lfo.connect(lfoG).connect(bp.frequency); lfo.start();
    n.connect(bp).connect(g).connect(master);
    stops.push(() => { try { lfo.stop(); } catch {} });
  } else if (id === "forest") {
    // Soft wind bed
    const n = src(makeNoiseBuffer(ac, 8, "pink"));
    const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1000; bp.Q.value = 0.4;
    const g = ac.createGain(); g.gain.value = 0.22;
    n.connect(bp).connect(g).connect(master);
    // Softer, sparser bird chirps
    const chirp = () => {
      const t = ac.currentTime + Math.random() * 0.2;
      const o = ac.createOscillator(); o.type = "sine";
      const base = 1500 + Math.random() * 1200;
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.6), t + 0.12);
      const cg = ac.createGain();
      cg.gain.setValueAtTime(0, t);
      cg.gain.linearRampToValueAtTime(0.06, t + 0.05);   // softer peak
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(cg).connect(master);
      o.start(t); o.stop(t + 0.4);
    };
    const iv = setInterval(() => { if (Math.random() < 0.35) chirp(); }, 2800);
    stops.push(() => clearInterval(iv));
  } else if (id === "fireplace") {
    // Warm hush bed (no hard crackles)
    const n = src(makeNoiseBuffer(ac, 8, "brown"));
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320;
    const g = ac.createGain(); g.gain.value = 0.55;
    // Slow flicker
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.4;
    const lfoG = ac.createGain(); lfoG.gain.value = 0.06;
    lfo.connect(lfoG).connect(g.gain); lfo.start();
    n.connect(lp).connect(g).connect(master);
    // Very soft, rare crackles (much quieter than before)
    const crackle = () => {
      const t = ac.currentTime;
      const bs = ac.createBufferSource();
      bs.buffer = makeNoiseBuffer(ac, 0.08, "pink");
      const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
      const cg = ac.createGain();
      cg.gain.setValueAtTime(0, t);
      cg.gain.linearRampToValueAtTime(0.06 + Math.random() * 0.04, t + 0.02);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      bs.connect(hp).connect(cg).connect(master);
      bs.start(t); bs.stop(t + 0.2);
    };
    const iv = setInterval(() => { if (Math.random() < 0.5) crackle(); }, 1400);
    stops.push(() => { clearInterval(iv); try { lfo.stop(); } catch {} });
  } else if (id === "lofi") {
    // Slow major-7th pad, soft-lowpassed
    const freqs = [174.61, 220.00, 261.63, 329.63]; // F3 A3 C4 E4
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(); o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      const g = ac.createGain(); g.gain.value = 0.07;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.08 + i * 0.02;
      const lfoG = ac.createGain(); lfoG.gain.value = 0.03;
      lfo.connect(lfoG).connect(g.gain); lfo.start();
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
      o.connect(lp).connect(g).connect(master);
      o.start();
      stops.push(() => { try { o.stop(); lfo.stop(); } catch {} });
    });
    // Whisper-quiet vinyl hiss
    const hiss = src(makeNoiseBuffer(ac, 6, "pink"));
    const hg = ac.createGain(); hg.gain.value = 0.025;
    hiss.connect(hg).connect(master);
  }

  return {
    master,
    stop: () => {
      try { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + 0.35); } catch {}
      setTimeout(() => { stops.forEach(fn => fn()); try { master.disconnect(); } catch {} }, 400);
    },
  };
}
