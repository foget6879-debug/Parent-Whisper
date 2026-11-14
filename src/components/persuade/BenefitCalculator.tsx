import { useState } from 'react';
import Reveal from '@/components/persuade/Reveal';
import { CALCULATOR_DEFAULTS } from '@/data/upgradePlan';
import { useLanguage } from '@/i18n/LanguageContext';

interface Assumptions {
  price: number;
  hoursPerWeek: number;
  sharePercent: number;
  valuePerHour: number;
  repairAvoidedPerYear: number;
}

interface FieldConfig {
  key: keyof Assumptions;
  labelKey: 'price' | 'hours' | 'share' | 'value' | 'repair';
  min: number;
  max: number;
  step: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'price', labelKey: 'price', min: 0, max: 50000, step: 100 },
  { key: 'hoursPerWeek', labelKey: 'hours', min: 0, max: 40, step: 0.5 },
  { key: 'sharePercent', labelKey: 'share', min: 0, max: 100, step: 5 },
  { key: 'valuePerHour', labelKey: 'value', min: 0, max: 1000, step: 10 },
  { key: 'repairAvoidedPerYear', labelKey: 'repair', min: 0, max: 20000, step: 100 },
];

function toNumber(raw: string): number {
  const parsed = Number(raw.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export default function BenefitCalculator() {
  const { t, formatNumber } = useLanguage();
  const [values, setValues] = useState<Assumptions>({ ...CALCULATOR_DEFAULTS });

  const yearlyTimeValue = values.hoursPerWeek * 52 * (values.sharePercent / 100) * values.valuePerHour;
  const yearlyValue = yearlyTimeValue + values.repairAvoidedPerYear;
  const monthlyValue = yearlyValue / 12;
  const paybackMonths = monthlyValue > 0 ? values.price / monthlyValue : null;

  const update = (key: keyof Assumptions, raw: string) => {
    setValues((current) => ({ ...current, [key]: toNumber(raw) }));
  };

  const currency = t.currency;

  return (
    <section className="section-shell">
      <Reveal>
        <p className="eyebrow">{t.calculator.eyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          {t.calculator.title}
        </h2>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">{t.calculator.intro}</p>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <form className="glass grid gap-6 rounded-3xl p-6 md:p-8" onSubmit={(event) => event.preventDefault()}>
            {FIELDS.map((field) => {
              const id = `calc-${field.key}`;
              const cfg = t.calculator.fields[field.labelKey];
              return (
                <div key={field.key}>
                  <label htmlFor={id} className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {cfg.label}
                  </label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{cfg.hint}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      id={id}
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={values[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                      className="h-2 w-full cursor-pointer"
                    />
                    <div className="flex w-36 shrink-0 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 transition-shadow focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-200/60 dark:border-white/15 dark:bg-primary-950/60 dark:focus-within:border-accent-400/60 dark:focus-within:ring-accent-500/10">
                      <input
                        type="number"
                        aria-label={`${cfg.label}, ${cfg.unit}`}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={values[field.key]}
                        onChange={(event) => update(field.key, event.target.value)}
                        className="w-full bg-transparent text-right text-lg font-semibold text-slate-900 outline-none dark:text-slate-100"
                      />
                      <span className="text-sm text-slate-500 dark:text-slate-400">{cfg.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </form>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-2">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-8 text-white panel-glow dark:from-primary-900 dark:via-primary-800 dark:to-primary-950">
            <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-accent-400/25 blur-3xl" aria-hidden="true" />
            <p className="relative text-lg text-primary-100">{t.calculator.resultTitle}</p>
            <p className="relative mt-2 font-display text-5xl font-extrabold text-accent-300" aria-live="polite">
              {paybackMonths === null ? '—' : `${Math.ceil(paybackMonths)} ${t.calculator.months}`}
            </p>
            <dl className="relative mt-8 space-y-4 text-primary-50">
              <div className="flex justify-between gap-4">
                <dt>{t.calculator.timeSaving}</dt>
                <dd className="font-semibold">{formatNumber(Math.round(yearlyTimeValue))} {currency}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t.calculator.repairSaving}</dt>
                <dd className="font-semibold">{formatNumber(values.repairAvoidedPerYear)} {currency}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/20 pt-4">
                <dt>{t.calculator.total}</dt>
                <dd className="font-extrabold">{formatNumber(Math.round(yearlyValue))} {currency}</dd>
              </div>
            </dl>
            <p className="relative mt-auto pt-8 text-sm text-primary-100">{t.calculator.formula}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}