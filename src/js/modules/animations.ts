declare const gsap: any;
declare const ScrollTrigger: any;
declare const SplitText: any;

gsap.registerPlugin(ScrollTrigger, SplitText);

export function textLineReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-line-reveal]');
  if (!targets.length) return;

  targets.forEach((target) => {
    SplitText.create(target, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
    });

    const lines = target.querySelectorAll('.line');

    gsap
      .timeline({
        scrollTrigger: {
          trigger: target,
          start: 'top 90%',
        },
      })
      .to(lines, {
        y: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
      });
  });
}

export function fadeUpAnimation(): void {
  const groups = document.querySelectorAll<HTMLElement>('[data-fade-up-group]');
  const singles = document.querySelectorAll<HTMLElement>(
    '[data-fade-up]:not([data-fade-up-group] [data-fade-up])'
  );

  groups.forEach((group) => {
    const targets = group.querySelectorAll<HTMLElement>('[data-fade-up]');
    if (!targets.length) return;

    const stagger = group.dataset.stagger ?? 0.15;

    gsap
      .timeline({
        scrollTrigger: {
          trigger: group,
          start: 'top 90%',
        },
      })
      .to(targets, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: stagger,
        ease: 'power3.out',
      });
  });

  singles.forEach((target) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: target,
          start: 'top 90%',
        },
      })
      .to(target, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      });
  });
}
