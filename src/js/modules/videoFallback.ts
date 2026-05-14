import gsap from 'gsap';

export function videoFallback(): void {
  const videoBlocks = document.querySelectorAll<HTMLElement>('[data-video-fallback]');
  if (!videoBlocks.length) return;

  videoBlocks.forEach((block) => {
    const videoWrap = block.querySelector<HTMLElement>('[data-video-wrap]');
    const video = videoWrap?.querySelector<HTMLVideoElement>('video');
    const image = block.querySelector<HTMLElement>('[data-fallback-image]');

    if (!videoWrap || !video || !image) return;

    const showFallback = () => {
      gsap.to(videoWrap, {
        autoAlpha: 0,
        duration: 0.2,
        ease: 'power2.out',
      });

      gsap.to(image, {
        autoAlpha: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    const showVideo = () => {
      gsap.set(videoWrap, {
        autoAlpha: 1,
      });

      gsap.to(image, {
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
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
