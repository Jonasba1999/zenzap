export function wistiaLazyLoad(): void {
  const lazyLoadTriggers = document.querySelectorAll<HTMLElement>('[data-wistia-trigger]');

  if (!lazyLoadTriggers.length) return;

  lazyLoadTriggers.forEach((trigger) => {
    const wistiaId = trigger.dataset.wistiaTrigger;

    if (!wistiaId) return;

    trigger.addEventListener('click', () => {
      loadWistiaVideo(wistiaId);
    });
  });
}

function loadWistiaVideo(wistiaId: string): void {
  const wistiaEmbed = document.querySelector<HTMLElement>(`[data-wistia-embed="${wistiaId}"]`);

  if (!wistiaEmbed) return;

  if (!wistiaEmbed || wistiaEmbed.querySelector('iframe')) return; // already inserted

  wistiaEmbed.innerHTML = `
        <div style="position:relative;padding-top:56.25%;">
          <iframe
            src="https://fast.wistia.net/embed/iframe/${wistiaId}?videoFoam=true&autoplay=1"
            title="Wistia video"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowfullscreen
            frameborder="0"
            scrolling="no"
            style="position:absolute;inset:0;width:100%;height:100%;">
          </iframe>
        </div>
      `;
}
