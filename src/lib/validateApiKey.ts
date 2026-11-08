const ALLOWED_KEY_CHARS = /^[A-Za-z0-9-]+$/;
const KEY_PREFIX = 'sk-or-';
const MIN_KEY_LENGTH = 20;

export type ApiKeyValidation =
  | { valid: true }
  | { valid: false; message: string };

export function sanitizeApiKey(value: string): string {
  return value.replace(/[^A-Za-z0-9-]/g, '').slice(0, 200);
}

export function validateApiKey(value: string): ApiKeyValidation {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: 'Введіть ключ OpenRouter.' };
  }

  if (!ALLOWED_KEY_CHARS.test(trimmed)) {
    return { valid: false, message: 'Ключ містить заборонені символи. Допускаються лише латинські літери, цифри та дефіси.' };
  }

  if (!trimmed.startsWith(KEY_PREFIX)) {
    return { valid: false, message: 'Ключ має починатися з «sk-or-».' };
  }

  if (trimmed.length < MIN_KEY_LENGTH) {
    return { valid: false, message: 'Ключ занадто короткий. Перевірте, чи скопіювано його повністю.' };
  }

  return { valid: true };
}
