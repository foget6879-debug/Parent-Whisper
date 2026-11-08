import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AMBIENCE_SCENES,
  isAmbienceRunning,
  setAmbienceVolume,
  startAmbience,
  stopAmbience,
  subscribeAmbienceRunning,
  type AmbienceScene,
} from '@/lib/ambience';

const STORAGE_KEY = 'family-page-ambience';

const DEFAULT_VOLUME = 0.45;

interface AmbienceSettings {
  scene: AmbienceScene;
  volume: number;
  enabled: boolean;
}

function isScene(value: unknown): value is AmbienceScene {
  return AMBIENCE_SCENES.some((scene) => scene.id === value);
}

function readStoredSettings(): AmbienceSettings {
  const fallback: AmbienceSettings = { scene: 'city', volume: DEFAULT_VOLUME, enabled: false };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return fallback;

    const candidate = parsed as Partial<AmbienceSettings>;
    return {
      scene: isScene(candidate.scene) ? candidate.scene : fallback.scene,
      volume:
        typeof candidate.volume === 'number' && Number.isFinite(candidate.volume)
          ? Math.min(1, Math.max(0, candidate.volume))
          : fallback.volume,
      enabled: candidate.enabled === true,
    };
  } catch {
    return fallback;
  }
}

export function useAmbience() {
  const [settings, setSettings] = useState<AmbienceSettings>(readStoredSettings);
  const [active, setActive] = useState(isAmbienceRunning);

  useEffect(() => subscribeAmbienceRunning(setActive), []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage may be blocked; the setting still applies for this visit.
    }
  }, [settings]);

  useEffect(() => {
    setAmbienceVolume(settings.volume);
  }, [settings.volume]);

  useEffect(() => {
    if (settings.enabled) {
      startAmbience(settings.scene);
    } else {
      stopAmbience();
    }
  }, [settings.enabled, settings.scene]);

  const setScene = useCallback((scene: AmbienceScene) => {
    setSettings((current) => ({ ...current, scene, enabled: true }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings((current) => ({ ...current, volume: Math.min(1, Math.max(0, volume)) }));
  }, []);

  const toggle = useCallback(() => {
    setSettings((current) => ({ ...current, enabled: !current.enabled }));
  }, []);

  return useMemo(
    () => ({
      scene: settings.scene,
      volume: settings.volume,
      enabled: settings.enabled,
      active,
      setScene,
      setVolume,
      toggle,
    }),
    [settings, active, setScene, setVolume, toggle],
  );
}
