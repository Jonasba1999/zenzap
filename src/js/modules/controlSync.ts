import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function controlSync(): void {
  const INTERVAL = 3000;

  const sections = document.querySelectorAll<HTMLElement>('[data-control-sync]');

  if (!sections.length) return;

  sections.forEach((section) => {
    const triggers = section.querySelectorAll<HTMLElement>('[data-trigger]');

    if (!triggers.length) return;

    let currentIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const pairs: Array<{
      trigger: HTMLElement;
      image: HTMLElement | null;
      loader: HTMLElement | null;
    }> = [];

    function activate(index: number): void {
      const pair = pairs[index];
      gsap.to(pair.image, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' });
      gsap.to(pair.loader, { yPercent: 0, duration: INTERVAL / 1000 - 0.05, ease: 'linear' });
      pair.trigger.classList.add('is-active');
    }

    function deactivate(index: number): void {
      const pair = pairs[index];
      gsap.to(pair.image, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' });
      gsap.killTweensOf(pair.loader);
      gsap.set(pair.loader, { yPercent: -100 });
      pair.trigger.classList.remove('is-active');
    }

    function scheduleNext(): void {
      timeoutId = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % pairs.length;
        deactivate(currentIndex);
        currentIndex = nextIndex;
        activate(currentIndex);
        scheduleNext();
      }, INTERVAL);
    }

    function goTo(index: number): void {
      if (index === currentIndex) return;
      if (timeoutId !== null) clearTimeout(timeoutId);
      deactivate(currentIndex);
      currentIndex = index;
      activate(currentIndex);
      scheduleNext();
    }

    function startLoop(): void {
      activate(currentIndex);
      scheduleNext();
    }

    triggers.forEach((trigger, index) => {
      const name = trigger.dataset.trigger;
      const image = section.querySelector<HTMLElement>(`[data-image="${name}"]`);
      const loader = trigger.querySelector<HTMLElement>('[data-loader]');

      gsap.set(loader, { yPercent: -100 });
      if (index !== 0) gsap.set(image, { autoAlpha: 0 });

      pairs.push({ trigger, image, loader });

      trigger.addEventListener('click', () => goTo(index));
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      onEnter: () => startLoop(),
    });
  });
}
