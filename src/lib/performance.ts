import { CATEGORY_LABELS, type Product, type ProductCategory } from '@/lib/products';

/**
 * A small, deterministic "power" index derived from the catalogue fields.
 *
 * The catalogue only stores a CPU model string, RAM/storage sizes and a free
 * text name/description, so the index is heuristic: it is meant for comparing
 * options inside the same category, not as a benchmark replacement.
 */

export type PerformanceMetricKey = 'cpu' | 'gpu' | 'ram' | 'storage';

export interface PerformanceMetric {
  key: PerformanceMetricKey;
  label: string;
  score: number;
  detail: string | null;
}

export interface PerformanceProfile {
  score: number;
  label: string;
  metrics: PerformanceMetric[];
}

const CPU_TIERS: Record<3 | 5 | 7 | 9, number> = { 3: 42, 5: 60, 7: 76, 9: 90 };
const RYZEN_TIERS: Record<3 | 5 | 7 | 9, number> = { 3: 44, 5: 60, 7: 76, 9: 90 };

const NVIDIA_SCORES: Record<number, number> = {
  4090: 100,
  4080: 92,
  4070: 82,
  4060: 68,
  3090: 94,
  3080: 86,
  3070: 74,
  3060: 60,
  3050: 48,
  2080: 62,
  2070: 52,
  2060: 42,
  1660: 44,
  1650: 34,
};

const AMD_SCORES: Record<number, number> = {
  7900: 92,
  7800: 82,
  7700: 74,
  7600: 60,
  6900: 92,
  6800: 83,
  6700: 71,
  6600: 57,
  5700: 45,
  5600: 40,
};

const RAM_STEPS: Array<[number, number]> = [
  [4, 28],
  [8, 48],
  [16, 70],
  [24, 80],
  [32, 90],
  [64, 100],
];

const STORAGE_STEPS: Array<[number, number]> = [
  [128, 30],
  [256, 48],
  [512, 65],
  [1024, 82],
  [2048, 95],
  [4096, 100],
];

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function stepScore(value: number, steps: Array<[number, number]>): number {
  if (value <= steps[0][0]) return steps[0][1];

  for (let index = 1; index < steps.length; index += 1) {
    const [previousValue, previousScore] = steps[index - 1];
    const [currentValue, currentScore] = steps[index];
    if (value <= currentValue) {
      const ratio = (value - previousValue) / (currentValue - previousValue);
      return previousScore + ratio * (currentScore - previousScore);
    }
  }

  return steps[steps.length - 1][1];
}

function makeMetric(
  key: PerformanceMetricKey,
  label: string,
  score: number,
  detail: string | null,
): PerformanceMetric {
  return { key, label, score: Math.round(clamp(score)), detail };
}

function formatCapacity(gb: number): string {
  if (gb >= 1024) {
    const tb = gb / 1024;
    return `${Number.isInteger(tb) ? tb : tb.toFixed(1)} ТБ`;
  }
  if (gb >= 1000) return '1 ТБ';
  return `${gb} ГБ`;
}

function cpuMetric(product: Product): PerformanceMetric | null {
  const raw = product.cpu?.trim() || null;
  const text = `${raw ?? ''} ${product.name}`.trim();
  if (!text) return null;

  const intel = text.match(/\bi([3579])[-\s]?(\d{3,5})([A-Za-z]{0,3})\b/);
  if (intel) {
    const tier = Number(intel[1]) as 3 | 5 | 7 | 9;
    const model = intel[2];
    const suffix = (intel[3] ?? '').toUpperCase();
    const generation =
      model.length >= 4 && model[0] === '1' ? Number(model.slice(0, 2)) : Number(model[0]);

    let score = CPU_TIERS[tier] + clamp((generation - 10) * 1.5, -10, 8);
    if (suffix.startsWith('U')) score -= 8;
    if (suffix.startsWith('H')) score += 2;
    if (suffix.startsWith('P')) score -= 1;

    return makeMetric('cpu', 'Процесор', score, raw ?? `Intel Core i${tier}-${model}${suffix}`);
  }

  const ryzen = text.match(/\bRyzen\s*([3579])\s*(\d{4})([A-Za-z]{0,3})\b/);
  if (ryzen) {
    const tier = Number(ryzen[1]) as 3 | 5 | 7 | 9;
    const model = ryzen[2];
    const suffix = (ryzen[3] ?? '').toUpperCase();
    const generation = Number(model[0]);

    let score = RYZEN_TIERS[tier] + clamp((generation - 3) * 4, 0, 16);
    if (suffix.startsWith('U')) score -= 8;
    if (suffix.startsWith('H')) score += 2;

    return makeMetric('cpu', 'Процесор', score, raw ?? `Ryzen ${tier} ${model}${suffix}`);
  }

  const apple = text.match(/\bApple\s*M([1-4])\b/i);
  if (apple) {
    const generation = Number(apple[1]);
    const score = { 1: 82, 2: 90, 3: 94, 4: 97 }[generation] ?? 85;
    return makeMetric('cpu', 'Процесор', score, raw ?? `Apple M${generation}`);
  }

  const helio = text.match(/Helio\s*G(\d+)/i);
  if (helio) {
    return makeMetric('cpu', 'Процесор', 28 + Number(helio[1]) * 0.12, raw ?? `MediaTek Helio G${helio[1]}`);
  }

  if (/Snapdragon/i.test(text)) return makeMetric('cpu', 'Процесор', 45, raw);
  if (/Celeron/i.test(text)) return makeMetric('cpu', 'Процесор', 24, raw);
  if (/Pentium/i.test(text)) return makeMetric('cpu', 'Процесор', 30, raw);
  if (/Athlon/i.test(text)) return makeMetric('cpu', 'Процесор', 32, raw);
  if (/\bAtom\b/i.test(text)) return makeMetric('cpu', 'Процесор', 18, raw);

  return raw ? makeMetric('cpu', 'Процесор', 45, raw) : null;
}

function gpuMetric(product: Product): PerformanceMetric | null {
  const text = `${product.name} ${product.description ?? ''}`;
  const match = text.match(/\b(RTX|GTX|RX)\s*(\d{3,4})(\s*Ti|\s*XT)?\b/i);

  if (!match) return null;

  const vendor = match[1].toUpperCase();
  const model = Number(match[2]);
  const suffix = (match[3] ?? '').trim().toUpperCase();

  const lookup = vendor === 'RX' ? AMD_SCORES[model] : NVIDIA_SCORES[model];
  let score = lookup ?? (vendor === 'RX' ? 45 + (model % 100) * 0.45 : 48 + (model % 100) * 0.4);
  if (suffix === 'TI') score += 5;
  if (suffix === 'XT') score += 4;

  const vramMatch = product.category === 'gpu' ? text.match(/(\d+)\s*(?:ГБ|GB)/i) : null;
  const vram = vramMatch ? Number(vramMatch[1]) : null;
  if (vram !== null) {
    if (vram >= 16) score += 6;
    else if (vram >= 12) score += 3;
  }

  const detail = `${vendor} ${model}${suffix ? ` ${suffix}` : ''}${vram !== null ? ` · ${vram} ГБ` : ''}`;
  return makeMetric('gpu', 'Графіка', score, detail);
}

function ramSpeed(product: Product): number | null {
  const text = `${product.name} ${product.description ?? ''}`;
  const mhz = text.match(/(\d{4})\s*(?:MHz|МГц)/i);
  if (mhz) return Number(mhz[1]);
  const afterType = text.match(/DDR\s*[345]\s*(\d{4})/i);
  return afterType ? Number(afterType[1]) : null;
}

function ramMetric(product: Product): PerformanceMetric | null {
  if (product.ramGb === null) return null;

  const text = `${product.name} ${product.description ?? ''}`;
  const ddr = text.match(/DDR\s*([345])/i);
  const speed = ramSpeed(product);
  const capacityScore = stepScore(product.ramGb, RAM_STEPS);

  const parts = [`${product.ramGb} ГБ`];
  if (ddr) parts.push(`DDR${ddr[1]}`);
  if (speed) parts.push(`${speed} МГц`);

  let score = capacityScore;
  if (ddr || speed) {
    const generation = ddr ? Number(ddr[1]) : null;
    const typeScore = generation ? ({ 3: 45, 4: 62, 5: 82 }[generation] ?? 60) : capacityScore;
    const speedScore = speed ? clamp(((speed - 2133) / (6400 - 2133)) * 100) : capacityScore;
    score = capacityScore * 0.55 + typeScore * 0.2 + speedScore * 0.25;
  }

  return makeMetric('ram', 'Пам’ять', score, parts.join(' · '));
}

function storageMetric(product: Product): PerformanceMetric | null {
  if (product.storageGb === null) return null;

  const text = `${product.name} ${product.description ?? ''}`;
  const isNvme = /NVME|PCIE/i.test(text);
  const isSata = /SATA/i.test(text);
  const capacityScore = stepScore(product.storageGb, STORAGE_STEPS);

  let score = capacityScore;
  if (product.category === 'ssd') {
    const interfaceScore = isNvme ? 100 : isSata ? 45 : 70;
    score = capacityScore * 0.65 + interfaceScore * 0.35;
  } else if (isNvme) {
    score += 4;
  } else if (isSata) {
    score -= 2;
  }

  const parts = [formatCapacity(product.storageGb)];
  if (isNvme) parts.push('NVMe');
  else if (isSata) parts.push('SATA');

  return makeMetric('storage', 'Накопичувач', score, parts.join(' · '));
}

function deviceGpuMetric(
  product: Product,
  exactGpu: PerformanceMetric | null,
  cpu: PerformanceMetric | null,
): PerformanceMetric | null {
  if (exactGpu) return exactGpu;
  if (!cpu) return null;

  const text = `${product.name} ${product.description ?? ''}`;
  const hasDiscreteHint = /дискретн|discrete|RTX|GTX|Radeon/i.test(text);
  const score = hasDiscreteHint
    ? Math.max(50, cpu.score * 0.55)
    : cpu.score * (product.category === 'tablet' ? 0.5 : 0.45);

  return makeMetric('gpu', 'Графіка', score, hasDiscreteHint ? 'Дискретна графіка' : 'Інтегрована графіка');
}

function performanceLabel(score: number): string {
  if (score >= 80) return 'Дуже висока';
  if (score >= 60) return 'Висока';
  if (score >= 42) return 'Середня';
  if (score >= 28) return 'Базова';
  return 'Мінімальна';
}

const DEVICE_WEIGHTS: Record<PerformanceMetricKey, number> = {
  cpu: 0.4,
  gpu: 0.25,
  ram: 0.2,
  storage: 0.15,
};

export function getPerformanceProfile(product: Product): PerformanceProfile | null {
  const cpu = cpuMetric(product);
  const exactGpu = gpuMetric(product);
  const ram = ramMetric(product);
  const storage = storageMetric(product);
  const isDevice =
    product.category === 'laptop' ||
    product.category === 'desktop' ||
    product.category === 'tablet' ||
    product.category === 'kit';

  const metrics: PerformanceMetric[] = [];
  if (isDevice) {
    const gpu = deviceGpuMetric(product, exactGpu, cpu);
    if (cpu) metrics.push(cpu);
    if (gpu) metrics.push(gpu);
    if (ram) metrics.push(ram);
    if (storage) metrics.push(storage);
  } else {
    if (cpu) metrics.push(cpu);
    if (exactGpu) metrics.push(exactGpu);
    if (ram) metrics.push(ram);
    if (storage) metrics.push(storage);
  }

  if (metrics.length === 0) return null;

  let score: number;

  if (product.category === 'gpu') {
    score = exactGpu?.score ?? 50;
  } else if (product.category === 'cpu') {
    score = cpu?.score ?? 50;
  } else if (product.category === 'ram') {
    score = ram?.score ?? 50;
  } else if (product.category === 'ssd') {
    score = storage?.score ?? 50;
  } else {
    let weighted = 0;
    let totalWeight = 0;
    for (const metric of metrics) {
      const weight = DEVICE_WEIGHTS[metric.key];
      weighted += metric.score * weight;
      totalWeight += weight;
    }
    score = totalWeight > 0 ? weighted / totalWeight : 50;
  }

  const rounded = Math.round(clamp(score));
  return { score: rounded, label: performanceLabel(rounded), metrics };
}

const DEVICE_CATEGORIES = new Set<ProductCategory>(['laptop', 'desktop', 'tablet', 'kit']);

export function isDeviceCategory(category: ProductCategory): boolean {
  return DEVICE_CATEGORIES.has(category);
}

/**
 * Power scores are only directly comparable between whole devices or between
 * two products of the same component type (two GPUs, two SSDs, …).
 */
export function arePerformanceComparable(products: Product[]): boolean {
  const categories = new Set(products.map((product) => product.category));
  if (categories.size <= 1) return true;
  return [...categories].every(isDeviceCategory);
}

export function powerComparisonLabel(products: Product[]): string {
  const categories = new Set(products.map((product) => product.category));
  if (categories.size === 1) {
    const only = products[0].category;
    return isDeviceCategory(only) ? 'Пристрої' : CATEGORY_LABELS[only];
  }
  if ([...categories].every(isDeviceCategory)) return 'Пристрої різних типів';
  return 'Різні класи комплектуючих';
}

/** IDs of the products with the highest power index, or [] when not comparable. */
export function getPowerWinners(products: Product[]): string[] {
  if (products.length < 2 || !arePerformanceComparable(products)) return [];

  const scored = products
    .map((product) => ({ id: product.id, profile: getPerformanceProfile(product) }))
    .filter((entry): entry is { id: string; profile: PerformanceProfile } => entry.profile !== null);

  if (scored.length < 2) return [];

  const best = Math.max(...scored.map((entry) => entry.profile.score));
  return scored.filter((entry) => entry.profile.score === best).map((entry) => entry.id);
}
