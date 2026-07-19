import { useEffect, useRef } from "react";
import type { Theme } from "../themes";

interface Props { theme: Theme }

/**
 * Cinematic silhouette live wallpapers. Original, non-infringing art inspired by
 * iconic hero & anime aesthetics. Pure canvas — offline, GPU-friendly, 60fps.
 */
export default function SceneField({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!theme.scene) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const scene = theme.scene;
    const accent = theme.accent;
    const fg = theme.fg;
    const start = performance.now();

    // Pre-computed structures per scene
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random() * 0.6, s: Math.random() * 1.2 + 0.2, p: Math.random() * Math.PI * 2,
    }));
    const petals = Array.from({ length: 60 }, () => ({
      x: Math.random(), y: Math.random(), vy: Math.random() * 0.0004 + 0.0002,
      vx: (Math.random() - 0.5) * 0.0006, r: Math.random() * Math.PI * 2, s: Math.random() * 6 + 3,
    }));
    const embers = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: 1 + Math.random(), vy: Math.random() * 0.0012 + 0.0005,
      vx: (Math.random() - 0.5) * 0.0004, s: Math.random() * 3 + 1, life: Math.random(),
    }));
    const raindrops = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(), l: Math.random() * 20 + 10, v: Math.random() * 0.02 + 0.015,
    }));
    const bokeh = Array.from({ length: 40 }, () => ({
      x: Math.random(), y: Math.random() * 0.7, r: Math.random() * 40 + 20,
      c: ["#ff00e5", "#ffe600", "#00e5ff", "#ff2a3d"][Math.floor(Math.random() * 4)],
      p: Math.random() * Math.PI * 2,
    }));
    const lanterns = Array.from({ length: 45 }, () => ({
      x: Math.random(), y: 1 + Math.random() * 0.5, vy: Math.random() * 0.0004 + 0.0002,
      sway: Math.random() * Math.PI * 2, s: Math.random() * 8 + 6,
    }));
    const bamboo = Array.from({ length: 22 }, (_, i) => ({
      x: (i + 0.5) / 22 + (Math.random() - 0.5) * 0.02,
      w: Math.random() * 8 + 4, sway: Math.random() * Math.PI * 2,
    }));
    // building silhouettes
    const buildings = Array.from({ length: 30 }, (_, i) => ({
      x: i / 30, w: 1 / 30 + 0.005,
      h: Math.random() * 0.35 + 0.25,
      lights: Array.from({ length: 20 }, () => ({ x: Math.random(), y: Math.random(), on: Math.random() > 0.4 })),
    }));
    // web strands anchors
    const web = Array.from({ length: 6 }, () => ({
      x1: Math.random(), y1: Math.random() * 0.6,
      x2: Math.random(), y2: Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    }));

    // lightning state
    let lightningT = 0, lightningA = 0, lightningBoltPts: {x:number;y:number}[] = [];

    const drawBg = () => {
      ctx.fillStyle = "rgba(0,0,0,0.0)";
      ctx.clearRect(0, 0, W, H);
    };

    const silhouetteCityscape = () => {
      const groundY = H * 0.78;
      // far layer
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      buildings.forEach(b => {
        const h = b.h * H * 0.5;
        ctx.fillRect(b.x * W, groundY - h, b.w * W + 1, h);
      });
      // near layer taller
      ctx.fillStyle = "#000";
      buildings.forEach((b, i) => {
        const h = (b.h + 0.3) * H * 0.65;
        const x = ((b.x * 1.2 + 0.05) % 1) * W;
        ctx.fillRect(x, H - h, b.w * W * 1.6 + 1, h);
        // windows
        ctx.fillStyle = accent + "40";
        b.lights.forEach(l => {
          if (!l.on) return;
          ctx.fillRect(x + l.x * b.w * W * 1.6, H - h + l.y * h, 2 * dpr, 2 * dpr);
        });
        ctx.fillStyle = "#000";
      });
      // ground
      ctx.fillStyle = "#000";
      ctx.fillRect(0, H - 2, W, 2);
    };

    const drawMoon = (x: number, y: number, r: number, color: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, color);
      g.addColorStop(0.3, color + "80");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };

    const drawStars = (alpha = 0.9, t = 0) => {
      stars.forEach(s => {
        const a = alpha * (0.4 + Math.sin(t * 0.002 + s.p) * 0.4 + 0.2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(s.x * W, s.y * H, s.s * dpr, s.s * dpr);
      });
    };

    const draw = () => {
      const t = performance.now() - start;
      drawBg();

      switch (scene) {
        case "web-city": {
          // sky glow
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#3b82f622"); g.addColorStop(1, "transparent");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          drawStars(0.5, t);
          drawMoon(W * 0.82, H * 0.18, 40 * dpr, "#ffb0b8");
          silhouetteCityscape();
          // swinging web strands
          web.forEach(s => {
            const sway = Math.sin(t * 0.0006 + s.phase) * 0.05;
            ctx.strokeStyle = fg + "70";
            ctx.lineWidth = 1.2 * dpr;
            ctx.beginPath();
            ctx.moveTo(s.x1 * W, s.y1 * H);
            ctx.bezierCurveTo(
              (s.x1 + sway) * W, (s.y1 + 0.15) * H,
              (s.x2 - sway) * W, (s.y2 + 0.15) * H,
              s.x2 * W, s.y2 * H
            );
            ctx.stroke();
          });
          // swinging figure silhouette
          const sx = W * (0.5 + Math.sin(t * 0.0005) * 0.35);
          const sy = H * (0.45 + Math.abs(Math.cos(t * 0.0005)) * 0.1);
          ctx.strokeStyle = fg + "60"; ctx.lineWidth = 1 * dpr;
          ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, sy); ctx.stroke();
          ctx.fillStyle = "#000";
          ctx.beginPath(); ctx.arc(sx, sy, 12 * dpr, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(sx - 4 * dpr, sy, 8 * dpr, 22 * dpr);
          break;
        }
        case "slayer-forest": {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#0a1728"); g.addColorStop(1, "#020509");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          drawMoon(W * 0.75, H * 0.22, 60 * dpr, "#e8f4ff");
          // mist
          for (let i = 0; i < 3; i++) {
            const y = H * (0.55 + i * 0.15);
            const mg = ctx.createLinearGradient(0, y - 40 * dpr, 0, y + 60 * dpr);
            mg.addColorStop(0, "transparent"); mg.addColorStop(0.5, "#4a6a9020"); mg.addColorStop(1, "transparent");
            ctx.fillStyle = mg; ctx.fillRect(0, y - 40 * dpr, W, 100 * dpr);
          }
          // bamboo
          bamboo.forEach(b => {
            const sway = Math.sin(t * 0.0008 + b.sway) * 6 * dpr;
            const w = b.w * dpr;
            ctx.fillStyle = "#0a1520";
            ctx.fillRect(b.x * W + sway - w / 2, 0, w, H);
            // segments
            ctx.strokeStyle = accent + "40"; ctx.lineWidth = 1;
            for (let y = 40 * dpr; y < H; y += 80 * dpr) {
              ctx.beginPath(); ctx.moveTo(b.x * W + sway - w, y); ctx.lineTo(b.x * W + sway + w, y); ctx.stroke();
            }
          });
          // water ripple slash arc
          const arcT = (t * 0.0006) % 1;
          if (arcT < 0.5) {
            ctx.strokeStyle = `rgba(200,240,255,${(0.5 - arcT) * 1.6})`;
            ctx.lineWidth = 3 * dpr;
            ctx.beginPath();
            const cx = W / 2, cy = H * 0.6;
            ctx.arc(cx, cy, 200 * dpr * (arcT + 0.3), Math.PI * 1.1, Math.PI * 1.9);
            ctx.stroke();
          }
          break;
        }
        case "flame-hashira": {
          // heat gradient
          const g = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, H);
          g.addColorStop(0, "#ff3d1a55"); g.addColorStop(0.4, "#8a1a0022"); g.addColorStop(1, "transparent");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          // embers
          embers.forEach(e => {
            e.y -= e.vy; e.x += e.vx + Math.sin(t * 0.001 + e.life * 10) * 0.0002;
            if (e.y < -0.05) { e.y = 1.05; e.x = Math.random(); }
            const a = Math.max(0, Math.min(1, e.y * 1.2));
            ctx.fillStyle = `rgba(255,${100 + a * 100},${20 + a * 40},${0.9 - a * 0.7})`;
            ctx.beginPath(); ctx.arc(e.x * W, e.y * H, e.s * dpr, 0, Math.PI * 2); ctx.fill();
          });
          // flame silhouette at bottom
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.moveTo(0, H);
          for (let x = 0; x <= W; x += 20 * dpr) {
            const y = H - (60 + Math.sin(x * 0.01 + t * 0.003) * 20 + Math.sin(x * 0.03 + t * 0.005) * 15) * dpr;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
          break;
        }
        case "thunder-breath": {
          drawStars(0.4, t);
          // clouds
          for (let i = 0; i < 5; i++) {
            const y = H * (0.15 + i * 0.05);
            const cg = ctx.createRadialGradient(W / 2, y, 0, W / 2, y, W * 0.6);
            cg.addColorStop(0, "#1a2050aa"); cg.addColorStop(1, "transparent");
            ctx.fillStyle = cg; ctx.fillRect(0, y - 60 * dpr, W, 120 * dpr);
          }
          // lightning strike
          lightningT--;
          if (lightningT <= 0 && Math.random() < 0.012) {
            lightningT = 25; lightningA = 1;
            let x = W * (0.2 + Math.random() * 0.6); let y = 0;
            lightningBoltPts = [{ x, y }];
            while (y < H * 0.7) {
              x += (Math.random() - 0.5) * 60 * dpr;
              y += 30 * dpr + Math.random() * 30 * dpr;
              lightningBoltPts.push({ x, y });
            }
          }
          if (lightningA > 0) {
            ctx.fillStyle = `rgba(255,240,180,${lightningA * 0.15})`;
            ctx.fillRect(0, 0, W, H);
            ctx.strokeStyle = `rgba(255,255,220,${lightningA})`;
            ctx.lineWidth = 3 * dpr;
            ctx.shadowColor = accent; ctx.shadowBlur = 20 * dpr;
            ctx.beginPath();
            lightningBoltPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.stroke();
            ctx.shadowBlur = 0;
            lightningA *= 0.86;
          }
          // horizon silhouette
          ctx.fillStyle = "#000";
          ctx.beginPath(); ctx.moveTo(0, H);
          for (let x = 0; x <= W; x += 40 * dpr) {
            ctx.lineTo(x, H * 0.75 + Math.sin(x * 0.005) * 20 * dpr);
          }
          ctx.lineTo(W, H); ctx.fill();
          break;
        }
        case "neon-tokyo": {
          // wet street reflection gradient
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#1a0033"); g.addColorStop(0.7, "#000018"); g.addColorStop(1, "#0a0020");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          // bokeh
          bokeh.forEach(b => {
            const bx = (b.x + Math.sin(t * 0.0002 + b.p) * 0.02) * W;
            const by = (b.y + Math.cos(t * 0.0003 + b.p) * 0.01) * H;
            const rg = ctx.createRadialGradient(bx, by, 0, bx, by, b.r * dpr);
            rg.addColorStop(0, b.c + "80"); rg.addColorStop(1, "transparent");
            ctx.fillStyle = rg;
            ctx.beginPath(); ctx.arc(bx, by, b.r * dpr, 0, Math.PI * 2); ctx.fill();
          });
          silhouetteCityscape();
          // rain
          ctx.strokeStyle = "#a5f3fc80"; ctx.lineWidth = 1;
          raindrops.forEach(r => {
            r.y += r.v; r.x -= r.v * 0.3;
            if (r.y > 1) { r.y = -0.05; r.x = Math.random(); }
            if (r.x < 0) r.x = 1;
            ctx.beginPath();
            ctx.moveTo(r.x * W, r.y * H);
            ctx.lineTo(r.x * W - 4 * dpr, r.y * H + r.l * dpr);
            ctx.stroke();
          });
          break;
        }
        case "sakura-duel": {
          const g = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, W);
          g.addColorStop(0, "#3a0a2255"); g.addColorStop(1, "#08020a");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          drawMoon(W * 0.7, H * 0.2, 55 * dpr, "#f472b6");
          // distant trees
          ctx.fillStyle = "#1a0510";
          for (let i = 0; i < 15; i++) {
            const x = (i / 15) * W;
            ctx.beginPath(); ctx.arc(x, H * 0.75, 60 * dpr + (i % 3) * 20 * dpr, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = "#000"; ctx.fillRect(0, H * 0.78, W, H * 0.22);
          // petals swirling
          petals.forEach(p => {
            p.y += p.vy + Math.sin(t * 0.001 + p.r) * 0.0003;
            p.x += p.vx + Math.cos(t * 0.0008 + p.r) * 0.0006;
            if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
            if (p.x > 1.05) p.x = -0.05; if (p.x < -0.05) p.x = 1.05;
            ctx.fillStyle = accent + "cc";
            ctx.save();
            ctx.translate(p.x * W, p.y * H);
            ctx.rotate(t * 0.001 + p.r);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.s * dpr, p.s * dpr * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
          // katana gleam
          const gleamT = (t * 0.0004) % 1;
          if (gleamT < 0.4) {
            ctx.strokeStyle = `rgba(255,255,255,${(0.4 - gleamT) * 2})`;
            ctx.lineWidth = 4 * dpr;
            ctx.shadowColor = "#fff"; ctx.shadowBlur = 20 * dpr;
            ctx.beginPath();
            ctx.moveTo(W * 0.2, H * 0.75);
            ctx.lineTo(W * 0.8, H * 0.4);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          break;
        }
        case "ninja-village": {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#2a0508"); g.addColorStop(1, "#08020a");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          drawMoon(W * 0.5, H * 0.22, 90 * dpr, "#ff3d3d");
          drawStars(0.35, t);
          // pagoda rooftops
          ctx.fillStyle = "#000";
          for (let i = 0; i < 5; i++) {
            const cx = W * (0.1 + i * 0.2);
            const baseY = H * 0.75;
            for (let tier = 0; tier < 3; tier++) {
              const tw = 120 * dpr - tier * 30 * dpr;
              const ty = baseY - tier * 40 * dpr;
              ctx.beginPath();
              ctx.moveTo(cx - tw, ty);
              ctx.lineTo(cx, ty - 20 * dpr);
              ctx.lineTo(cx + tw, ty);
              ctx.lineTo(cx + tw - 10 * dpr, ty + 8 * dpr);
              ctx.lineTo(cx - tw + 10 * dpr, ty + 8 * dpr);
              ctx.closePath(); ctx.fill();
            }
          }
          ctx.fillRect(0, H * 0.78, W, H * 0.22);
          break;
        }
        case "titan-wall": {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#2a1f0a"); g.addColorStop(1, "#0a0702");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          // sun
          drawMoon(W * 0.5, H * 0.35, 70 * dpr, "#f5cf6a");
          // wall
          ctx.fillStyle = "#0a0603";
          ctx.fillRect(0, H * 0.55, W, H * 0.45);
          // brick lines
          ctx.strokeStyle = "#2a1a0a"; ctx.lineWidth = 1;
          for (let y = H * 0.55; y < H; y += 24 * dpr) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
          }
          // colossal silhouette rising
          const rise = Math.sin(t * 0.0003) * 20 * dpr;
          ctx.fillStyle = "#000";
          const bx = W * 0.5, by = H * 0.55 + rise;
          ctx.beginPath();
          ctx.arc(bx, by - 90 * dpr, 60 * dpr, 0, Math.PI * 2); // head
          ctx.fill();
          ctx.fillRect(bx - 100 * dpr, by - 40 * dpr, 200 * dpr, 200 * dpr); // torso
          // birds
          for (let i = 0; i < 8; i++) {
            const bxx = ((t * 0.05 + i * 200 * dpr) % (W + 200 * dpr)) - 100 * dpr;
            const byy = H * 0.25 + Math.sin(t * 0.002 + i) * 10 * dpr;
            ctx.strokeStyle = "#000"; ctx.lineWidth = 1.5 * dpr;
            ctx.beginPath();
            ctx.moveTo(bxx - 8 * dpr, byy); ctx.quadraticCurveTo(bxx, byy - 4 * dpr, bxx + 8 * dpr, byy);
            ctx.stroke();
          }
          break;
        }
        case "mecha-hangar": {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#001a2a"); g.addColorStop(1, "#000508");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          // perspective grid floor
          ctx.strokeStyle = accent + "55"; ctx.lineWidth = 1;
          const horizonY = H * 0.55;
          const offset = (t * 0.05) % 40;
          for (let i = 0; i < 20; i++) {
            const y = horizonY + Math.pow(i / 20, 2) * (H - horizonY) + offset * (i / 20);
            if (y > H) continue;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
          }
          for (let x = -10; x <= 10; x++) {
            ctx.beginPath();
            ctx.moveTo(W / 2, horizonY);
            ctx.lineTo(W / 2 + x * W * 0.15, H);
            ctx.stroke();
          }
          // mecha silhouette pulse
          const pulse = 0.7 + Math.sin(t * 0.003) * 0.3;
          ctx.shadowColor = accent; ctx.shadowBlur = 30 * dpr * pulse;
          ctx.fillStyle = "#000";
          const mx = W / 2, my = H * 0.5;
          ctx.fillRect(mx - 40 * dpr, my - 100 * dpr, 80 * dpr, 60 * dpr); // head
          ctx.fillRect(mx - 70 * dpr, my - 40 * dpr, 140 * dpr, 120 * dpr); // body
          ctx.fillRect(mx - 100 * dpr, my - 30 * dpr, 30 * dpr, 100 * dpr); // l arm
          ctx.fillRect(mx + 70 * dpr, my - 30 * dpr, 30 * dpr, 100 * dpr); // r arm
          ctx.shadowBlur = 0;
          // eye glow
          ctx.fillStyle = accent;
          ctx.fillRect(mx - 20 * dpr, my - 80 * dpr, 40 * dpr, 6 * dpr);
          break;
        }
        case "spirit-lanterns": {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, "#0a0018"); g.addColorStop(1, "#000");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          drawStars(0.4, t);
          // distant mountains
          ctx.fillStyle = "#0a0510";
          ctx.beginPath(); ctx.moveTo(0, H * 0.7);
          for (let x = 0; x <= W; x += 60 * dpr) {
            ctx.lineTo(x, H * 0.7 - Math.abs(Math.sin(x * 0.003)) * 60 * dpr);
          }
          ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
          // lanterns
          lanterns.forEach(l => {
            l.y -= l.vy;
            if (l.y < -0.1) { l.y = 1.1; l.sway = Math.random() * Math.PI * 2; }
            const sway = Math.sin(t * 0.001 + l.sway) * 0.02;
            const lx = (l.x + sway) * W;
            const ly = l.y * H;
            const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, l.s * 4 * dpr);
            glow.addColorStop(0, accent + "cc"); glow.addColorStop(0.4, accent + "55"); glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(lx, ly, l.s * 4 * dpr, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffb46a";
            ctx.beginPath(); ctx.arc(lx, ly, l.s * dpr, 0, Math.PI * 2); ctx.fill();
          });
          break;
        }
      }

      // subtle vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.75);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [theme]);

  if (!theme.scene) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
