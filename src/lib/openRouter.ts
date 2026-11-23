export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

export interface ModelPricing {
  promptPerToken: number;
  completionPerToken: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: ModelPricing | null;
}

export interface TestResult {
  reply: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number | null;
}

interface RawModel {
  id?: unknown;
  name?: unknown;
  pricing?: { prompt?: unknown; completion?: unknown };
}

function parsePrice(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function fetchModels(signal?: AbortSignal): Promise<OpenRouterModel[]> {
  const response = await fetch(`${OPENROUTER_API_URL}/models`, { signal });
  if (!response.ok) throw new Error(`Список моделей недоступний (код ${response.status}).`);

  const body = (await response.json()) as { data?: unknown };
  if (!Array.isArray(body.data)) throw new Error('Неочікувана відповідь сервера.');

  return (body.data as RawModel[])
    .filter((model): model is RawModel & { id: string } => typeof model.id === 'string')
    .map((model) => {
      const prompt = parsePrice(model.pricing?.prompt);
      const completion = parsePrice(model.pricing?.completion);
      return {
        id: model.id,
        name: typeof model.name === 'string' ? model.name : model.id,
        pricing:
          prompt !== null && completion !== null
            ? { promptPerToken: prompt, completionPerToken: completion }
            : null,
      };
    });
}

function isEn(): boolean {
  try {
    return window.localStorage.getItem('family-page-language') === 'en';
  } catch {
    return false;
  }
}

function describeFailure(status: number, apiMessage: string | null): string {
  const en = isEn();
  if (status === 401)
    return en
      ? 'Invalid API key. Make sure you copied it in full.'
      : 'Ключ не підходить. Перевірте, чи скопійовано його повністю.';
  if (status === 402)
    return en
      ? 'Insufficient OpenRouter balance or key limit exhausted.'
      : 'На рахунку OpenRouter немає коштів або ліміт ключа вичерпано.';
  if (status === 429)
    return en ? 'Too many requests. Try again a bit later.' : 'Забагато запитів. Спробуйте трохи пізніше.';
  return apiMessage ?? (en ? `Request failed (code ${status}).` : `Помилка під час запиту (код ${status}).`);
}

async function readApiMessage(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    return typeof body.error?.message === 'string' ? body.error.message : null;
  } catch {
    return null;
  }
}

export function formatUsd(value: number): string {
  if (value > 0 && value < 0.0001) return 'менше $0.0001';
  return `${value.toFixed(4)}`;
}

export function computeCost(
  pricing: ModelPricing | null,
  promptTokens: number,
  completionTokens: number
): number | null {
  if (!pricing) return null;
  return promptTokens * pricing.promptPerToken + completionTokens * pricing.completionPerToken;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  reply: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number | null;
}

export async function sendChatMessage(
  apiKey: string,
  model: string,
  maxTokens: number,
  messages: ChatMessage[],
  pricing: ModelPricing | null,
  signal?: AbortSignal
): Promise<ChatResult> {
  const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(describeFailure(response.status, await readApiMessage(response)));
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: unknown } }[];
    usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
  };
  const reply = body.choices?.[0]?.message?.content;
  if (typeof reply !== 'string')
    throw new Error(isEn() ? 'The model did not return a text reply.' : 'Модель не повернула текст відповіді.');

  const promptTokens = parseCount(body.usage?.prompt_tokens);
  const completionTokens = parseCount(body.usage?.completion_tokens);

  return {
    reply: reply.trim(),
    promptTokens,
    completionTokens,
    costUsd: computeCost(pricing, promptTokens, completionTokens),
  };
}

export async function sendTestMessage(
  apiKey: string,
  model: string,
  maxTokens: number,
  pricing: ModelPricing | null
): Promise<TestResult> {
  const result = await sendChatMessage(
    apiKey,
    model,
    maxTokens,
    [{ role: 'user', content: 'Відповідь одним словом: ти працюєш?' }],
    pricing
  );
  return result;
}
