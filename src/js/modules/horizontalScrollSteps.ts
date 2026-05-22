import gsap from 'gsap';

export function horizontalScrollSteps(): void {
  const list = document.querySelector<HTMLElement>('[data-horizontal-steps]');

  if (!list) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    const overflowWidth = list.scrollWidth - list.offsetWidth;

    gsap.to(list, {
      x: -overflowWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: list,
        start: 'bottom bottom',
        end: 'bottom 70%',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
  });
}
