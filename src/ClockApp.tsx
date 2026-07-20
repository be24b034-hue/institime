import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Clock, Timer, Watch, Coffee, Bell, GripVertical, Sparkles,
  Palette, Play, Pause, RotateCcw, Plus, Minus, X, Menu, Sun, Moon,
  Maximize, Minimize, ChevronLeft, ChevronRight, Image as ImageIcon,
} from "lucide-react";
import WallpaperGallery, { DEFAULT_FILTERS, filterCss, type WallpaperFilters } from "./components/WallpaperGallery";
import type { StoredWallpaper } from "./wallpapers";
import { THEMES, FONTS, type Theme, type ThemeId } from "./themes";

type Mode = "digital" | "analog" | "flip" | "minimal" | "stopwatch" | "timer" | "pomodoro" | "alarm";

const MODES: { id: Mode; label: string; icon: any }[] = [
  { id: "digital", label: "Digital", icon: Clock },
  { id: "analog", label: "Analog", icon: Watch },
  { id: "flip", label: "Flip", icon: GripVertical },
  { id: "minimal", label: "Minimal", icon: Sparkles },
  { id: "stopwatch", label: "Stopwatch", icon: Timer },
  { id: "timer", label: "Timer", icon: Timer },
  { id: "pomodoro", label: "Pomodoro", icon: Coffee },
  { id: "alarm", label: "Alarm", icon: Bell },
];

/* ---------------- storage ---------------- */
const STORE_KEY = "insti-time-v1";
interface Store {
  themeId: ThemeId;
  mode: Mode;
  is24h: boolean;
  showSeconds: boolean;
  fontOverride?: string;
  glowIntensity: number;
  wallpaper?: StoredWallpaper | null;
  wallpaperFilters?: WallpaperFilters;
}
const loadStore = (): Store => {
  try { return { themeId: "vigilante", mode: "digital", is24h: true, showSeconds: true, glowIntensity: 1, wallpaper: null, wallpaperFilters: DEFAULT_FILTERS, ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") }; }
  catch { return { themeId: "vigilante", mode: "digital", is24h: true, showSeconds: true, glowIntensity: 1, wallpaper: null, wallpaperFilters: DEFAULT_FILTERS }; }
};
const saveStore = (s: Store) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} };

/* ---------------- hooks ---------------- */
function useNow(intervalMs = 250) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function useWakeLock(active: boolean) {
  const ref = useRef<any>(null);
  useEffect(() => {
    let cancelled = false;
    const request = async () => {
      try {
        // @ts-ignore
        if ("wakeLock" in navigator && active) {
          // @ts-ignore
          ref.current = await navigator.wakeLock.request("screen");
        }
      } catch {}
    };
    const release = async () => {
      try { if (ref.current) { await ref.current.release(); ref.current = null; } } catch {}
    };
    if (active) request(); else release();
    const onVis = () => { if (document.visibilityState === "visible" && active && !cancelled) request(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", onVis); release(); };
  }, [active]);
}

/* ---------------- helpers ---------------- */
const pad = (n: number, l = 2) => n.toString().padStart(l, "0");
const fmtHMS = (ms: number, showMs = false) => {
  const total = Math.max(0, Math.floor(ms));
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}${showMs ? "." + pad(cs) : ""}`;
  return `${pad(m)}:${pad(s)}${showMs ? "." + pad(cs) : ""}`;
};

/* ---------------- Digital Clock ---------------- */
function DigitalClock({ theme, is24h, showSeconds, glow, font }: { theme: Theme; is24h: boolean; showSeconds: boolean; glow: number; font: string }) {
  const now = useNow(200);
  let h = now.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  if (!is24h) { h = h % 12; if (h === 0) h = 12; }
  const m = now.getMinutes(), s = now.getSeconds();
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="text-[15vw] md:text-[18vw] leading-none font-bold tracking-tight tabular-nums flex items-baseline gap-[0.05em]"
        style={{ color: theme.fg, fontFamily: font, textShadow: glow > 0 ? `0 0 ${20 * glow}px ${theme.glow}, 0 0 ${60 * glow}px ${theme.glow}80` : "none" }}>
        <span>{pad(h)}</span>
        <span className="opacity-70 animate-pulse">:</span>
        <span>{pad(m)}</span>
        {showSeconds && <span className="text-[8vw] md:text-[10vw] opacity-60 ml-2">{pad(s)}</span>}
        {!is24h && <span className="text-[4vw] md:text-[5vw] opacity-70 ml-4">{ampm}</span>}
      </div>
      <div className="uppercase tracking-[0.35em] text-sm md:text-lg" style={{ color: theme.muted, fontFamily: font }}>
        {date}
      </div>
    </div>
  );
}

/* ---------------- Analog Clock ---------------- */
function AnalogClock({ theme, glow }: { theme: Theme; glow: number }) {
  const now = useNow(50);
  const s = now.getSeconds() + now.getMilliseconds() / 1000;
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  const size = 560;
  const cx = size / 2, cy = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-[85vmin] h-[85vmin]"
      style={{ filter: glow > 0 ? `drop-shadow(0 0 ${16 * glow}px ${theme.glow})` : undefined }}>
      <circle cx={cx} cy={cy} r={cx - 10} fill="none" stroke={theme.muted} strokeWidth="1" opacity="0.4" />
      <circle cx={cx} cy={cy} r={cx - 30} fill="none" stroke={theme.accent} strokeWidth="2" opacity="0.5" />
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const outer = cx - 20, inner = cx - (i % 5 === 0 ? 45 : 32);
        return <line key={i} x1={cx + Math.cos(a) * inner} y1={cy + Math.sin(a) * inner}
          x2={cx + Math.cos(a) * outer} y2={cy + Math.sin(a) * outer}
          stroke={i % 5 === 0 ? theme.fg : theme.muted} strokeWidth={i % 5 === 0 ? 3 : 1} />;
      })}
      {/* hour */}
      <line x1={cx} y1={cy} x2={cx + Math.cos((h / 12) * Math.PI * 2 - Math.PI / 2) * (cx - 130)}
        y2={cy + Math.sin((h / 12) * Math.PI * 2 - Math.PI / 2) * (cx - 130)} stroke={theme.fg} strokeWidth="8" strokeLinecap="round" />
      {/* minute */}
      <line x1={cx} y1={cy} x2={cx + Math.cos((m / 60) * Math.PI * 2 - Math.PI / 2) * (cx - 70)}
        y2={cy + Math.sin((m / 60) * Math.PI * 2 - Math.PI / 2) * (cx - 70)} stroke={theme.fg} strokeWidth="5" strokeLinecap="round" />
      {/* second */}
      <line x1={cx} y1={cy} x2={cx + Math.cos((s / 60) * Math.PI * 2 - Math.PI / 2) * (cx - 50)}
        y2={cy + Math.sin((s / 60) * Math.PI * 2 - Math.PI / 2) * (cx - 50)} stroke={theme.accent} strokeWidth="2" strokeLinecap="round"
        style={{ transition: "all 0.05s linear" }} />
      <circle cx={cx} cy={cy} r={8} fill={theme.accent} />
      <circle cx={cx} cy={cy} r={3} fill={theme.bg.includes("#") ? "#000" : "#000"} />
    </svg>
  );
}

/* ---------------- Flip Clock ---------------- */
function FlipDigit({ value, theme, font }: { value: string; theme: Theme; font: string }) {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);
  useEffect(() => {
    if (value !== display) {
      setFlipping(true);
      const t = setTimeout(() => { setDisplay(value); setFlipping(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value, display]);
  return (
    <div className="relative w-[16vw] h-[22vw] md:w-[12vw] md:h-[16vw] max-w-[180px] max-h-[240px] rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: `linear-gradient(180deg, ${theme.fg}18 0%, ${theme.fg}08 50%, ${theme.fg}18 100%)`, border: `1px solid ${theme.fg}30` }}>
      <div className="absolute inset-0 flex items-center justify-center text-[13vw] md:text-[10vw] font-bold tabular-nums"
        style={{ color: theme.fg, fontFamily: font, transition: "transform 0.3s", transform: flipping ? "rotateX(90deg)" : "rotateX(0)", transformOrigin: "center" }}>
        {display}
      </div>
      <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: theme.bg.includes("#") ? "#000" : "#000", opacity: 0.6 }} />
    </div>
  );
}
function FlipClock({ theme, is24h, font }: { theme: Theme; is24h: boolean; font: string }) {
  const now = useNow(500);
  let h = now.getHours(); if (!is24h) { h = h % 12; if (h === 0) h = 12; }
  const m = now.getMinutes(), s = now.getSeconds();
  return (
    <div className="flex items-center gap-3 md:gap-5">
      <FlipDigit value={pad(h)[0]} theme={theme} font={font} />
      <FlipDigit value={pad(h)[1]} theme={theme} font={font} />
      <div className="text-[10vw] md:text-[6vw] opacity-70 animate-pulse" style={{ color: theme.fg }}>:</div>
      <FlipDigit value={pad(m)[0]} theme={theme} font={font} />
      <FlipDigit value={pad(m)[1]} theme={theme} font={font} />
      <div className="text-[10vw] md:text-[6vw] opacity-70 animate-pulse" style={{ color: theme.fg }}>:</div>
      <FlipDigit value={pad(s)[0]} theme={theme} font={font} />
      <FlipDigit value={pad(s)[1]} theme={theme} font={font} />
    </div>
  );
}

/* ---------------- Minimal ---------------- */
function MinimalClock({ theme, is24h, font }: { theme: Theme; is24h: boolean; font: string }) {
  const now = useNow(500);
  let h = now.getHours(); if (!is24h) { h = h % 12; if (h === 0) h = 12; }
  const m = now.getMinutes();
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="text-[22vw] md:text-[16vw] font-thin tabular-nums leading-none"
        style={{ color: theme.fg, fontFamily: font, letterSpacing: "-0.04em" }}>
        {pad(h)}<span className="opacity-30">:</span>{pad(m)}
      </div>
    </div>
  );
}

/* ---------------- Stopwatch ---------------- */
function Stopwatch({ theme, font, onRunningChange }: { theme: Theme; font: string; onRunningChange: (r: boolean) => void }) {
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(0);
  const startRef = useRef(0);
  const [laps, setLaps] = useState<number[]>([]);
  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - ms;
    let raf = 0;
    const tick = () => { setMs(performance.now() - startRef.current); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  useEffect(() => { onRunningChange(running); }, [running, onRunningChange]);
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-[12vw] md:text-[14vw] font-bold tabular-nums leading-none"
        style={{ color: theme.fg, fontFamily: font, textShadow: `0 0 30px ${theme.glow}80` }}>
        {fmtHMS(ms, true)}
      </div>
      <div className="flex gap-4">
        <ControlBtn theme={theme} onClick={() => setRunning(r => !r)}>
          {running ? <Pause size={22} /> : <Play size={22} />} {running ? "Pause" : "Start"}
        </ControlBtn>
        <ControlBtn theme={theme} onClick={() => { if (running) setLaps(l => [ms, ...l]); else { setMs(0); setLaps([]); } }}>
          {running ? "Lap" : <><RotateCcw size={20} /> Reset</>}
        </ControlBtn>
      </div>
      {laps.length > 0 && (
        <div className="max-h-40 overflow-y-auto text-sm space-y-1 min-w-[200px] font-mono" style={{ color: theme.muted }}>
          {laps.map((l, i) => (
            <div key={i} className="flex justify-between px-3 py-1 border-b" style={{ borderColor: theme.muted + "30" }}>
              <span>Lap {laps.length - i}</span><span style={{ color: theme.fg }}>{fmtHMS(l, true)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Timer ---------------- */
function CountdownTimer({ theme, font, onRunningChange }: { theme: Theme; font: string; onRunningChange: (r: boolean) => void }) {
  const [duration, setDuration] = useState(5 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(duration);
  const endRef = useRef(0);
  useEffect(() => { if (!running) setRemaining(duration); }, [duration, running]);
  useEffect(() => {
    if (!running) return;
    endRef.current = performance.now() + remaining;
    let raf = 0;
    const tick = () => {
      const left = endRef.current - performance.now();
      if (left <= 0) { setRemaining(0); setRunning(false); playBeep(); toast.success("Timer done!"); return; }
      setRemaining(left); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  useEffect(() => { onRunningChange(running); }, [running, onRunningChange]);

  const bump = (deltaMin: number) => {
    if (running) return;
    setDuration(d => Math.max(0, d + deltaMin * 60_000));
  };
  const pct = duration > 0 ? remaining / duration : 0;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <svg viewBox="0 0 200 200" className="w-[60vmin] h-[60vmin]">
          <circle cx="100" cy="100" r="92" fill="none" stroke={theme.muted + "40"} strokeWidth="3" />
          <circle cx="100" cy="100" r="92" fill="none" stroke={theme.accent} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 92}`} strokeDashoffset={`${2 * Math.PI * 92 * (1 - pct)}`}
            transform="rotate(-90 100 100)" style={{ transition: "stroke-dashoffset 0.2s linear", filter: `drop-shadow(0 0 8px ${theme.glow})` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[8vmin] font-bold tabular-nums" style={{ color: theme.fg, fontFamily: font, textShadow: `0 0 20px ${theme.glow}80` }}>
            {fmtHMS(remaining)}
          </div>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {[1, 5, 10, -1, -5].map(v => (
          <button key={v} disabled={running} onClick={() => bump(v)}
            className="px-3 py-1.5 text-sm rounded-full border transition disabled:opacity-30"
            style={{ borderColor: theme.muted + "60", color: theme.fg }}>
            {v > 0 ? "+" : ""}{v}m
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        <ControlBtn theme={theme} onClick={() => { if (remaining > 0) setRunning(r => !r); }}>
          {running ? <Pause size={22} /> : <Play size={22} />} {running ? "Pause" : "Start"}
        </ControlBtn>
        <ControlBtn theme={theme} onClick={() => { setRunning(false); setRemaining(duration); }}>
          <RotateCcw size={20} /> Reset
        </ControlBtn>
      </div>
    </div>
  );
}

/* ---------------- Pomodoro ---------------- */
function Pomodoro({ theme, font, onRunningChange }: { theme: Theme; font: string; onRunningChange: (r: boolean) => void }) {
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(25 * 60_000);
  const [cycles, setCycles] = useState(0);
  const endRef = useRef(0);
  useEffect(() => { onRunningChange(running); }, [running, onRunningChange]);
  useEffect(() => {
    if (!running) return;
    endRef.current = performance.now() + remaining;
    let raf = 0;
    const tick = () => {
      const left = endRef.current - performance.now();
      if (left <= 0) {
        playBeep();
        if (phase === "focus") { setCycles(c => c + 1); setPhase("break"); setRemaining(5 * 60_000); toast.success("Break time"); }
        else { setPhase("focus"); setRemaining(25 * 60_000); toast.success("Focus time"); }
        return;
      }
      setRemaining(left); raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, phase]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="uppercase tracking-[0.4em] text-sm" style={{ color: theme.muted, fontFamily: font }}>
        {phase === "focus" ? "Focus" : "Break"} · Cycle {cycles + 1}
      </div>
      <div className="text-[16vw] md:text-[14vw] font-bold tabular-nums leading-none"
        style={{ color: theme.fg, fontFamily: font, textShadow: `0 0 40px ${theme.glow}80` }}>
        {fmtHMS(remaining)}
      </div>
      <div className="flex gap-4">
        <ControlBtn theme={theme} onClick={() => setRunning(r => !r)}>
          {running ? <Pause size={22} /> : <Play size={22} />} {running ? "Pause" : "Start"}
        </ControlBtn>
        <ControlBtn theme={theme} onClick={() => { setRunning(false); setPhase("focus"); setRemaining(25 * 60_000); setCycles(0); }}>
          <RotateCcw size={20} /> Reset
        </ControlBtn>
      </div>
    </div>
  );
}

/* ---------------- Alarm ---------------- */
function Alarm({ theme, font }: { theme: Theme; font: string }) {
  const [time, setTime] = useState("07:00");
  const [armed, setArmed] = useState(false);
  const firedRef = useRef<string | null>(null);
  const now = useNow(1000);
  useEffect(() => {
    if (!armed) return;
    const cur = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (cur === time && firedRef.current !== cur) {
      firedRef.current = cur;
      playBeep(); playBeep(); playBeep();
      toast.success(`⏰ Alarm! ${time}`);
    }
    if (cur !== time) firedRef.current = null;
  }, [now, armed, time]);
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-[10vw] md:text-[8vw] font-bold tabular-nums" style={{ color: theme.fg, fontFamily: font, textShadow: `0 0 30px ${theme.glow}80` }}>
        {time}
      </div>
      <input type="time" value={time} onChange={e => setTime(e.target.value)}
        className="bg-transparent text-2xl px-4 py-2 rounded-lg border outline-none"
        style={{ borderColor: theme.muted, color: theme.fg }} />
      <ControlBtn theme={theme} onClick={() => setArmed(a => !a)}>
        <Bell size={20} /> {armed ? "Disarm" : "Arm Alarm"}
      </ControlBtn>
      {armed && <div className="text-sm uppercase tracking-widest animate-pulse" style={{ color: theme.accent }}>Alarm armed</div>}
    </div>
  );
}

/* ---------------- shared ---------------- */
function ControlBtn({ theme, onClick, children }: any) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-xl border transition-all active:scale-95 hover:scale-105"
      style={{ background: `${theme.fg}12`, borderColor: `${theme.fg}30`, color: theme.fg, fontFamily: theme.font }}>
      {children}
    </button>
  );
}

let _audio: AudioContext | null = null;
function playBeep() {
  try {
    _audio ||= new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = _audio.createOscillator(); const g = _audio.createGain();
    o.frequency.value = 880; o.type = "sine";
    g.gain.setValueAtTime(0.001, _audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, _audio.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, _audio.currentTime + 0.6);
    o.connect(g).connect(_audio.destination);
    o.start(); o.stop(_audio.currentTime + 0.6);
  } catch {}
}

/* ---------------- main app ---------------- */
import ParticleField from "./components/ParticleField";
import SceneField from "./components/SceneField";

export default function ClockApp() {
  const [store, setStore] = useState<Store>(loadStore);
  const theme = useMemo(() => THEMES.find(t => t.id === store.themeId) || THEMES[0], [store.themeId]);
  const [showChrome, setShowChrome] = useState(true);
  const [showThemes, setShowThemes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWallpapers, setShowWallpapers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [running, setRunning] = useState(false);
  useWakeLock(running || store.mode === "digital" || store.mode === "analog" || store.mode === "flip" || store.mode === "minimal");
  useEffect(() => saveStore(store), [store]);

  // fullscreen state sync
  useEffect(() => {
    const on = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);

  // auto-hide chrome after 4.5s of inactivity
  const hideTimer = useRef<number | null>(null);
  const showChromeRef = useRef(showChrome);
  const showThemesRef = useRef(showThemes);
  const showSettingsRef = useRef(showSettings);
  const showWallpapersRef = useRef(showWallpapers);
  useEffect(() => { showChromeRef.current = showChrome; }, [showChrome]);
  useEffect(() => { showThemesRef.current = showThemes; }, [showThemes]);
  useEffect(() => { showSettingsRef.current = showSettings; }, [showSettings]);
  useEffect(() => { showWallpapersRef.current = showWallpapers; }, [showWallpapers]);
  const lastTap = useRef(0);
  const clearHideTimer = () => { if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; } };
  const scheduleHide = () => {
    clearHideTimer();
    if (showThemesRef.current || showSettingsRef.current || showWallpapersRef.current) return;
    if (!showChromeRef.current) { setShowChrome(true); lastTap.current = 0; }
    hideTimer.current = window.setTimeout(() => setShowChrome(false), 4500);
  };
  useEffect(() => {
    if (showChrome && !showThemes && !showSettings && !showWallpapers) scheduleHide();
    else clearHideTimer();
    return clearHideTimer;
  }, [showChrome, showThemes, showSettings, showWallpapers]);

  // gestures: swipe, double-tap, long-press
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const shiftTheme = (dir: 1 | -1) => {
    const idx = THEMES.findIndex(t => t.id === store.themeId);
    const next = THEMES[(idx + dir + THEMES.length) % THEMES.length];
    setStore(s => ({ ...s, themeId: next.id }));
    toast(next.name, { description: next.vibe, duration: 1200 });
  };
  const shiftMode = (dir: 1 | -1) => {
    const idx = MODES.findIndex(m => m.id === store.mode);
    const next = MODES[(idx + dir + MODES.length) % MODES.length];
    setStore(s => ({ ...s, mode: next.id }));
  };
  const onPointerDown = (e: React.PointerEvent) => {
    touchStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => { setShowSettings(true); }, 650);
    scheduleHide();
  };
  const cancelLongPress = () => { if (longPressTimer.current) { window.clearTimeout(longPressTimer.current); longPressTimer.current = null; } };
  const onPointerUp = (e: React.PointerEvent) => {
    cancelLongPress();
    scheduleHide();
    const s = touchStart.current; touchStart.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y, dt = Date.now() - s.t;
    if (dt < 500 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      shiftTheme(dx < 0 ? 1 : -1);
    } else if (dt < 500 && Math.abs(dy) > 80 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      shiftMode(dy < 0 ? 1 : -1);
    } else if (dt < 300 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (!showChromeRef.current) {
        setShowChrome(true);
        lastTap.current = 0;
      } else {
        const now = Date.now();
        if (now - lastTap.current < 300) { setShowChrome(false); lastTap.current = 0; }
        else lastTap.current = now;
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const font = store.fontOverride || theme.font;

  const renderMode = () => {
    switch (store.mode) {
      case "digital": return <DigitalClock theme={theme} is24h={store.is24h} showSeconds={store.showSeconds} glow={store.glowIntensity} font={font} />;
      case "analog": return <AnalogClock theme={theme} glow={store.glowIntensity} />;
      case "flip": return <FlipClock theme={theme} is24h={store.is24h} font={font} />;
      case "minimal": return <MinimalClock theme={theme} is24h={store.is24h} font={font} />;
      case "stopwatch": return <Stopwatch theme={theme} font={font} onRunningChange={setRunning} />;
      case "timer": return <CountdownTimer theme={theme} font={font} onRunningChange={setRunning} />;
      case "pomodoro": return <Pomodoro theme={theme} font={font} onRunningChange={setRunning} />;
      case "alarm": return <Alarm theme={theme} font={font} />;
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: theme.bg, color: theme.fg, fontFamily: theme.font, touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={cancelLongPress}
      onPointerMove={(e) => {
        const s = touchStart.current;
        if (s && (Math.abs(e.clientX - s.x) > 12 || Math.abs(e.clientY - s.y) > 12)) cancelLongPress();
        scheduleHide();
      }}
    >
      <SceneField theme={theme} />
      <ParticleField theme={theme} />

      {/* clock area */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-6 transition-opacity duration-500"
        key={store.mode + store.themeId}
        style={{ animation: "fade-in 0.5s ease" }}>
        {renderMode()}
      </div>

      {/* top bar */}
      <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 transition-all duration-500 ${showChrome ? "opacity-100" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.fg}15`, border: `1px solid ${theme.fg}30` }}>
            <Clock size={16} style={{ color: theme.fg }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: theme.fg }}>Insti Time</div>
            <div className="text-[10px] uppercase tracking-widest" style={{ color: theme.muted }}>{theme.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconBtn theme={theme} onClick={toggleFullscreen} label="Fullscreen">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </IconBtn>
          <IconBtn theme={theme} onClick={() => setShowThemes(true)} label="Themes"><Palette size={16} /></IconBtn>
          <IconBtn theme={theme} onClick={() => setShowSettings(true)} label="Settings"><Menu size={16} /></IconBtn>
        </div>
      </div>

      {/* mode dock */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-6 md:pb-8 transition-all duration-500 ${showChrome ? "opacity-100" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className="flex items-center gap-1 p-1.5 rounded-2xl backdrop-blur-2xl max-w-[95vw] overflow-x-auto"
          style={{ background: `${theme.fg}0d`, border: `1px solid ${theme.fg}25`, boxShadow: `0 20px 60px ${theme.glow}20` }}>
          {MODES.map(m => {
            const active = m.id === store.mode;
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => setStore(s => ({ ...s, mode: m.id }))}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                style={{ background: active ? theme.fg : "transparent", color: active ? (theme.bg.includes("linear") || theme.bg.includes("radial") ? "#000" : theme.bg) : theme.fg }}>
                <Icon size={14} />
                <span className="text-xs uppercase tracking-widest hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* side theme arrows */}
      <button onClick={() => shiftTheme(-1)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all ${showChrome ? "opacity-60 hover:opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: `${theme.fg}12`, border: `1px solid ${theme.fg}25`, color: theme.fg }}>
        <ChevronLeft size={18} />
      </button>
      <button onClick={() => shiftTheme(1)}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-xl flex items-center justify-center transition-all ${showChrome ? "opacity-60 hover:opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: `${theme.fg}12`, border: `1px solid ${theme.fg}25`, color: theme.fg }}>
        <ChevronRight size={18} />
      </button>

      {/* Theme picker sheet */}
      {showThemes && (
        <Sheet theme={theme} onClose={() => setShowThemes(false)} title="Themes">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { setStore(s => ({ ...s, themeId: t.id })); setShowThemes(false); }}
                className="text-left rounded-xl overflow-hidden border transition hover:scale-[1.02] active:scale-95"
                style={{ borderColor: t.id === store.themeId ? t.accent : `${theme.fg}20` }}>
                <div className="h-20 relative" style={{ background: t.bg }}>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: t.fg, fontFamily: t.font, textShadow: `0 0 12px ${t.glow}` }}>
                    12:34
                  </div>
                </div>
                <div className="p-2" style={{ background: `${theme.fg}05` }}>
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.fg }}>{t.name}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: theme.muted }}>{t.vibe}</div>
                </div>
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {/* Settings sheet */}
      {showSettings && (
        <Sheet theme={theme} onClose={() => setShowSettings(false)} title="Settings">
          <div className="space-y-6">
            <SettingRow label="24-hour clock">
              <Toggle theme={theme} value={store.is24h} onChange={v => setStore(s => ({ ...s, is24h: v }))} />
            </SettingRow>
            <SettingRow label="Show seconds">
              <Toggle theme={theme} value={store.showSeconds} onChange={v => setStore(s => ({ ...s, showSeconds: v }))} />
            </SettingRow>
            <SettingRow label={`Glow intensity · ${Math.round(store.glowIntensity * 100)}%`}>
              <input type="range" min={0} max={2} step={0.1} value={store.glowIntensity}
                onChange={e => setStore(s => ({ ...s, glowIntensity: Number(e.target.value) }))}
                className="w-40 accent-current" style={{ color: theme.accent }} />
            </SettingRow>
            <div>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.muted }}>Font</div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                <button onClick={() => setStore(s => ({ ...s, fontOverride: undefined }))}
                  className="px-3 py-2 text-xs rounded-lg border text-left"
                  style={{ borderColor: !store.fontOverride ? theme.accent : `${theme.fg}30`, color: theme.fg, fontFamily: theme.font }}>
                  Theme default
                </button>
                {FONTS.map(f => (
                  <button key={f.value} onClick={() => setStore(s => ({ ...s, fontOverride: f.value }))}
                    className="px-3 py-2 text-xs rounded-lg border text-left"
                    style={{ borderColor: store.fontOverride === f.value ? theme.accent : `${theme.fg}30`, color: theme.fg, fontFamily: f.value }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-widest pt-4 border-t" style={{ color: theme.muted, borderColor: `${theme.fg}20` }}>
              <div>Swipe ← → to change theme</div>
              <div>Swipe ↑ ↓ to change mode</div>
              <div>Double-tap to hide controls</div>
              <div>Long-press to open settings</div>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function IconBtn({ theme, onClick, children, label }: any) {
  return (
    <button onClick={onClick} aria-label={label}
      className="w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-xl border transition hover:scale-105 active:scale-95"
      style={{ background: `${theme.fg}10`, borderColor: `${theme.fg}25`, color: theme.fg }}>
      {children}
    </button>
  );
}

function Sheet({ theme, onClose, title, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onPointerDown={e => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full md:max-w-lg max-h-[85vh] rounded-t-3xl md:rounded-3xl overflow-hidden border animate-fade-in-up"
        style={{ background: theme.bg.includes("linear") || theme.bg.includes("radial") ? "#0a0a0a" : theme.bg, borderColor: `${theme.fg}25`, color: theme.fg, boxShadow: `0 -20px 80px ${theme.glow}30` }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: `${theme.fg}15` }}>
          <div className="text-sm uppercase tracking-[0.3em] font-semibold">{title}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${theme.fg}15` }}><X size={16} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">{children}</div>
      </div>
    </div>
  );
}

function SettingRow({ label, children }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, theme }: any) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-12 h-7 rounded-full relative transition"
      style={{ background: value ? theme.accent : `${theme.fg}25` }}>
      <span className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform"
        style={{ transform: value ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}
