export function logoRotate() {
  const logoSections = document.querySelectorAll<HTMLElement>('[data-logo-rotate]');

  if (!logoSections.length) return;

  logoSections.forEach((section) => {
    const logoWraps = section.querySelectorAll<HTMLElement>('[data-logo-wrap]');

    if (!logoWraps.length) return;

    logoWraps.forEach((logoWrap, index) => {
      // 1. Craete gsap rotate animation
      // 2. Apply it for each logo in wrap
      // 3. Add all animation timelines to array
      // 4. Create timer function that selects which timeline to play
      // 4.1. Columns order: 1, 3, 5, 7, 2, 4, 6
    });
  });
}
