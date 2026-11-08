import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';
import { SPEED_METRICS } from '@/data/upgradePlan';
import { playSound } from '@/lib/sound';

const MAX_SECONDS = 240;
const STEP = 5;
const TICK_THRESHOLD = 8;

function Panel({ variant }: { variant: 'before' | 'after' }) {
  const isBefore = variant === 'before';
  return (
    <div className={`h-full w-full p-6 md:p-10 ${isBefore ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 dark:from-slate-800 dark:to-slate-900 dark:text-slate-100' : 'bg-gradient-to-br from-success-100 via-accent-100 to-white text-success-700 dark:from-success-700/30 dark:via-primary-800 dark:to-primary-900 dark:text-success-100'}`}>
      <p className="text-lg font-extrabold">{isBefore ? 'Зараз' : 'Після оновлення'}</p>
      <ul className="mt-6 space-y-6">
        {SPEED_METRICS.map((metric) => {
          const data = isBefore ? metric.before : metric.after;
          const width = Math.max(6, Math.min(100, (data.seconds / MAX_SECONDS) * 100));
          return (
            <li key={metric.id}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold">{metric.label}</span>
                <span className="text-xl font-extrabold">{data.text}</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isBefore ? 'bg-gradient-to-r from-slate-500 to-slate-400' : 'bg-gradient-to-r from-success-500 to-accent-500'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm opacity-80">Менша довжина смуги означає швидше.</p>
    </div>
  );
}

export default function BeforeAfterSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const dragging = useRef(false);
  const lastTickPosition = useRef(50);

  const playTick = (next: number) => {
    if (Math.abs(next - lastTickPosition.current) >= TICK_THRESHOLD) {
      playSound('tick');
      lastTickPosition.current = next;
    }
  };

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(next);
    playTick(next);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    playSound('whoosh');
    updateFromClientX(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) updateFromClientX(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      setPosition((value) => {
        const next = Math.max(0, value - STEP);
        playTick(next);
        return next;
      });
    }
    if (event.key === 'ArrowRight') {
      setPosition((value) => {
        const next = Math.min(100, value + STEP);
        playTick(next);
        return next;
      });
    }
    if (event.key === 'Home') {
      setPosition(0);
      playSound('whoosh');
    }
    if (event.key === 'End') {
      setPosition(100);
      playSound('whoosh');
    }
  };

  return (
    <section className="section-shell">
      <Reveal>
        <p className="eyebrow">До і після</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          Перетягніть посередину й подивіться самі
        </h2>
      </Reveal>

      <Reveal delay={120} className="mt-12">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative isolate h-[26rem] touch-none select-none overflow-hidden rounded-[2rem] ring-1 ring-white/60 shadow-card md:h-[24rem] dark:ring-white/10 dark:shadow-card-dark"
        >
          <div className="absolute inset-0">
            <Panel variant="after" />
          </div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
            <Panel variant="before" />
          </div>

          <div
            role="slider"
            tabIndex={0}
            aria-label="Порівняння до і після оновлення"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            onKeyDown={handleKeyDown}
            className="absolute inset-y-0 z-10 flex cursor-ew-resize items-center justify-center"
            style={{ left: `calc(${position}% - 24px)`, width: 48 }}
          >
            <span className="h-full w-1 rounded-full bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]" />
            <span className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-accent-400 text-primary-950 shadow-lg shadow-accent-500/40 ring-4 ring-white/70 transition-transform hover:scale-110 active:scale-95 dark:ring-primary-950/60">
              <ChevronsLeftRight className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
