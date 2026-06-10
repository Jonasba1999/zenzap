import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function stickyCta(): void {
  const stickyCta = document.querySelector<HTMLElement>('[data-sticky-cta="cta"]');
  const trigger = document.querySelector<HTMLElement>('[data-sticky-cta="trigger"]');
  const hideTriggers = document.querySelectorAll<HTMLElement>('[data-sticky-cta="hide-trigger"]');

  if (!stickyCta || !trigger) return;

  gsap.set(stickyCta, { yPercent: 100, autoAlpha: 0 });

  const hide = () => {
    gsap
      .timeline()
      .to(stickyCta, {
        yPercent: 100,
        duration: 0.3,
        ease: 'power2.out',
      })
      .set(stickyCta, { autoAlpha: 0 });
  };

  const show = () => {
    gsap.timeline().set(stickyCta, { autoAlpha: 1 }).to(stickyCta, {
      yPercent: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  ScrollTrigger.create({
    trigger: trigger,
    start: 'bottom top',
    onEnter: show,
    onLeaveBack: hide,
  });

  hideTriggers.forEach((hideTrigger) => {
    ScrollTrigger.create({
      trigger: hideTrigger,
      start: 'top bottom',
      onEnter: hide,
      onLeaveBack: show,
    });
  });
}
