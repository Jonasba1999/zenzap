export function filloutDemoForm(): void {
  const iframe = document.querySelector<HTMLIFrameElement>(
    '[data-fillout-id="kNk4Ha9PXdus"] iframe'
  );
  if (!iframe) return;

  const url = new URL(iframe.src);
  url.searchParams.set('pageUri', window.location.href);
  url.searchParams.set('pageName', document.title);

  iframe.src = url.toString();
}
