import { HandCoins, RotateCcw, Scale, Wrench } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';
import { FAMILY_CONTRIBUTION } from '@/data/upgradePlan';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';

const ICONS = [Wrench, Scale, RotateCcw, HandCoins];

export default function Guarantees() {
  const { t, formatNumber } = useLanguage();

  return (
    <section className="section-shell">
      <Reveal>
        <p className="eyebrow">{t.guarantees.eyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          {t.guarantees.title}
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {t.guarantees.items.map((item, index) => {
          const Icon = ICONS[index] ?? Wrench;
          const text = item.text.includes('{amount}')
            ? interpolate(item.text, { amount: formatNumber(FAMILY_CONTRIBUTION) })
            : item.text;
          return (
            <Reveal key={item.title} delay={index * 100}>
              <div className="glass flex h-full gap-5 rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-success-300/70 dark:hover:border-success-400/30">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-success-100 to-success-300/70 text-success-700 shadow-sm dark:from-success-500/20 dark:to-success-700/20 dark:text-success-300">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}