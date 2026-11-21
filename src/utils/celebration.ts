/**
 * Lightweight zero-dependency Studio Pastel Confetti & Haptic Feedback utilities.
 * Respects `prefers-reduced-motion` and cleans up its overlay canvas automatically.
 */

export function triggerHaptic(kind: 'light' | 'success' | 'celebrate' = 'light'): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    if (kind === 'light') {
      navigator.vibrate(10);
    } else if (kind === 'success') {
      navigator.vibrate([12, 35, 16]);
    } else {
      navigator.vibrate([18, 40, 22, 40, 30]);
    }
  } catch {
    // ignore on unsupported devices
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'ribbon' | 'heart';
  alpha: number;
  life: number;
  maxLife: number;
}

const PASTEL_COLORS = [
  '#F28AA4', // pastel rose
  '#A68DE8', // pastel lavender
  '#7BD8BE', // pastel mint
  '#FFE082', // butter pastel yellow
  '#8CC4F8', // sky pastel
  '#F7AC97', // sweet peach
  '#FFD1DC', // cotton pink
  '#B8E4C9', // pistachio
];

function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size * 0.6;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(s * 0.5, -s * 0.45, s * 1.25, s * 0.15, 0, s * 1.05);
  ctx.bezierCurveTo(-s * 1.25, s * 0.15, -s * 0.5, -s * 0.45, 0, s * 0.35);
  ctx.fill();
}

export function launchPastelConfetti(variant: 'celebration' | 'hearts' = 'celebration'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const count = variant === 'hearts' ? 42 : 68;
  const originX = width * 0.5;
  const originY = variant === 'hearts' ? height * 0.36 : height * 0.28;

  const particles: Particle[] = Array.from({ length: count }, (_, idx) => {
    const angle = (Math.PI * 2 * idx) / count + (Math.random() - 0.5) * 0.4;
    const speed = (variant === 'hearts' ? 3.2 : 4.2) + Math.random() * 5.2;
    const shapes: Particle['shape'][] =
      variant === 'hearts' ? ['heart', 'heart', 'circle'] : ['ribbon', 'circle', 'heart'];
    return {
      x: originX + (Math.random() - 0.5) * 90,
      y: originY + (Math.random() - 0.5) * 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3.6,
      size: (variant === 'hearts' ? 7 : 6) + Math.random() * 5,
      color: PASTEL_COLORS[idx % PASTEL_COLORS.length],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.16,
      shape: shapes[idx % shapes.length],
      alpha: 1,
      life: 0,
      maxLife: 78 + Math.random() * 38,
    };
  });

  let rafId = 0;

  const step = () => {
    ctx.clearRect(0, 0, width, height);
    let alive = 0;

    for (const p of particles) {
      p.life += 1;
      if (p.life >= p.maxLife) continue;
      alive += 1;

      p.vx *= 0.985;
      p.vy += 0.14; // gentle pastel gravity
      p.x += p.vx + Math.sin(p.life * 0.09) * 0.35;
      p.y += p.vy;
      p.rotation += p.vRot;
      const progress = p.life / p.maxLife;
      p.alpha = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.size * 0.6, -p.size * 0.25, p.size * 1.2, p.size * 0.5);
      } else {
        drawHeart(ctx, p.size);
      }
      ctx.restore();
    }

    if (alive > 0) {
      rafId = window.requestAnimationFrame(step);
    } else {
      window.cancelAnimationFrame(rafId);
      canvas.remove();
    }
  };

  rafId = window.requestAnimationFrame(step);
}
