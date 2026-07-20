// Curated free / CC wallpaper providers. LoremFlickr returns real
// Creative-Commons Flickr photos for a given tag with no API key required.
// Picsum is used for the "Minimal" and random discovery categories.

export interface WallpaperCategory {
  id: string;
  label: string;
  query: string; // comma-separated flickr tags
  emoji: string;
}

export const CATEGORIES: WallpaperCategory[] = [
  { id: "anime",     label: "Anime Inspired",   query: "anime,art,illustration",     emoji: "✦" },
  { id: "japan",     label: "Japanese Villages", query: "japan,village,kyoto",       emoji: "⛩" },
  { id: "lofi",      label: "Lo-fi Villages",   query: "lofi,aesthetic,city",        emoji: "◐" },
  { id: "rain",      label: "Rainy Streets",    query: "rain,street,neon",           emoji: "☂" },
  { id: "nature",    label: "Nature",           query: "nature,landscape",           emoji: "❦" },
  { id: "mountains", label: "Mountains",        query: "mountains,alps,sunrise",     emoji: "▲" },
  { id: "forest",    label: "Forest",           query: "forest,trees,fog",           emoji: "♣" },
  { id: "ocean",     label: "Ocean",            query: "ocean,waves,sea",            emoji: "≈" },
  { id: "space",     label: "Space",            query: "space,nebula,galaxy",        emoji: "✧" },
  { id: "cyberpunk", label: "Cyberpunk",        query: "cyberpunk,neon,tokyo",       emoji: "◊" },
  { id: "minimal",   label: "Minimal",          query: "minimal,abstract,gradient",  emoji: "○" },
  { id: "gaming",    label: "Gaming",           query: "gaming,rgb,setup",           emoji: "◆" },
];

// Wallpaper URL. `sig` gives us a stable-per-tile but different-per-slot photo.
export const wpUrl = (query: string, sig: number, w = 900, h = 1400) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(query)}?lock=${sig}`;

export const thumbUrl = (query: string, sig: number) =>
  `https://loremflickr.com/400/600/${encodeURIComponent(query)}?lock=${sig}`;

export interface StoredWallpaper {
  id: string;         // `${category}-${sig}`
  category: string;
  query: string;
  sig: number;
  url: string;
  thumb: string;
  addedAt: number;
}

const FAV_KEY = "insti-wp-favs-v1";
const RECENT_KEY = "insti-wp-recent-v1";

export const loadFavs = (): StoredWallpaper[] => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
};
export const saveFavs = (list: StoredWallpaper[]) => {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch {}
};
export const loadRecent = (): StoredWallpaper[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
};
export const pushRecent = (w: StoredWallpaper) => {
  const list = loadRecent().filter(x => x.id !== w.id);
  list.unshift(w);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 24))); } catch {}
};
