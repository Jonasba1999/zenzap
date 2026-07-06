import domtoimage from 'dom-to-image';

async function domToImage(node: HTMLElement): Promise<void> {
  const logo = document.createElement('img');
  logo.src =
    'https://cdn.prod.website-files.com/6559c53afcb17d5a5995bfc0/68e2959ea276b3c16c64fa7b_logo%20zenzap.svg';
  logo.className = 'export-logo';

  node.style.position = 'relative';
  node.appendChild(logo);

  setTimeout(async () => {
    try {
      const dataUrl = await domtoimage.toJpeg(node, {
        quality: 0.95,
        filter: (element) => {
          return !(element instanceof HTMLElement && element.classList.contains('cta_copy-btn'));
        },
      });

      const link = document.createElement('a');
      link.download = 'survey-data-section.jpeg';
      link.href = dataUrl;
      link.click();
    } finally {
      logo.remove();
    }
  }, 300);
}

export function initDomToImage(): void {
  const buttons = document.querySelectorAll('.cta_copy-btn');

  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const node = button.closest('[data-print-wrapper]') as HTMLElement;
      if (node) {
        domToImage(node);

        const textWrapper = button.querySelector('.cta_copy-btn-text');
        if (textWrapper) {
          textWrapper.textContent = 'Copied!';
        }

        setTimeout(() => {
          if (textWrapper) {
            textWrapper.textContent = 'Copy';
          }
        }, 2000);
      }
    });
  });
}
