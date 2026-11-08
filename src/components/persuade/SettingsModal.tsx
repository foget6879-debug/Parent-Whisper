import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { KeyRound, X } from 'lucide-react';
import ConnectionTest from '@/components/persuade/ConnectionTest';
import { useAiSettings, type AiSettings } from '@/hooks/useAiSettings';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { fetchModels, formatUsd, type OpenRouterModel } from '@/lib/openRouter';
import { sanitizeApiKey, validateApiKey } from '@/lib/validateApiKey';

interface SettingsModalProps {
  onClose: () => void;
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

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, saveSettings, clearApiKey } = useAiSettings();
  const [draft, setDraft] = useState<AiSettings>(settings);
  const [status, setStatus] = useState<'idle' | 'saved' | 'cleared'>('idle');
  const [models, setModels] = useState<ModelsState>({ status: 'loading' });

  useEscapeKey(onClose);

  useEffect(() => {
    const controller = new AbortController();
    fetchModels(controller.signal)
      .then((list) => setModels({ status: 'ready', models: list }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Невідома помилка.';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/95 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-accent-300 shadow-lg shadow-primary-900/25">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="settings-title" className="text-2xl font-extrabold text-primary-900 dark:text-slate-50">
              Налаштування AI
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити налаштування"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div>
            <label htmlFor="openrouter-key" className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ключ OpenRouter API
            </label>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ключ зберігається лише в цьому браузері й не передається нікуди, крім OpenRouter.
            </p>
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
              Модель штучного інтелекту
            </label>
            <input
              id="ai-model"
              list="ai-model-options"
              autoComplete="off"
              spellCheck={false}
              value={draft.model}
              onChange={(event) => updateDraft({ model: event.target.value })}
              placeholder="Почніть вводити назву моделі"
              className={inputClass}
            />
            <datalist id="ai-model-options">
              {models.status === 'ready' &&
                models.models.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
            </datalist>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              {models.status === 'loading' && 'Завантажуємо список моделей…'}
              {models.status === 'error' && `${models.message} Можна ввести ID моделі вручну.`}
              {models.status === 'ready' && `Доступно моделей: ${models.models.length}.`}
            </p>
            {pricing && (
              <div className="mt-3 rounded-xl bg-primary-50/70 p-4 text-base dark:bg-white/5">
                <p className="text-slate-700 dark:text-slate-200">
                  Вхідні токени: {formatPerMillion(pricing.promptPerToken)} за 1 млн. Вихідні токени:{' '}
                  {formatPerMillion(pricing.completionPerToken)} за 1 млн.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="ai-max-tokens" className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
              Максимум токенів у відповіді
            </label>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Токен приблизно дорівнює частині слова. Чим більше ліміт, тим довша можлива відповідь і вища вартість.
            </p>
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
                Найдорожча відповідь з цим лімітом коштує приблизно {formatUsd(maxReplyCost)}.
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
              Зберегти
            </button>
            {settings.apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="rounded-full px-5 py-3 text-lg font-semibold text-danger-600 transition-colors hover:bg-danger-100 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                Видалити ключ
              </button>
            )}
          </div>

          <p aria-live="polite" className="min-h-[1.5rem] text-base text-success-700 dark:text-success-100">
            {status === 'saved' && 'Налаштування збережено.'}
            {status === 'cleared' && 'Ключ видалено.'}
          </p>
        </form>
      </div>
    </div>
  );
}
