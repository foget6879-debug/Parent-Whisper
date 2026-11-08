import { ArrowDown, BadgeCheck, Timer, Wallet } from 'lucide-react';
import Hero3D from '@/components/persuade/Hero3D';
import RippleButton from '@/components/persuade/RippleButton';
import Reveal from '@/components/persuade/Reveal';
import { SPEED_METRICS, UPGRADE_PRICES } from '@/data/upgradePlan';

const HERO_STATS = [
  { icon: Wallet, value: `від ${UPGRADE_PRICES.minimal.toLocaleString('uk-UA')} грн`, label: 'старт оновлення' },
  { icon: Timer, value: `${SPEED_METRICS[0].before.text} → ${SPEED_METRICS[0].after.text}`, label: 'запуск ноутбука' },
  { icon: BadgeCheck, value: '0 ризику', label: 'порівнюємо перед покупкою' },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 right-[-6rem] h-[26rem] w-[26rem] rounded-full bg-accent-300/25 blur-3xl dark:bg-accent-500/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-primary-300/40 blur-3xl dark:bg-primary-600/25" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/20" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-14 md:grid-cols-[1.05fr_0.95fr] md:pb-28 md:pt-24">
        <Reveal>
          <p className="eyebrow">Спокійна розмова для всієї родини</p>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] text-primary-900 md:text-6xl dark:text-slate-50">
            Мамо, тату, давайте поговоримо про <span className="text-gradient">швидший ноутбук</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl text-slate-600 dark:text-slate-300">
            Невелике оновлення за {UPGRADE_PRICES.optimal.toLocaleString('uk-UA')} грн зробить щоденну роботу спокійнішою,
            і ноутбук ще довго служитиме нам.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <RippleButton href="#conversation">Поговорімо про це</RippleButton>
            <RippleButton href="#problem" variant="secondary">
              Як це виглядає зараз
              <ArrowDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden="true" />
            </RippleButton>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {HERO_STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5"
                >
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Icon className="h-4 w-4 text-accent-600 dark:text-accent-300" aria-hidden="true" />
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-lg font-bold text-primary-800 dark:text-slate-50">{stat.value}</dd>
                </div>
              );
            })}
          </dl>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative">
            <div className="absolute inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary-400/30 via-violet-400/20 to-accent-300/30 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white/40 p-4 shadow-card backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-card-dark">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/80 to-transparent" aria-hidden="true" />
              <Hero3D />
              <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">План оновлення 2026</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
                  активно
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
