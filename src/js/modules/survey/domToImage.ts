import domtoimage from 'dom-to-image';

function domToImage(node: HTMLElement): Promise<string> {
  return domtoimage.toJpeg(node, { quality: 0.95 }).then(function (dataUrl) {
    const link = document.createElement('a');
    link.download = 'survey-data-section.jpeg';
    link.href = dataUrl;
    link.click();
  });
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
