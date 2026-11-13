import { useCallback, useEffect, useState } from 'react';

export type BackgroundId = 'city' | 'gradient' | 'space';

export interface BackgroundOption {
  id: BackgroundId;
  label: string;
  description: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'city',
    label: 'Місто',
    description: 'Анімований силует міста (день/ніч).',
  },
  {
    id: 'gradient',
    label: 'Мінімалістичний',
    description: 'М’який градієнт без зайвих деталей.',
  },
  {
    id: 'space',
    label: 'Космос',
    description: 'Зоряне небо та туманність (день/ніч).',
  },
];

const STORAGE_KEY = 'family-page-background';

function readStoredBackground(): BackgroundId | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'city' || value === 'gradient' || value === 'space' ? value : null;
  } catch {
    return null;
  }
}

export function useBackground() {
  const [background, setBackground] = useState<BackgroundId>(() => readStoredBackground() ?? 'city');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, background);
    } catch {
      // Storage may be blocked; the choice still applies for this visit.
    }
  }, [background]);

  const set = useCallback((id: BackgroundId) => {
    setBackground(id);
  }, []);

  return { background, setBackground: set };
}
