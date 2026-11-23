import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Bot, KeyRound, Loader2, MessageSquarePlus, Send, Settings, ShieldCheck, Sparkles, User } from 'lucide-react';
import Reveal from '@/components/persuade/Reveal';
import type { AiSettings } from '@/hooks/useAiSettings';
import { useLanguage, interpolate } from '@/i18n/LanguageContext';
import { fetchModels, formatUsd, sendChatMessage, type ChatMessage, type OpenRouterModel } from '@/lib/openRouter';
import { playSound } from '@/lib/sound';
import { sanitizeApiKey, validateApiKey } from '@/lib/validateApiKey';

interface AiChatProps {
  ai: {
    settings: AiSettings;
    saveSettings: (next: AiSettings) => void;
    clearApiKey: () => void;
  };
  onOpenSettings: () => void;
}

interface DisplayMessage extends ChatMessage {
  id: string;
  pending?: boolean;
}

type ModelsState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; models: OpenRouterModel[] }
  | { status: 'error'; message: string };

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AiChat({ ai, onOpenSettings }: AiChatProps) {
  const { t } = useLanguage();
  const { settings, saveSettings } = ai;
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelsState>({ status: 'idle' });
  const [modelQuery, setModelQuery] = useState(settings.model);
  const [draftKey, setDraftKey] = useState(settings.apiKey);
  const [keySaved, setKeySaved] = useState(false);
  const [usage, setUsage] = useState<{ in: number; out: number; cost: number | null } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setModelQuery(settings.model);
  }, [settings.model]);

  useEffect(() => {
    setDraftKey(settings.apiKey);
  }, [settings.apiKey]);

  useEffect(() => {
    const controller = new AbortController();
    setModels({ status: 'loading' });
    fetchModels(controller.signal)
      .then((list) => setModels({ status: 'ready', models: list }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setModels({ status: 'error', message: err instanceof Error ? err.message : 'Error' });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const availableModels = useMemo(() => {
    if (models.status !== 'ready') return [];
    const q = modelQuery.trim().toLowerCase();
    const filtered = q ? models.models.filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)) : models.models;
    return filtered.slice(0, 80);
  }, [models, modelQuery]);

  const selectedModelInfo = useMemo(
    () => (models.status === 'ready' ? models.models.find((m) => m.id === settings.model) : undefined),
    [models, settings.model]
  );

  const hasKey = settings.apiKey.trim().length > 0;
  const hasModel = settings.model.trim().length > 0;
  const canChat = hasKey && hasModel && !sending;

  const status = !hasKey ? t.aiChat.status.noKey : !hasModel ? t.aiChat.status.noModel : t.aiChat.status.ready;
  const statusColor = !hasKey || !hasModel ? 'bg-amber-400/20 text-amber-200 ring-amber-400/30' : 'bg-emerald-400/20 text-emerald-200 ring-emerald-400/30';

  const handleSaveKey = () => {
    const cleaned = sanitizeApiKey(draftKey).trim();
    const validation = validateApiKey(cleaned);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }
    saveSettings({ ...settings, apiKey: cleaned });
    setKeySaved(true);
    setError(null);
    playSound('success');
    window.setTimeout(() => setKeySaved(false), 1800);
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setUsage(null);
    setSending(false);
    playSound('click');
  };

  const send = async () => {
    const content = input.trim();
    if (!content || !canChat) return;
    setError(null);
    setInput('');

    const userMsg: DisplayMessage = { id: uid(), role: 'user', content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setSending(true);
    playSound('select');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await sendChatMessage(
        settings.apiKey.trim(),
        settings.model.trim(),
        settings.maxTokens,
        nextMessages.map((m) => ({ role: m.role, content: m.content })),
        selectedModelInfo?.pricing ?? null,
        controller.signal
      );
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: result.reply }]);
      setUsage({ in: result.promptTokens, out: result.completionTokens, cost: result.costUsd });
      playSound('success');
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : String(err));
      playSound('toggle-off');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setSending(false);
      }
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <section id="ai-chat" className="section-shell relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15" />
      </div>

      <Reveal>
        <p className="eyebrow">{t.aiChat.eyebrow}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="max-w-3xl text-3xl font-extrabold text-primary-900 md:text-4xl dark:text-slate-50">
              {t.aiChat.title}
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{t.aiChat.subtitle}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-700 dark:text-cyan-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
            </span>
            {t.aiChat.badge}
          </span>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
        <Reveal className="min-w-0">
          <div className="glass relative h-full overflow-hidden rounded-[2rem] p-6 md:p-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" aria-hidden="true" />

            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-xl font-extrabold text-primary-900 dark:text-slate-50">
                <Sparkles className="h-5 w-5 text-cyan-500 dark:text-cyan-300" aria-hidden="true" />
                {t.aiChat.instructionsTitle}
              </h3>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusColor}`}>
                {status}
              </span>
            </div>

            <ol className="mt-6 space-y-4">
              {t.aiChat.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 text-sm font-extrabold text-accent-300 shadow-md dark:from-cyan-500/20 dark:to-violet-500/20 dark:text-cyan-200">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200/70 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <KeyRound className="h-4 w-4 text-primary-600 dark:text-cyan-300" aria-hidden="true" />
                  {t.aiChat.keyLabel}
                </span>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={draftKey}
                    onChange={(e) => { setDraftKey(sanitizeApiKey(e.target.value)); setKeySaved(false); }}
                    placeholder={t.aiChat.keyPlaceholder}
                    autoComplete="off"
                    spellCheck={false}
                    className="min-w-0 flex-1 rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-500/10"
                  />
                  <button
                    type="button"
                    onClick={handleSaveKey}
                    className="shrink-0 rounded-xl bg-gradient-to-r from-primary-700 to-primary-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 dark:from-cyan-500 dark:to-primary-600"
                  >
                    {keySaved ? t.aiChat.saved : t.aiChat.saveKey}
                  </button>
                </div>
                <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.aiChat.keyHint}
                </span>
              </label>

              <div className="block">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Bot className="h-4 w-4 text-primary-600 dark:text-cyan-300" aria-hidden="true" />
                  {t.aiChat.modelLabel}
                </span>
                <input
                  type="text"
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                  onBlur={() => {
                    const value = modelQuery.trim();
                    if (value && value !== settings.model) saveSettings({ ...settings, model: value });
                  }}
                  placeholder={t.aiChat.modelPlaceholder}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-500/10"
                />

                <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="max-h-64 overflow-y-auto p-1.5">
                    {models.status === 'loading' && (
                      <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">...</p>
                    )}
                    {models.status === 'error' && (
                      <p className="px-3 py-4 text-center text-sm text-danger-600 dark:text-red-300">{models.message}</p>
                    )}
                    {models.status === 'ready' && availableModels.length === 0 && (
                      <p className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">—</p>
                    )}
                    {models.status === 'ready' &&
                      availableModels.map((m) => {
                        const selected = settings.model === m.id;
                        const promptM = m.pricing ? (m.pricing.promptPerToken * 1_000_000).toFixed(2) : null;
                        const completionM = m.pricing ? (m.pricing.completionPerToken * 1_000_000).toFixed(2) : null;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              saveSettings({ ...settings, model: m.id });
                              setModelQuery(m.id);
                              playSound('select');
                            }}
                            className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              selected
                                ? 'bg-cyan-500/15 ring-1 ring-cyan-400/40 dark:bg-cyan-400/10'
                                : 'hover:bg-slate-100/80 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm font-semibold ${selected ? 'text-cyan-700 dark:text-cyan-200' : 'text-slate-800 dark:text-slate-100'}`}>
                                {m.name}
                              </p>
                              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{m.id}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              {promptM !== null && completionM !== null ? (
                                <>
                                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">${promptM} / ${completionM}</p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500">in/out · 1M</p>
                                </>
                              ) : (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">—</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                  {models.status === 'ready' && (
                    <div className="border-t border-slate-200/70 px-3 py-2 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
                      {settings.model ? settings.model : t.aiChat.modelPlaceholder}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-900 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                {t.aiChat.openSettings}
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="min-w-0">
          <div className="glass relative flex h-[38rem] flex-col overflow-hidden rounded-[2rem] md:h-[42rem]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(rgba(34,211,238,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.04)_1px,transparent_1px)]" aria-hidden="true" />

            <div className="relative flex items-center justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-extrabold text-primary-900 dark:text-slate-50">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-primary-500/20 text-cyan-600 dark:text-cyan-300">
                    <Bot className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="truncate">{settings.model || t.aiChat.modelPlaceholder}</span>
                </p>
                {usage && (
                  <p className="mt-0.5 pl-10 text-xs text-slate-500 dark:text-slate-400">
                    {interpolate(t.aiChat.usage, { in: usage.in, out: usage.out })}
                    {usage.cost !== null ? ` · ${interpolate(t.aiChat.cost, { cost: formatUsd(usage.cost) })}` : ''}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t.aiChat.clear}</span>
              </button>
            </div>

            <div ref={listRef} className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-5">
              {messages.length === 0 && !sending && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl" aria-hidden="true" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-primary-500/10 text-cyan-600 dark:text-cyan-300">
                      <Sparkles className="h-8 w-8" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="mt-5 font-display text-xl font-extrabold text-primary-900 dark:text-slate-50">{t.aiChat.emptyTitle}</p>
                  <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{t.aiChat.emptyText}</p>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[92%] gap-2.5 sm:max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            isUser
                              ? 'bg-primary-700 text-accent-300 dark:bg-accent-500/20 dark:text-accent-300'
                              : 'bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-600 dark:text-cyan-300'
                          }`}
                        >
                          {isUser ? <User className="h-4 w-4" aria-hidden="true" /> : <Bot className="h-4 w-4" aria-hidden="true" />}
                        </span>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed sm:text-base ${
                            isUser
                              ? 'rounded-tr-md bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-lg shadow-primary-900/20 dark:from-primary-600 dark:to-primary-800'
                              : 'rounded-tl-md border border-slate-200/70 bg-white/80 text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100'
                          }`}
                        >
                          <p className={`mb-1 text-[11px] font-bold uppercase tracking-wider ${isUser ? 'text-primary-200' : 'text-cyan-600 dark:text-cyan-300'}`}>
                            {isUser ? t.aiChat.you : t.aiChat.assistant}
                          </p>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sending && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[85%] gap-2.5">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-600 dark:text-cyan-300">
                        <Bot className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="rounded-2xl rounded-tl-md border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          {t.aiChat.sending}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative border-t border-slate-200/70 p-4 dark:border-white/10">
              {!hasKey && (
                <p className="mb-3 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {t.aiChat.noKeyBanner}
                </p>
              )}
              {hasKey && !hasModel && (
                <p className="mb-3 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {t.aiChat.noModelBanner}
                </p>
              )}
              {error && (
                <p className="mb-3 rounded-xl border border-danger-300/50 bg-danger-100 px-3 py-2 text-sm text-danger-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200" role="alert">
                  <span className="font-bold">{t.aiChat.errorPrefix}:</span> {error}
                </p>
              )}

              <form onSubmit={onSubmit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t.aiChat.inputPlaceholder}
                  rows={1}
                  className="max-h-32 min-h-[3rem] min-w-0 flex-1 resize-y rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-3 text-base text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:border-cyan-400/60 dark:focus:ring-cyan-500/10"
                />
                <button
                  type="submit"
                  disabled={!canChat || !input.trim()}
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-primary-600 px-5 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 hover:from-cyan-400 hover:to-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.aiChat.send}</span>
                </button>
              </form>
              <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">{t.aiChat.disclaimer}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}