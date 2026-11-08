import type { Product, ProductCategory } from '@/lib/products';
import { PRODUCT_CATEGORIES } from '@/lib/products';

const STORAGE_KEY = 'compare.customProducts';

function isCustomProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.source === 'custom' &&
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.brand === 'string' &&
    typeof candidate.priceUah === 'number' &&
    PRODUCT_CATEGORIES.includes(candidate.category as ProductCategory)
  );
}

export function readCustomProducts(): Product[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCustomProduct) : [];
  } catch {
    return [];
  }
}

export function writeCustomProducts(products: Product[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Storage can be blocked (private mode, full quota); the list then lasts only for this visit.
  }
}
