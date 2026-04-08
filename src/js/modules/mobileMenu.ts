import gsap from 'gsap';

export function mobileMenu(): void {
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  const hamburger = document.querySelector<HTMLElement>('[data-mobile-menu-trigger]');

  if (!menu || !hamburger) return;

  let menuOpen = false;
  let drillOpen = false;

  const drillWrap = menu.querySelector<HTMLElement>('[data-drill-wrap]');
  const drillTriggers = menu.querySelectorAll<HTMLElement>('[data-drill-trigger]');
  const drillContent = menu.querySelectorAll<HTMLElement>('[data-drill-content]');
  const drillReturns = menu.querySelectorAll<HTMLElement>('[data-drill-return]');

  if (!drillTriggers.length || !drillContent.length || !drillWrap || !drillReturns.length) return;

  const drillMap = new Map<string, HTMLElement>();

  drillContent.forEach((content) => {
    const name = content.dataset.drillContent;
    if (!name) return;

    gsap.set(content, {
      display: 'none',
    });

    drillMap.set(name, content);
  });

  function openMenu(): void {
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

    tl.set(menu, {
      autoAlpha: 1,
    }).to(menu, {
      x: 0,
      duration: 0.5,
      ease: 'power3.inOut',
    });

    menuOpen = true;
  }

  function closeMenu(): void {
    let tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

    tl.to(menu, {
      x: '100%',
      duration: 0.5,
      ease: 'power3.inOut',
    }).set(menu, {
      autoAlpha: 0,
    });

    menuOpen = false;

    if (drillOpen) {
      menuDrillOut();
      drillOpen = false;
    }
  }

  function menuDrillIn(activeContent: HTMLElement): void {
    // 1. Show related content
    drillMap.forEach((content) => {
      if (content !== activeContent) {
        gsap.set(content, {
          display: 'none',
        });
      } else {
        gsap.set(content, {
          display: 'flex',
        });
      }
    });

    // 2. Animate mobile nav
    const offset = drillWrap!.offsetWidth / 2 + 40;
    gsap.to(drillWrap, {
      x: -offset,
      duration: 0.5,
      ease: 'power3.inOut',
    });

    drillOpen = true;
  }

  function menuDrillOut(): void {
    gsap.to(drillWrap, {
      x: '0%',
      duration: 0.5,
      ease: 'power3.inOut',
    });
  }

  // Event listeners
  drillTriggers.forEach((trigger) => {
    const contentName = trigger.dataset.drillTrigger;

    if (!contentName) return;

    const contentEl = drillMap.get(contentName);

    if (!contentEl) return;

    trigger.addEventListener('click', () => {
      menuDrillIn(contentEl);
    });
  });

  drillReturns.forEach((drillReturn) => {
    drillReturn.addEventListener('click', menuDrillOut);
  });

  hamburger.addEventListener('click', () => {
    if (!menuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  });
}
