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

const STORAGE_KEY = 'compare.catalogProducts';

const INITIAL_CATALOG: Product[] = [
  {
    id: 'catalog-asus-vivobook-15-x1504',
    source: 'catalog',
    category: 'laptop',
    brand: 'ASUS',
    name: 'ASUS Vivobook 15 X1504',
    description: 'Бюджетний ноутбук на кожен день: документи, браузер і фільми.',
    priceUah: 18999,
    cpu: 'Intel Core i3-1215U',
    ramGb: 8,
    storageGb: 256,
    displayInches: 15.6,
    weightKg: 1.7,
    batteryHours: 7,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=ASUS+Vivobook+15+X1504',
  },
  {
    id: 'catalog-lenovo-ideapad-slim-3-14',
    source: 'catalog',
    category: 'laptop',
    brand: 'Lenovo',
    name: 'Lenovo IdeaPad Slim 3 14',
    description: 'Легкий і швидкий ноутбук для навчання та роботи з кількома програмами.',
    priceUah: 27999,
    cpu: 'Intel Core i5-1235U',
    ramGb: 16,
    storageGb: 512,
    displayInches: 14,
    weightKg: 1.37,
    batteryHours: 10.5,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Lenovo+IdeaPad+Slim+3+14',
  },
  {
    id: 'catalog-asus-tuf-gaming-f16',
    source: 'catalog',
    category: 'laptop',
    brand: 'ASUS',
    name: 'ASUS TUF Gaming F16',
    description: 'Потужний ноутбук для творчості, монтажу й ігор з дискретною графікою.',
    priceUah: 42999,
    cpu: 'AMD Ryzen 7 7735HS',
    ramGb: 16,
    storageGb: 1024,
    displayInches: 16,
    weightKg: 2.2,
    batteryHours: 8,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=ASUS+TUF+Gaming+F16',
  },
  {
    id: 'catalog-acer-aspire-xc-desktop',
    source: 'catalog',
    category: 'desktop',
    brand: 'Acer',
    name: 'Acer Aspire XC Desktop',
    description: null,
    priceUah: 22999,
    cpu: 'Intel Core i5-12400',
    ramGb: 16,
    storageGb: 512,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Acer+Aspire+XC+desktop+i5',
  },
  {
    id: 'catalog-samsung-galaxy-tab-a9',
    source: 'catalog',
    category: 'tablet',
    brand: 'Samsung',
    name: 'Samsung Galaxy Tab A9',
    description: 'Компактний планшет для фільмів, браузера й нотаток.',
    priceUah: 13999,
    cpu: 'MediaTek Helio G99',
    ramGb: 8,
    storageGb: 128,
    displayInches: 11,
    weightKg: 0.49,
    batteryHours: 10,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Samsung+Galaxy+Tab+A9',
  },
  {
    id: 'catalog-gigabyte-geforce-rtx-4060-8gb',
    source: 'catalog',
    category: 'gpu',
    brand: 'Gigabyte',
    name: 'Gigabyte GeForce RTX 4060 8 ГБ',
    description: 'Відеокарта для сучасних ігор у Full HD і відтворення відео у високій якості.',
    priceUah: 12999,
    cpu: null,
    ramGb: null,
    storageGb: null,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=GeForce+RTX+4060+8GB',
  },
  {
    id: 'catalog-asus-geforce-rtx-4070-12gb',
    source: 'catalog',
    category: 'gpu',
    brand: 'ASUS',
    name: 'ASUS GeForce RTX 4070 12 ГБ',
    description: 'Відеокарта для ігор у високій якості, монтажу відео та 3D-графіки.',
    priceUah: 19999,
    cpu: null,
    ramGb: null,
    storageGb: null,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=GeForce+RTX+4070+12GB',
  },
  {
    id: 'catalog-intel-core-i5-12400f',
    source: 'catalog',
    category: 'cpu',
    brand: 'Intel',
    name: 'Intel Core i5-12400F',
    description: 'Швидкий 6-ядерний процесор для навчання, офісу й браузера.',
    priceUah: 7999,
    cpu: 'Intel Core i5-12400F',
    ramGb: null,
    storageGb: null,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Intel+Core+i5-12400F',
  },
  {
    id: 'catalog-amd-ryzen-7-5700x',
    source: 'catalog',
    category: 'cpu',
    brand: 'AMD',
    name: 'AMD Ryzen 7 5700X',
    description: '8-ядерний процесор для творчості, монтажу та великих таблиць.',
    priceUah: 11999,
    cpu: 'AMD Ryzen 7 5700X',
    ramGb: null,
    storageGb: null,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=AMD+Ryzen+7+5700X',
  },
  {
    id: 'catalog-kingston-fury-16gb-ddr4-3200',
    source: 'catalog',
    category: 'ram',
    brand: 'Kingston',
    name: 'Kingston FURY 16 ГБ (2×8) DDR4 3200',
    description: 'Достатньо оперативної пам’яті для навчання, фільмів і кількох програм одночасно.',
    priceUah: 2699,
    cpu: null,
    ramGb: 16,
    storageGb: null,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Kingston+FURY+16GB+DDR4+3200',
  },
  {
    id: 'catalog-corsair-vengeance-32gb-ddr4-3600',
    source: 'catalog',
    category: 'ram',
    brand: 'Corsair',
    name: 'Corsair Vengeance 32 ГБ (2×16) DDR4 3600',
    description: 'Для ігор, монтажу та великої кількості вкладок у браузері.',
    priceUah: 5999,
    cpu: null,
    ramGb: 32,
    storageGb: null,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Corsair+Vengeance+32GB+DDR4',
  },
  {
    id: 'catalog-samsung-980-500gb-sata-ssd',
    source: 'catalog',
    category: 'ssd',
    brand: 'Samsung',
    name: 'Samsung 980 500 ГБ SATA SSD',
    description: 'Бюджетне прискорення старого ноутбука або комп’ютера.',
    priceUah: 2199,
    cpu: null,
    ramGb: null,
    storageGb: 500,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Samsung+980+500GB+SSD',
  },
  {
    id: 'catalog-samsung-980-pro-1tb-nvme-ssd',
    source: 'catalog',
    category: 'ssd',
    brand: 'Samsung',
    name: 'Samsung 980 PRO 1 ТБ NVMe SSD',
    description: 'Швидкий NVMe-накопичувач на багато років фото, відео й файлів.',
    priceUah: 4999,
    cpu: null,
    ramGb: null,
    storageGb: 1000,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=Samsung+980+PRO+1TB+NVMe',
  },
  {
    id: 'catalog-kit-quick-start-ssd-1tb',
    source: 'catalog',
    category: 'kit',
    brand: 'Комплект',
    name: 'Комплект «Швидкий старт»: SSD 1 ТБ + перенесення даних',
    description: 'SSD 1 ТБ NVMe із перенесенням усіх даних і налаштуванням системи.',
    priceUah: 6499,
    cpu: null,
    ramGb: null,
    storageGb: 1000,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=SSD+1TB+NVMe+комплект',
  },
  {
    id: 'catalog-kit-gaming-rtx-4070-ryzen-7',
    source: 'catalog',
    category: 'kit',
    brand: 'Комплект',
    name: 'Комплект «Для ігор»: RTX 4070 + Ryzen 7 + 32 ГБ',
    description: 'Відеокарта RTX 4070, процесор Ryzen 7 і 32 ГБ пам’яті для сучасних ігор.',
    priceUah: 44999,
    cpu: 'AMD Ryzen 7 5700X',
    ramGb: 32,
    storageGb: 1000,
    displayInches: null,
    weightKg: null,
    batteryHours: null,
    marketplaceUrl: 'https://rozetka.com.ua/search/?text=RTX+4070+Ryzen+7+32GB+комплект',
  },
];

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isCatalogProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const product = value as Record<string, unknown>;

  return (
    product.source === 'catalog' &&
    typeof product.id === 'string' &&
    PRODUCT_CATEGORIES.includes(product.category as ProductCategory) &&
    typeof product.brand === 'string' &&
    typeof product.name === 'string' &&
    isNullableString(product.description) &&
    typeof product.priceUah === 'number' &&
    Number.isFinite(product.priceUah) &&
    isNullableString(product.cpu) &&
    isNullableNumber(product.ramGb) &&
    isNullableNumber(product.storageGb) &&
    isNullableNumber(product.displayInches) &&
    isNullableNumber(product.weightKg) &&
    isNullableNumber(product.batteryHours) &&
    isNullableString(product.marketplaceUrl)
  );
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

function sortByPrice(products: Product[]): Product[] {
  return products.sort((first, second) => first.priceUah - second.priceUah);
}

export async function fetchProducts(): Promise<Product[]> {
  let stored: string | null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error('Не вдалося прочитати каталог із локального сховища браузера.');
  }

  if (stored === null) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATALOG));
    } catch {
      throw new Error('Не вдалося зберегти початковий каталог у сховищі браузера.');
    }
    return sortByPrice([...INITIAL_CATALOG]);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch {
    throw new Error('Локальний каталог пошкоджений. Очистьте дані сайту та оновіть сторінку.');
  }

  if (!Array.isArray(parsed) || !parsed.every(isCatalogProduct)) {
    throw new Error('Формат локального каталогу некоректний. Очистьте дані сайту та оновіть сторінку.');
  }

  const products = parsed.map((product) => ({
    ...product,
    marketplaceUrl: httpUrlOrNull(product.marketplaceUrl),
  }));
  return sortByPrice(products);
}
