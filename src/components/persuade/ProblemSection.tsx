import { AlertTriangle, Clock, Gauge, Thermometer } from 'lucide-react';
import CountUp from '@/components/persuade/CountUp';
import Reveal from '@/components/persuade/Reveal';
import { SPEED_METRICS } from '@/data/upgradePlan';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ProblemSection() {
  const { t } = useLanguage();
  const bootMinutes = SPEED_METRICS[0].before.seconds / 60;
  const openSeconds = SPEED_METRICS[1].before.seconds;

  const symptoms = [
    { icon: Clock, title: t.problem.symptoms.bootTitle, text: t.problem.symptoms.bootText },
    { icon: Gauge, title: t.problem.symptoms.tabsTitle, text: t.problem.symptoms.tabsText },
    { icon: Thermometer, title: t.problem.symptoms.heatTitle, text: t.problem.symptoms.heatText },
    { icon: AlertTriangle, title: t.problem.symptoms.freezeTitle, text: t.problem.symptoms.freezeText },
  ];

  return (
    <section id="problem" className="section-shell">
      <Reveal>
        <p className="eyebrow">{t.problem.eyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          {t.problem.title}
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {symptoms.map((symptom, index) => {
          const Icon = symptom.icon;
          return (
            <Reveal key={symptom.title} delay={index * 100}>
              <div className="glass group relative flex h-full gap-5 overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-300/70 dark:hover:border-accent-400/30">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 shadow-sm dark:from-primary-500/25 dark:to-primary-700/20 dark:text-primary-200">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{symptom.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{symptom.text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={150} className="mt-10">
        <div className="relative grid gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-8 text-white panel-glow sm:grid-cols-2 md:p-10 dark:from-primary-900 dark:via-primary-800 dark:to-primary-950">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-400/25 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <p className="text-lg text-primary-100">{t.problem.bootNow}</p>
            <p className="mt-2 font-display text-5xl font-extrabold text-accent-300">
              <CountUp value={bootMinutes} suffix={` ${t.problem.min}`} />
            </p>
          </div>
          <div className="relative">
            <p className="text-lg text-primary-100">{t.problem.openNow}</p>
            <p className="mt-2 font-display text-5xl font-extrabold text-accent-300">
              <CountUp value={openSeconds} suffix={` ${t.problem.sec}`} />
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
