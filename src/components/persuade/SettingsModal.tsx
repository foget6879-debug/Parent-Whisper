import { useCallback, useEffect, useMemo, useRef, useState, type AnimationEvent, type FormEvent } from 'react';
import { Building2, Check, Globe, Image, KeyRound, Sparkles, Stars, X } from 'lucide-react';
import ConnectionTest from '@/components/persuade/ConnectionTest';
import { BACKGROUND_OPTIONS, type BackgroundId } from '@/hooks/useBackground';
import { useAiSettings, type AiSettings } from '@/hooks/useAiSettings';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';
import type { Language } from '@/i18n/translations';
import { fetchModels, formatUsd, type OpenRouterModel } from '@/lib/openRouter';
import { playSound } from '@/lib/sound';
import { sanitizeApiKey, validateApiKey } from '@/lib/validateApiKey';

interface SettingsModalProps {
  onClose: () => void;
  background: BackgroundId;
  onChangeBackground: (id: BackgroundId) => void;
}

const MAX_TOKENS_LIMIT = 8192;

type ModelsState =
  | { status: 'loading' }
  | { status: 'ready'; models: OpenRouterModel[] }
  | { status: 'error'; message: string };

const inputClass =
  'mt-3 w-full rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-lg text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-200/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-accent-400/60 dark:focus:ring-accent-500/10';

function formatPerMillion(perToken: number): string {
  return `$${(perToken * 1_000_000).toFixed(2)}`;
}

const BACKGROUND_ICONS: Record<BackgroundId, typeof Image> = {
  city: Building2,
  gradient: Sparkles,
  space: Stars,
};

const LANGUAGES: { id: Language; labelKey: 'languageUk' | 'languageEn' }[] = [
  { id: 'uk', labelKey: 'languageUk' },
  { id: 'en', labelKey: 'languageEn' },
];

export default function SettingsModal({ onClose, background, onChangeBackground }: SettingsModalProps) {
  const { t, language, setLanguage } = useLanguage();
  const [leaving, setLeaving] = useState(false);
  const closedRef = useRef(false);
  const requestClose = useCallback(() => setLeaving(true), []);
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!leaving || closedRef.current || event.target !== event.currentTarget) return;
    closedRef.current = true;
    onClose();
  };

  const { settings, saveSettings, clearApiKey } = useAiSettings();
  const [draft, setDraft] = useState<AiSettings>(settings);
  const [status, setStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
  const [models, setModels] = useState<ModelsState>({ status: 'loading' });

  useEscapeKey(requestClose);

  useEffect(() => {
    const controller = new AbortController();
    fetchModels(controller.signal)
      .then((list) => setModels({ status: 'ready', models: list }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Unknown error.';
        setModels({ status: 'error', message });
      });
    return () => controller.abort();
  }, []);

  const selectedModel = models.status === 'ready' ? models.models.find((m) => m.id === draft.model) : undefined;
  const pricing = selectedModel?.pricing ?? null;

  const updateDraft = (patch: Partial<AiSettings>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setStatus('idle');
  };

  const keyValidation = useMemo(() => validateApiKey(draft.apiKey), [draft.apiKey]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!keyValidation.valid) return;
    const maxTokens = Math.min(Math.max(Math.round(draft.maxTokens) || 1, 1), MAX_TOKENS_LIMIT);
    saveSettings({ ...draft, maxTokens });
    setDraft((current) => ({ ...current, apiKey: current.apiKey.trim(), model: current.model.trim(), maxTokens }));
    setStatus('saved');
  };

  const handleClearKey = () => {
    clearApiKey();
    setDraft((current) => ({ ...current, apiKey: '' }));
    setStatus('cleared');
  };

  const maxReplyCost = pricing ? draft.maxTokens * pricing.completionPerToken : null;

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
        aria-labelledby="settings-title"
        onAnimationEnd={handleAnimationEnd}
        className={`relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/70 bg-white/95 p-4 shadow-2xl sm:p-6 backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/95 md:p-8 ${
          leaving ? 'animate-slide-dialog-out' : 'animate-slide-dialog-in'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-accent-300 shadow-lg shadow-primary-900/25">
              <Image className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="settings-title" className="text-2xl font-extrabold text-primary-900 dark:text-slate-50">
              {t.settings.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label={t.settings.close}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <section className="mt-6" aria-labelledby="language-settings-title">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary-600 dark:text-accent-300" aria-hidden="true" />
            <h3 id="language-settings-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.languageTitle}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.settings.languageHint}</p>
          <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label={t.settings.languageTitle}>
            {LANGUAGES.map((lang) => {
              const selected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setLanguage(lang.id);
                    playSound('select');
                  }}
                  className={`flex items-center justify-between gap-2 rounded-2xl border p-4 text-left font-bold transition-all hover:-translate-y-0.5 ${
                    selected
                      ? 'border-accent-400/80 bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-lg shadow-primary-900/25'
                      : 'border-slate-200/80 bg-white/70 text-slate-700 hover:border-primary-300 hover:bg-primary-50/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-accent-400/40 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{t.settings[lang.labelKey]}</span>
                  {selected && <Check className="h-4 w-4 text-accent-300" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="background-settings-title">
          <h3 id="background-settings-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t.settings.backgroundTitle}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.settings.backgroundHint}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t.settings.backgroundTitle}>
            {BACKGROUND_OPTIONS.map((option) => {
              const Icon = BACKGROUND_ICONS[option.id];
              const selected = background === option.id;
              const optionText = t.background[option.id];
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    onChangeBackground(option.id);
                    playSound('select');
                  }}
                  className={`relative rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                    selected
                      ? 'border-accent-400/80 bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-lg shadow-primary-900/25'
                      : 'border-slate-200/80 bg-white/70 text-slate-700 hover:border-primary-300 hover:bg-primary-50/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-accent-400/40 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Icon className={`h-5 w-5 ${selected ? 'text-accent-300' : 'text-primary-600 dark:text-accent-300'}`} aria-hidden="true" />
                    {selected && <Check className="h-4 w-4 text-accent-300" aria-hidden="true" />}
                  </div>
                  <span className="mt-3 block text-base font-bold">{optionText.label}</span>
                  <span className={`mt-1 block text-sm leading-snug ${selected ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {optionText.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-8 border-t border-slate-200/80 pt-6 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-white/10 dark:text-accent-300">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-xl font-extrabold text-primary-900 dark:text-slate-50">{t.settings.aiTitle}</h3>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div>
            <label htmlFor="openrouter-key" className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.keyLabel}
            </label>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.settings.keyHint}</p>
            <input
              id="openrouter-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={draft.apiKey}
              onChange={(event) => updateDraft({ apiKey: sanitizeApiKey(event.target.value) })}
              placeholder="sk-or-..."
              aria-invalid={!keyValidation.valid && draft.apiKey.length > 0}
              className={inputClass}
            />
            {draft.apiKey.length > 0 && !keyValidation.valid && (
              <p className="mt-2 text-sm font-medium text-danger-600 dark:text-red-300" role="alert">
                {keyValidation.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ai-model" className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.modelLabel}
            </label>
            <input
              id="ai-model"
              list="ai-model-options"
              autoComplete="off"
              spellCheck={false}
              value={draft.model}
              onChange={(event) => updateDraft({ model: event.target.value })}
              placeholder={t.settings.modelPlaceholder}
              className={inputClass}
            />
            <datalist id="ai-model-options">
              {models.status === 'ready' &&
                models.models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
            </datalist>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              {models.status === 'loading' && t.settings.modelsLoading}
              {models.status === 'error' && interpolate(t.settings.modelsError, { message: models.message })}
              {models.status === 'ready' && interpolate(t.settings.modelsReady, { count: models.models.length })}
            </p>
            {pricing && (
              <div className="mt-3 rounded-xl bg-primary-50/70 p-4 text-base dark:bg-white/5">
                <p className="text-slate-700 dark:text-slate-200">
                  {interpolate(t.settings.inputTokens, {
                    price: formatPerMillion(pricing.promptPerToken),
                    outPrice: formatPerMillion(pricing.completionPerToken),
                  })}
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="ai-max-tokens" className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.settings.maxTokensLabel}
            </label>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.settings.maxTokensHint}</p>
            <input
              id="ai-max-tokens"
              type="number"
              min={1}
              max={MAX_TOKENS_LIMIT}
              step={1}
              value={draft.maxTokens}
              onChange={(event) => updateDraft({ maxTokens: Number(event.target.value) || 0 })}
              className={inputClass}
            />
            {maxReplyCost !== null && (
              <p className="mt-2 text-base text-slate-700 dark:text-slate-200">
                {interpolate(t.settings.maxCost, { cost: formatUsd(maxReplyCost) })}
              </p>
            )}
          </div>

          <ConnectionTest apiKey={draft.apiKey.trim()} model={draft.model.trim()} maxTokens={draft.maxTokens} pricing={pricing} />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!keyValidation.valid}
              className="rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-6 py-3 text-lg font-extrabold text-primary-950 shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 hover:from-accent-200 hover:to-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.settings.save}
            </button>
            {settings.apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="rounded-full px-5 py-3 text-lg font-semibold text-danger-600 transition-colors hover:bg-danger-100 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                {t.settings.deleteKey}
              </button>
            )}
          </div>

          <p aria-live="polite" className="min-h-[1.5rem] text-base text-success-700 dark:text-success-100">
            {status === 'saved' && t.settings.saved}
            {status === 'cleared' && t.settings.cleared}
          </p>
        </form>
      </div>
    </div>
  );
}