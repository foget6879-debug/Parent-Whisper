import { supabase } from '@/lib/supabase';

export type ProductCategory = 'laptop' | 'desktop' | 'tablet' | 'kit' | 'gpu' | 'cpu' | 'ram' | 'ssd';

export const PRODUCT_CATEGORIES = [
  'laptop',
  'desktop',
  'tablet',
  'kit',
  'gpu',
  'cpu',
  'ram',
  'ssd',
] as const satisfies readonly ProductCategory[];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  laptop: 'Ноутбуки',
  desktop: 'Комп’ютери',
  tablet: 'Планшети',
  kit: 'Комплекти',
  gpu: 'Відеокарти',
  cpu: 'Процесори',
  ram: 'Оперативна пам’ять',
  ssd: 'Накопичувачі',
};

export function formatUah(value: number): string {
  return `${value.toLocaleString('uk-UA')} грн`;
}

export interface Product {
  id: string;
  source: 'catalog' | 'custom';
  category: ProductCategory;
  brand: string;
  name: string;
  description: string | null;
  priceUah: number;
  cpu: string | null;
  ramGb: number | null;
  storageGb: number | null;
  displayInches: number | null;
  weightKg: number | null;
  batteryHours: number | null;
  marketplaceUrl: string | null;
}

interface ProductRow {
  id: string;
  category: ProductCategory;
  brand: string;
  name: string;
  description: string | null;
  price_uah: number;
  cpu: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
  display_inches: number | null;
  weight_kg: number | null;
  battery_hours: number | null;
  marketplace_url: string | null;
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function httpUrlOrNull(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, category, brand, name, description, price_uah, cpu, ram_gb, storage_gb, display_inches, weight_kg, battery_hours, marketplace_url'
    )
    .order('price_uah', { ascending: true });

  if (error) throw new Error('Не вдалося завантажити каталог. Спробуйте оновити сторінку.');

  return ((data ?? []) as ProductRow[]).map((row) => ({
    id: row.id,
    source: 'catalog' as const,
    category: row.category,
    brand: row.brand,
    name: row.name,
    description: row.description,
    priceUah: Number(row.price_uah),
    cpu: row.cpu,
    ramGb: numberOrNull(row.ram_gb),
    storageGb: numberOrNull(row.storage_gb),
    displayInches: numberOrNull(row.display_inches),
    weightKg: numberOrNull(row.weight_kg),
    batteryHours: numberOrNull(row.battery_hours),
    marketplaceUrl: httpUrlOrNull(row.marketplace_url),
  }));
}
