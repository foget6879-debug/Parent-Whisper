const FLOATERS = [
  { id: 'f1', left: '12%', top: '18%', size: 14, duration: 18, delay: -4, drift: 'bg-float-a' },
  { id: 'f2', left: '72%', top: '12%', size: 10, duration: 22, delay: -11, drift: 'bg-float-b' },
  { id: 'f3', left: '28%', top: '62%', size: 18, duration: 26, delay: -7, drift: 'bg-float-c' },
  { id: 'f4', left: '82%', top: '58%', size: 12, duration: 20, delay: -15, drift: 'bg-float-a' },
  { id: 'f5', left: '48%', top: '34%', size: 9, duration: 24, delay: -2, drift: 'bg-float-b' },
  { id: 'f6', left: '58%', top: '78%', size: 16, duration: 28, delay: -19, drift: 'bg-float-c' },
];

/**
 * Minimal, non-distracting gradient/mesh backdrop. Adapts to light/dark.
 */
export default function GradientBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/70 to-sky-50 dark:from-[#070816] dark:via-[#0f1030] dark:to-[#141336]" />
      <div className="bg-blob-drift absolute -top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-700/20" />
      <div
        className="bg-blob-drift-alt absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent-200/35 blur-3xl dark:bg-accent-500/10"
        style={{ animationDelay: '-8s' }}
      />
      <div
        className="bg-blob-drift absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-sky-200/35 blur-3xl dark:bg-indigo-600/15"
        style={{ animationDelay: '-14s', animationDuration: '34s' }}
      />
      <div className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18] [background-image:radial-gradient(rgba(99,102,241,0.18)_1px,transparent_1px)] [background-size:28px_28px]" />

      {FLOATERS.map((item) => (
        <span
          key={item.id}
          className={`absolute rounded-full bg-primary-300/35 blur-[1px] dark:bg-indigo-200/25 ${item.drift}`}
          style={{
            left: item.left,
            top: item.top,
            width: item.size,
            height: item.size,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            boxShadow: '0 0 18px 6px rgba(165, 180, 252, 0.18)',
          }}
        />
      ))}
    </div>
  );
}
