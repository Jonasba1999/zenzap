import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function refreshScrollTriggers(): void {
  let refreshTimeout: ReturnType<typeof setTimeout>;
  const resizeObserver = new ResizeObserver(() => {
    // Debounce so we don't refresh on every pixel change
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
  });

  resizeObserver.observe(document.body);
}
