import { useCallback, useMemo, useState } from 'react';
import { AlertCircle, Loader2, Plus, Search } from 'lucide-react';
import AddCustomProductModal from '@/components/persuade/AddCustomProductModal';
import CompareBar from '@/components/persuade/CompareBar';
import CompareModal from '@/components/persuade/CompareModal';
import ProductCard from '@/components/persuade/ProductCard';
import Reveal from '@/components/persuade/Reveal';
import { useAnimatedPresence } from '@/hooks/useAnimatedPresence';
import { useCustomProducts } from '@/hooks/useCustomProducts';
import { useProducts } from '@/hooks/useProducts';
import { CATEGORY_LABELS, type Product, type ProductCategory } from '@/lib/products';
import { playSound } from '@/lib/sound';

const MAX_COMPARE = 3;

type CategoryFilter = ProductCategory | 'all';

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'laptop', label: CATEGORY_LABELS.laptop },
  { value: 'desktop', label: CATEGORY_LABELS.desktop },
  { value: 'tablet', label: CATEGORY_LABELS.tablet },
  { value: 'kit', label: CATEGORY_LABELS.kit },
  { value: 'gpu', label: CATEGORY_LABELS.gpu },
  { value: 'cpu', label: CATEGORY_LABELS.cpu },
  { value: 'ram', label: CATEGORY_LABELS.ram },
  { value: 'ssd', label: CATEGORY_LABELS.ssd },
];

function matchesQuery(product: Product, query: string): boolean {
  return [product.name, product.brand, product.description, product.cpu].some((field) =>
    field?.toLowerCase().includes(query)
  );
}

export default function DeviceCompare() {
  const { state, retry } = useProducts();
  const { items: customItems, add: addCustom, remove: removeCustom } = useCustomProducts();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const closeCompare = useCallback(() => setCompareOpen(false), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);

  const products = useMemo(
    () => [...(state.status === 'ready' ? state.products : []), ...customItems],
    [state, customItems]
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visible = products.filter(
    (product) =>
      (category === 'all' || product.category === category) &&
      (normalizedQuery === '' || matchesQuery(product, normalizedQuery))
  );
  const selected = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const selectionFull = selectedIds.length >= MAX_COMPARE;
  const lockedCategory = selected[0]?.category ?? null;
  const compareBar = useAnimatedPresence(selected.length > 0 && !compareOpen);
  const isDisabled = (product: Product) =>
    !selectedIds.includes(product.id) &&
    (selectionFull || (lockedCategory !== null && product.category !== lockedCategory));

  const toggle = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        playSound('deselect');
        return current.filter((existing) => existing !== id);
      }
      if (current.length >= MAX_COMPARE) return current;
      playSound('select');
      return [...current, id];
    });
  };

  const remove = (id: string) => setSelectedIds((current) => current.filter((existing) => existing !== id));

  const removeCustomItem = (id: string) => {
    removeCustom(id);
    remove(id);
  };

  const saveCustomItem = (product: Product) => {
    addCustom(product);
    setCategory(product.category);
    setQuery('');
    playSound('success');
    setAddOpen(false);
  };

  return (
    <section id="compare" className={`mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-28 ${selected.length > 0 ? 'pb-40' : ''}`}>
      <Reveal>
        <p className="eyebrow">Порівняння</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
          Оберіть пристрої і порівняйте їх ціни та характеристики
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Можна обрати до трьох варіантів однієї категорії. Перейдіть за посиланням, щоб побачити пропозицію в магазині.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="relative flex-1 md:max-w-sm">
          <span className="sr-only">Пошук за назвою</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук за назвою, наприклад RTX"
            className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-12 pr-4 text-base text-slate-900 shadow-sm backdrop-blur placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-200/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:ring-primary-500/20"
          />
        </label>
        <button
          type="button"
          onClick={() => { playSound('open'); setAddOpen(true); }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 px-5 py-3 text-base font-bold text-white shadow-lg shadow-primary-900/25 transition-all hover:-translate-y-0.5 hover:from-primary-500 hover:to-primary-700 dark:from-accent-400 dark:to-accent-600 dark:text-primary-950 dark:shadow-accent-500/20 dark:hover:from-accent-300 dark:hover:to-accent-500"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          Додати свій прилад
          {customItems.length > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-sm font-extrabold tabular-nums dark:bg-primary-950/25">
              {customItems.length}
            </span>
          )}
        </button>
      </div>

      <div role="group" aria-label="Фільтр за категорією" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setCategory(filter.value)}
            aria-pressed={category === filter.value}
            className={`rounded-full px-5 py-2.5 text-base font-semibold transition-all active:scale-95 ${
              category === filter.value
                ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg shadow-primary-900/25 dark:from-accent-400 dark:to-accent-600 dark:text-primary-950'
                : 'bg-white/70 text-primary-800 ring-1 ring-slate-200/80 hover:bg-white hover:ring-accent-300 dark:bg-white/5 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-white/10'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {state.status === 'loading' && (
        <div className="mt-12 flex items-center gap-3 text-lg text-slate-600 dark:text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          Завантажуємо каталог…
        </div>
      )}

      {state.status === 'error' && (
        <div className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl bg-danger-100 p-6 text-danger-700">
          <AlertCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
          <p className="flex-1 text-lg font-semibold">{state.message}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-danger-700 px-5 py-2.5 text-base font-bold text-white transition-colors hover:bg-danger-600"
          >
            Спробувати ще раз
          </button>
        </div>
      )}

      {visible.length === 0 && state.status !== 'loading' && (
        <div className="mt-12 flex flex-wrap items-center gap-4 rounded-3xl border border-dashed border-slate-300/90 bg-white/50 p-6 dark:border-white/15 dark:bg-white/[0.03]">
          <p className="flex-1 text-lg text-slate-600 dark:text-slate-300">
            {normalizedQuery
              ? 'Нічого не знайдено. Спробуйте інші слова або додайте свій прилад.'
              : 'У цій категорії поки немає пристроїв у каталозі — ви можете додати власний варіант.'}
          </p>
          <button
            type="button"
            onClick={() => { playSound('open'); setAddOpen(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-5 py-3 text-base font-extrabold text-primary-950 shadow-lg shadow-accent-500/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Додати прилад
          </button>
        </div>
      )}

      {visible.length > 0 && (
        <div key={category} className="mt-10 grid animate-tab-panel gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, index) => (
            <Reveal key={product.id} delay={(index % 3) * 100} className="h-full">
              <ProductCard
                product={product}
                selected={selectedIds.includes(product.id)}
                disabled={isDisabled(product)}
                onToggle={toggle}
                onRemove={product.source === 'custom' ? removeCustomItem : undefined}
              />
            </Reveal>
          ))}
        </div>
      )}

      {state.status === 'ready' && (
        <p className="mt-10 text-sm text-slate-500 dark:text-slate-400">
          Ціни орієнтовні і можуть змінюватися. Перевіряйте актуальну ціну в магазині перед покупкою.
        </p>
      )}

      {compareBar.rendered && (
        <CompareBar
          products={selected}
          leaving={compareBar.leaving}
          onRemove={remove}
          onClear={() => setSelectedIds([])}
          onCompare={() => { playSound('success'); setCompareOpen(true); }}
        />
      )}

      {compareOpen && selected.length >= 2 && <CompareModal products={selected} onClose={closeCompare} />}
      {addOpen && (
        <AddCustomProductModal
          onSave={saveCustomItem}
          onClose={closeAdd}
          defaultCategory={category === 'all' ? null : category}
        />
      )}
    </section>
  );
}
