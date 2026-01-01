import { useEffect, useMemo, useRef } from "react";
import { useRainTheme } from "@/hooks/useRainTheme";

type Drop = {
  x: number;
  y: number;
  len: number;
  speed: number;
  thickness: number;
  alpha: number;
  layer: 0 | 1 | 2;
};

const RainBackground = () => {
  const { rainEnabled } = useRainTheme();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dropsRef = useRef<Drop[]>([]);

  const initialDrops = useMemo<Drop[]>(() => {
    const count = 420;
    const next: Drop[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const layer: 0 | 1 | 2 = r < 0.2 ? 0 : r < 0.7 ? 1 : 2; // 0=near, 2=far
      const speedBase = layer === 0 ? 1500 : layer === 1 ? 1100 : 800;
      const lenBase = layer === 0 ? 60 : layer === 1 ? 45 : 28;
      const thickness = layer === 0 ? 1.4 : layer === 1 ? 1.0 : 0.7;
      const alpha = layer === 0 ? 0.18 : layer === 1 ? 0.14 : 0.09;

      next.push({
        x: Math.random(),
        y: Math.random(),
        len: lenBase + Math.random() * (layer === 0 ? 30 : layer === 1 ? 22 : 14),
        speed: speedBase + Math.random() * (layer === 0 ? 800 : layer === 1 ? 500 : 350),
        thickness,
        alpha,
        layer,
      });
    }
    return next;
  }, []);

  useEffect(() => {
    // keep a mutable copy for animation without re-render loops
    dropsRef.current = initialDrops.map((d) => ({ ...d }));
  }, [initialDrops]);

  if (!rainEnabled) return null;

  return (
    <RainCanvas canvasRef={canvasRef} dropsRef={dropsRef} />
  );
};

export default RainBackground;

const RainCanvas = ({
  canvasRef,
  dropsRef,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  dropsRef: React.RefObject<Drop[]>;
}) => {
  const wind = useMemo(() => {
    // Negative = left tilt (similar to reference gif)
    return -0.35;
  }, []);

  const lastTsRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    runningRef.current = true;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const w = window.innerWidth;
      const h = window.innerHeight;
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (ts: number) => {
      if (!runningRef.current) return;
      const { w, h } = sizeRef.current;
      const dt = lastTsRef.current ? Math.min(0.05, (ts - lastTsRef.current) / 1000) : 0.016;
      lastTsRef.current = ts;

      // Fade with slight persistence for motion blur
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, 0, w, h);

      // Mist / haze
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(0, 0, 0, 0.0)");
      g.addColorStop(0.65, "rgba(0, 0, 0, 0.05)");
      g.addColorStop(1, "rgba(0, 0, 0, 0.14)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Rain streaks
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const drops = dropsRef.current;
      for (const d of drops) {
        const x = d.x * w;
        const y = d.y * h;

        const tilt = wind * (d.layer === 0 ? 1.25 : d.layer === 1 ? 1.0 : 0.8);
        const dx = tilt * d.len;
        const dy = d.len;

        ctx.strokeStyle = `rgba(80, 255, 220, ${d.alpha})`;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.stroke();

        // advance
        const speed = d.speed * dt;
        d.y += speed / h;
        d.x += (tilt * speed) / w;

        // wrap
        if (d.y > 1.15) {
          d.y = -0.1 - Math.random() * 0.2;
          d.x = Math.random();
        }
        if (d.x < -0.1) d.x = 1.1;
        if (d.x > 1.1) d.x = -0.1;
      }

      ctx.restore();

      rafRef.current = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    // Start with a dark clear so it reads as rain, not nothing
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      runningRef.current = false;
      window.removeEventListener("resize", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, dropsRef, wind]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-[0.55]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/25" />
    </div>
  );
};
