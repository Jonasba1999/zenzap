import gsap from 'gsap';

export function partnersLogosSequential(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-trusted-section]');

  if (!sections.length) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    sections.forEach((section) => {
      const maskWraps = Array.from(section.querySelectorAll<HTMLElement>('[data-mask-wrap]'));

      if (!maskWraps.length) return;

      maskWraps.forEach((wrap) => {
        const imgs = wrap.querySelectorAll<HTMLElement>('img');
        gsap.set(imgs, { yPercent: 100 });
      });

      maskWraps.forEach((wrap, index) => {
        const firstImg = wrap.querySelector<HTMLElement>('img');
        if (firstImg) {
          gsap.to(firstImg, { yPercent: 0, duration: 0.5, delay: index * 0.1, ease: 'power2.out' });
        }
      });

      const activeIndex = new Array(maskWraps.length).fill(0);

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
        seqIndex = seqIndex < sequence.length - 1 ? seqIndex + 1 : 0;
        delayedCall = gsap.delayedCall(0.7, animateNext);
      }

      delayedCall = gsap.delayedCall(2, animateNext);

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

      const activeIndex = new Array(maskWraps.length).fill(0);

      // Groups: [0,2,4,6,...] then [1,3,5,...] then repeat
      const groups: number[][] = [[], []];
      maskWraps.forEach((_, i) => {
        groups[i % 2 === 0 ? 0 : 1].push(i);
      });

      let groupIndex = 0;
      let delayedCall: gsap.core.Tween | null = null;

      function animateGroup() {
        groups[groupIndex].forEach((wrapIndex) => {
          const wrap = maskWraps[wrapIndex];
          const imgs = wrap.querySelectorAll<HTMLElement>('img');

          if (imgs.length < 2) return;

          const currentActive = activeIndex[wrapIndex];
          const nextActive = currentActive === 0 ? 1 : 0;
          const outImg = imgs[currentActive];
          const inImg = imgs[nextActive];

          gsap.to(outImg, {
            yPercent: -100,
            duration: 0.7,
            ease: 'back.inOut(1.2)',
            onComplete: () => gsap.set(outImg, { yPercent: 100 }),
          });
          gsap.to(inImg, { yPercent: 0, duration: 0.7, ease: 'back.inOut(1.2)' });

          activeIndex[wrapIndex] = nextActive;
        });

        groupIndex = (groupIndex + 1) % groups.length;
        delayedCall = gsap.delayedCall(2, animateGroup);
      }

      delayedCall = gsap.delayedCall(2, animateGroup);

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
