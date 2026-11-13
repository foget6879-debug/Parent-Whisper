import { useEffect, useRef } from 'react';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
}

/**
 * A soft glowing "firefly" that wanders freely and gravitates toward the cursor area.
 * Purely decorative, pointer-events none, disabled for reduced motion.
 */
export default function CursorFirefly() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let x = width * 0.5;
    let y = height * 0.35;
    let vx = 0.6;
    let vy = -0.3;
    let targetX = x;
    let targetY = y;
    let hasPointer = false;
    let wanderAngle = Math.random() * Math.PI * 2;
    let raf = 0;
    let visible = false;

    const show = () => {
      if (visible) return;
      visible = true;
      el.style.opacity = '1';
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      targetX = event.clientX;
      targetY = event.clientY;
      hasPointer = hasFinePointer();
      show();
    };

    const onPointerLeave = () => {
      hasPointer = false;
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
    };

    const onVisibility = () => {
      if (!document.hidden && !raf) raf = window.requestAnimationFrame(tick);
    };

    const tick = () => {
      if (document.hidden) {
        raf = 0;
        return;
      }

      // Wander: slowly drifting heading
      wanderAngle += (Math.random() - 0.5) * 0.18;
      const wanderX = Math.cos(wanderAngle) * 0.22;
      const wanderY = Math.sin(wanderAngle) * 0.22;

      // Attraction toward cursor (or idle drift target)
      const tx = hasPointer ? targetX : width * 0.5 + Math.cos(wanderAngle * 0.7) * width * 0.18;
      const ty = hasPointer ? targetY : height * 0.35 + Math.sin(wanderAngle * 0.9) * height * 0.12;
      const dx = tx - x;
      const dy = ty - y;
      const dist = Math.hypot(dx, dy) || 1;

      // Gravitate when far, ease off when near so it orbits/floats around the cursor area
      const pull = hasPointer ? Math.min(dist * 0.0022, 0.18) : 0.03;
      let ax = (dx / dist) * pull + wanderX;
      let ay = (dy / dist) * pull + wanderY;

      // Gentle orbiting swirl around cursor when close
      if (hasPointer && dist < 220) {
        const swirl = (1 - dist / 220) * 0.06;
        ax += (-dy / dist) * swirl;
        ay += (dx / dist) * swirl;
      }

      vx = (vx + ax) * 0.965;
      vy = (vy + ay) * 0.965;

      const speed = Math.hypot(vx, vy);
      const maxSpeed = hasPointer ? 3.2 : 1.4;
      if (speed > maxSpeed) {
        vx = (vx / speed) * maxSpeed;
        vy = (vy / speed) * maxSpeed;
      }

      x += vx;
      y += vy;

      // Soft bounds
      const pad = 40;
      if (x < -pad) x = width + pad;
      if (x > width + pad) x = -pad;
      if (y < -pad) y = height + pad;
      if (y > height + pad) y = -pad;

      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (!visible) show();
      raf = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-28 w-28 opacity-0 transition-opacity duration-700 will-change-transform"
      style={{ transform: 'translate3d(-200px, -200px, 0) translate(-50%, -50%)' }}
    >
      <div className="absolute inset-0 rounded-full bg-accent-300/20 blur-2xl dark:bg-accent-400/25" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-300/25 blur-xl dark:bg-indigo-300/20" />
      <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-[0_0_18px_6px_rgba(165,180,252,0.55)] dark:bg-amber-100/90 dark:shadow-[0_0_18px_6px_rgba(253,230,138,0.5)]" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
    </div>
  );
}
