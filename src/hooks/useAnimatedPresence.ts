import { useEffect, useState } from 'react';

/**
 * Keeps a conditionally rendered element mounted long enough to play its exit
 * animation. `rendered` stays true while exiting; `leaving` is true only
 * during the exit window so callers can swap enter/exit classes.
 */
export function useAnimatedPresence(show: boolean, exitMs = 260): { rendered: boolean; leaving: boolean } {
  const [rendered, setRendered] = useState(show);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setRendered(true);
      setLeaving(false);
      return;
    }

    if (!rendered) return;

    setLeaving(true);
    const timer = window.setTimeout(() => {
      setRendered(false);
      setLeaving(false);
    }, exitMs);

    return () => window.clearTimeout(timer);
  }, [show, rendered, exitMs]);

  return { rendered, leaving };
}
