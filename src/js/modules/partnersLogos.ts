import gsap from 'gsap';

export function partnersLogos(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-trusted-section]');

  if (!sections.length) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    sections.forEach((section) => {
      const maskWraps = Array.from(section.querySelectorAll<HTMLElement>('[data-mask-wrap]'));

      if (!maskWraps.length) return;

      // Set all images to y 100% initially
      maskWraps.forEach((wrap) => {
        const imgs = wrap.querySelectorAll<HTMLElement>('img');
        gsap.set(imgs, { yPercent: 100 });
      });

      // Animate first image of each wrap in on page load
      maskWraps.forEach((wrap, index) => {
        const firstImg = wrap.querySelector<HTMLElement>('img');
        if (firstImg) {
          gsap.to(firstImg, { yPercent: 0, duration: 0.5, delay: index * 0.1, ease: 'power2.out' });
        }
      });

      // Track which image is currently visible per wrap (0 = first, 1 = second)
      const activeIndex = new Array(maskWraps.length).fill(0);

      // Build sequence: odd positions (0-based: 0,2,4,...) then even positions (1,3,5,...)
      function buildSequence(total: number): number[] {
        const odds = [];
        const evens = [];
        for (let i = 0; i < total; i++) {
          if (i % 2 === 0) odds.push(i);
          else evens.push(i);
        }
        return [...odds, ...evens];
      }

      const sequence = buildSequence(maskWraps.length);
      let seqIndex = 0;
      let delayedCall: gsap.core.Tween | null = null;

      function animateNext() {
        const wrapIndex = sequence[seqIndex];
        const wrap = maskWraps[wrapIndex];
        const imgs = wrap.querySelectorAll<HTMLElement>('img');

        if (imgs.length < 2) {
          step();
          return;
        }

        const currentActive = activeIndex[wrapIndex];
        const nextActive = currentActive === 0 ? 1 : 0;
        const outImg = imgs[currentActive];
        const inImg = imgs[nextActive];

        gsap.to(outImg, {
          yPercent: -100,
          duration: 0.7,
          ease: 'back.inOut(1.2)',
          onComplete: () => {
            gsap.set(outImg, { yPercent: 100 });
          },
        });
        gsap.to(inImg, { yPercent: 0, duration: 0.7, ease: 'back.inOut(1.2)' });

        activeIndex[wrapIndex] = nextActive;
        step();
      }

      function step() {
        seqIndex = (seqIndex + 1) % sequence.length;
        delayedCall = gsap.delayedCall(2, animateNext);
      }

      // Start the loop after initial load animation settles
      delayedCall = gsap.delayedCall(2, animateNext);

      // Cleanup: kill pending delayed call and reset images when breakpoint exits
      return () => {
        delayedCall?.kill();
        maskWraps.forEach((wrap) => {
          const imgs = wrap.querySelectorAll<HTMLElement>('img');
          gsap.killTweensOf(imgs);
          gsap.set(imgs[0], { yPercent: 0 });
          gsap.set(imgs[1], { yPercent: 100 });
        });
      };
    });
  });
}
