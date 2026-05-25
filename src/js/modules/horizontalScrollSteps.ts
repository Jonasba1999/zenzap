import gsap from 'gsap';

export function horizontalScrollSteps(): void {
  const wrap = document.querySelector<HTMLElement>('[data-horizontal-steps="wrap"]');

  console.log(wrap);
  if (!wrap) return;

  const list = wrap.querySelector<HTMLElement>('[data-horizontal-steps="list"]');

  if (!list) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    const overflowWidth = list.scrollWidth - list.offsetWidth;

    gsap.to(list, {
      x: -overflowWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: '+=1000',
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });
  });
}
