import { useEffect, useRef } from "react";
import type { Theme } from "../themes";

interface Props { theme: Theme }

export default function ParticleField({ theme }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = window.innerWidth * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const type = theme.particles || "none";
    const w = window.innerWidth, h = window.innerHeight;

    interface P { x: number; y: number; vx: number; vy: number; life: number; size: number; ch?: string }
    let parts: P[] = [];
    const count = type === "matrix" ? 60 : type === "stars" ? 140 : type === "web" ? 80 : type === "grid" ? 0 : 70;

    for (let i = 0; i < count; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: type === "embers" ? -Math.random() * 0.8 - 0.2 : type === "snow" || type === "petals" || type === "matrix" ? Math.random() * 0.8 + 0.2 : (Math.random() - 0.5) * 0.3,
        life: Math.random(),
        size: Math.random() * 2 + 0.5,
        ch: type === "matrix" ? String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)) : undefined,
      });
    }

    let lightningTimer = 0;
    let lightningAlpha = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      if (type === "grid") {
        ctx.strokeStyle = theme.accent + "22";
        ctx.lineWidth = 1;
        const gap = 60;
        const t = Date.now() * 0.0002;
        const offset = (t * gap) % gap;
        for (let x = -gap + offset; x < w; x += gap) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = -gap + offset; y < h; y += gap) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
      }

      if (type === "lightning") {
        lightningTimer--;
        if (lightningTimer <= 0 && Math.random() < 0.008) {
          lightningAlpha = 0.5;
          lightningTimer = 30;
        }
        if (lightningAlpha > 0) {
          ctx.fillStyle = theme.accent + Math.floor(lightningAlpha * 255).toString(16).padStart(2, "0");
          ctx.fillRect(0, 0, w, h);
          lightningAlpha *= 0.85;
        }
      }

      if (type === "web") {
        // draw web threads
        ctx.strokeStyle = theme.fg + "18";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < parts.length; i++) {
          for (let j = i + 1; j < parts.length; j++) {
            const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
            const d = Math.hypot(dx, dy);
            if (d < 120) {
              ctx.globalAlpha = 1 - d / 120;
              ctx.beginPath();
              ctx.moveTo(parts[i].x, parts[i].y);
              ctx.lineTo(parts[j].x, parts[j].y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        if (type === "matrix") {
          ctx.fillStyle = theme.fg;
          ctx.font = "16px 'Share Tech Mono', monospace";
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.003 + p.x) * 0.3;
          ctx.fillText(p.ch || "0", p.x, p.y);
          ctx.globalAlpha = 1;
        } else if (type === "runes") {
          ctx.strokeStyle = theme.accent;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = theme.accent;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [theme]);

  if (!theme.particles || theme.particles === "none") return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
