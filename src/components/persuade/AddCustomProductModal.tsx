import { useCallback, useMemo, useRef, useState, type AnimationEvent, type FormEvent, type ReactNode } from 'react';
import { Gauge, Plus, X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { getPerformanceProfile, isDeviceCategory } from '@/lib/performance';
import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from '@/lib/products';

interface AddCustomProductModalProps {
  onSave: (product: Product) => void;
  onClose: () => void;
  /** Pre-selects the category when opened from an active filter. */
  defaultCategory?: ProductCategory | null;
}

interface Draft {
  category: ProductCategory | '';
  name: string;
  brand: string;
  priceUah: string;
  marketplaceUrl: string;
  cpu: string;
  ramGb: string;
  storageGb: string;
  displayInches: string;
  weightKg: string;
  batteryHours: string;
  description: string;
}

type DraftErrors = Partial<Record<keyof Draft, string>>;

function emptyDraft(category: ProductCategory | '' = ''): Draft {
  return {
    category,
    name: '',
    brand: '',
    priceUah: '',
    marketplaceUrl: '',
    cpu: '',
    ramGb: '',
    storageGb: '',
    displayInches: '',
    weightKg: '',
    batteryHours: '',
    description: '',
  };
}

const FIELD_CLASS =
  'w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-base text-slate-900 transition-shadow placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-200/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-accent-400/60 dark:focus:ring-accent-500/10';

function parseWholeNumber(value: string): number | null {
  return /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
}

function parseDecimal(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateLink(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function categoryHints(category: ProductCategory | ''): { name: string; cpu: string } {
  switch (category) {
    case 'laptop':
      return { name: 'Наприклад, ASUS Vivobook 15', cpu: 'Наприклад, Intel Core i5-1235U' };
    case 'desktop':
      return { name: 'Наприклад, Ігровий ПК на Ryzen 5', cpu: 'Наприклад, AMD Ryzen 5 5600' };
    case 'tablet':
      return { name: 'Наприклад, Samsung Galaxy Tab A9', cpu: 'Наприклад, Snapdragon 695' };
    case 'kit':
      return { name: 'Наприклад, Комплект для роботи', cpu: 'Наприклад, Intel Core i3-12100' };
    case 'gpu':
      return { name: 'Наприклад, Відеокарта RTX 4060 8 ГБ', cpu: 'Модель / чип (необов’язково)' };
    case 'cpu':
      return { name: 'Наприклад, Intel Core i5-12400F', cpu: 'Повна модель (необов’язково)' };
    case 'ram':
      return { name: 'Наприклад, Kingston Fury 16 ГБ DDR4 3200 МГц', cpu: 'Не застосовується' };
    case 'ssd':
      return { name: 'Наприклад, Kingston NV2 1 ТБ NVMe', cpu: 'Не застосовується' };
    default:
      return { name: 'Наприклад, ASUS Vivobook 15', cpu: 'Наприклад, Intel Core i5' };
  }
}

function validateDraft(draft: Draft): { errors: DraftErrors; product: Product | null } {
  const errors: DraftErrors = {};
  const name = draft.name.trim();
  const price = parseWholeNumber(draft.priceUah);
  const ramGb = draft.ramGb.trim() === '' ? null : parseWholeNumber(draft.ramGb);
  const storageGb = draft.storageGb.trim() === '' ? null : parseWholeNumber(draft.storageGb);
  const displayInches = draft.displayInches.trim() === '' ? null : parseDecimal(draft.displayInches);
  const weightKg = draft.weightKg.trim() === '' ? null : parseDecimal(draft.weightKg);
  const batteryHours = draft.batteryHours.trim() === '' ? null : parseWholeNumber(draft.batteryHours);
  const cpuApplies = draft.category !== 'ram' && draft.category !== 'ssd';

  if (!draft.category) errors.category = 'Оберіть категорію.';
  if (!name) errors.name = 'Вкажіть назву, наприклад «ASUS Vivobook 15».';
  else if (name.length > 120) errors.name = 'Назва має бути коротшою за 120 символів.';
  if (price === null || price <= 0) errors.priceUah = 'Вкажіть ціну цілим числом у гривнях.';
  if (draft.marketplaceUrl.trim() && !validateLink(draft.marketplaceUrl)) {
    errors.marketplaceUrl = 'Вставте повне посилання, що починається з https://';
  }
  if (draft.ramGb.trim() && ramGb === null) errors.ramGb = 'Лише ціле число, наприклад 16.';
  if (draft.storageGb.trim() && storageGb === null) errors.storageGb = 'Лише ціле число, наприклад 512.';
  if (draft.displayInches.trim() && (displayInches === null || displayInches <= 0 || displayInches > 60)) {
    errors.displayInches = 'Число від 1 до 60, наприклад 15.6.';
  }
  if (draft.weightKg.trim() && (weightKg === null || weightKg <= 0 || weightKg > 50)) {
    errors.weightKg = 'Число від 0.1 до 50, наприклад 1.8.';
  }
  if (draft.batteryHours.trim() && (batteryHours === null || batteryHours <= 0 || batteryHours > 48)) {
    errors.batteryHours = 'Ціле число від 1 до 48.';
  }
  if (draft.description.length > 300) errors.description = 'Опис має бути коротшим за 300 символів.';

  if (Object.keys(errors).length > 0 || !draft.category || price === null) {
    return { errors, product: null };
  }

  const link = draft.marketplaceUrl.trim();
  return {
    errors,
    product: {
      id: generateId(),
      source: 'custom',
      category: draft.category,
      brand: draft.brand.trim() || 'Власний варіант',
      name,
      description: draft.description.trim() || null,
      priceUah: price,
      cpu: cpuApplies ? draft.cpu.trim() || null : null,
      ramGb,
      storageGb,
      displayInches,
      weightKg,
      batteryHours,
      marketplaceUrl: link ? new URL(link).toString() : null,
    },
  };
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-base font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {hint && <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{hint}</span>}
      <div className={hint ? 'mt-2' : 'mt-2'}>{children}</div>
      {error && <span className="mt-2 block text-sm font-medium text-danger-700 dark:text-danger-100">{error}</span>}
    </label>
  );
}

export default function AddCustomProductModal({ onSave, onClose, defaultCategory = null }: AddCustomProductModalProps) {
  const [leaving, setLeaving] = useState(false);
  const closedRef = useRef(false);
  const requestClose = useCallback(() => setLeaving(true), []);

  useEscapeKey(requestClose);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!leaving || closedRef.current || event.target !== event.currentTarget) return;
    closedRef.current = true;
    onClose();
  };

  const [draft, setDraft] = useState<Draft>(() => emptyDraft(defaultCategory ?? ''));
  const [errors, setErrors] = useState<DraftErrors>({});

  const hints = useMemo(() => categoryHints(draft.category), [draft.category]);
  const isDevice = draft.category !== '' && isDeviceCategory(draft.category);
  const cpuApplies = draft.category !== 'ram' && draft.category !== 'ssd';

  const previewProfile = useMemo(() => {
    if (!draft.name.trim() && !draft.cpu.trim() && !draft.ramGb.trim() && !draft.storageGb.trim()) return null;
    const price = parseWholeNumber(draft.priceUah) ?? 0;
    return getPerformanceProfile({
      id: 'preview',
      source: 'custom',
      category: draft.category || 'laptop',
      brand: draft.brand.trim() || 'Власний варіант',
      name: draft.name.trim() || 'Прилад',
      description: draft.description.trim() || null,
      priceUah: price,
      cpu: cpuApplies ? draft.cpu.trim() || null : null,
      ramGb: parseWholeNumber(draft.ramGb),
      storageGb: parseWholeNumber(draft.storageGb),
      displayInches: parseDecimal(draft.displayInches),
      weightKg: parseDecimal(draft.weightKg),
      batteryHours: parseWholeNumber(draft.batteryHours),
      marketplaceUrl: null,
    });
  }, [draft, cpuApplies]);

  const update = (field: keyof Draft) => (event: { target: { value: string } }) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateDraft(draft);
    setErrors(result.errors);
    if (result.product) onSave(result.product);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${leaving ? 'pointer-events-none' : ''}`}>
      <div
        className={`absolute inset-0 bg-primary-950/70 backdrop-blur-sm ${leaving ? 'animate-overlay-out' : 'animate-overlay-in'}`}
        onClick={requestClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        onAnimationEnd={handleAnimationEnd}
        className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/95 ${
          leaving ? 'animate-slide-dialog-out' : 'animate-slide-dialog-in'
        }`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-4 sm:p-6 dark:border-white/10">
          <div>
            <h2 id="add-product-title" className="flex items-center gap-2 text-2xl font-extrabold text-primary-900 dark:text-slate-50">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-accent-300 shadow-md dark:from-accent-400 dark:to-accent-600 dark:text-primary-950">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </span>
              Додати свій прилад
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
              Вкажіть характеристики — прилад збережеться на цьому пристрої, з’явиться в каталозі та його можна буде порівняти за потужністю.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Закрити форму"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="overflow-auto p-4 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Категорія" error={errors.category}>
              <select value={draft.category} onChange={update('category')} className={FIELD_CLASS}>
                <option value="">Оберіть категорію</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Бренд (необов’язково)">
              <input value={draft.brand} onChange={update('brand')} maxLength={60} placeholder="Наприклад, ASUS" className={FIELD_CLASS} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Назва" error={errors.name}>
                <input
                  value={draft.name}
                  onChange={update('name')}
                  maxLength={160}
                  placeholder={hints.name}
                  className={FIELD_CLASS}
                />
              </Field>
            </div>

            <Field label="Ціна, грн" error={errors.priceUah}>
              <input value={draft.priceUah} onChange={update('priceUah')} inputMode="numeric" placeholder="12999" className={FIELD_CLASS} />
            </Field>
            <Field label="Посилання на магазин (необов’язково)" error={errors.marketplaceUrl}>
              <input
                value={draft.marketplaceUrl}
                onChange={update('marketplaceUrl')}
                inputMode="url"
                placeholder="https://"
                className={FIELD_CLASS}
              />
            </Field>

            {cpuApplies && (
              <Field label={draft.category === 'gpu' ? 'Модель / чип (необов’язково)' : 'Процесор / модель'} hint="Впливає на оцінку потужності">
                <input value={draft.cpu} onChange={update('cpu')} maxLength={120} placeholder={hints.cpu} className={FIELD_CLASS} />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-5">
              <Field
                label={draft.category === 'ram' ? 'Обсяг, ГБ' : 'Пам’ять, ГБ'}
                error={errors.ramGb}
                hint={draft.category === 'ram' ? 'Наприклад, 16' : undefined}
              >
                <input value={draft.ramGb} onChange={update('ramGb')} inputMode="numeric" placeholder="16" className={FIELD_CLASS} />
              </Field>
              <Field
                label={draft.category === 'ssd' ? 'Обсяг, ГБ' : 'Накопичувач, ГБ'}
                error={errors.storageGb}
                hint={draft.category === 'ssd' ? 'Наприклад, 512 або 1024' : undefined}
              >
                <input value={draft.storageGb} onChange={update('storageGb')} inputMode="numeric" placeholder="512" className={FIELD_CLASS} />
              </Field>
            </div>

            {isDevice && (
              <>
                <div className="md:col-span-2 mt-1">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Параметри пристрою (необов’язково)</p>
                </div>
                <Field label="Екран, дюйми" error={errors.displayInches}>
                  <input value={draft.displayInches} onChange={update('displayInches')} inputMode="decimal" placeholder="15.6" className={FIELD_CLASS} />
                </Field>
                <Field label="Вага, кг" error={errors.weightKg}>
                  <input value={draft.weightKg} onChange={update('weightKg')} inputMode="decimal" placeholder="1.8" className={FIELD_CLASS} />
                </Field>
                <Field label="Автономність, год" error={errors.batteryHours}>
                  <input value={draft.batteryHours} onChange={update('batteryHours')} inputMode="numeric" placeholder="8" className={FIELD_CLASS} />
                </Field>
                <div className="hidden md:block" />
              </>
            )}

            <div className="md:col-span-2">
              <Field label="Опис / примітки (необов’язково)" error={errors.description} hint="Для відеокарт, пам’яті чи SSD вкажіть деталі в назві або тут (наприклад, DDR5 5600 МГц, NVMe).">
                <textarea
                  value={draft.description}
                  onChange={update('description')}
                  rows={3}
                  maxLength={400}
                  placeholder="Коротко: що важливо знати про цей варіант"
                  className={FIELD_CLASS}
                />
              </Field>
            </div>
          </div>

          {previewProfile && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <Gauge className="h-5 w-5 text-primary-700 dark:text-accent-300" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Попередня оцінка потужності</p>
                <p className="text-base font-extrabold text-primary-900 dark:text-slate-50">
                  {previewProfile.score}/100 · {previewProfile.label}
                </p>
              </div>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div
                  className="power-bar h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400"
                  style={{ width: `${previewProfile.score}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full px-6 py-3 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary-900/25 transition-all hover:-translate-y-0.5 hover:from-primary-500 hover:to-primary-700 dark:from-accent-300 dark:to-accent-500 dark:text-primary-950 dark:shadow-accent-500/20 dark:hover:from-accent-200 dark:hover:to-accent-400"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Додати до каталогу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
