import { useEffect, useState } from 'react';
import { prefersReducedMotion, useInView } from '@/hooks/useInView';

interface CountUpProps {
  value: number;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

export default function CountUp({ value, suffix = '', durationMs = 1200, className = '' }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.6);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setCurrent(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, durationMs]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {current.toLocaleString('uk-UA')}
      {suffix}
    </span>
  );
}
