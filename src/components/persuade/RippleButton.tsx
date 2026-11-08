import { useState, type MouseEvent, type ReactNode } from 'react';
import { playSound } from '@/lib/sound';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface RippleButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-accent-300 to-accent-500 text-primary-950 shadow-lg shadow-accent-500/30 hover:-translate-y-0.5 hover:from-accent-200 hover:to-accent-400',
  secondary:
    'border-2 border-primary-800/80 bg-white/40 text-primary-800 backdrop-blur hover:-translate-y-0.5 hover:bg-primary-800 hover:text-white dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/15 dark:hover:text-white',
};

export default function RippleButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const spawnRipple = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const id = Date.now() + Math.random();
    setRipples((current) => [
      ...current,
      { id, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2, size },
    ]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== id));
    }, 600);
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    spawnRipple(event);
    playSound('click');
    onClick?.();
  };

  const handleHover = () => {
    playSound('hover');
  };

  const classes = `relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-4 text-lg font-extrabold transition-all duration-200 ${VARIANTS[variant]} ${className}`;

  const content = (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full bg-white/70 animate-ripple"
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
      <span className="relative">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} onClick={handleClick} onMouseEnter={handleHover} className={classes} data-no-ripple="true">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={handleClick} onMouseEnter={handleHover} className={classes} data-no-ripple="true">
      {content}
    </button>
  );
}
