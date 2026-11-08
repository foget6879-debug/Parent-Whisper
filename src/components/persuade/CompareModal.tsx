import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { formatUah, type Product } from '@/lib/products';

interface CompareModalProps {
  products: Product[];
  onClose: () => void;
}

type BetterDirection = 'lower' | 'higher';

interface SpecRow {
  key: string;
  label: string;
  value: (product: Product) => string | null;
  numeric: (product: Product) => number | null;
  better: BetterDirection;
  /** Rows compare only when this returns true (e.g. CPU tiers across the same brand). */
  comparable?: (products: Product[]) => boolean;
}

function sameBrand(products: Product[]): boolean {
  return new Set(products.map((p) => p.brand)).size === 1;
}

interface WinnerMap {
  price: string[];
  [specKey: string]: string[];
}

function parseGpuVram(product: Product): number | null {
  if (product.category !== 'gpu') return null;
  const match = product.name.match(/(\d+)\s*(?:ГБ|GB)/i);
  return match ? Number(match[1]) : null;
}

function parseGpuSeries(product: Product): { label: string; rank: number } | null {
  if (product.category !== 'gpu') return null;
  const match = product.name.match(/\b(RTX|GTX|RX)\s*(\d{3,4})\b/i);
  if (!match) return null;
  return { label: `${match[1].toUpperCase()} ${match[2]}`, rank: Number(match[2]) };
}

function parseCpuTier(product: Product): number | null {
  if (product.category !== 'cpu') return null;
  const text = `${product.cpu ?? ''} ${product.name}`;
  const intel = text.match(/\bi([3579])\b/i) ?? text.match(/Core\s*([3579])\b/i);
  if (intel) return Number(intel[1]);
  const ryzen = text.match(/Ryzen\s*([3579])/i);
  return ryzen ? Number(ryzen[1]) : null;
}

function parseCpuNumber(product: Product): number | null {
  if (product.category !== 'cpu') return null;
  const text = `${product.cpu ?? ''} ${product.name}`;
  const match = text.match(/(\d{4,5})/);
  return match ? Number(match[1]) : null;
}

function parseRamType(product: Product): number | null {
  if (product.category !== 'ram') return null;
  const match = product.name.match(/DDR\s*([345])/i);
  return match ? Number(match[1]) : null;
}

function parseRamSpeed(product: Product): number | null {
  if (product.category !== 'ram') return null;
  const mhz = product.name.match(/(\d{4})\s*(?:MHz|МГц)/i);
  if (mhz) return Number(mhz[1]);
  const afterType = product.name.match(/DDR\s*[345]\s*(\d{4})/i);
  return afterType ? Number(afterType[1]) : null;
}

function parseRamKit(product: Product): string | null {
  if (product.category !== 'ram') return null;
  const match = product.name.match(/\(([^)]+)\)/);
  return match ? match[1].replace(/\s+/g, '') : null;
}

function parseSsdInterface(product: Product): { label: string; rank: number } | null {
  if (product.category !== 'ssd') return null;
  const text = product.name.toUpperCase();
  if (/NVME|PCIE/.test(text)) return { label: 'NVMe', rank: 2 };
  if (/SATA/.test(text)) return { label: 'SATA', rank: 1 };
  return null;
}

function pricePerGb(product: Product, gb: number | null): number | null {
  if (!gb || gb <= 0) return null;
  return Math.round(product.priceUah / gb);
}

const SPEC_ROWS: SpecRow[] = [
  { key: 'cpu', label: 'Процесор / модель', value: (p) => p.cpu, numeric: () => null, better: 'higher' },
  { key: 'ram', label: 'Оперативна пам’ять', value: (p) => (p.ramGb !== null ? `${p.ramGb} ГБ` : null), numeric: (p) => p.ramGb, better: 'higher' },
  { key: 'storage', label: 'Накопичувач', value: (p) => (p.storageGb !== null ? `${p.storageGb} ГБ` : null), numeric: (p) => p.storageGb, better: 'higher' },
  { key: 'display', label: 'Екран', value: (p) => (p.displayInches !== null ? `${p.displayInches}″` : null), numeric: (p) => p.displayInches, better: 'higher' },
  { key: 'weight', label: 'Вага', value: (p) => (p.weightKg !== null ? `${p.weightKg} кг` : null), numeric: (p) => p.weightKg, better: 'lower' },
  { key: 'battery', label: 'Автономність', value: (p) => (p.batteryHours !== null ? `до ${p.batteryHours} год` : null), numeric: (p) => p.batteryHours, better: 'higher' },
  {
    key: 'gpuSeries',
    label: 'Серія відеокарти',
    value: (p) => parseGpuSeries(p)?.label ?? null,
    numeric: (p) => parseGpuSeries(p)?.rank ?? null,
    better: 'higher',
  },
  {
    key: 'gpuVram',
    label: 'Відеопам’ять',
    value: (p) => {
      const gb = parseGpuVram(p);
      return gb !== null ? `${gb} ГБ` : null;
    },
    numeric: parseGpuVram,
    better: 'higher',
  },
  {
    key: 'gpuPriceGb',
    label: 'Ціна за 1 ГБ відеопам’яті',
    value: (p) => {
      const price = pricePerGb(p, parseGpuVram(p));
      return price !== null ? `${price.toLocaleString('uk-UA')} грн` : null;
    },
    numeric: (p) => pricePerGb(p, parseGpuVram(p)),
    better: 'lower',
  },
  {
    key: 'cpuTier',
    label: 'Клас процесора',
    value: (p) => {
      const tier = parseCpuTier(p);
      return tier !== null ? `Рівень ${tier}` : null;
    },
    numeric: parseCpuTier,
    better: 'higher',
    comparable: sameBrand,
  },
  {
    key: 'cpuNumber',
    label: 'Індекс моделі',
    value: (p) => {
      const index = parseCpuNumber(p);
      return index !== null ? String(index) : null;
    },
    numeric: parseCpuNumber,
    better: 'higher',
    comparable: sameBrand,
  },
  {
    key: 'ramType',
    label: 'Тип пам’яті',
    value: (p) => {
      const type = parseRamType(p);
      return type !== null ? `DDR${type}` : null;
    },
    numeric: parseRamType,
    better: 'higher',
  },
  {
    key: 'ramSpeed',
    label: 'Швидкість пам’яті',
    value: (p) => {
      const speed = parseRamSpeed(p);
      return speed !== null ? `${speed} МГц` : null;
    },
    numeric: parseRamSpeed,
    better: 'higher',
  },
  { key: 'ramKit', label: 'Комплектація', value: parseRamKit, numeric: () => null, better: 'higher' },
  {
    key: 'ramPriceGb',
    label: 'Ціна за 1 ГБ пам’яті',
    value: (p) => {
      if (p.category !== 'ram') return null;
      const price = pricePerGb(p, p.ramGb);
      return price !== null ? `${price.toLocaleString('uk-UA')} грн` : null;
    },
    numeric: (p) => (p.category === 'ram' ? pricePerGb(p, p.ramGb) : null),
    better: 'lower',
  },
  {
    key: 'ssdInterface',
    label: 'Інтерфейс',
    value: (p) => parseSsdInterface(p)?.label ?? null,
    numeric: (p) => parseSsdInterface(p)?.rank ?? null,
    better: 'higher',
  },
  {
    key: 'ssdPriceGb',
    label: 'Ціна за 1 ГБ',
    value: (p) => {
      if (p.category !== 'ssd') return null;
      const price = pricePerGb(p, p.storageGb);
      return price !== null ? `${price.toLocaleString('uk-UA')} грн` : null;
    },
    numeric: (p) => (p.category === 'ssd' ? pricePerGb(p, p.storageGb) : null),
    better: 'lower',
  },
];

function computeWinners(products: Product[], rows: SpecRow[]): WinnerMap {
  const result: WinnerMap = { price: [] };

  const cheapest = Math.min(...products.map((p) => p.priceUah));
  result.price = products.filter((p) => p.priceUah === cheapest).map((p) => p.id);

  for (const row of rows) {
    if (row.comparable && !row.comparable(products)) {
      result[row.key] = [];
      continue;
    }
    const numerics = products.map((p) => row.numeric(p)).filter((v): v is number => v !== null);
    if (numerics.length < 2) {
      result[row.key] = [];
      continue;
    }
    const best = row.better === 'lower' ? Math.min(...numerics) : Math.max(...numerics);
    result[row.key] = products.filter((p) => row.numeric(p) === best).map((p) => p.id);
  }

  return result;
}

interface CompatibilityNote {
  level: 'ok' | 'warning';
  message: string;
}

function checkCompatibility(products: Product[]): CompatibilityNote[] {
  const notes: CompatibilityNote[] = [];
  const categories = new Set(products.map((p) => p.category));
  const singleCategory = categories.size === 1 ? products[0].category : null;

  if (singleCategory === 'ram') {
    const types = new Set(products.map(parseRamType).filter((v): v is number => v !== null));
    if (types.size > 1) {
      notes.push({
        level: 'warning',
        message: 'У порівнянні є різні покоління пам’яті (DDR4 / DDR5). Перевірте, який тип підтримує материнська плата.',
      });
    } else if (types.size === 1) {
      notes.push({ level: 'ok', message: `Усі модулі одного типу (DDR${[...types][0]}) — за типом вони сумісні.` });
    }
    const speeds = products.map(parseRamSpeed).filter((v): v is number => v !== null);
    if (new Set(speeds).size > 1) {
      notes.push({
        level: 'ok',
        message: 'Якщо поставити модулі з різною швидкістю разом, система працюватиме на швидкості повільнішого.',
      });
    }
  }

  if (singleCategory === 'ssd') {
    const interfaces = new Set(products.map((p) => parseSsdInterface(p)?.label).filter(Boolean) as string[]);
    if (interfaces.size > 1) {
      notes.push({ level: 'ok', message: 'SATA і NVMe підключаються по-різному, але обидва підійдуть. NVMe зазвичай швидший.' });
    } else if (interfaces.size === 1) {
      notes.push({ level: 'ok', message: `Усі накопичувачі з інтерфейсом ${[...interfaces][0]} — взаємозамінні.` });
    }
  }

  if (singleCategory === 'gpu') {
    notes.push({
      level: 'warning',
      message: 'Перевірте потужність блока живлення та наявність потрібних роз’ємів для вибраної відеокарти.',
    });
    const vrams = products.map(parseGpuVram).filter((v): v is number => v !== null);
    if (new Set(vrams).size > 1) {
      notes.push({ level: 'ok', message: 'Більше відеопам’яті дає запас для нових ігор і важких програм.' });
    }
  }

  if (singleCategory === 'cpu') {
    notes.push({
      level: 'warning',
      message: 'Перевірте сокет процесора та підтримку з боку материнської плати й системи охолодження.',
    });
  }

  if (categories.size > 1) {
    const hasCpu = products.some((p) => p.category === 'cpu');
    const hasGpu = products.some((p) => p.category === 'gpu');
    const hasRam = products.some((p) => p.category === 'ram');
    const hasSsd = products.some((p) => p.category === 'ssd');

    if (hasCpu && hasRam) {
      notes.push({ level: 'ok', message: 'Процесор і оперативна пам’ять — основа оновлення, їх можна брати разом.' });
    }
    if (hasCpu && hasGpu) {
      notes.push({
        level: 'warning',
        message: 'Перевірте, чи материнська плата та блок живлення підтримують і новий процесор, і нову відеокарту.',
      });
    }
    if (hasGpu && hasSsd) {
      notes.push({ level: 'ok', message: 'Відеокарта й накопичувач незалежні — можна встановити разом.' });
    }
    if (hasRam && hasSsd) {
      notes.push({ level: 'ok', message: 'Оперативна пам’ять і накопичувач працюють разом без конфліктів.' });
    }
    if (hasCpu && hasSsd && !hasRam) {
      notes.push({
        level: 'warning',
        message: 'Для оновлення з новим процесором варто також перевірити оперативну пам’ять — її може не вистачати.',
      });
    }
  }

  return notes;
}

function winnerBadgeClass(highlight: boolean): string {
  return highlight
    ? 'rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-2.5 py-1 text-sm font-bold text-primary-950'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-sm font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400';
}

export default function CompareModal({ products, onClose }: CompareModalProps) {
  useEscapeKey(onClose);
  const winners = useMemo(() => computeWinners(products, SPEC_ROWS), [products]);
  const compatibility = useMemo(() => checkCompatibility(products), [products]);

  const winCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const allWinnerLists = [winners.price, ...SPEC_ROWS.map((r) => winners[r.key] ?? [])];
    for (const list of allWinnerLists) {
      for (const id of list) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [winners]);

  const topPick = useMemo(() => {
    if (products.length < 2) return null;
    let bestId: string | null = null;
    let bestCount = -1;
    for (const product of products) {
      const count = winCounts.get(product.id) ?? 0;
      if (count > bestCount) {
        bestCount = count;
        bestId = product.id;
      }
    }
    return bestCount > 0 ? bestId : null;
  }, [products, winCounts]);

  const bestValue = topPick ? products.find((p) => p.id === topPick) : null;
  const priceSpread = Math.max(...products.map((p) => p.priceUah)) - Math.min(...products.map((p) => p.priceUah));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-primary-950/95"
      >
        <div className="relative flex items-center justify-between gap-4 border-b border-slate-200/80 bg-gradient-to-r from-primary-50/80 via-white/60 to-accent-100/50 p-6 dark:border-white/10 dark:from-primary-900/40 dark:via-primary-950/40 dark:to-accent-900/10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-900 text-accent-300 shadow-lg shadow-primary-900/25">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="compare-title" className="text-2xl font-extrabold text-primary-900 dark:text-slate-50">
                Порівняння характеристик
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {products.length} варіанти · підсвічено найкраще значення в кожному рядку
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити порівняння"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-auto p-6">
          {bestValue && (
            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-accent-300/60 bg-gradient-to-r from-accent-100/80 to-white/50 px-5 py-4 dark:border-accent-400/20 dark:from-accent-500/15 dark:to-transparent">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-300 to-accent-500 text-primary-950 shadow-lg shadow-accent-500/25">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase tracking-wider text-accent-700 dark:text-accent-300">Найкращий загалом</p>
                <p className="text-lg font-extrabold text-primary-900 dark:text-slate-50">{bestValue.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {winCounts.get(bestValue.id) ?? 0} переваг у порівнянні · ціна {formatUah(bestValue.priceUah)}
                </p>
              </div>
              {priceSpread > 0 && (
                <div className="rounded-xl bg-white/70 px-3 py-2 text-right text-sm dark:bg-white/5">
                  <p className="font-semibold text-slate-500 dark:text-slate-400">Різниця цін</p>
                  <p className="font-extrabold text-primary-800 dark:text-accent-300">{formatUah(priceSpread)}</p>
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-base">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="w-44 bg-slate-50/90 px-4 py-4 align-bottom text-sm font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"
                  >
                    Характеристика
                  </th>
                  {products.map((product, index) => (
                    <th key={product.id} scope="col" className="bg-slate-50/90 px-4 py-4 align-bottom dark:bg-white/[0.04]">
                      <span className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
                          {index + 1}
                        </span>
                        <span className="text-lg font-extrabold leading-tight text-slate-900 dark:text-slate-50">{product.name}</span>
                      </span>
                      <span className="mt-1 block pl-8 text-sm font-semibold text-slate-500 dark:text-slate-400">{product.brand}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 dark:border-white/10">
                  <th scope="row" className="border-t border-slate-200/80 px-4 py-4 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
                    Ціна
                  </th>
                  {products.map((product) => {
                    const isWinner = winners.price.includes(product.id);
                    return (
                      <td key={product.id} className={`border-t border-slate-200/80 px-4 py-4 dark:border-white/10 ${isWinner ? 'bg-accent-100/50 dark:bg-accent-500/10' : ''}`}>
                        <span className="font-display text-xl font-extrabold text-primary-800 dark:text-accent-300">{formatUah(product.priceUah)}</span>
                        {products.length > 1 && isWinner && <span className={`ml-2 ${winnerBadgeClass(true)}`}>Найнижча</span>}
                      </td>
                    );
                  })}
                </tr>
                {SPEC_ROWS.map((row) => {
                  const winnerIds = winners[row.key] ?? [];
                  const hasValues = products.some((p) => row.value(p) !== null);
                  if (!hasValues) return null;
                  return (
                    <tr key={row.key} className="border-t border-slate-200 dark:border-white/10">
                      <th scope="row" className="border-t border-slate-200/80 px-4 py-4 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
                        {row.label}
                      </th>
                      {products.map((product) => {
                        const isWinner = winnerIds.includes(product.id);
                        const value = row.value(product);
                        return (
                          <td
                            key={product.id}
                            className={`border-t border-slate-200/80 px-4 py-4 text-slate-900 dark:border-white/10 dark:text-slate-100 ${
                              isWinner && products.length > 1 ? 'bg-accent-100/50 dark:bg-accent-500/10' : ''
                            }`}
                          >
                            {value ?? '—'}
                            {isWinner && products.length > 1 && value !== null && <span className={`ml-2 ${winnerBadgeClass(true)}`}>Краще</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t border-slate-200 dark:border-white/10">
                  <th scope="row" className="border-t border-slate-200/80 px-4 py-4 font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
                    Покупка
                  </th>
                  {products.map((product) => (
                    <td key={product.id} className="border-t border-slate-200/80 px-4 py-4 dark:border-white/10">
                      {product.marketplaceUrl ? (
                        <a
                          href={product.marketplaceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-primary-700 underline-offset-4 hover:underline dark:text-accent-300"
                        >
                          Маркетплейс
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {compatibility.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-primary-900 dark:text-slate-50">
                <Zap className="h-5 w-5 text-accent-600 dark:text-accent-300" aria-hidden="true" />
                Сумісність і що перевірити
              </h3>
              <ul className="mt-3 space-y-2.5">
                {compatibility.map((note, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-base text-slate-700 dark:text-slate-200">
                    {note.level === 'ok' ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-600 dark:text-success-400" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600 dark:text-warning-400" aria-hidden="true" />
                    )}
                    <span>{note.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
            Підсвічування показує найкраще значення у кожному рядку. Характеристики комплектуючих зчитані з назв і полів каталогу, тому перед покупкою
            варто звірити їх з описом у магазині. Ціни орієнтовні.
          </p>
        </div>
      </div>
    </div>
  );
}
