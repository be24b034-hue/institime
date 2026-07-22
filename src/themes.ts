import demonSlayerCorpsVideo from "./assets/demon-slayer-corps.mp4.asset.json";
import tomiokaFrozenVideo from "./assets/tomioka-frozen-silence.mp4.asset.json";
import tanjiroAkazaVideo from "./assets/tanjiro-in-akazas-eye.mp4.asset.json";
import girlCurtainsVideo from "./assets/girl-behind-curtains-3.mp4.asset.json";
import azureHorizonVideo from "./assets/azure-horizon.mp4.asset.json";
import forgottenArcVideo from "./assets/beneath-the-forgotten-arc.mp4.asset.json";
import springMeadowVideo from "./assets/spring-meadow.mp4.asset.json";
import katanaForestVideo from "./assets/katana-forest.mp4.asset.json";
import silentSunsetVideo from "./assets/sunset-over-silent-horizon.mp4.asset.json";
import itachiMoonVideo from "./assets/itachi-sharingan-red-moon.mp4.asset.json";
import gojoSukunaVideo from "./assets/gojo-vs-sukuna-battle.mp4.asset.json";
import gojoSixEyesVideo from "./assets/gojo-six-eyes-jujutsu-kaisen.mp4.asset.json";

export type ThemeId =
  | "spider" | "vigilante" | "armored" | "thunder" | "emerald" | "superstrength"
  | "speedster" | "wakandan" | "mystic" | "galaxy" | "matrix" | "cyberpunk"
  | "tron" | "amoled" | "gold" | "royal" | "ocean" | "sakura" | "fire" | "ice" | "synthwave" | "minimal"
  | "web-city" | "slayer-forest" | "flame-hashira" | "thunder-breath" | "neon-tokyo"
  | "sakura-duel" | "ninja-village" | "titan-wall" | "mecha-hangar" | "spirit-lanterns"
  | "slayer-corps-live" | "frozen-silence-live"
  | "crimson-iris-live" | "silk-curtains-live" | "azure-horizon-live" | "forgotten-arc-live"
  | "spring-meadow-live" | "katana-forest-live" | "silent-sunset-live" | "crimson-moon-live"
  | "cursed-duel-live" | "six-eyes-live";

export type SceneId =
  | "web-city" | "slayer-forest" | "flame-hashira" | "thunder-breath" | "neon-tokyo"
  | "sakura-duel" | "ninja-village" | "titan-wall" | "mecha-hangar" | "spirit-lanterns";

export interface Theme {
  id: ThemeId;
  name: string;
  bg: string;
  fg: string;
  accent: string;
  muted: string;
  font: string;
  glow: string;
  particles?: "web" | "lightning" | "stars" | "grid" | "runes" | "petals" | "embers" | "snow" | "matrix" | "none";
  scene?: SceneId;
  video?: string;
  vibe?: string;
}

export const THEMES: Theme[] = [
  { id: "spider", name: "Web Slinger", vibe: "spider-inspired",
    bg: "radial-gradient(ellipse at 30% 20%, #2a0a12 0%, #0a0208 60%, #050106 100%)",
    fg: "#ff2a3d", accent: "#3b82f6", muted: "#ff7a85", font: "'Orbitron', sans-serif",
    glow: "#ff2a3d", particles: "web" },
  { id: "vigilante", name: "Dark Vigilante", vibe: "gothic gold",
    bg: "radial-gradient(ellipse at center, #0d0d10 0%, #000 80%)",
    fg: "#e8c268", accent: "#3a3a3a", muted: "#7a6a3a", font: "'Bebas Neue', sans-serif",
    glow: "#f0c04a" },
  { id: "armored", name: "Armored HUD", vibe: "iron heart",
    bg: "linear-gradient(140deg, #2a0508 0%, #0a0000 50%, #1a0a02 100%)",
    fg: "#ffcf3d", accent: "#e11d2a", muted: "#c0752a", font: "'Chakra Petch', sans-serif",
    glow: "#ffb400", particles: "grid" },
  { id: "thunder", name: "Thunder God", vibe: "storm forged",
    bg: "radial-gradient(ellipse at top, #0a1a4a 0%, #030618 70%, #000 100%)",
    fg: "#a5d8ff", accent: "#3b82f6", muted: "#6ea8ff", font: "'Audiowide', sans-serif",
    glow: "#7cc4ff", particles: "lightning" },
  { id: "emerald", name: "Emerald Cosmos", vibe: "cosmic energy",
    bg: "radial-gradient(ellipse at bottom, #002a1a 0%, #001008 70%, #000 100%)",
    fg: "#4ade80", accent: "#22d3ee", muted: "#3fb46a", font: "'Michroma', sans-serif",
    glow: "#22ff88", particles: "stars" },
  { id: "superstrength", name: "Man of Tomorrow", vibe: "super minimalist",
    bg: "linear-gradient(160deg, #0b1030 0%, #050818 100%)",
    fg: "#f0f4ff", accent: "#ef4444", muted: "#a3b3ff", font: "'Syncopate', sans-serif",
    glow: "#3b6bff" },
  { id: "speedster", name: "Speedster", vibe: "neon motion",
    bg: "radial-gradient(ellipse at 50% 50%, #1a0000 0%, #0a0000 60%, #000 100%)",
    fg: "#ff2d2d", accent: "#ffe500", muted: "#ff6a6a", font: "'Rajdhani', sans-serif",
    glow: "#ff0033", particles: "lightning" },
  { id: "wakandan", name: "Wakandan", vibe: "vibranium tech",
    bg: "radial-gradient(ellipse at 20% 80%, #1a0033 0%, #0a0012 60%, #000 100%)",
    fg: "#c4a3ff", accent: "#8b5cf6", muted: "#8f6acc", font: "'Michroma', sans-serif",
    glow: "#a855f7", particles: "runes" },
  { id: "mystic", name: "Mystic Arts", vibe: "arcane runes",
    bg: "radial-gradient(ellipse at center, #2a0f00 0%, #100500 70%, #000 100%)",
    fg: "#ff8c1a", accent: "#ffb347", muted: "#c56a1a", font: "'Major Mono Display', monospace",
    glow: "#ff9e2c", particles: "runes" },
  { id: "galaxy", name: "Deep Space", vibe: "stellar drift",
    bg: "radial-gradient(ellipse at 30% 30%, #1a0a3a 0%, #05021a 60%, #000 100%)",
    fg: "#e0d4ff", accent: "#a78bfa", muted: "#8b7fc4", font: "'Orbitron', sans-serif",
    glow: "#b48cff", particles: "stars" },
  { id: "matrix", name: "Matrix", vibe: "terminal",
    bg: "#000", fg: "#00ff41", accent: "#00ff41", muted: "#008820",
    font: "'Share Tech Mono', monospace", glow: "#00ff66", particles: "matrix" },
  { id: "cyberpunk", name: "Cyberpunk", vibe: "night city",
    bg: "linear-gradient(180deg, #12002a 0%, #001a2a 100%)",
    fg: "#ffe600", accent: "#ff00e5", muted: "#00e5ff", font: "'Rubik Mono One', sans-serif",
    glow: "#ff00c8", particles: "grid" },
  { id: "tron", name: "Grid", vibe: "tron-inspired",
    bg: "#000814", fg: "#67e8f9", accent: "#22d3ee", muted: "#0891b2",
    font: "'Audiowide', sans-serif", glow: "#22d3ee", particles: "grid" },
  { id: "amoled", name: "AMOLED", vibe: "true black",
    bg: "#000", fg: "#f5f5f5", accent: "#f5f5f5", muted: "#606060",
    font: "'JetBrains Mono', monospace", glow: "#ffffff40" },
  { id: "gold", name: "Luxury Gold", vibe: "opulent",
    bg: "radial-gradient(ellipse, #14100a 0%, #050403 100%)",
    fg: "#f5cf6a", accent: "#c9a34a", muted: "#8a7038", font: "'Bebas Neue', sans-serif",
    glow: "#f5cf6a" },
  { id: "royal", name: "Royal Purple", vibe: "regal",
    bg: "radial-gradient(ellipse, #1a0a2a 0%, #08010f 100%)",
    fg: "#e9d5ff", accent: "#c084fc", muted: "#9575cd", font: "'Syncopate', sans-serif",
    glow: "#c084fc" },
  { id: "ocean", name: "Deep Ocean", vibe: "abyssal",
    bg: "linear-gradient(180deg, #001a2e 0%, #000814 100%)",
    fg: "#7dd3fc", accent: "#38bdf8", muted: "#4a90c2", font: "'Chakra Petch', sans-serif",
    glow: "#38bdf8" },
  { id: "sakura", name: "Sakura", vibe: "cherry blossom",
    bg: "linear-gradient(180deg, #1a0510 0%, #08020a 100%)",
    fg: "#fbcfe8", accent: "#f472b6", muted: "#c890a8", font: "'Major Mono Display', monospace",
    glow: "#f472b6", particles: "petals" },
  { id: "fire", name: "Ember", vibe: "molten",
    bg: "radial-gradient(ellipse at bottom, #2a0500 0%, #0a0100 70%, #000 100%)",
    fg: "#fb923c", accent: "#ef4444", muted: "#c65a1a", font: "'Rajdhani', sans-serif",
    glow: "#ff5a1a", particles: "embers" },
  { id: "ice", name: "Glacier", vibe: "frozen",
    bg: "linear-gradient(180deg, #0a1a2a 0%, #030812 100%)",
    fg: "#e0f2fe", accent: "#7dd3fc", muted: "#94b7d4", font: "'Chakra Petch', sans-serif",
    glow: "#a5f3fc", particles: "snow" },
  { id: "synthwave", name: "Synthwave", vibe: "80s neon",
    bg: "linear-gradient(180deg, #2d0a3a 0%, #0a0518 60%, #000 100%)",
    fg: "#ff5ce1", accent: "#5ce1ff", muted: "#a05ce1", font: "'Rubik Mono One', sans-serif",
    glow: "#ff5ce1", particles: "grid" },
  { id: "minimal", name: "Minimal", vibe: "pure white",
    bg: "#0a0a0a", fg: "#fafafa", accent: "#fafafa", muted: "#606060",
    font: "'Inter', sans-serif", glow: "transparent" },

  /* -------- Cinematic anime & hero live wallpapers -------- */
  { id: "web-city", name: "Web City", vibe: "rooftop swing · spider-inspired",
    bg: "linear-gradient(180deg, #1a0510 0%, #0a0616 55%, #050208 100%)",
    fg: "#ff2a3d", accent: "#3b82f6", muted: "#ff7a85",
    font: "'Orbitron', sans-serif", glow: "#ff2a3d", scene: "web-city" },
  { id: "slayer-forest", name: "Moonlit Bamboo", vibe: "demon slayer-inspired",
    bg: "linear-gradient(180deg, #050a12 0%, #020509 100%)",
    fg: "#e8f4ff", accent: "#7dd3fc", muted: "#8aa0b8",
    font: "'Cormorant Garamond', serif", glow: "#a5f3fc", scene: "slayer-forest" },
  { id: "flame-hashira", name: "Flame Breathing", vibe: "ember hashira-inspired",
    bg: "radial-gradient(ellipse at bottom, #3a0a00 0%, #150200 60%, #000 100%)",
    fg: "#ffb84a", accent: "#ff3d1a", muted: "#c56a1a",
    font: "'Rajdhani', sans-serif", glow: "#ff5a1a", scene: "flame-hashira" },
  { id: "thunder-breath", name: "Thunder Breathing", vibe: "storm strike",
    bg: "radial-gradient(ellipse at top, #0a0f2a 0%, #030512 70%, #000 100%)",
    fg: "#ffee88", accent: "#8ac6ff", muted: "#6a7ab0",
    font: "'Audiowide', sans-serif", glow: "#ffe14a", scene: "thunder-breath" },
  { id: "neon-tokyo", name: "Neon Tokyo", vibe: "rain & bokeh",
    bg: "linear-gradient(180deg, #12002a 0%, #0a0018 60%, #000 100%)",
    fg: "#ffe600", accent: "#ff00e5", muted: "#67e8f9",
    font: "'Rubik Mono One', sans-serif", glow: "#ff00c8", scene: "neon-tokyo" },
  { id: "sakura-duel", name: "Sakura Duel", vibe: "katana gleam",
    bg: "linear-gradient(180deg, #1a0510 0%, #08020a 100%)",
    fg: "#fbcfe8", accent: "#f472b6", muted: "#c890a8",
    font: "'Major Mono Display', monospace", glow: "#f472b6", scene: "sakura-duel" },
  { id: "ninja-village", name: "Hidden Village", vibe: "red moon rooftops",
    bg: "linear-gradient(180deg, #1a0508 0%, #08020a 100%)",
    fg: "#ff8a5c", accent: "#ff3d3d", muted: "#a0554a",
    font: "'Bebas Neue', sans-serif", glow: "#ff5a3a", scene: "ninja-village" },
  { id: "titan-wall", name: "Beyond the Wall", vibe: "colossal silhouette",
    bg: "linear-gradient(180deg, #1a1208 0%, #0a0702 100%)",
    fg: "#f5e3b0", accent: "#c9a34a", muted: "#8a7038",
    font: "'Chakra Petch', sans-serif", glow: "#e8c268", scene: "titan-wall" },
  { id: "mecha-hangar", name: "Mecha Hangar", vibe: "grid pulse",
    bg: "linear-gradient(180deg, #001018 0%, #000508 100%)",
    fg: "#67e8f9", accent: "#22d3ee", muted: "#0891b2",
    font: "'Michroma', sans-serif", glow: "#22d3ee", scene: "mecha-hangar" },
  { id: "spirit-lanterns", name: "Spirit Lanterns", vibe: "floating flame",
    bg: "linear-gradient(180deg, #0a0018 0%, #050010 100%)",
    fg: "#ffd28a", accent: "#ff8a3d", muted: "#8a6a4a",
    font: "'Cormorant Garamond', serif", glow: "#ffb46a", scene: "spirit-lanterns" },

  /* -------- Live video wallpapers -------- */
  { id: "slayer-corps-live", name: "Slayer Corps · Live", vibe: "cinematic 4K live wallpaper",
    bg: "#000",
    fg: "#f5e3b0", accent: "#7dd3fc", muted: "#8aa0b8",
    font: "'Cormorant Garamond', serif", glow: "#a5f3fc",
    video: demonSlayerCorpsVideo.url },
  { id: "frozen-silence-live", name: "Frozen Silence · Live", vibe: "water hashira · live",
    bg: "#000",
    fg: "#e0f2fe", accent: "#38bdf8", muted: "#94b7d4",
    font: "'Cormorant Garamond', serif", glow: "#7dd3fc",
    video: tomiokaFrozenVideo.url },

  /* -------- New premium live wallpapers -------- */
  { id: "crimson-iris-live", name: "Crimson Iris · Live", vibe: "burning eye · live",
    bg: "#0a0000", fg: "#ffcf6a", accent: "#ff3d1a", muted: "#b0684a",
    font: "'Cormorant Garamond', serif", glow: "#ff5a1a", video: tanjiroAkazaVideo.url },
  { id: "silk-curtains-live", name: "Silk Curtains · Live", vibe: "dreamy silhouette · live",
    bg: "#0a0508", fg: "#fbe4f0", accent: "#f472b6", muted: "#c890a8",
    font: "'Cormorant Garamond', serif", glow: "#f9a8d4", video: girlCurtainsVideo.url },
  { id: "azure-horizon-live", name: "Azure Horizon · Live", vibe: "endless ocean sky · live",
    bg: "#00060a", fg: "#e0f2fe", accent: "#38bdf8", muted: "#7ea8c4",
    font: "'Chakra Petch', sans-serif", glow: "#7dd3fc", video: azureHorizonVideo.url },
  { id: "forgotten-arc-live", name: "Forgotten Arc · Live", vibe: "ancient mystic · live",
    bg: "#050308", fg: "#e9d5ff", accent: "#a78bfa", muted: "#8b7fc4",
    font: "'Major Mono Display', monospace", glow: "#b48cff", video: forgottenArcVideo.url },
  { id: "spring-meadow-live", name: "Spring Meadow · Live", vibe: "petal breeze · live",
    bg: "#050a05", fg: "#f0fff4", accent: "#86efac", muted: "#a8c4a8",
    font: "'Cormorant Garamond', serif", glow: "#bef264", video: springMeadowVideo.url },
  { id: "katana-forest-live", name: "Katana Forest · Live", vibe: "misty samurai · live",
    bg: "#040608", fg: "#e6efe4", accent: "#7dd3fc", muted: "#88a094",
    font: "'Cormorant Garamond', serif", glow: "#a5f3fc", video: katanaForestVideo.url },
  { id: "silent-sunset-live", name: "Silent Sunset · Live", vibe: "amber horizon · live",
    bg: "#0a0400", fg: "#ffd28a", accent: "#ff8a3d", muted: "#b0805a",
    font: "'Cormorant Garamond', serif", glow: "#ffb46a", video: silentSunsetVideo.url },
  { id: "crimson-moon-live", name: "Crimson Moon · Live", vibe: "sharingan · live",
    bg: "#0a0000", fg: "#ff5a5a", accent: "#ef4444", muted: "#a04040",
    font: "'Bebas Neue', sans-serif", glow: "#ff2a2a", video: itachiMoonVideo.url },
  { id: "cursed-duel-live", name: "Cursed Duel · Live", vibe: "sorcerer clash · live",
    bg: "#04010a", fg: "#c4b5fd", accent: "#8b5cf6", muted: "#8f7ac0",
    font: "'Michroma', sans-serif", glow: "#a855f7", video: gojoSukunaVideo.url },
  { id: "six-eyes-live", name: "Six Eyes · Live", vibe: "infinite blue · live",
    bg: "#00030a", fg: "#a5f3fc", accent: "#22d3ee", muted: "#5a90a8",
    font: "'Michroma', sans-serif", glow: "#22d3ee", video: gojoSixEyesVideo.url },
];

export const FONTS = [
  { label: "HUD Sci-Fi", value: "'Orbitron', sans-serif" },
  { label: "Digital Seven", value: "'VT323', monospace" },
  { label: "LCD", value: "'Share Tech Mono', monospace" },
  { label: "Mechanical", value: "'JetBrains Mono', monospace" },
  { label: "Pixel Arcade", value: "'Silkscreen', monospace" },
  { label: "Military", value: "'Chakra Petch', sans-serif" },
  { label: "Clean Modern", value: "'Inter', sans-serif" },
  { label: "Minimal Luxury", value: "'Syncopate', sans-serif" },
  { label: "Gaming", value: "'Audiowide', sans-serif" },
  { label: "Futuristic", value: "'Michroma', sans-serif" },
  { label: "Cyber", value: "'Rubik Mono One', sans-serif" },
  { label: "Cinematic", value: "'Bebas Neue', sans-serif" },
  { label: "Thin Modern", value: "'Rajdhani', sans-serif" },
  { label: "Terminal", value: "'Major Mono Display', monospace" },
];
