export function copyButton(): void {
  const copyButtons = document.querySelectorAll<HTMLElement>('[data-copy-button]');
  if (!copyButtons.length) return;

  function copyContent(
    content: string,
    labelText: HTMLElement | null,
    defaultIcon: HTMLElement | null,
    copiedIcon: HTMLElement | null
  ): void {
    // 1. Copy to clipboard
    navigator.clipboard.writeText(content);

    // 2. Change icon
    if (defaultIcon) defaultIcon.style.display = 'none';
    if (copiedIcon) copiedIcon.style.display = 'block';

    // 3. Change labelText to "Copied!"
    if (labelText) labelText.textContent = 'Copied!';

    // 4. Reverse after 2s
    setTimeout(() => {
      if (defaultIcon) defaultIcon.style.display = 'block';
      if (copiedIcon) copiedIcon.style.display = 'none';
      if (labelText) labelText.textContent = labelText.dataset.labelText ?? '';
    }, 2000);
  }

  copyButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const content = button.dataset.copyButton;
      const label = button.querySelector<HTMLElement>('[data-label]');
      const labelText = label?.querySelector<HTMLElement>('[data-label-text]') ?? null;
      const defaultIcon = button.querySelector<HTMLElement>('[data-icon="default"]');
      const copiedIcon = button.querySelector<HTMLElement>('[data-icon="copied"]');
      if (!content) return;
      copyContent(content, labelText, defaultIcon, copiedIcon);
    });
  });
}
