import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function integrationsMarquee() {
  const sections = document.querySelectorAll<HTMLElement>('[data-integrations-marquee]');

  if (!sections.length) return;

  sections.forEach((section) => {
    const desktopMarquee = section.querySelector<HTMLElement>('[data-desktop-marquee]');
    const mobileMarquee = section.querySelector<HTMLElement>('[data-mobile-marquee]');

    if (!desktopMarquee && !mobileMarquee) return;

    const mm = gsap.matchMedia();

    function setupMarquee(container: HTMLElement, duration: number, gap: number) {
      const rows = container.querySelectorAll<HTMLElement>('[data-row]');
      const tweens: gsap.core.Tween[] = [];

      rows.forEach((row) => {
        const isReverse = row.dataset.row === 'reverse';
        const content = row.querySelector('.integrations_marquee-content');

        if (!content) return;

        // Promote rows to their own compositor layer for GPU acceleration
        row.style.willChange = 'transform';

        const contentWidth = content.scrollWidth + gap;

        const tween = gsap.to(row, {
          x: isReverse ? contentWidth : -contentWidth,
          duration,
          ease: 'linear',
          repeat: -1,
          force3D: true,
        });

        tweens.push(tween);
      });

      return tweens;
    }

    mm.add('(min-width: 768px)', () => {
      const tweens = desktopMarquee ? setupMarquee(desktopMarquee, 40, 90) : [];
      setupScrollTrigger(tweens);
    });

    mm.add('(max-width: 767px)', () => {
      const tweens = mobileMarquee ? setupMarquee(mobileMarquee, 24, 48) : [];
      setupScrollTrigger(tweens);
    });

    function setupScrollTrigger(tweens: gsap.core.Tween[]) {
      if (!tweens.length) return;

      const updateSpeed = (speedFactor: number) => {
        tweens.forEach((tween) => {
          gsap.killTweensOf(tween, 'timeScale');
          gsap.to(tween, {
            timeScale: speedFactor,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      };

      let scrollTimeout: ReturnType<typeof setTimeout>;
      let lastUpdate = 0;
      const THROTTLE_MS = 50;

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const now = Date.now();
          if (now - lastUpdate < THROTTLE_MS) return;
          lastUpdate = now;

          const velocity = Math.abs(self.getVelocity());
          const speedFactor = Math.max(1, velocity / 350);
          updateSpeed(speedFactor);

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => updateSpeed(1), 150);
        },
        onLeave: () => updateSpeed(1),
        onEnterBack: () => updateSpeed(1),
        onLeaveBack: () => updateSpeed(1),
      });
    }
  });
}
