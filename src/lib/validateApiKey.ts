const ALLOWED_KEY_CHARS = /^[A-Za-z0-9-]+$/;
const KEY_PREFIX = 'sk-or-';
const MIN_KEY_LENGTH = 20;

function isEn(): boolean {
  try {
    return window.localStorage.getItem('family-page-language') === 'en';
  } catch {
    return false;
  }
}

export type ApiKeyValidation =
  | { valid: true }
  | { valid: false; message: string };

export function sanitizeApiKey(value: string): string {
  return value.replace(/[^A-Za-z0-9-]/g, '').slice(0, 200);
}

export function validateApiKey(value: string): ApiKeyValidation {
  const trimmed = value.trim();
  const en = isEn();

  if (trimmed.length === 0) {
    return { valid: false, message: en ? 'Enter your OpenRouter key.' : 'Введіть ключ OpenRouter.' };
  }

  if (!ALLOWED_KEY_CHARS.test(trimmed)) {
    return {
      valid: false,
      message: en
        ? 'The key contains invalid characters. Only Latin letters, numbers, and hyphens are allowed.'
        : 'Ключ містить заборонені символи. Допускаються лише латинські літери, цифри та дефіси.',
    };
  }

  if (!trimmed.startsWith(KEY_PREFIX)) {
    return {
      valid: false,
      message: en ? 'The key must start with "sk-or-".' : 'Ключ має починатися з «sk-or-».',
    };
  }

  if (trimmed.length < MIN_KEY_LENGTH) {
    return {
      valid: false,
      message: en
        ? 'The key is too short. Make sure you copied it in full.'
        : 'Ключ занадто короткий. Перевірте, чи скопіювано його повністю.',
    };
  }

  return { valid: true };
}
