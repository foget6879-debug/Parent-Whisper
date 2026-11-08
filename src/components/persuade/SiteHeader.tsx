import { Laptop, Moon, Settings, Sun, Volume2, VolumeX } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';

interface SiteHeaderProps {
  theme: Theme;
  soundEnabled: boolean;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

const NAV_ITEMS = [
  { href: '#problem', label: 'Ситуація' },
  { href: '#options', label: 'Варіанти' },
  { href: '#compare', label: 'Порівняння' },
  { href: '#questions', label: 'Питання' },
  { href: '#conversation', label: 'Розмова' },
];

export default function SiteHeader({ theme, soundEnabled, onToggleTheme, onToggleSound, onOpenSettings }: SiteHeaderProps) {
  const isDark = theme === 'dark';
  const controlClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-primary-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-primary-600 dark:border-white/10 dark:bg-white/5 dark:text-accent-300 dark:hover:border-accent-400/60 dark:hover:text-accent-200';

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-5">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[0_18px_50px_-24px_rgba(49,46,129,0.45)] backdrop-blur-xl md:rounded-[1.35rem] md:px-6 dark:border-white/10 dark:bg-primary-950/70 dark:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between gap-4">
          <a href="#top" className="group flex items-center gap-3 rounded-xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-accent-300 shadow-lg shadow-primary-900/25 transition-transform duration-300 group-hover:rotate-6">
              <Laptop className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-extrabold leading-tight tracking-tight text-primary-900 dark:text-slate-50">
              Parent Whisper
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                a calm upgrade plan
              </span>
            </span>
          </a>

          <nav aria-label="Розділи сторінки" className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1 text-sm font-semibold md:flex dark:border-white/10 dark:bg-white/5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
              aria-pressed={soundEnabled}
              className={controlClass}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button type="button" onClick={onOpenSettings} aria-label="Відкрити налаштування" className={controlClass}>
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
              aria-pressed={isDark}
              className={controlClass}
            >
              {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
