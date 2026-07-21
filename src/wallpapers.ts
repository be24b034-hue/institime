// Wallpaper library.
// Every entry has a unique id and a unique image URL (unique sig -> unique
// LoremFlickr / Picsum photo). We never repeat the same image twice.
//
// Sources are free / CC:
//  - LoremFlickr   (Creative-Commons Flickr photos)
//  - Picsum        (unique random photos by id)
//
// Anime-series categories map to themed Flickr tags so we get visually
// matching photos without violating any copyright.

export type WallpaperKind = "static" | "live";
export type Orientation = "portrait" | "landscape";

export interface Wallpaper {
  id: string;
  title: string;
  tags: string[];         // lower-case; used for search & filter chips
  categories: string[];   // category ids from CATEGORIES
  kind: WallpaperKind;
  orientation: Orientation;
  url: string;
  thumb: string;
  is4k?: boolean;
  isAmoled?: boolean;
  isDark?: boolean;
  liveThemeId?: string;   // for live wallpapers, which theme to preview
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: "anime",           label: "Anime",             emoji: "✦" },
  { id: "demon-slayer",    label: "Demon Slayer",      emoji: "🔥" },
  { id: "naruto",          label: "Naruto",            emoji: "🍥" },
  { id: "one-piece",       label: "One Piece",         emoji: "☠" },
  { id: "jjk",             label: "Jujutsu Kaisen",    emoji: "✧" },
  { id: "aot",             label: "Attack on Titan",   emoji: "⚔" },
  { id: "solo-leveling",   label: "Solo Leveling",     emoji: "◆" },
  { id: "dragon-ball",     label: "Dragon Ball",       emoji: "☀" },
  { id: "chainsaw-man",    label: "Chainsaw Man",      emoji: "⛓" },
  { id: "tokyo-ghoul",     label: "Tokyo Ghoul",       emoji: "☾" },
  { id: "bleach",          label: "Bleach",            emoji: "▲" },
  { id: "ghibli",          label: "Studio Ghibli",     emoji: "❦" },
  { id: "japan",           label: "Japanese Villages", emoji: "⛩" },
  { id: "lofi",            label: "Lo-fi",             emoji: "◐" },
  { id: "rain",            label: "Rain",              emoji: "☂" },
  { id: "nature",          label: "Nature",            emoji: "♣" },
  { id: "mountains",       label: "Mountains",         emoji: "▲" },
  { id: "cyberpunk",       label: "Cyberpunk",         emoji: "◊" },
  { id: "space",           label: "Space",             emoji: "✧" },
  { id: "city",            label: "City",              emoji: "▮" },
  { id: "minimal",         label: "Minimal",           emoji: "○" },
  { id: "gaming",          label: "Gaming",            emoji: "◆" },
];

/* ---------------- pool generation ---------------- */

const wpUrl = (query: string, sig: number, w: number, h: number) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(query)}?lock=${sig}`;

const thumbUrl = (query: string, sig: number, portrait: boolean) =>
  `https://loremflickr.com/${portrait ? 320 : 480}/${portrait ? 480 : 320}/${encodeURIComponent(query)}?lock=${sig}`;

const picsumUrl = (id: number, w: number, h: number) =>
  `https://picsum.photos/id/${id}/${w}/${h}`;

interface SeriesSpec {
  id: string;              // category id
  title: string;
  query: string;           // flickr tags → matching photos
  extraTags: string[];     // extra search tags for this series
  dark?: boolean;
  seedBase: number;        // ensures unique LoremFlickr sigs across pool
}

const SERIES: SeriesSpec[] = [
  // anime series -> we use inspired Flickr tags (fire, moon, katana...)
  { id: "demon-slayer",  title: "Demon Slayer",    query: "fire,katana,night,japan",         extraTags: ["tanjiro","nezuko","zenitsu","inosuke","rengoku","kimetsu"],       dark: true, seedBase: 10_000 },
  { id: "naruto",        title: "Naruto",          query: "orange,leaf,ninja,forest",        extraTags: ["naruto","sasuke","kakashi","itachi","shinobi","konoha"],           dark: false, seedBase: 11_000 },
  { id: "one-piece",     title: "One Piece",       query: "ocean,ship,pirate,sunset",        extraTags: ["luffy","zoro","sanji","strawhat","pirate"],                        dark: false, seedBase: 12_000 },
  { id: "jjk",           title: "Jujutsu Kaisen",  query: "purple,cursed,neon,night",        extraTags: ["gojo","yuji","megumi","sukuna","itadori","jjk"],                   dark: true,  seedBase: 13_000 },
  { id: "aot",           title: "Attack on Titan", query: "wall,ruins,storm,giant",          extraTags: ["eren","mikasa","levi","titan","aot","survey corps"],               dark: true,  seedBase: 14_000 },
  { id: "solo-leveling", title: "Solo Leveling",   query: "blue,shadow,dungeon,portal",      extraTags: ["sung jinwoo","monarch","hunter","shadow"],                         dark: true,  seedBase: 15_000 },
  { id: "dragon-ball",   title: "Dragon Ball",     query: "sky,energy,mountain,sunset",      extraTags: ["goku","vegeta","gohan","saiyan","dbz"],                            dark: false, seedBase: 16_000 },
  { id: "chainsaw-man",  title: "Chainsaw Man",    query: "red,blood,urban,dark",            extraTags: ["denji","power","makima","chainsaw"],                               dark: true,  seedBase: 17_000 },
  { id: "tokyo-ghoul",   title: "Tokyo Ghoul",     query: "tokyo,night,red,dark",            extraTags: ["kaneki","ghoul","tokyo"],                                          dark: true,  seedBase: 18_000 },
  { id: "bleach",        title: "Bleach",          query: "moon,sword,white,black",          extraTags: ["ichigo","rukia","zangetsu","soul reaper"],                         dark: true,  seedBase: 19_000 },
  { id: "ghibli",        title: "Studio Ghibli",   query: "forest,cottage,pastoral,clouds",  extraTags: ["totoro","spirited","howl","miyazaki","ghibli"],                    dark: false, seedBase: 20_000 },

  // scenery / non-anime categories
  { id: "japan",         title: "Japan Village",   query: "japan,village,kyoto,shrine",      extraTags: ["torii","onsen","sakura"],                                          dark: false, seedBase: 21_000 },
  { id: "lofi",          title: "Lo-fi Scene",     query: "lofi,aesthetic,room,night",       extraTags: ["chill","study","aesthetic"],                                       dark: true,  seedBase: 22_000 },
  { id: "rain",          title: "Rainy Street",    query: "rain,street,neon,city",           extraTags: ["rainy","umbrella","wet","storm"],                                  dark: true,  seedBase: 23_000 },
  { id: "nature",        title: "Nature",          query: "nature,forest,landscape",         extraTags: ["trees","greenery","waterfall"],                                    dark: false, seedBase: 24_000 },
  { id: "mountains",     title: "Mountains",       query: "mountains,alps,peaks,sunrise",    extraTags: ["snow","alpine","himalaya"],                                        dark: false, seedBase: 25_000 },
  { id: "cyberpunk",     title: "Cyberpunk",       query: "cyberpunk,neon,tokyo,night",      extraTags: ["synth","futurism","street"],                                       dark: true,  seedBase: 26_000 },
  { id: "space",         title: "Space",           query: "space,nebula,galaxy,stars",       extraTags: ["cosmos","universe","astronaut","milkyway"],                        dark: true,  seedBase: 27_000 },
  { id: "city",          title: "City",            query: "city,skyline,night,lights",       extraTags: ["metropolis","skyscraper","downtown"],                              dark: true,  seedBase: 28_000 },
  { id: "minimal",       title: "Minimal",         query: "minimal,gradient,abstract",       extraTags: ["clean","simple","pastel"],                                         dark: false, seedBase: 29_000 },
  { id: "gaming",        title: "Gaming",          query: "gaming,rgb,setup,neon",           extraTags: ["controller","pc","console","esports"],                             dark: true,  seedBase: 30_000 },
];

// A curated set of Picsum photo IDs known to be scenic (mountains / nature /
// city). Using explicit IDs guarantees a *unique* photo per entry.
const PICSUM_SCENIC = [
  10, 15, 27, 29, 37, 43, 58, 76, 91, 96, 110, 129, 137, 141, 152, 164,
  183, 190, 200, 211, 218, 225, 244, 250, 274, 288, 306, 314, 331, 351,
  367, 378, 386, 395, 404, 416, 429, 437, 448, 456, 462, 470, 481, 493,
  503, 517, 526, 534, 548, 555, 566, 575, 582, 596, 604, 611, 622, 634,
];

const PORTRAIT_W = 1080, PORTRAIT_H = 1920;
const LANDSCAPE_W = 1920, LANDSCAPE_H = 1080;

function buildPool(): Wallpaper[] {
  const pool: Wallpaper[] = [];
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();
  const push = (w: Wallpaper) => {
    if (seenIds.has(w.id) || seenUrls.has(w.url)) return;
    seenIds.add(w.id); seenUrls.add(w.url); pool.push(w);
  };

  const ANIME_SERIES = new Set([
    "demon-slayer","naruto","one-piece","jjk","aot","solo-leveling",
    "dragon-ball","chainsaw-man","tokyo-ghoul","bleach","ghibli",
  ]);

  for (const s of SERIES) {
    const count = ANIME_SERIES.has(s.id) ? 16 : 14;
    for (let i = 0; i < count; i++) {
      const sig = s.seedBase + i;
      const portrait = i % 3 !== 0;              // ~66% portrait, ~33% landscape
      const url = wpUrl(s.query, sig, portrait ? PORTRAIT_W : LANDSCAPE_W, portrait ? PORTRAIT_H : LANDSCAPE_H);
      const cats = ANIME_SERIES.has(s.id) ? ["anime", s.id] : [s.id];
      push({
        id: `${s.id}-${sig}`,
        title: `${s.title} · ${String(i + 1).padStart(2, "0")}`,
        tags: [s.id, s.title.toLowerCase(), ...s.extraTags, ...s.query.split(",")],
        categories: cats,
        kind: "static",
        orientation: portrait ? "portrait" : "landscape",
        url,
        thumb: thumbUrl(s.query, sig, portrait),
        is4k: true,
        isDark: s.dark,
        isAmoled: s.dark && (i % 4 === 0),
      });
    }
  }

  // Picsum scenic bonus (unique guaranteed) — spread across nature / mountains / city / minimal
  const scenicCats: string[][] = [
    ["nature"], ["mountains"], ["city"], ["minimal"], ["nature","mountains"],
  ];
  PICSUM_SCENIC.forEach((id, idx) => {
    const portrait = idx % 2 === 0;
    const cats = scenicCats[idx % scenicCats.length];
    push({
      id: `picsum-${id}`,
      title: `Wanderer · ${String(idx + 1).padStart(2, "0")}`,
      tags: ["photo","scenic","landscape",...cats],
      categories: cats,
      kind: "static",
      orientation: portrait ? "portrait" : "landscape",
      url: picsumUrl(id, portrait ? PORTRAIT_W : LANDSCAPE_W, portrait ? PORTRAIT_H : LANDSCAPE_H),
      thumb: picsumUrl(id, portrait ? 320 : 480, portrait ? 480 : 320),
      is4k: true,
      isDark: idx % 3 === 0,
    });
  });

  // Live wallpapers → map to existing scene themes we already animate.
  const LIVE = [
    { themeId: "web-city",       title: "Spider · Web City",       tags: ["spider","web","spiderman","city","hero"],           cats: ["anime","cyberpunk","city"] },
    { themeId: "moonlit-bamboo", title: "Moonlit Bamboo",          tags: ["demon slayer","tanjiro","bamboo","moon","katana"],  cats: ["anime","demon-slayer","japan"] },
    { themeId: "flame-breathing",title: "Flame Breathing",         tags: ["demon slayer","rengoku","fire","flame","embers"],   cats: ["anime","demon-slayer"] },
    { themeId: "thunder-breath", title: "Thunder Breathing",       tags: ["demon slayer","zenitsu","lightning","thunder"],     cats: ["anime","demon-slayer"] },
    { themeId: "neon-tokyo",     title: "Neon Tokyo",              tags: ["tokyo","neon","cyberpunk","rain","street"],         cats: ["cyberpunk","city","rain"] },
    { themeId: "sakura-duel",    title: "Sakura Duel",             tags: ["sakura","japan","cherry","petals"],                 cats: ["anime","japan"] },
    { themeId: "hidden-village", title: "Hidden Village",          tags: ["naruto","ninja","village","leaf","konoha"],         cats: ["anime","naruto","japan"] },
    { themeId: "beyond-wall",    title: "Beyond the Wall",         tags: ["attack on titan","aot","wall","storm"],             cats: ["anime","aot"] },
    { themeId: "mecha-hangar",   title: "Mecha Hangar",            tags: ["mecha","robot","hangar","cyber"],                   cats: ["cyberpunk","gaming"] },
    { themeId: "spirit-lantern", title: "Spirit Lanterns",         tags: ["ghibli","spirit","lantern","forest","festival"],    cats: ["anime","ghibli","japan"] },
  ];
  LIVE.forEach((l, i) => {
    push({
      id: `live-${l.themeId}`,
      title: l.title,
      tags: ["live wallpaper","animated", ...l.tags],
      categories: l.cats,
      kind: "live",
      orientation: "portrait",
      // Preview thumbnail via themed loremflickr photo so the card shows something meaningful.
      url: wpUrl(l.tags.slice(0, 3).join(","), 90_000 + i, LANDSCAPE_W, LANDSCAPE_H),
      thumb: thumbUrl(l.tags.slice(0, 3).join(","), 90_000 + i, false),
      is4k: true, isDark: true,
      liveThemeId: l.themeId,
    });
  });

  return pool;
}

export const WALLPAPERS: Wallpaper[] = buildPool();

/* ---------------- search & filter ---------------- */

export type FilterChip =
  | "all" | "anime" | "nature" | "rain" | "japanese" | "dark" | "light"
  | "vertical" | "landscape" | "4k" | "amoled" | "live" | "static";

export const FILTER_CHIPS: { id: FilterChip; label: string }[] = [
  { id: "all",       label: "All" },
  { id: "anime",     label: "Anime" },
  { id: "nature",    label: "Nature" },
  { id: "rain",      label: "Rain" },
  { id: "japanese",  label: "Japanese" },
  { id: "dark",      label: "Dark" },
  { id: "light",     label: "Light" },
  { id: "vertical",  label: "Vertical" },
  { id: "landscape", label: "Landscape" },
  { id: "4k",        label: "4K" },
  { id: "amoled",    label: "AMOLED" },
  { id: "live",      label: "Live Wallpapers" },
  { id: "static",    label: "Static Wallpapers" },
];

const matchesChip = (w: Wallpaper, c: FilterChip): boolean => {
  switch (c) {
    case "all":       return true;
    case "anime":     return w.categories.includes("anime");
    case "nature":    return w.categories.includes("nature") || w.categories.includes("mountains");
    case "rain":      return w.categories.includes("rain") || w.tags.includes("rain");
    case "japanese":  return w.categories.includes("japan") || w.categories.includes("ghibli") || w.tags.some(t => t.includes("japan"));
    case "dark":      return !!w.isDark;
    case "light":     return !w.isDark;
    case "vertical":  return w.orientation === "portrait";
    case "landscape": return w.orientation === "landscape";
    case "4k":        return !!w.is4k;
    case "amoled":    return !!w.isAmoled;
    case "live":      return w.kind === "live";
    case "static":    return w.kind === "static";
  }
};

export function filterWallpapers(all: Wallpaper[], opts: {
  search?: string;
  category?: string | null;   // one category from CATEGORIES.id or null
  chips?: FilterChip[];
}): Wallpaper[] {
  const q = (opts.search || "").trim().toLowerCase();
  const cat = opts.category || null;
  const chips = (opts.chips || []).filter(c => c !== "all");
  return all.filter(w => {
    if (cat && !w.categories.includes(cat)) return false;
    if (chips.length && !chips.every(c => matchesChip(w, c))) return false;
    if (q) {
      const hay = [w.title, ...w.tags, ...w.categories].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ---------------- storage (favorites / recent) ---------------- */

const FAV_KEY = "insti-wp-favs-v2";
const RECENT_KEY = "insti-wp-recent-v2";

export const loadFavs = (): Wallpaper[] => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
};
export const saveFavs = (list: Wallpaper[]) => {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch {}
};
export const loadRecent = (): Wallpaper[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
};
export const pushRecent = (w: Wallpaper) => {
  const list = loadRecent().filter(x => x.id !== w.id);
  list.unshift(w);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 40))); } catch {}
};

/* ---------------- legacy compat (WallpaperGallery.tsx still imports these) ---------------- */

export type StoredWallpaper = Wallpaper;
export type WallpaperCategory = Category;
