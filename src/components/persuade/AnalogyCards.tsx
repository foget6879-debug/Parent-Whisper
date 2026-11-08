import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { BookOpen, HardDrive, ShieldCheck, type LucideIcon } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';
import { prefersReducedMotion } from '@/hooks/useInView';

interface Analogy {
  icon: LucideIcon;
  title: string;
  analogy: string;
  text: string;
}

const ANALOGIES: Analogy[] = [
  {
    icon: BookOpen,
    title: 'Оперативна пам\u02bcять',
    analogy: 'Це розмір робочого столу',
    text: 'На великому столі можна розкласти одразу кілька документів. На маленькому доводиться щоразу прибирати один, щоб взяти інший.',
  },
  {
    icon: HardDrive,
    title: 'Накопичувач SSD',
    analogy: 'Це ящик біля руки, а не підвал',
    text: 'Старий накопичувач схожий на архів, куди треба йти пішки. Новий SSD тримає найважливіше під рукою, тож усе відкривається миттєво.',
  },
  {
    icon: ShieldCheck,
    title: 'Планове обслуговування',
    analogy: 'Як ТО для автомобіля',
    text: 'Невелика вчасна заміна обходиться набагато дешевше, ніж ремонт після поломки. Ми зменшуємо ризик несподіваних витрат.',
  },
];

function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || prefersReducedMotion()) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTransform(`rotateX(${(-y * 12).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateZ(12px)`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTransform('')}
      style={{ transform: transform || undefined }}
      className="h-full transition-transform duration-300 ease-out will-change-transform preserve-3d"
    >
      {children}
    </div>
  );
}

export default function AnalogyCards() {
  return (
    <section className="section-shell">
      <Reveal>
        <p className="eyebrow">Простими словами</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          Три речі, які пояснюють усе без техніки
        </h2>
      </Reveal>

      <div className="perspective-1000 mt-12 grid gap-6 md:grid-cols-3">
        {ANALOGIES.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.title} delay={index * 120}>
              <TiltCard>
                <article className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 transition-colors duration-300 hover:border-accent-300/70 dark:hover:border-accent-400/30">
                  <span className="pointer-events-none absolute right-6 top-4 font-display text-6xl font-extrabold leading-none text-primary-900/5 dark:text-white/5" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-200 to-accent-400 text-primary-900 shadow-lg shadow-accent-500/25 dark:from-accent-500/30 dark:to-accent-700/30 dark:text-accent-200">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="mt-2 text-lg font-semibold text-primary-600 dark:text-accent-300">{item.analogy}</p>
                  <p className="mt-4 text-slate-600 dark:text-slate-300">{item.text}</p>
                </article>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
