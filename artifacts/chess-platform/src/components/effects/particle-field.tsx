import { useEffect, useRef } from "react";

const PIECES = ["♟", "♞", "♜", "♝", "♛", "♚", "♙", "♘", "♖", "♗", "♕", "♔"];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  opacity: number;
  targetOpacity: number;
  size: number;
  char: string;
  rotation: number;
  vr: number;
  phase: number;
}

function makeParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: -(Math.random() * 0.2 + 0.05),
    opacity: 0,
    targetOpacity: Math.random() * 0.045 + 0.015,
    size: Math.random() * 28 + 14,
    char: PIECES[Math.floor(Math.random() * PIECES.length)],
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.004,
    phase: Math.random() * Math.PI * 2,
  };
}

export function ParticleField({ count = 22 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const particles: Particle[] = Array.from({ length: count }, () => makeParticle(w, h));
    let raf: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.005;

      for (const p of particles) {
        p.x += p.vx + Math.sin(t + p.phase) * 0.12;
        p.y += p.vy;
        p.rotation += p.vr;
        p.opacity += (p.targetOpacity - p.opacity) * 0.015;

        if (p.y < -60) { Object.assign(p, makeParticle(w, h)); p.y = h + 40; }
        if (p.x < -60) p.x = w + 40;
        if (p.x > w + 60) p.x = -40;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = "#C9A84C";
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, 0, 0);
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
