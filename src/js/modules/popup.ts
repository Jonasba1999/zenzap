declare const gsap: any;

export function popup(): void {
  const triggers = document.querySelectorAll<HTMLElement>('[data-popup-trigger]');

  if (!triggers.length) return;

  function openPopup(popup: HTMLElement): void {
    gsap.to(popup, {
      autoAlpha: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  function closePopup(popup: HTMLElement): void {
    gsap.to(popup, {
      autoAlpha: 0,
      duration: 0.2,
    });
  }

  triggers.forEach((trigger) => {
    const popupName = trigger.dataset.popupTrigger;

    const popup = document.querySelector<HTMLElement>(`[data-popup="${popupName}"]`);

    if (!popup) return;

    const closeTriggers = document.querySelectorAll<HTMLElement>(
      `[data-popup-close="${popupName}"]`
    );

    closeTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        closePopup(popup);
      });
    });

    trigger.addEventListener('click', () => {
      openPopup(popup);
    });
  });
}
