import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';

interface Objection {
  question: string;
  answer: string;
}

const OBJECTIONS: Objection[] = [
  {
    question: 'А якщо і так працює?',
    answer:
      'Так, працює. Питання в тому, як довго і з яким настроєм. Ми не хочемо міняти те, що добре, а лише зробити щоденну роботу трохи спокійнішою.',
  },
  {
    question: 'Це ж дорого',
    answer:
      'Розуміємо, кожна гривня на рахунку. Тому є мінімальний варіант, а ще ми можемо розбити витрати на частини або поїздити на б/в комплектуючих, якщо так буде спокійніше.',
  },
  {
    question: 'Ти просто хочеш новеньке',
    answer:
      'Чесно: нового ноутбука мені не потрібно. Мені потрібно, щоб робота не забирала стільки часу. Тому пропонуємо найменший варіант, який це вирішує.',
  },
  {
    question: 'Може, одразу купити новий?',
    answer:
      'Новий коштує в кілька разів більше, а старий доведеться кудись діти. Оновлення дає схожий результат за набагато меншу суму, і ми спокійно порівняємо це з цінами.',
  },
  {
    question: 'А якщо не допоможе?',
    answer:
      'Тоді ми дізнаємося це за кілька днів: є можливість повернення в магазин за умовами продавця, і жодні гроші не будуть витрачені марно без нашого рішення.',
  },
  {
    question: 'Я сам не розумію, як це налаштувати',
    answer:
      'Вам і не треба розбиратися. Я сам встановлю все, перенесу файли і перевірю, що ноутбук працює. Вам достатньо просто сісти поруч і подивитися.',
  },
];

export default function Objections() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="questions" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <Reveal>
        <p className="eyebrow">Відповіді на запитання</p>
        <h2 className="mt-4 text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          «А якщо…» — і ми говоримо про це чесно
        </h2>
      </Reveal>

      <div className="mt-10 space-y-4">
        {OBJECTIONS.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `objection-panel-${index}`;
          const buttonId = `objection-button-${index}`;
          return (
            <Reveal key={item.question} delay={index * 60}>
              <div className={`glass overflow-hidden rounded-2xl transition-colors duration-300 ${isOpen ? 'border-accent-300/70 dark:border-accent-400/30' : ''}`}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-semibold text-slate-900 transition-colors hover:bg-white/60 dark:text-slate-100 dark:hover:bg-white/5"
                  >
                    {item.question}
                    <ChevronDown
                      className={`h-6 w-6 shrink-0 text-primary-600 transition-transform duration-300 dark:text-accent-300 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`px-6 pb-6 text-slate-600 transition-all duration-300 ease-out dark:text-slate-300 ${
                        isOpen ? 'translate-y-0 opacity-100 delay-[40ms]' : '-translate-y-2 opacity-0'
                      }`}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
