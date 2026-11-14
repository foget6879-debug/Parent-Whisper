import { useCallback, useMemo, useRef, useState, type AnimationEvent, type FormEvent, type ReactNode } from 'react';
import { Gauge, Plus, X } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';
import { getPerformanceProfile, isDeviceCategory } from '@/lib/performance';
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from '@/lib/products';

interface AddCustomProductModalProps {
  onSave: (product: Product) => void;
  onClose: () => void;
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
  const { t } = useLanguage();
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

  const hints = useMemo(() => {
    const key = draft.category || 'default';
    const ph = t.addCustom.placeholders;
    const map: Record<string, { name: string; cpu: string }> = {
      laptop: ph.laptop,
      desktop: ph.desktop,
      tablet: ph.tablet,
      kit: ph.kit,
      gpu: ph.gpu,
      cpu: ph.cpu,
      ram: ph.ram,
      ssd: ph.ssd,
      default: ph.default,
    };
    return map[key] ?? ph.default;
  }, [draft.category, t.addCustom.placeholders]);

  const isDevice = draft.category !== '' && isDeviceCategory(draft.category);
  const cpuApplies = draft.category !== 'ram' && draft.category !== 'ssd';

  const previewProfile = useMemo(() => {
    if (!draft.name.trim() && !draft.cpu.trim() && !draft.ramGb.trim() && !draft.storageGb.trim()) return null;
    const price = parseWholeNumber(draft.priceUah) ?? 0;
    return getPerformanceProfile({
      id: 'preview',
      source: 'custom',
      category: draft.category || 'laptop',
      brand: draft.brand.trim() || t.addCustom.customBrand,
      name: draft.name.trim() || t.addCustom.customDevice,
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
  }, [draft, cpuApplies, t.addCustom.customBrand, t.addCustom.customDevice]);

  const update = (field: keyof Draft) => (event: { target: { value: string } }) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const validateDraft = (d: Draft): { errors: DraftErrors; product: Product | null } => {
    const errs: DraftErrors = {};
    const name = d.name.trim();
    const price = parseWholeNumber(d.priceUah);
    const ramGb = d.ramGb.trim() === '' ? null : parseWholeNumber(d.ramGb);
    const storageGb = d.storageGb.trim() === '' ? null : parseWholeNumber(d.storageGb);
    const displayInches = d.displayInches.trim() === '' ? null : parseDecimal(d.displayInches);
    const weightKg = d.weightKg.trim() === '' ? null : parseDecimal(d.weightKg);
    const batteryHours = d.batteryHours.trim() === '' ? null : parseWholeNumber(d.batteryHours);
    const cpuOk = d.category !== 'ram' && d.category !== 'ssd';

    if (!d.category) errs.category = t.addCustom.errors.category;
    if (!name) errs.name = t.addCustom.errors.name;
    else if (name.length > 120) errs.name = t.addCustom.errors.nameLong;
    if (price === null || price <= 0) errs.priceUah = t.addCustom.errors.price;
    if (d.marketplaceUrl.trim() && !validateLink(d.marketplaceUrl)) errs.marketplaceUrl = t.addCustom.errors.link;
    if (d.ramGb.trim() && ramGb === null) errs.ramGb = interpolate(t.addCustom.errors.integer, { example: '16' });
    if (d.storageGb.trim() && storageGb === null) errs.storageGb = interpolate(t.addCustom.errors.integer, { example: '512' });
    if (d.displayInches.trim() && (displayInches === null || displayInches <= 0 || displayInches > 60)) errs.displayInches = t.addCustom.errors.display;
    if (d.weightKg.trim() && (weightKg === null || weightKg <= 0 || weightKg > 50)) errs.weightKg = t.addCustom.errors.weight;
    if (d.batteryHours.trim() && (batteryHours === null || batteryHours <= 0 || batteryHours > 48)) errs.batteryHours = t.addCustom.errors.battery;
    if (d.description.length > 300) errs.description = t.addCustom.errors.description;

    if (Object.keys(errs).length > 0 || !d.category || price === null) return { errors: errs, product: null };

    const link = d.marketplaceUrl.trim();
    return {
      errors: errs,
      product: {
        id: generateId(),
        source: 'custom',
        category: d.category,
        brand: d.brand.trim() || t.addCustom.customBrand,
        name,
        description: d.description.trim() || null,
        priceUah: price,
        cpu: cpuOk ? d.cpu.trim() || null : null,
        ramGb,
        storageGb,
        displayInches,
        weightKg,
        batteryHours,
        marketplaceUrl: link ? new URL(link).toString() : null,
      },
    };
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
              {t.addCustom.title}
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{t.addCustom.intro}</p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={t.addCustom.close}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="overflow-auto p-4 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t.addCustom.category} error={errors.category}>
              <select value={draft.category} onChange={update('category')} className={FIELD_CLASS}>
                <option value="">{t.addCustom.categoryPlaceholder}</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t.categories[category]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.addCustom.brand}>
              <input value={draft.brand} onChange={update('brand')} maxLength={60} placeholder={t.addCustom.placeholders.brand} className={FIELD_CLASS} />
            </Field>

            <div className="md:col-span-2">
              <Field label={t.addCustom.name} error={errors.name}>
                <input value={draft.name} onChange={update('name')} maxLength={160} placeholder={hints.name} className={FIELD_CLASS} />
              </Field>
            </div>

            <Field label={t.addCustom.price} error={errors.priceUah}>
              <input value={draft.priceUah} onChange={update('priceUah')} inputMode="numeric" placeholder="12999" className={FIELD_CLASS} />
            </Field>
            <Field label={t.addCustom.link} error={errors.marketplaceUrl}>
              <input value={draft.marketplaceUrl} onChange={update('marketplaceUrl')} inputMode="url" placeholder={t.addCustom.placeholders.link} className={FIELD_CLASS} />
            </Field>

            {cpuApplies && (
              <Field label={draft.category === 'gpu' ? t.addCustom.cpuGpu : t.addCustom.cpu} hint={t.addCustom.cpuHint}>
                <input value={draft.cpu} onChange={update('cpu')} maxLength={120} placeholder={hints.cpu} className={FIELD_CLASS} />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-5">
              <Field
                label={draft.category === 'ram' ? t.addCustom.ramOnly : t.addCustom.ram}
                error={errors.ramGb}
                hint={draft.category === 'ram' ? '16' : undefined}
              >
                <input value={draft.ramGb} onChange={update('ramGb')} inputMode="numeric" placeholder="16" className={FIELD_CLASS} />
              </Field>
              <Field
                label={draft.category === 'ssd' ? t.addCustom.storageOnly : t.addCustom.storage}
                error={errors.storageGb}
                hint={draft.category === 'ssd' ? '512 / 1024' : undefined}
              >
                <input value={draft.storageGb} onChange={update('storageGb')} inputMode="numeric" placeholder="512" className={FIELD_CLASS} />
              </Field>
            </div>

            {isDevice && (
              <>
                <div className="md:col-span-2 mt-1">
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t.addCustom.deviceParams}</p>
                </div>
                <Field label={t.addCustom.display} error={errors.displayInches}>
                  <input value={draft.displayInches} onChange={update('displayInches')} inputMode="decimal" placeholder="15.6" className={FIELD_CLASS} />
                </Field>
                <Field label={t.addCustom.weight} error={errors.weightKg}>
                  <input value={draft.weightKg} onChange={update('weightKg')} inputMode="decimal" placeholder="1.8" className={FIELD_CLASS} />
                </Field>
                <Field label={t.addCustom.battery} error={errors.batteryHours}>
                  <input value={draft.batteryHours} onChange={update('batteryHours')} inputMode="numeric" placeholder="8" className={FIELD_CLASS} />
                </Field>
                <div className="hidden md:block" />
              </>
            )}

            <div className="md:col-span-2">
              <Field label={t.addCustom.description} error={errors.description} hint={t.addCustom.descriptionHint}>
                <textarea
                  value={draft.description}
                  onChange={update('description')}
                  rows={3}
                  maxLength={400}
                  placeholder={t.addCustom.placeholders.desc}
                  className={FIELD_CLASS}
                />
              </Field>
            </div>
          </div>

          {previewProfile && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <Gauge className="h-5 w-5 text-primary-700 dark:text-accent-300" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t.addCustom.preview}</p>
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
              {t.addCustom.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary-900/25 transition-all hover:-translate-y-0.5 hover:from-primary-500 hover:to-primary-700 dark:from-accent-300 dark:to-accent-500 dark:text-primary-950 dark:shadow-accent-500/20 dark:hover:from-accent-200 dark:hover:to-accent-400"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              {t.addCustom.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}