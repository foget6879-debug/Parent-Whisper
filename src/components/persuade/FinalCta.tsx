import { useState } from 'react';
import Reveal from '@/components/persuade/Reveal';

const RESPONSES = {
  yes: {
    label: 'Так',
    message: 'Дякуємо! Наступний крок: спокійно подивитися ціни разом і обрати варіант. Ми поруч.',
  },
  think: {
    label: 'Хочу ще подумати',
    message: 'Звісно, це важливе рішення. Поверніться до сторінки, коли буде зручно, і ми продовжимо без поспіху.',
  },
  question: {
    label: 'Є питання',
    message: 'Чудово, питайте будь-що. Краще поговорити спокійно зараз, ніж сумніватися потім.',
  },
} as const;

type ResponseKey = keyof typeof RESPONSES;

export default function FinalCta() {
  const [response, setResponse] = useState<ResponseKey | null>(null);

  return (
    <section id="conversation" className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 p-8 text-center text-white panel-glow md:p-14 dark:from-primary-900 dark:via-primary-800 dark:to-primary-950">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-400/25 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-violet-500/30 blur-2xl" aria-hidden="true" />
          <h2 className="relative font-display text-3xl font-extrabold md:text-4xl">Давайте вирішимо разом</h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-lg text-primary-100">
            Нам не потрібно вирішувати все сьогодні. Скажіть, як ви бачите це, і ми підемо далі в тому темпі, який вам зручний.
          </p>

          <div className="relative mt-10 flex flex-wrap justify-center gap-4" role="group" aria-label="Ваша відповідь">
            {(Object.keys(RESPONSES) as ResponseKey[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={response === key}
                onClick={() => setResponse(key)}
                className={`rounded-full border-2 px-6 py-3 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                  response === key
                    ? 'border-accent-300 bg-gradient-to-r from-accent-300 to-accent-500 text-primary-950 shadow-lg shadow-accent-500/25'
                    : 'border-white/40 text-white hover:border-white hover:bg-white/10'
                }`}
              >
                {RESPONSES[key].label}
              </button>
            ))}
          </div>

          <p aria-live="polite" className="relative mx-auto mt-8 min-h-[3.5rem] max-w-xl text-lg text-primary-50">
            {response ? RESPONSES[response].message : ''}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
