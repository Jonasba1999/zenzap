declare const gsap: any;
declare const ScrollTrigger: any;

export function integrationsMarquee() {
  const sections = document.querySelectorAll<HTMLElement>('[data-integrations-marquee]');

  if (!sections.length) return;

  sections.forEach((section) => {
    const marqueeRows = section.querySelectorAll<HTMLElement>('[data-row]');

    if (!marqueeRows.length) return;

    const tweens: any[] = [];

    marqueeRows.forEach((row) => {
      const isReverse = row.dataset.row === 'reverse';
      const content = row.querySelector('.integrations_marquee-content');

      if (!content) return;

      const contentWidth = content.scrollWidth + 90;

      const tween = gsap.to(row, {
        x: isReverse ? contentWidth : -contentWidth,
        duration: 20,
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
      scrub: true,
      onUpdate: (self: any) => {
        const velocity = Math.abs(self.getVelocity());
        const speedFactor = Math.max(1, velocity / 150);
        updateSpeed(speedFactor);

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          updateSpeed(1);
        }, 100);
      },
      onLeave: () => updateSpeed(1),
      onEnterBack: () => updateSpeed(1),
      onLeaveBack: () => updateSpeed(1),
    });
  });
}
