import { CircuitBoard, Check, Cpu, ExternalLink, HardDrive, Laptop, MemoryStick, Monitor, Package, Plus, Tablet } from 'lucide-react';
import { CATEGORY_LABELS, formatUah, type Product, type ProductCategory } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
}

const CATEGORY_ICONS: Record<ProductCategory, typeof Laptop> = {
  laptop: Laptop,
  desktop: Monitor,
  tablet: Tablet,
  kit: Package,
  gpu: CircuitBoard,
  cpu: Cpu,
  ram: MemoryStick,
  ssd: HardDrive,
};

export default function ProductCard({ product, selected, disabled, onToggle, onRemove }: ProductCardProps) {
  const Icon = CATEGORY_ICONS[product.category];
  const specs = [
    product.cpu,
    product.ramGb !== null ? `${product.ramGb} ГБ оперативної пам’яті` : null,
    product.storageGb !== null ? `${product.storageGb} ГБ накопичувача` : null,
  ].filter((spec): spec is string => Boolean(spec));

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${
        selected
          ? 'border-accent-400 bg-gradient-to-br from-accent-100/80 via-white/70 to-white/60 shadow-xl shadow-accent-500/20 dark:border-accent-400/60 dark:from-accent-500/10 dark:via-white/[0.04] dark:to-white/[0.02]'
          : 'glass border-transparent hover:-translate-y-1 hover:border-accent-300/60 dark:hover:border-accent-400/30'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-700 to-primary-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm dark:from-primary-600 dark:to-primary-800">
          <Icon className="h-4 w-4" aria-hidden="true" />
          {CATEGORY_LABELS[product.category]}
        </span>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{product.brand}</span>
      </div>

      <h3 className="mt-5 text-xl font-extrabold leading-snug text-slate-900 dark:text-slate-50">{product.name}</h3>
      <p className="mt-3 font-display text-3xl font-extrabold text-primary-800 dark:text-accent-300">{formatUah(product.priceUah)}</p>

      {product.description && <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{product.description}</p>}

      {specs.length > 0 && (
        <ul className="mt-5 space-y-2 text-base text-slate-600 dark:text-slate-300">
          {specs.map((spec) => (
            <li key={spec} className="flex items-start gap-2.5">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
              <span>{spec}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        <button
          type="button"
          onClick={() => onToggle(product.id)}
          disabled={disabled}
          aria-pressed={selected}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-bold transition-all disabled:cursor-not-allowed ${
            selected
              ? 'bg-gradient-to-r from-accent-300 to-accent-500 text-primary-950 shadow-lg shadow-accent-500/25 hover:from-accent-200 hover:to-accent-400'
              : 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-md shadow-primary-900/20 hover:from-primary-500 hover:to-primary-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-600 dark:from-white/10 dark:to-white/10 dark:hover:from-white/20 dark:hover:to-white/20 dark:disabled:from-white/5 dark:disabled:to-white/5 dark:disabled:text-slate-400'
          }`}
        >
          {selected ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
          {selected ? 'Обрано' : 'Порівняти'}
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            className="rounded-full px-4 py-3 text-base font-semibold text-danger-700 transition-colors hover:bg-danger-100 dark:text-danger-100 dark:hover:bg-white/10"
          >
            Видалити
          </button>
        )}
        {product.marketplaceUrl && (
          <a
            href={product.marketplaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-base font-semibold text-primary-800 transition-colors hover:bg-slate-100 dark:text-accent-300 dark:hover:bg-white/10"
          >
            На маркетплейсі
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
