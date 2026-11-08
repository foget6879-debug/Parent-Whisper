import { useCallback, useState } from 'react';

export interface AiSettings {
  apiKey: string;
  model: string;
  maxTokens: number;
}

const STORAGE_KEY = 'openrouter-settings';

export const DEFAULT_AI_SETTINGS: AiSettings = {
  apiKey: '',
  model: '',
  maxTokens: 512,
};

function readSettings(): AiSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' ? parsed.model : '',
      maxTokens:
        typeof parsed.maxTokens === 'number' && parsed.maxTokens > 0
          ? Math.round(parsed.maxTokens)
          : DEFAULT_AI_SETTINGS.maxTokens,
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

function writeSettings(settings: AiSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be blocked; settings still apply for this visit.
  }
}

export function useAiSettings() {
  const [settings, setSettings] = useState<AiSettings>(readSettings);

  const saveSettings = useCallback((next: AiSettings) => {
    const normalized: AiSettings = {
      apiKey: next.apiKey.trim(),
      model: next.model.trim(),
      maxTokens: next.maxTokens,
    };
    writeSettings(normalized);
    setSettings(normalized);
  }, []);

  const clearApiKey = useCallback(() => {
    setSettings((current) => {
      const next = { ...current, apiKey: '' };
      writeSettings(next);
      return next;
    });
  }, []);

  return { settings, saveSettings, clearApiKey };
}
