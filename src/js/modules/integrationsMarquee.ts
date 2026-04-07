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

        const contentWidth = content.scrollWidth + gap;

        const tween = gsap.to(row, {
          x: isReverse ? contentWidth : -contentWidth,
          duration,
          ease: 'linear',
          repeat: -1,
        });

        tweens.push(tween);
      });

      const updateSpeed = (speedFactor: number) => {
        tweens.forEach((tween) => {
          gsap.killTweensOf(tween, 'timeScale');
          gsap.to(tween, {
            timeScale: speedFactor,
            duration: 0.5,
            ease: 'power2.out',
          });
        });
      };

      let scrollTimeout: ReturnType<typeof setTimeout>;

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const velocity = Math.abs(self.getVelocity());
          const speedFactor = Math.max(1, velocity / 280);
          updateSpeed(speedFactor);

          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => updateSpeed(1), 100);
        },
        onLeave: () => updateSpeed(1),
        onEnterBack: () => updateSpeed(1),
        onLeaveBack: () => updateSpeed(1),
      });
    }

    mm.add('(min-width: 992px)', () => {
      if (desktopMarquee) setupMarquee(desktopMarquee, 20, 90);
    });

    mm.add('(max-width: 991px)', () => {
      if (mobileMarquee) setupMarquee(mobileMarquee, 12, 48);
    });
  });
}
