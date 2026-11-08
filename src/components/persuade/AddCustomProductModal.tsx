import { useState, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, type Product, type ProductCategory } from '@/lib/products';

interface AddCustomProductModalProps {
  onSave: (product: Product) => void;
  onClose: () => void;
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
  description: string;
}

type DraftErrors = Partial<Record<keyof Draft, string>>;

const EMPTY_DRAFT: Draft = {
  category: '',
  name: '',
  brand: '',
  priceUah: '',
  marketplaceUrl: '',
  cpu: '',
  ramGb: '',
  storageGb: '',
  description: '',
};

const FIELD_CLASS =
  'w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-base text-slate-900 transition-shadow placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-200/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-accent-400/60 dark:focus:ring-accent-500/10';

function parseWholeNumber(value: string): number | null {
  return /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
}

function validateLink(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateDraft(draft: Draft): { errors: DraftErrors; product: Product | null } {
  const errors: DraftErrors = {};
  const name = draft.name.trim();
  const price = parseWholeNumber(draft.priceUah);
  const ramGb = draft.ramGb.trim() === '' ? null : parseWholeNumber(draft.ramGb);
  const storageGb = draft.storageGb.trim() === '' ? null : parseWholeNumber(draft.storageGb);

  if (!draft.category) errors.category = 'Оберіть категорію.';
  if (!name) errors.name = 'Вкажіть назву, наприклад «Відеокарта RTX 4060».';
  else if (name.length > 120) errors.name = 'Назва має бути коротшою за 120 символів.';
  if (price === null || price <= 0) errors.priceUah = 'Вкажіть ціну цілим числом у гривнях.';
  if (draft.marketplaceUrl.trim() && !validateLink(draft.marketplaceUrl)) {
    errors.marketplaceUrl = 'Вставте повне посилання, що починається з https://';
  }
  if (draft.ramGb.trim() && ramGb === null) errors.ramGb = 'Лише ціле число, наприклад 16.';
  if (draft.storageGb.trim() && storageGb === null) errors.storageGb = 'Лише ціле число, наприклад 512.';
  if (draft.description.length > 300) errors.description = 'Опис має бути коротшим за 300 символів.';

  if (Object.keys(errors).length > 0 || !draft.category || price === null) {
    return { errors, product: null };
  }

  const link = draft.marketplaceUrl.trim();
  return {
    errors,
    product: {
      id: `custom-${crypto.randomUUID()}`,
      source: 'custom',
      category: draft.category,
      brand: draft.brand.trim() || 'Власний варіант',
      name,
      description: draft.description.trim() || null,
      priceUah: price,
      cpu: draft.cpu.trim() || null,
      ramGb,
      storageGb,
      displayInches: null,
      weightKg: null,
      batteryHours: null,
      marketplaceUrl: link ? new URL(link).toString() : null,
    },
  };
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-base font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
      {error && <span className="mt-2 block text-sm font-medium text-danger-700 dark:text-danger-100">{error}</span>}
    </label>
  );
}

export default function AddCustomProductModal({ onSave, onClose }: AddCustomProductModalProps) {
  useEscapeKey(onClose);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});

  const update = (field: keyof Draft) => (event: { target: { value: string } }) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateDraft(draft);
    setErrors(result.errors);
    if (result.product) onSave(result.product);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/95"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 p-6 dark:border-white/10">
          <div>
            <h2 id="add-product-title" className="text-2xl font-extrabold text-primary-900 dark:text-slate-50">
              Додати свій варіант
            </h2>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
              Введіть назву й ціну з магазину, і цей варіант з’явиться в порівнянні.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити форму"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="overflow-auto p-6">
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
                  placeholder="Наприклад, Відеокарта RTX 4060 8 ГБ"
                  className={FIELD_CLASS}
                />
              </Field>
            </div>
            <Field label="Ціна, грн" error={errors.priceUah}>
              <input value={draft.priceUah} onChange={update('priceUah')} inputMode="numeric" placeholder="12999" className={FIELD_CLASS} />
            </Field>
            <Field label="Посилання з Розетки або іншого магазину (необов’язково)" error={errors.marketplaceUrl}>
              <input
                value={draft.marketplaceUrl}
                onChange={update('marketplaceUrl')}
                inputMode="url"
                placeholder="https://"
                className={FIELD_CLASS}
              />
            </Field>
            <Field label="Процесор або модель (необов’язково)">
              <input value={draft.cpu} onChange={update('cpu')} maxLength={120} placeholder="Наприклад, Intel Core i5" className={FIELD_CLASS} />
            </Field>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Пам’ять, ГБ" error={errors.ramGb}>
                <input value={draft.ramGb} onChange={update('ramGb')} inputMode="numeric" placeholder="16" className={FIELD_CLASS} />
              </Field>
              <Field label="Накопичувач, ГБ" error={errors.storageGb}>
                <input value={draft.storageGb} onChange={update('storageGb')} inputMode="numeric" placeholder="512" className={FIELD_CLASS} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Опис (необов’язково)" error={errors.description}>
                <textarea
                  value={draft.description}
                  onChange={update('description')}
                  rows={3}
                  maxLength={400}
                  placeholder="Коротко про те, що важливо для вас"
                  className={FIELD_CLASS}
                />
              </Field>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-3 text-base font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary-900/25 transition-all hover:-translate-y-0.5 hover:from-primary-500 hover:to-primary-700 dark:from-accent-300 dark:to-accent-500 dark:text-primary-950 dark:shadow-accent-500/20 dark:hover:from-accent-200 dark:hover:to-accent-400"
            >
              Додати до порівняння
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
