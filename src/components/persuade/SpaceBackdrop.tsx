import { useMemo } from 'react';

interface Star {
  key: string;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  bright: boolean;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(count: number, seed: number): Star[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, (_, index) => ({
    key: `s-${seed}-${index}`,
    left: random() * 100,
    top: random() * 100,
    size: 1 + random() * 2.2,
    delay: random() * 8,
    duration: 3 + random() * 6,
    bright: random() > 0.85,
  }));
}

export default function SpaceBackdrop() {
  const stars = useMemo(() => generateStars(140, 4242), []);
  const dust = useMemo(() => generateStars(40, 9191), []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Sky base */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-indigo-50 to-slate-100 dark:from-[#020617] dark:via-[#0b0720] dark:to-[#020617] transition-colors duration-500" />

      {/* Nebula / atmosphere */}
      <div className="bg-nebula-drift absolute -top-32 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl dark:bg-fuchsia-700/15" />
      <div
        className="bg-nebula-drift-alt absolute top-1/3 -left-24 h-[26rem] w-[26rem] rounded-full bg-sky-200/35 blur-3xl dark:bg-indigo-600/20"
        style={{ animationDelay: '-10s' }}
      />
      <div
        className="bg-nebula-drift absolute bottom-[-8rem] right-[-6rem] h-[30rem] w-[30rem] rounded-full bg-violet-200/30 blur-3xl dark:bg-cyan-500/10"
        style={{ animationDelay: '-18s', animationDuration: '42s' }}
      />

      {/* Subtle sun glow in light mode / deep glow in dark */}
      <div className="absolute top-[12%] right-[14%] h-40 w-40 rounded-full bg-white/70 blur-2xl opacity-80 dark:opacity-0 transition-opacity duration-500" />
      <div className="absolute top-[10%] right-[12%] h-28 w-28 rounded-full bg-indigo-400/20 blur-3xl opacity-0 dark:opacity-60 transition-opacity duration-500" />

      {/* Stars (prominent in dark, faint in light) */}
      <div className="absolute inset-0 opacity-30 dark:opacity-100 transition-opacity duration-500">
        {stars.map((star) => (
          <span
            key={star.key}
            className="absolute rounded-full bg-slate-500 dark:bg-slate-100"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.bright ? 0.95 : 0.55,
              boxShadow: star.bright ? '0 0 6px 1px rgba(255,255,255,0.35)' : 'none',
              animation: `star-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Extra dust/glow points for dark nebula depth */}
      <div className="absolute inset-0 opacity-0 dark:opacity-70 transition-opacity duration-500">
        {dust.map((star) => (
          <span
            key={star.key}
            className="absolute rounded-full bg-indigo-200"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${Math.max(1, star.size - 0.5)}px`,
              height: `${Math.max(1, star.size - 0.5)}px`,
              opacity: 0.35,
              filter: 'blur(0.5px)',
              animation: `star-twinkle ${star.duration + 2}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Occasional shooting stars */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-500">
        <span className="bg-shooting-star bg-shooting-star--a" />
        <span className="bg-shooting-star bg-shooting-star--b" />
        <span className="bg-shooting-star bg-shooting-star--c" />
      </div>
    </div>
  );
}
