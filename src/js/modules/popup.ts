import gsap from 'gsap';
import { toggleScroll } from './utils';

function pauseVideoInPopup(popup: HTMLElement): void {
  const iframe = popup.querySelector<HTMLIFrameElement>('iframe');
  if (!iframe?.contentWindow) return;

  // Try multiple message formats — different players accept different shapes
  const messages = [
    JSON.stringify({ method: 'pause' }),
    JSON.stringify({ method: 'pause', value: '' }),
    JSON.stringify({ event: 'command', func: 'pauseVideo' }), // YouTube format
    'pause',
  ];

  messages.forEach((msg) => {
    iframe.contentWindow!.postMessage(msg, '*');
  });
}

export function popup(): void {
  const triggers = document.querySelectorAll<HTMLElement>('[data-popup-trigger]');

  if (!triggers.length) return;

  function openPopup(popup: HTMLElement): void {
    toggleScroll(false);
    popup.style.display = 'flex';
    gsap.to(popup, {
      autoAlpha: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  function closePopup(popup: HTMLElement): void {
    toggleScroll(true);
    pauseVideoInPopup(popup);
    gsap.to(popup, {
      autoAlpha: 0,
      duration: 0.2,
      onComplete: () => {
        popup.style.display = 'none';
      },
    });
  }

  triggers.forEach((trigger) => {
    const popupName = trigger.dataset.popupTrigger;
    const popup = document.querySelector<HTMLElement>(`[data-popup="${popupName}"]`);
    if (!popup) return;

    const closeTriggers = popup.querySelectorAll<HTMLElement>('[data-popup-close]');
    closeTriggers.forEach((closeTrigger) => {
      closeTrigger.addEventListener('click', () => closePopup(popup));
    });

    trigger.addEventListener('click', () => openPopup(popup));
  });
}
