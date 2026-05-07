import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function controlSync(): void {
  document.querySelectorAll<HTMLElement>('[data-control-sync]').forEach((section) => {
    const triggers = Array.from(section.querySelectorAll<HTMLElement>('[data-trigger]'));
    if (!triggers.length) return;

    const items = triggers.map((trigger) => {
      const wrapper = section.querySelector<HTMLElement>(
        `[data-video="${trigger.dataset.trigger}"]`
      );
      return {
        trigger,
        wrapper,
        videoEl: wrapper?.querySelector<HTMLVideoElement>('video') ?? null,
        loader: trigger.querySelector<HTMLElement>('[data-loader]'),
      };
    });

    let activeIndex = -1;
    let endedHandler: (() => void) | null = null;

    function setActive(index: number): void {
      const prevIndex = activeIndex;

      if (prevIndex >= 0 && items[prevIndex].videoEl && endedHandler) {
        items[prevIndex].videoEl!.removeEventListener('ended', endedHandler);
        endedHandler = null;
      }

      items.forEach((item, i) => {
        const isActive = i === index;
        item.trigger.classList.toggle('is-active', isActive);
        gsap.to(item.wrapper, { autoAlpha: isActive ? 1 : 0, duration: 0, ease: 'power2.out' });

        if (!isActive) {
          gsap.killTweensOf(item.loader);
          gsap.set(item.loader, { yPercent: -100 });
          if (i === prevIndex && item.videoEl) {
            item.videoEl.pause();
            item.videoEl.currentTime = 0;
          }
        }
      });

      activeIndex = index;
      const activeItem = items[index];

      if (activeItem.videoEl) {
        activeItem.videoEl.currentTime = 0;
        activeItem.videoEl.play().then(() => {
          const duration = activeItem.videoEl!.duration;
          gsap.killTweensOf(activeItem.loader);
          gsap.fromTo(
            activeItem.loader,
            { yPercent: -100 },
            { yPercent: 0, duration, ease: 'linear' }
          );
        });

        endedHandler = () => setActive((activeIndex + 1) % items.length);
        activeItem.videoEl.addEventListener('ended', endedHandler, { once: true });
      }
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
