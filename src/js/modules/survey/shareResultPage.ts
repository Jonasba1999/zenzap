export function shareResultPage(): void {
  const buttons = document.querySelectorAll<HTMLElement>('.cta_copy-btn');

  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const textWrapper = button.querySelector<HTMLElement>('.cta_copy-btn-text');

      try {
        await navigator.clipboard.writeText(window.location.href);

        if (textWrapper) {
          textWrapper.textContent = 'Copied!';
        }

        setTimeout(() => {
          if (textWrapper) {
            textWrapper.textContent = 'Copy Image';
          }
        }, 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);

        if (textWrapper) {
          textWrapper.textContent = 'Failed';
        }

        setTimeout(() => {
          if (textWrapper) {
            textWrapper.textContent = 'Copy Image';
          }
        }, 2000);
      }
    });
  });
}
