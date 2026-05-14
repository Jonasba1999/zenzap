export function videoFallback(): void {
  const videoBlocks = document.querySelectorAll<HTMLElement>('[data-video-fallback]');
  if (!videoBlocks.length) return;

  videoBlocks.forEach((block) => {
    const videoWrap = block.querySelector<HTMLElement>('[data-video-wrap]');
    const video = videoWrap?.querySelector<HTMLVideoElement>('video');
    const image = block.querySelector<HTMLElement>('[data-fallback-image]');

    if (!videoWrap || !video || !image) return;

    const showFallback = () => {
      videoWrap.style.display = 'none';
      image.style.display = 'block';
    };

    const showVideo = () => {
      videoWrap.style.display = 'block';
      image.style.display = 'none';
    };

    video
      .play()
      .then(() => {
        // Playback started successfully
        showVideo();
      })
      .catch((error) => {
        // Playback was blocked — show placeholder
        // error.name is usually "NotAllowedError" or "AbortError"
        showFallback();
      });
  });
}
