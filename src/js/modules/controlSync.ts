import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function controlSync(): void {
  const INTERVAL = 3;

  document.querySelectorAll<HTMLElement>('[data-control-sync]').forEach((section) => {
    const triggers = Array.from(section.querySelectorAll<HTMLElement>('[data-trigger]'));
    if (!triggers.length) return;

    const items = triggers.map((trigger) => ({
      trigger,
      image: section.querySelector<HTMLElement>(`[data-image="${trigger.dataset.trigger}"]`),
      loader: trigger.querySelector<HTMLElement>('[data-loader]'),
    }));

    let activeIndex = -1;
    let nextCall: gsap.core.Tween | null = null;

    function setActive(index: number): void {
      items.forEach((item, i) => {
        const isActive = i === index;
        item.trigger.classList.toggle('is-active', isActive);
        gsap.to(item.image, { autoAlpha: isActive ? 1 : 0, duration: 0.8, ease: 'power2.out' });
        gsap.killTweensOf(item.loader);
        gsap.fromTo(
          item.loader,
          { yPercent: -100 },
          isActive
            ? { yPercent: 0, duration: INTERVAL, ease: 'linear' }
            : { yPercent: -100, duration: 0 }
        );
      });
      activeIndex = index;

      nextCall?.kill();
      nextCall = gsap.delayedCall(INTERVAL, () => setActive((activeIndex + 1) % items.length));
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        if (index !== activeIndex) setActive(index);
      });
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: () => setActive(0),
    });
  });
}
