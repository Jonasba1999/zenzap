import { Rive } from '@rive-app/canvas';

export function animateRive() {
  const animations = [
    {
      selector: '.donut-chart--privacy-old-messages',
      file: 'https://cdn.prod.website-files.com/6559c53afcb17d5a5995bfc0/6a54d4c8a06b16ffe13de71d_survey-animations-eye.riv',
    },
    {
      selector: '.offboarding_chart-embed',
      file: 'https://cdn.prod.website-files.com/6559c53afcb17d5a5995bfc0/6a54d4c868beb9015690196e_survey-animations-group-chats.riv',
    },
    {
      selector: '#chart-time-searching',
      file: 'https://cdn.prod.website-files.com/6559c53afcb17d5a5995bfc0/6a54d4c918d9ee3bac57ba92_survey-animations-search.riv',
    },
  ];

  animations.forEach(({ selector, file }) => {
    const wrapper = document.querySelector<HTMLElement>(selector);

    if (!wrapper) return;

    // Prevent duplicate Rive initialization
    if (wrapper.querySelector('[data-rive-canvas]')) return;

    const chartCanvas = wrapper.querySelector('canvas');

    const canvas = document.createElement('canvas');

    canvas.dataset.riveCanvas = 'true';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';

    chartCanvas?.closest('div')?.appendChild(canvas);

    const riveInstance = new Rive({
      src: file,
      canvas,
      autoplay: true,
      fit: 'contain',
      alignment: 'center',
    });

    wrapper.dataset.riveInitialized = 'true';

    wrapper.addEventListener(
      'remove',
      () => {
        riveInstance.cleanup();
      },
      { once: true }
    );
  });
}
