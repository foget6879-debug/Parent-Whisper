import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Building2,
  CloudRain,
  Coffee,
  MoonStar,
  Pause,
  Play,
  Volume1,
  Volume2,
  VolumeX,
  Waves,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AMBIENCE_SCENES, type AmbienceScene } from '@/lib/ambience';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';

export interface AmbienceControls {
  scene: AmbienceScene;
  enabled: boolean;
  active: boolean;
  volume: number;
  setScene: (scene: AmbienceScene) => void;
  setVolume: (volume: number) => void;
  toggle: () => void;
}

interface AmbienceControlProps {
  ambience: AmbienceControls;
}

const SCENE_ICONS: Record<AmbienceScene, LucideIcon> = {
  city: Building2,
  rain: CloudRain,
  cafe: Coffee,
  night: MoonStar,
};

const controlClass =
  'relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-primary-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-400 hover:text-primary-600 sm:h-11 sm:w-11 dark:border-white/10 dark:bg-white/5 dark:text-accent-300 dark:hover:border-accent-400/60 dark:hover:text-accent-200';

export default function AmbienceControl({ ambience }: AmbienceControlProps) {
  const { t } = useLanguage();
  const { scene, enabled, active, volume, setScene, setVolume, toggle } = ambience;
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useEscapeKey(close);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const activeSceneText = t.ambience.scenes[scene];
  const VolumeIcon = !enabled || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={enabled ? interpolate(t.ambience.configure, { label: activeSceneText.label }) : t.ambience.open}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={t.ambience.tooltip}
        className={controlClass}
      >
        <Waves className="h-5 w-5" aria-hidden="true" />
        {active && (
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500 shadow-[0_0_0_3px_rgba(132,204,22,0.25)] animate-pulse"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t.ambience.title}
          className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[21rem] max-w-[calc(100vw-2rem)] animate-popover-in rounded-3xl border border-white/70 bg-white/95 p-5 text-left shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/95"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-base font-extrabold text-primary-900 dark:text-slate-50">{t.ambience.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.ambience.hint}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={toggle}
                aria-pressed={enabled}
                aria-label={enabled ? t.ambience.pause : t.ambience.play}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-800 text-accent-300 transition-colors hover:bg-primary-700 dark:bg-accent-400 dark:text-primary-950 dark:hover:bg-accent-300"
              >
                {enabled ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={close}
                aria-label={t.ambience.close}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label={t.ambience.group}>
            {AMBIENCE_SCENES.map((item) => {
              const Icon = SCENE_ICONS[item.id];
              const isActive = enabled && scene === item.id;
              const sceneText = t.ambience.scenes[item.id];

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScene(item.id)}
                  aria-pressed={isActive}
                  className={`rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 ${
                    isActive
                      ? 'border-accent-400/80 bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-lg shadow-primary-900/25'
                      : 'border-slate-200/80 bg-white/70 text-slate-700 hover:border-primary-300 hover:bg-primary-50/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-accent-400/40 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-accent-300' : 'text-primary-600 dark:text-accent-300'}`} aria-hidden="true" />
                  <span className="mt-2 block text-sm font-bold">{sceneText.label}</span>
                  <span className={`mt-0.5 block text-[11px] leading-snug ${isActive ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {sceneText.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <VolumeIcon className="h-4 w-4" aria-hidden="true" />
                {t.ambience.volume}
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
              aria-label={t.ambience.volumeAria}
              className="mt-3 w-full cursor-pointer"
            />
          </div>

          <p role="status" aria-live="polite" className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {enabled ? (
              active ? (
                <>
                  <span className="ambience-bars text-accent-500" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  {interpolate(t.ambience.nowPlaying, { label: activeSceneText.label })}
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" aria-hidden="true" />
                  {t.ambience.tapToHear}
                </>
              )
            ) : (
              t.ambience.muted
            )}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-slate-400 dark:text-slate-500">{t.ambience.note}</p>
        </div>
      )}
    </div>
  );
}