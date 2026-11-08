function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const INTERACTIVE_SELECTOR = 'button, a[href], [role="button"], [data-ripple]';

function isDisabled(target: HTMLElement): boolean {
  if (target.matches(':disabled, [aria-disabled="true"]')) return true;
  const fieldset = target.closest('fieldset:disabled');
  return fieldset !== null;
}

function isSlider(target: HTMLElement): boolean {
  return target instanceof HTMLInputElement && target.type === 'range';
}

function findRippleHost(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const host = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!host || host.dataset.noRipple === 'true' || isDisabled(host) || isSlider(host)) return null;
  return host;
}

function createRipple(host: HTMLElement, event: PointerEvent): void {
  if (prefersReducedMotion()) return;
  if (event.button !== 0 && event.pointerType === 'mouse') return;

  const rect = host.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const dx = Math.max(x, rect.width - x);
  const dy = Math.max(y, rect.height - y);
  const radius = Math.ceil(Math.sqrt(dx * dx + dy * dy)) + 2;
  const size = radius * 2;

  const computed = window.getComputedStyle(host);
  if (computed.position === 'static') host.style.position = 'relative';
  host.classList.add('ripple-surface');

  const ripple = document.createElement('span');
  ripple.className = 'ripple-wave';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${x - radius}px`;
  ripple.style.top = `${y - radius}px`;
  ripple.setAttribute('aria-hidden', 'true');
  host.appendChild(ripple);

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    ripple.remove();
  };

  ripple.addEventListener('animationend', remove, { once: true });
  window.setTimeout(remove, 700);
}

let installed = false;

export function installRipple(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener(
    'pointerdown',
    (event) => {
      const host = findRippleHost(event.target);
      if (host) createRipple(host, event);
    },
    { passive: true },
  );
}
