// Усі цифри й суми тут орієнтовні: замініть їх на свої після заміру та цін у магазині.
export const UPGRADE_PRICES = {
  minimal: 1800,
  optimal: 4200,
  maximal: 22000,
} as const;

export const FAMILY_CONTRIBUTION = 1000;

export const SPEED_METRICS = [
  {
    id: 'boot',
    label: 'Запуск ноутбука',
    before: { seconds: 240, text: '4 хв' },
    after: { seconds: 35, text: '35 сек' },
  },
  {
    id: 'open',
    label: 'Відкриття документа',
    before: { seconds: 12, text: '12 сек' },
    after: { seconds: 2, text: '2 сек' },
  },
  {
    id: 'browser',
    label: 'Кілька вкладок браузера',
    before: { seconds: 9, text: 'гальмує' },
    after: { seconds: 1, text: 'плавно' },
  },
] as const;

export const CALCULATOR_DEFAULTS = {
  price: UPGRADE_PRICES.optimal,
  hoursPerWeek: 3,
  sharePercent: 60,
  valuePerHour: 100,
  repairAvoidedPerYear: 1000,
} as const;
