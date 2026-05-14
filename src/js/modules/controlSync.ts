import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IMAGE_INTERVAL = 3;

// Cached promise — detection runs once per page load and is reused
let autoplaySupport: Promise<boolean> | null = null;

function canAutoplayVideo(testVideo: HTMLVideoElement): Promise<boolean> {
  if (autoplaySupport) return autoplaySupport;

  autoplaySupport = (async () => {
    try {
      await testVideo.play();
      if (testVideo.paused) return false;
      testVideo.pause();
      testVideo.currentTime = 0;
      return true;
    } catch {
      return false;
    }
  })();

  return autoplaySupport;
}

export async function controlSync(): Promise<void> {
  const sections = document.querySelectorAll<HTMLElement>('[data-control-sync]');

  for (const section of Array.from(sections)) {
    const declaredMode = section.dataset.controlSync as 'video' | 'image';
    const triggers = Array.from(section.querySelectorAll<HTMLElement>('[data-trigger]'));
    if (!triggers.length) continue;

    let activeIndex: number = -1;
    let loaderTween: gsap.core.Tween | null = null;

    // Create elements map
    const items = triggers.map((trigger) => {
      const wrapper = section.querySelector<HTMLElement>(
        `[data-video="${trigger.dataset.trigger}"]`
      );
      return {
        trigger,
        wrapper,
        video: wrapper?.querySelector<HTMLVideoElement>('video') ?? null,
        loader: trigger.querySelector<HTMLElement>('[data-loader]'),
      };
    });

    // Resolve mode: if declared as 'video' but device can't autoplay, fall back to 'image'
    let mode: 'video' | 'image' = declaredMode;
    if (declaredMode === 'video' && items[0].video) {
      const canPlay = await canAutoplayVideo(items[0].video);
      if (!canPlay) mode = 'image';
    }

    function setActive(index: number): void {
      // Kill any in-flight loader animation before starting a new one
      loaderTween?.kill();
      loaderTween = null;

      items.forEach((item, i) => {
        const isActive = i === index;

        // General styles
        if (isActive) {
          item.trigger.classList.add('is-active');
          gsap.to(item.wrapper, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' });
        } else {
          item.trigger.classList.remove('is-active');
          gsap.to(item.wrapper, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' });
          gsap.killTweensOf(item.loader);
          gsap.set(item.loader, { yPercent: -100 });
        }

        // Video sequence
        if (mode === 'video' && item.video) {
          if (isActive) {
            item.video.currentTime = 0;
            item.video
              .play()
              .then(() => {
                gsap.killTweensOf(item.loader);
                loaderTween = gsap.fromTo(
                  item.loader,
                  { yPercent: -100 },
                  { yPercent: 0, duration: item.video!.duration, ease: 'linear' }
                );
              })
              .catch(() => {
                // Playback failed unexpectedly — should be rare since we detected upfront
              });

            // Advance to next when video ends. { once: true } prevents listener buildup.
            item.video.addEventListener('ended', () => setActive((index + 1) % items.length), {
              once: true,
            });
          } else {
            item.video.pause();
            item.video.currentTime = 0;
          }
        }

        // Image sequence
        if (mode === 'image') {
          if (isActive) {
            gsap.killTweensOf(item.loader);
            loaderTween = gsap.fromTo(
              item.loader,
              { yPercent: -100 },
              {
                yPercent: 0,
                duration: IMAGE_INTERVAL,
                ease: 'linear',
                onComplete: () => {
                  setActive((index + 1) % items.length);
                },
              }
            );
          }
        }
      });

      // Set new active index
      activeIndex = index;
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        if (index !== activeIndex) setActive(index);
      });
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 90%',
      once: true,
      onEnter: () => setActive(0),
    });
  }
}
