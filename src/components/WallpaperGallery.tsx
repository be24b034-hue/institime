import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Search, Heart, Download, Share2, Shuffle, Sparkles, Check, Play,
  Sun, Contrast, Droplets, Waves,
} from "lucide-react";
import {
  CATEGORIES, FILTER_CHIPS, WALLPAPERS, filterWallpapers,
  loadFavs, saveFavs, loadRecent, pushRecent,
  type Wallpaper, type FilterChip, type StoredWallpaper,
} from "@/wallpapers";

export interface WallpaperFilters {
  brightness: number; // 0.2 - 1.5
  blur: number;       // 0 - 24 (px)
  saturation: number; // 0 - 2
  contrast: number;   // 0.5 - 1.8
}

export const DEFAULT_FILTERS: WallpaperFilters = {
  brightness: 0.75, blur: 0, saturation: 1, contrast: 1,
};

export const filterCss = (f: WallpaperFilters) =>
  `brightness(${f.brightness}) blur(${f.blur}px) saturate(${f.saturation}) contrast(${f.contrast})`;

interface Props {
  themeFg: string;
  themeBg: string;
  themeGlow: string;
  currentUrl?: string;
  filters: WallpaperFilters;
  onFiltersChange: (f: WallpaperFilters) => void;
  onApply: (w: StoredWallpaper | null) => void;
  onClose: () => void;
}

type Tab = "browse" | "favorites" | "recent" | "adjust";

export default function WallpaperGallery({
  themeFg, themeBg, themeGlow, currentUrl, filters, onFiltersChange, onApply, onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>("browse");
  const [category, setCategory] = useState<string | null>(null);
  const [chips, setChips] = useState<FilterChip[]>(["all"]);
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<Wallpaper[]>(loadFavs());
  const [recent] = useState<Wallpaper[]>(loadRecent());
  const [preview, setPreview] = useState<Wallpaper | null>(null);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [count, setCount] = useState(48);
  const sentinel = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterWallpapers(WALLPAPERS, { search: q, category, chips }),
    [q, category, chips],
  );

  const shownBrowse = filtered.slice(0, count);

  // infinite scroll (browse only)
  useEffect(() => {
    if (!sentinel.current || tab !== "browse") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setCount(c => Math.min(c + 48, filtered.length));
    }, { rootMargin: "600px" });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [tab, filtered.length]);

  // reset paging when search / filters change
  useEffect(() => { setCount(48); }, [q, category, chips]);

  const toggleChip = (id: FilterChip) => {
    if (id === "all") { setChips(["all"]); return; }
    setChips(prev => {
      const without = prev.filter(c => c !== "all" && c !== id);
      return prev.includes(id) ? (without.length ? without : ["all"]) : [...without, id];
    });
  };

  const toggleFav = (w: Wallpaper) => {
    const exists = favs.some(f => f.id === w.id);
    const next = exists ? favs.filter(f => f.id !== w.id) : [w, ...favs];
    setFavs(next); saveFavs(next);
  };
  const isFav = (id: string) => favs.some(f => f.id === id);

  const apply = (w: Wallpaper) => { pushRecent(w); onApply(w); };

  const random = () => {
    const w = filtered[Math.floor(Math.random() * filtered.length)] || WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)];
    setPreview(w);
  };

  const share = async (w: Wallpaper) => {
    try {
      if (navigator.share) await navigator.share({ title: w.title, text: w.title, url: w.url });
      else { await navigator.clipboard.writeText(w.url); }
    } catch {}
  };

  const gridSource: Wallpaper[] =
    tab === "favorites" ? favs : tab === "recent" ? recent : shownBrowse;

  const related = preview
    ? WALLPAPERS.filter(w => w.id !== preview.id && w.categories.some(c => preview.categories.includes(c))).slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" onPointerDown={e => e.stopPropagation()}
      style={{ background: "rgba(6,6,10,0.88)", backdropFilter: "blur(24px)", color: themeFg }}>
      {/* header */}
      <div className="flex items-center gap-3 px-4 md:px-8 py-4 border-b" style={{ borderColor: `${themeFg}18` }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeFg}, ${themeGlow})`, color: "#000" }}>
            <Sparkles size={16} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] opacity-60">Insti</div>
            <div className="text-sm font-semibold uppercase tracking-widest">Wallpapers</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 max-w-xl mx-auto rounded-full px-4 py-2 border"
          style={{ background: `${themeFg}0d`, borderColor: `${themeFg}20` }}>
          <Search size={14} className="opacity-60" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search Naruto, Gojo, Rain, Village…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-40"
            style={{ color: themeFg }}
          />
          {q && <button onClick={() => setQ("")} className="opacity-60 hover:opacity-100"><X size={14} /></button>}
        </div>
        <button onClick={random} title="Surprise me"
          className="w-9 h-9 rounded-lg flex items-center justify-center border transition hover:scale-105"
          style={{ background: `${themeFg}10`, borderColor: `${themeFg}25` }}>
          <Shuffle size={16} />
        </button>
        <button onClick={onClose} title="Close"
          className="w-9 h-9 rounded-lg flex items-center justify-center border transition hover:scale-105"
          style={{ background: `${themeFg}10`, borderColor: `${themeFg}25` }}>
          <X size={16} />
        </button>
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 px-4 md:px-8 py-3 overflow-x-auto border-b" style={{ borderColor: `${themeFg}12` }}>
        {(["browse", "favorites", "recent", "adjust"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-xs uppercase tracking-widest whitespace-nowrap transition"
            style={{
              background: tab === t ? themeFg : "transparent",
              color: tab === t ? "#000" : themeFg,
              border: `1px solid ${tab === t ? themeFg : themeFg + "20"}`,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* filter chips + category strip (browse only) */}
      {tab === "browse" && (
        <div className="border-b" style={{ borderColor: `${themeFg}10` }}>
          <div className="flex items-center gap-1 px-4 md:px-8 pt-3 pb-2 overflow-x-auto">
            {FILTER_CHIPS.map(f => {
              const active = chips.includes(f.id);
              return (
                <button key={f.id} onClick={() => toggleChip(f.id)}
                  className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest whitespace-nowrap transition"
                  style={{
                    background: active ? `${themeFg}22` : "transparent",
                    color: themeFg,
                    border: `1px solid ${active ? themeFg + "70" : themeFg + "18"}`,
                  }}>{f.label}</button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 px-4 md:px-8 pb-3 overflow-x-auto">
            <button onClick={() => setCategory(null)}
              className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest whitespace-nowrap transition"
              style={{
                background: !category ? `${themeFg}22` : "transparent",
                color: themeFg,
                border: `1px solid ${!category ? themeFg + "50" : themeFg + "15"}`,
              }}>All Categories</button>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id === category ? null : c.id)}
                className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest whitespace-nowrap transition"
                style={{
                  background: category === c.id ? `${themeFg}22` : "transparent",
                  color: themeFg,
                  border: `1px solid ${category === c.id ? themeFg + "50" : themeFg + "15"}`,
                }}>
                <span className="mr-1 opacity-70">{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {tab === "adjust" ? (
          <AdjustPanel themeFg={themeFg} themeGlow={themeGlow} filters={filters} onChange={onFiltersChange} onClear={() => onApply(null)} hasWallpaper={!!currentUrl} />
        ) : gridSource.length === 0 ? (
          <div className="text-center opacity-60 py-24 text-sm uppercase tracking-widest">
            {tab === "favorites" ? "No favorites yet · tap ♡ to save" : tab === "recent" ? "Nothing viewed yet" : "No wallpapers match your filters"}
          </div>
        ) : (
          <>
            {tab === "browse" && (
              <div className="text-[11px] uppercase tracking-widest opacity-50 mb-3">
                {filtered.length} unique wallpapers · showing {shownBrowse.length}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {gridSource.map(w => (
                <WallpaperCard
                  key={w.id} w={w} active={currentUrl === w.url} themeFg={themeFg}
                  loaded={!!loaded[w.id]} onLoad={() => setLoaded(l => ({ ...l, [w.id]: true }))}
                  fav={isFav(w.id)} onFav={() => toggleFav(w)} onOpen={() => setPreview(w)}
                />
              ))}
            </div>
            {tab === "browse" && count < filtered.length && <div ref={sentinel} className="h-16" />}
          </>
        )}
      </div>

      {preview && (
        <PreviewSheet
          w={preview}
          themeFg={themeFg}
          themeGlow={themeGlow}
          isFav={isFav(preview.id)}
          filters={filters}
          related={related}
          onSelectRelated={(rw) => setPreview(rw)}
          onToggleFav={() => toggleFav(preview)}
          onShare={() => share(preview)}
          onApply={() => { apply(preview); setPreview(null); }}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function WallpaperCard({ w, active, themeFg, loaded, onLoad, fav, onFav, onOpen }: {
  w: Wallpaper; active: boolean; themeFg: string; loaded: boolean; onLoad: () => void;
  fav: boolean; onFav: () => void; onOpen: () => void;
}) {
  return (
    <button onClick={onOpen}
      className="group relative aspect-[2/3] rounded-2xl overflow-hidden border transition hover:scale-[1.02] active:scale-95"
      style={{ borderColor: active ? themeFg : `${themeFg}18`, background: `${themeFg}08` }}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse"
          style={{ background: `linear-gradient(120deg, ${themeFg}08, ${themeFg}18, ${themeFg}08)` }} />
      )}
      <img src={w.thumb} alt={w.title} loading="lazy" decoding="async" onLoad={onLoad}
        className="w-full h-full object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
        style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75))" }} />
      <div className="absolute bottom-2 left-2 right-14 text-left opacity-0 group-hover:opacity-100 transition">
        <div className="text-[10px] uppercase tracking-widest text-white/80 truncate">{w.title}</div>
      </div>
      <div className="absolute top-2 left-2 flex gap-1">
        {w.kind === "live" && (
          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest flex items-center gap-1"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            <Play size={9} /> Live
          </span>
        )}
        {w.is4k && (
          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>4K</span>
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition hover:scale-110"
          style={{ background: "rgba(0,0,0,0.5)", color: fav ? "#ff4d80" : "#fff" }}>
          <Heart size={13} fill={fav ? "#ff4d80" : "none"} />
        </button>
      </div>
      {active && (
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-1"
          style={{ background: themeFg, color: "#000" }}>
          <Check size={10} /> Active
        </div>
      )}
    </button>
  );
}

function AdjustPanel({ themeFg, themeGlow, filters, onChange, onClear, hasWallpaper }: {
  themeFg: string; themeGlow: string; filters: WallpaperFilters;
  onChange: (f: WallpaperFilters) => void; onClear: () => void; hasWallpaper: boolean;
}) {
  const update = (k: keyof WallpaperFilters, v: number) => onChange({ ...filters, [k]: v });
  const rows: { key: keyof WallpaperFilters; label: string; icon: any; min: number; max: number; step: number; suffix?: string }[] = [
    { key: "brightness", label: "Brightness", icon: Sun,     min: 0.2, max: 1.5, step: 0.05 },
    { key: "blur",       label: "Blur",       icon: Droplets, min: 0,   max: 24,  step: 1, suffix: "px" },
    { key: "saturation", label: "Saturation", icon: Waves,    min: 0,   max: 2,   step: 0.05 },
    { key: "contrast",   label: "Contrast",   icon: Contrast, min: 0.5, max: 1.8, step: 0.05 },
  ];
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="rounded-3xl border p-6" style={{ borderColor: `${themeFg}20`, background: `${themeFg}05`, boxShadow: `0 20px 80px ${themeGlow}20` }}>
        <div className="text-xs uppercase tracking-[0.3em] opacity-60 mb-4">Wallpaper Player</div>
        {rows.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.key} className="mb-5 last:mb-0">
              <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-widest">
                <span className="flex items-center gap-2"><Icon size={12} />{r.label}</span>
                <span className="tabular-nums opacity-70">{filters[r.key].toFixed(r.step < 1 ? 2 : 0)}{r.suffix || ""}</span>
              </div>
              <input type="range" min={r.min} max={r.max} step={r.step} value={filters[r.key]}
                onChange={e => update(r.key, Number(e.target.value))}
                className="w-full accent-current" style={{ color: themeFg }} />
            </div>
          );
        })}
        <button onClick={() => onChange(DEFAULT_FILTERS)}
          className="mt-2 text-[11px] uppercase tracking-widest opacity-60 hover:opacity-100">Reset adjustments</button>
      </div>
      {hasWallpaper && (
        <button onClick={onClear}
          className="w-full rounded-2xl border py-3 text-xs uppercase tracking-widest transition hover:scale-[1.01]"
          style={{ borderColor: `${themeFg}30`, color: themeFg }}>
          Remove wallpaper · use theme background
        </button>
      )}
    </div>
  );
}

function PreviewSheet({ w, themeFg, themeGlow, isFav, filters, related, onSelectRelated, onToggleFav, onShare, onApply, onClose }: {
  w: Wallpaper; themeFg: string; themeGlow: string; isFav: boolean; filters: WallpaperFilters;
  related: Wallpaper[]; onSelectRelated: (w: Wallpaper) => void;
  onToggleFav: () => void; onShare: () => void; onApply: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border animate-fade-in"
        style={{ borderColor: `${themeFg}25`, boxShadow: `0 40px 120px ${themeGlow}40`, background: "#0a0a0a" }}
        onClick={e => e.stopPropagation()}>
        <div className="aspect-[3/4] md:aspect-[16/10] relative bg-black">
          <img src={w.url} alt={w.title} className="w-full h-full object-cover"
            style={{ filter: filterCss(filters) }} />
          <div className="absolute inset-x-0 bottom-0 p-4 flex flex-wrap gap-2 justify-between items-end"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85), transparent)" }}>
            <div className="text-white">
              <div className="text-sm md:text-base font-semibold">{w.title}</div>
              <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1">
                {w.kind === "live" ? "Live · " : ""}{w.orientation} · {w.is4k ? "4K · " : ""}{w.categories.slice(0, 3).join(" / ")}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <a href={w.url} download target="_blank" rel="noreferrer"
                className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border backdrop-blur-md flex items-center gap-2 text-white"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}>
                <Download size={13} /> Download
              </a>
              <button onClick={onShare}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border backdrop-blur-md flex items-center gap-2 text-white"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}>
                <Share2 size={13} /> Share
              </button>
              <button onClick={onToggleFav}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-widest border backdrop-blur-md flex items-center gap-2"
                style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)", color: isFav ? "#ff4d80" : "#fff" }}>
                <Heart size={13} fill={isFav ? "#ff4d80" : "none"} /> {isFav ? "Saved" : "Favorite"}
              </button>
              <button onClick={onApply}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-widest flex items-center gap-2"
                style={{ background: themeFg, color: "#000" }}>
                <Check size={13} /> Set as background
              </button>
            </div>
          </div>
        </div>
        {related.length > 0 && (
          <div className="p-4 md:p-6">
            <div className="text-[11px] uppercase tracking-widest opacity-60 mb-3" style={{ color: themeFg }}>Related</div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {related.map(rw => (
                <button key={rw.id} onClick={() => onSelectRelated(rw)}
                  className="aspect-[2/3] rounded-lg overflow-hidden border hover:scale-[1.03] transition"
                  style={{ borderColor: `${themeFg}20` }}>
                  <img src={rw.thumb} alt={rw.title} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
