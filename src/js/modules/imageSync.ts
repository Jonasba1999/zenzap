import gsap from 'gsap';

export function imageSync(): void {
  const sections = document.querySelectorAll<HTMLElement>('[data-images-sync]');

  if (!sections.length) return;

  function changeImage(newImage: HTMLElement, activeImage: HTMLElement | null): void {
    gsap.set(newImage, { zIndex: 2 });
    if (activeImage) gsap.set(activeImage, { zIndex: 1 });

    gsap.to(newImage, {
      autoAlpha: 1,
      duration: 0.4,
      onComplete: () => {
        if (activeImage) void gsap.set(activeImage, { autoAlpha: 0 });
      },
    });
  }

  sections.forEach((section) => {
    const triggers = section.querySelectorAll<HTMLElement>('[data-image-trigger]');

    if (!triggers.length) return;

    let activeImage: HTMLElement | null = null;

    triggers.forEach((trigger) => {
      const imageName = trigger.dataset.imageTrigger;
      const image = section.querySelector<HTMLElement>(`[data-image="${imageName}"]`);

      if (!image) return;

      if (trigger.hasAttribute('data-image-active')) {
        gsap.set(image, { autoAlpha: 1 });
        activeImage = image;
      } else {
        gsap.set(image, { autoAlpha: 0 });
      }

      trigger.addEventListener('click', () => {
        if (activeImage === image) return;
        changeImage(image, activeImage);
        activeImage = image;
      });
    });
  });
}
