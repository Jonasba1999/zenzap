import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initNotificationAnimation(): void {
  const section = document.querySelector<HTMLElement>('.section_notification');
  const cardMegan = document.querySelector<HTMLImageElement>('#cardMegan');
  const cardTodd = document.querySelector<HTMLImageElement>('#cardTodd');

  if (!section || !cardMegan || !cardTodd) return;

  // Set initial states
  gsap.set([cardMegan], {
    opacity: 0,
    y: 40,
    scale: 0.9,
  });
  gsap.set([cardTodd], {
    opacity: 0,
    y: 100,
    scale: 0.9,
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 0.8,
    },
  });

  tl.to(cardMegan, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1,
    ease: 'power3.out',
  }).to(
    cardTodd,
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
    },
    0.3
  );
}
