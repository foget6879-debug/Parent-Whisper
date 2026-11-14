import { useCallback, useEffect, useRef, useState } from 'react';
import { Laptop, Menu, Moon, Settings, Sun, Volume2, VolumeX, X } from 'lucide-react';
import AmbienceControl, { type AmbienceControls } from '@/components/persuade/AmbienceControl';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Theme } from '@/hooks/useTheme';

interface SiteHeaderProps {
  theme: Theme;
  soundEnabled: boolean;
  ambience: AmbienceControls;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export default function SiteHeader({
  theme,
  soundEnabled,
  ambience,
  onToggleTheme,
  onToggleSound,
  onOpenSettings,
}: SiteHeaderProps) {
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '#problem', label: t.header.nav.problem },
    { href: '#options', label: t.header.nav.options },
    { href: '#compare', label: t.header.nav.compare },
    { href: '#questions', label: t.header.nav.questions },
    { href: '#conversation', label: t.header.nav.conversation },
  ];

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  useEscapeKey(closeMobile);

  useEffect(() => {
    if (!mobileOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMobileOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [mobileOpen]);

  const controlClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-primary-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-primary-600 sm:h-11 sm:w-11 dark:border-white/10 dark:bg-white/5 dark:text-accent-300 dark:hover:border-accent-400/60 dark:hover:text-accent-200';

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-3 sm:pt-3 md:px-6 md:pt-5">
      <div
        ref={menuRef}
        className="relative mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/70 px-3 py-2.5 shadow-[0_18px_50px_-24px_rgba(49,46,129,0.45)] backdrop-blur-xl sm:px-4 sm:py-3 md:rounded-[1.35rem] md:px-6 dark:border-white/10 dark:bg-primary-950/70 dark:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <a href="#top" className="group flex min-w-0 items-center gap-2 rounded-xl sm:gap-3" onClick={closeMobile}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-accent-300 shadow-lg shadow-primary-900/25 transition-transform duration-300 group-hover:rotate-6 sm:h-10 sm:w-10">
              <Laptop className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 font-display text-sm font-extrabold leading-tight tracking-tight text-primary-900 sm:text-base dark:text-slate-50">
              <span className="block truncate">{t.header.brand}</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 min-[380px]:block dark:text-slate-400">
                {t.header.tagline}
              </span>
            </span>
          </a>

          <nav
            aria-label={t.header.navAria}
            className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1 text-sm font-semibold md:flex dark:border-white/10 dark:bg-white/5"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <AmbienceControl ambience={ambience} />
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? t.header.soundOn : t.header.soundOff}
              title={soundEnabled ? t.header.soundOn : t.header.soundOff}
              aria-pressed={soundEnabled}
              className={controlClass}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button type="button" onClick={onOpenSettings} aria-label={t.header.settings} className={controlClass}>
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? t.header.themeToLight : t.header.themeToDark}
              aria-pressed={isDark}
              className={controlClass}
            >
              {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? t.header.menuClose : t.header.menuOpen}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className={`${controlClass} md:hidden`}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            id="mobile-nav"
            aria-label={t.header.navAria}
            className="animate-popover-in mt-3 grid gap-1 border-t border-slate-200/70 pt-3 md:hidden dark:border-white/10"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-800 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
