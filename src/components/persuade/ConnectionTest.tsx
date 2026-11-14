import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, PlayCircle, XCircle } from 'lucide-react';
import { sendTestMessage, formatUsd, type ModelPricing, type TestResult } from '@/lib/openRouter';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';

interface ConnectionTestProps {
  apiKey: string;
  model: string;
  maxTokens: number;
  pricing: ModelPricing | null;
}

type TestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; result: TestResult }
  | { status: 'error'; message: string };

export default function ConnectionTest({ apiKey, model, maxTokens, pricing }: ConnectionTestProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<TestState>({ status: 'idle' });
  const canTest = Boolean(apiKey && model);

  useEffect(() => {
    setState({ status: 'idle' });
  }, [apiKey, model, maxTokens]);

  const runTest = async () => {
    setState({ status: 'loading' });
    try {
      const result = await sendTestMessage(apiKey, model, maxTokens, pricing);
      setState({ status: 'ok', result });
    } catch (error) {
      const message = error instanceof Error ? error.message : t.connection.unknownError;
      setState({ status: 'error', message });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.connection.title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.connection.hint}</p>
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={!canTest || state.status === 'loading'}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-800 px-5 py-3 text-base font-bold text-white shadow-lg shadow-primary-900/25 transition-all hover:-translate-y-0.5 hover:from-primary-500 hover:to-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:from-accent-300 dark:to-accent-500 dark:text-primary-950 dark:shadow-accent-500/20 dark:hover:from-accent-200 dark:hover:to-accent-400"
        >
          {state.status === 'loading' ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <PlayCircle className="h-5 w-5" aria-hidden="true" />
          )}
          {t.connection.test}
        </button>
      </div>

      {!canTest && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t.connection.need}</p>}

      <div aria-live="polite" className="mt-4">
        {state.status === 'ok' && (
          <div className="flex gap-3 rounded-xl bg-success-100 p-4 text-success-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="text-base">
              <p className="font-bold">{interpolate(t.connection.ok, { reply: state.result.reply })}</p>
              <p className="mt-1">
                {interpolate(t.connection.usage, { in: state.result.promptTokens, out: state.result.completionTokens })}{' '}
                {state.result.costUsd === null
                  ? t.connection.costUnknown
                  : interpolate(t.connection.cost, { cost: formatUsd(state.result.costUsd) })}
              </p>
            </div>
          </div>
        )}
        {state.status === 'error' && (
          <div className="flex gap-3 rounded-xl bg-danger-100 p-4 text-danger-700">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-base font-semibold">{interpolate(t.connection.fail, { message: state.message })}</p>
          </div>
        )}
      </div>
    </div>
  );
}