import { ArrowRight, X } from 'lucide-react';
import type { Product } from '@/lib/products';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';

interface CompareBarProps {
  products: Product[];
  leaving?: boolean;
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClear: () => void;
}

export default function CompareBar({ products, leaving = false, onRemove, onCompare, onClear }: CompareBarProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:px-6 ${leaving ? 'pointer-events-none animate-bar-down' : 'animate-bar-up'}`}
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-card backdrop-blur-xl md:flex-nowrap dark:border-white/10 dark:bg-primary-950/90 dark:shadow-card-dark">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span className="mr-1 text-base font-bold text-slate-900 dark:text-slate-100">
            {interpolate(t.compare.selected, { count: products.length })}
          </span>
          {products.map((product) => (
            <span
              key={product.id}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary-50 py-1.5 pl-3 pr-1.5 text-sm font-semibold text-primary-900 ring-1 ring-primary-100 dark:bg-white/10 dark:text-slate-100 dark:ring-white/10"
            >
              <span className="truncate">{product.name}</span>
              <button
                type="button"
                onClick={() => onRemove(product.id)}
                aria-label={interpolate(t.compare.remove, { name: product.name })}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-primary-100 dark:hover:bg-white/15"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-4 py-3 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            {t.compare.clear}
          </button>
          <button
            type="button"
            onClick={onCompare}
            disabled={products.length < 2}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-6 py-3 text-base font-extrabold text-primary-950 shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 hover:from-accent-200 hover:to-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.compare.compare}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {products.length < 2 && (
          <p className="w-full text-sm text-slate-500 dark:text-slate-400">{t.compare.needMore}</p>
        )}
      </div>
    </div>
  );
}
