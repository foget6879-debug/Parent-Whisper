import { Check, Minus, Sparkles } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';
import { UPGRADE_PRICES } from '@/data/upgradePlan';

interface Option {
  name: string;
  summary: string;
  price: number;
  pros: string[];
  cons: string[];
  recommended?: boolean;
}

const OPTIONS: Option[] = [
  {
    name: 'Мінімальний',
    summary: 'Швидкий накопичувач SSD на 500 ГБ і перенесення всіх файлів.',
    price: UPGRADE_PRICES.minimal,
    pros: ['Найменша сума', 'Запуск і відкриття файлів стають швидшими'],
    cons: ['Місця на диску буде менше', 'Пам\u02bcять лишається такою самою, тож багато вкладок може гальмувати'],
  },
  {
    name: 'Оптимальний',
    summary: 'SSD на 1 ТБ та пам\u02bcять 16 ГБ. Ми встановимо все самі.',
    price: UPGRADE_PRICES.optimal,
    pros: [
      'Плавна робота з вкладками й документами',
      'Місця вистачить на роки фото та файлів',
      'Найкраще співвідношення ціни і користі',
    ],
    cons: ['Сума більша за мінімальний варіант'],
    recommended: true,
  },
  {
    name: 'Максимальний',
    summary: 'Новий сучасний ноутбук із запасом на багато років.',
    price: UPGRADE_PRICES.maximal,
    pros: ['Нова техніка з гарантією', 'Запас потужності на довгий час'],
    cons: ['Найбільша сума', 'Перенесення даних і налаштування займуть час', 'Старий ноутбук доведеться кудись діти'],
  },
];

export default function Options() {
  return (
    <section id="options" className="section-shell">
      <Reveal>
        <p className="eyebrow">Три варіанти</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          Від скромного кроку до повного оновлення: вибираємо разом
        </h2>
      </Reveal>

      <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
        {OPTIONS.map((option, index) => (
          <Reveal key={option.name} delay={index * 120} className="h-full">
            <article
              className={`relative flex h-full flex-col rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                option.recommended
                  ? 'bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white panel-glow ring-4 ring-accent-400/80 md:-my-4 dark:from-primary-900 dark:via-primary-800 dark:to-primary-950'
                  : 'glass shadow-card hover:border-accent-300/70 dark:hover:border-accent-400/30'
              }`}
            >
              {option.recommended && (
                <span className="absolute -top-4 left-8 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-4 py-1.5 text-sm font-extrabold text-primary-950 animate-pulse-soft">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Рекомендовано
                </span>
              )}
              <h3 className={`text-2xl font-extrabold ${option.recommended ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                {option.name}
              </h3>
              <p className={`mt-2 ${option.recommended ? 'text-primary-100' : 'text-slate-600 dark:text-slate-300'}`}>{option.summary}</p>
              <p className={`mt-6 font-display text-4xl font-extrabold ${option.recommended ? 'text-accent-300' : 'text-primary-800 dark:text-accent-300'}`}>
                {option.price.toLocaleString('uk-UA')} грн
              </p>

              <ul className="mt-6 space-y-3">
                {option.pros.map((pro) => (
                  <li key={pro} className="flex gap-3">
                    <Check className={`mt-1 h-5 w-5 shrink-0 ${option.recommended ? 'text-accent-300' : 'text-success-600 dark:text-success-400'}`} aria-hidden="true" />
                    <span>{pro}</span>
                  </li>
                ))}
                {option.cons.map((con) => (
                  <li key={con} className={`flex gap-3 ${option.recommended ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    <Minus className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
