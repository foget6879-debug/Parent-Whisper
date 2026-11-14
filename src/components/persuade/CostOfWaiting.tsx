import { CalendarDays, CalendarClock, CalendarRange, Hourglass } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';
import { useLanguage } from '@/i18n/LanguageContext';

const ICONS = [CalendarDays, CalendarRange, CalendarClock, Hourglass];

export default function CostOfWaiting() {
  const { t } = useLanguage();

  return (
    <section className="section-shell">
      <Reveal>
        <p className="eyebrow">{t.costOfWaiting.eyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          {t.costOfWaiting.title}
        </h2>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{t.costOfWaiting.intro}</p>
      </Reveal>

      <div className="relative mt-12">
        <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-accent-400 via-primary-400 to-violet-400 md:block dark:from-accent-500/60 dark:via-primary-500/60 dark:to-violet-500/60" aria-hidden="true" />
        <ol className="grid gap-6 md:grid-cols-4">
          {t.costOfWaiting.steps.map((step, index) => {
            const Icon = ICONS[index] ?? CalendarDays;
            return (
              <li key={step.when}>
                <Reveal delay={index * 120}>
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/70 bg-gradient-to-br from-accent-300 to-accent-500 text-primary-950 shadow-lg shadow-accent-500/30 dark:border-white/10 dark:from-accent-400 dark:to-accent-600">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold text-slate-900 dark:text-slate-100">{step.when}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{step.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}