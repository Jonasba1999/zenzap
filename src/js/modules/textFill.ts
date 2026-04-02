declare const gsap: any;
declare const ScrollTrigger: any;
declare const SplitText: any;

export function textFill() {
  const fillBlocks = document.querySelectorAll<HTMLElement>('[data-fill-text]');

  if (!fillBlocks.length) return;

  fillBlocks.forEach((block) => {
    let split = SplitText.create(block, {
      type: 'lines',
      linesClass: 'line',
    });

    split.lines.forEach((line: HTMLElement, i: number) => {
      gsap.fromTo(
        line,
        { '--fill': '0%' },
        {
          '--fill': '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: block,
            start: `top+=${i * 200} 85%`,
            end: `top+=${i * 200 + 200} 85%`,
            scrub: 0.5,
          },
        }
      );
    });
  });
}
