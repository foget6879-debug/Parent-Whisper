import { Gauge, Trophy } from 'lucide-react';
import {
  arePerformanceComparable,
  getPerformanceProfile,
  powerComparisonLabel,
  type PerformanceProfile,
} from '@/lib/performance';
import { CATEGORY_LABELS, type Product } from '@/lib/products';

interface PowerCompareProps {
  products: Product[];
  winnerIds: string[];
}

interface ScoredEntry {
  product: Product;
  profile: PerformanceProfile | null;
}

function scoreBadgeClass(score: number, highlighted: boolean): string {
  if (highlighted) return 'bg-accent-200/90 text-primary-950 dark:bg-accent-400/25 dark:text-accent-200';
  if (score >= 80) return 'bg-success-100 text-success-800 dark:bg-success-500/15 dark:text-success-300';
  if (score >= 60) return 'bg-primary-100 text-primary-800 dark:bg-primary-500/20 dark:text-primary-200';
  if (score >= 42) return 'bg-warning-100 text-warning-800 dark:bg-warning-500/15 dark:text-warning-300';
  return 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300';
}

export default function PowerCompare({ products, winnerIds }: PowerCompareProps) {
  const comparable = arePerformanceComparable(products);
  const entries: ScoredEntry[] = products.map((product) => ({
    product,
    profile: getPerformanceProfile(product),
  }));

  if (entries.every((entry) => entry.profile === null)) return null;

  return (
    <section className="mb-6 rounded-3xl border border-slate-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2.5 text-lg font-extrabold text-primary-900 dark:text-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-accent-300 shadow-md shadow-primary-900/20 dark:from-primary-500 dark:to-primary-800">
              <Gauge className="h-5 w-5" aria-hidden="true" />
            </span>
            Потужність
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Індекс 0–100 з характеристик каталогу · {powerComparisonLabel(products)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${
            comparable
              ? 'bg-primary-50 text-primary-800 ring-primary-100 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10'
              : 'bg-warning-100 text-warning-800 ring-warning-200 dark:bg-warning-500/10 dark:text-warning-200 dark:ring-warning-400/20'
          }`}
        >
          {comparable ? 'Порівняння напряму' : 'Різні класи — без переможця'}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ product, profile }, index) => {
          const isWinner = winnerIds.includes(product.id);
          return (
            <div
              key={product.id}
              className={`relative flex flex-col rounded-2xl border p-4 ${
                isWinner
                  ? 'border-accent-300/70 bg-gradient-to-br from-accent-100/70 via-white/60 to-white/40 shadow-lg shadow-accent-500/10 dark:border-accent-400/30 dark:from-accent-500/10 dark:via-white/[0.04] dark:to-transparent'
                  : 'border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
                      {index + 1}
                    </span>
                    {CATEGORY_LABELS[product.category]}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-base font-extrabold leading-snug text-slate-900 dark:text-slate-50">
                    {product.name}
                  </p>
                </div>
                {isWinner && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-2.5 py-1 text-sm font-bold text-primary-950 shadow-sm">
                    <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                    Лідер
                  </span>
                )}
              </div>

              {profile ? (
                <>
                  <div className="mt-4 flex items-end justify-between gap-2">
                    <p className="font-display text-4xl font-extrabold leading-none text-primary-800 dark:text-accent-300">
                      {profile.score}
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">/100</span>
                    </p>
                    <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${scoreBadgeClass(profile.score, isWinner)}`}>
                      {profile.label}
                    </span>
                  </div>

                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10"
                    role="progressbar"
                    aria-label={`Загальна потужність: ${product.name}`}
                    aria-valuenow={profile.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`power-bar h-full rounded-full ${
                        isWinner
                          ? 'bg-gradient-to-r from-accent-300 to-accent-500'
                          : 'bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-accent-400'
                      }`}
                      style={{ width: `${profile.score}%`, animationDelay: `${index * 90}ms` }}
                    />
                  </div>

                  <ul className="mt-4 space-y-2.5">
                    {profile.metrics.map((metric, metricIndex) => (
                      <li key={metric.key}>
                        <div className="flex items-baseline justify-between gap-2 text-sm">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">{metric.label}</span>
                          <span className="font-bold tabular-nums text-slate-500 dark:text-slate-400">{metric.score}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
                          <div
                            className={`power-bar h-full rounded-full ${
                              isWinner ? 'bg-accent-400/90' : 'bg-primary-500/70 dark:bg-primary-300/70'
                            }`}
                            style={{
                              width: `${metric.score}%`,
                              animationDelay: `${index * 90 + metricIndex * 45 + 90}ms`,
                            }}
                          />
                        </div>
                        {metric.detail && (
                          <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500" title={metric.detail}>
                            {metric.detail}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Недостатньо даних для оцінки потужності.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {comparable
          ? 'Індекс враховує процесор, графіку, пам’ять і накопичувач із вагами для пристроїв. Це орієнтовна оцінка на основі полів каталогу, а не результат бенчмарку.'
          : 'Індекси різних класів (наприклад, відеокарти й накопичувача) не зіставні напряму — порівнюйте профілі всередині одного класу.'}
      </p>
    </section>
  );
}
