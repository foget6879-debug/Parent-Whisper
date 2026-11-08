import { useCallback, useEffect, useState } from 'react';
import { isSoundEnabled, setSoundEnabled, unlockAudio } from '@/lib/sound';

const STORAGE_KEY = 'family-page-sound';

function readStoredEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

export function useSound() {
  const [enabled, setEnabled] = useState(readStoredEnabled);

  useEffect(() => {
    setSoundEnabled(enabled);
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
    } catch {
      // Storage may be blocked; the setting still applies for this visit.
    }
  }, [enabled]);

  const toggle = useCallback(() => {
    unlockAudio();
    setEnabled((current) => !current);
  }, []);

  return { enabled, isSoundOn: isSoundEnabled(), toggle };
}
