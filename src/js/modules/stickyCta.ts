import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function stickyCta(): void {
  const stickyCta = document.querySelector<HTMLElement>('[data-sticky-cta="cta"]');
  const trigger = document.querySelector<HTMLElement>('[data-sticky-cta="trigger"]');

  if (!stickyCta || !trigger) return;

  gsap.set(stickyCta, { yPercent: 100, autoAlpha: 0 });

  ScrollTrigger.create({
    trigger: trigger,
    start: 'bottom top',
    onEnter: () => {
      gsap.timeline().set(stickyCta, { autoAlpha: 1 }).to(stickyCta, {
        yPercent: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    },
    onLeaveBack: () => {
      gsap
        .timeline()
        .to(stickyCta, {
          yPercent: 100,
          duration: 0.3,
          ease: 'power2.out',
        })
        .set(stickyCta, { autoAlpha: 1 });
    },
  });
}
