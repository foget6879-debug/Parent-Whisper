import { CalendarDays, CalendarClock, CalendarRange, Hourglass } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';

const TIMELINE = [
  {
    icon: CalendarDays,
    when: 'Через місяць',
    text: 'Ті самі хвилини на кожен запуск і кожне відкриття. Звична незручність починає здаватися нормою.',
  },
  {
    icon: CalendarRange,
    when: 'Через пів року',
    text: 'Більше вкладок, більше програм, більше очікування. Робота, навчання чи листування займають дедалі більше часу.',
  },
  {
    icon: CalendarClock,
    when: 'Через рік',
    text: 'Система стає менш стабільною. Одна несподівана поломка може коштувати дорожче, ніж планове оновлення.',
  },
  {
    icon: Hourglass,
    when: 'Через два роки',
    text: 'Коли ноутбук відмовить, доведеться терміново шукати заміну. Вибирати спокійно вже не вийде.',
  },
];

export default function CostOfWaiting() {
  return (
    <section className="section-shell">
      <Reveal>
        <p className="eyebrow">Ціна бездіяльності</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          Що буде, якщо нічого не робити
        </h2>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
          Нічого поганого не станеться відразу. Просто щодня трохи більше часу йтиме на очікування.
        </p>
      </Reveal>

      <div className="relative mt-12">
        <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-accent-400 via-primary-400 to-violet-400 md:block dark:from-accent-500/60 dark:via-primary-500/60 dark:to-violet-500/60" aria-hidden="true" />
        <ol className="grid gap-6 md:grid-cols-4">
          {TIMELINE.map((step, index) => {
            const Icon = step.icon;
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
