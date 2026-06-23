import gsap from 'gsap';

export function logoRotate() {
  const logoSections = document.querySelectorAll<HTMLElement>('.clients-wall_grid.is-desktop');

  if (!logoSections.length) return;

  logoSections.forEach((section) => {
    const cells = Array.from(section.querySelectorAll<HTMLElement>('.clients-wall_cell'));

    if (!cells.length) return;

    // Set initial state: first item visible, rest hidden
    const currentItemIndex = new Map<number, number>();
    cells.forEach((cell, i) => {
      const items = cell.querySelectorAll<HTMLElement>('.clients-wall_item');
      if (items.length < 2) return;
      items.forEach((item, j) => gsap.set(item, { autoAlpha: j === 0 ? 1 : 0 }));
      currentItemIndex.set(i, 0);
    });

    const shuffle = (arr: number[]) => arr.sort(() => Math.random() - 0.5);
    const eligibleIndices = cells
      .map((cell, i) => ({ cell, i }))
      .filter(({ cell }) => cell.querySelectorAll('.clients-wall_item').length >= 2)
      .map(({ i }) => i);
    let queue: number[] = shuffle([...eligibleIndices]);

    setInterval(() => {
      if (queue.length === 0) queue = shuffle([...eligibleIndices]);

      const index = queue.shift()!;
      const cell = cells[index];
      const items = Array.from(cell.querySelectorAll<HTMLElement>('.clients-wall_item'));

      const current = currentItemIndex.get(index)!;
      const next = (current + 1) % items.length;

      gsap.to(items[current], { autoAlpha: 0, duration: 0.4, ease: 'power1.inOut' });
      gsap.to(items[next], { autoAlpha: 1, duration: 0.4, ease: 'power1.inOut' });
      currentItemIndex.set(index, next);
    }, 2000);
  });
}
