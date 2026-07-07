import domtoimage from 'dom-to-image';

async function domToImage(node: HTMLElement): Promise<void> {
  const logo = document.createElement('img');

  const whiteLogo =
    'https://cdn.prod.website-files.com/6559c53afcb17d5a5995bfc0/65d50e69ac02829f9c8d4ef8_Zenzap.svg';
  const blackLogo =
    'https://cdn.prod.website-files.com/6559c53afcb17d5a5995bfc0/66b1269daaf4163a0b1bc9c1_zenzap%20black.svg';

  logo.src = node.getAttribute('data-print-wrapper') === 'black' ? whiteLogo : blackLogo;
  logo.className = 'export-logo';

  node.style.position = 'relative';
  node.appendChild(logo);

  setTimeout(async () => {
    try {
      const blob = await domtoimage.toBlob(node, {
        filter: (element) => {
          return !(element instanceof HTMLElement && element.classList.contains('cta_copy-btn'));
        },
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
    } catch (err) {
      console.error('Failed to copy image:', err);
    } finally {
      logo.remove();
    }
  }, 300);
}

export function initDomToImage(): void {
  const buttons = document.querySelectorAll('.cta_copy-btn');

  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const node = button.closest('[data-print-wrapper]') as HTMLElement;

      if (!node) return;

      const textWrapper = button.querySelector('.cta_copy-btn-text');

      try {
        await domToImage(node);

        if (textWrapper) {
          textWrapper.textContent = 'Copied!';
        }
      } catch {
        if (textWrapper) {
          textWrapper.textContent = 'Failed';
        }
      }

      setTimeout(() => {
        if (textWrapper) {
          textWrapper.textContent = 'Copy';
        }
      }, 2000);
    });
  });
}
