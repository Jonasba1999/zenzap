declare const gsap: any;

export function aiSetup(): void {
  const setupSections = document.querySelectorAll('[data-ai-setup]');
  if (!setupSections.length) return;

  setupSections.forEach((section) => {
    const dropdownTrigger = section.querySelector<HTMLElement>('[data-dropdown-trigger]');
    const dropdown = section.querySelector<HTMLElement>('[data-dropdown]');
    const dropdownPlaceholder = section.querySelector<HTMLElement>('[data-dropdown-placeholder]');
    const dropdownLinks = section.querySelectorAll<HTMLElement>('[data-dropdown-link]');
    const contentWraps = section.querySelectorAll<HTMLElement>('[data-content]');
    const dropdownIcon = section.querySelector<HTMLElement>('[data-dropdown-icon]');
    let isOpen = false;

    // Set initial state
    gsap.set(dropdown, {
      autoAlpha: 0,
      height: 0,
    });

    // Hide first link by default
    if (dropdownLinks.length) {
      gsap.set(dropdownLinks[0], { display: 'none' });
    }

    function handleDropdownLink(clickedName: string): void {
      isOpen = false;

      // Update placeholder instantly
      if (dropdownPlaceholder) {
        const clickedLink = section.querySelector<HTMLElement>(
          `[data-dropdown-link="${clickedName}"]`
        );
        if (clickedLink) {
          dropdownPlaceholder.textContent = clickedLink.textContent?.trim() ?? '';
        }
      }

      // Show related content
      contentWraps.forEach((content) => {
        const name = content.dataset.content;

        gsap.set(content, {
          display: name === clickedName ? 'flex' : 'none',
        });
      });

      dropdownClose(() => {
        // Swap links after dropdown is fully closed
        dropdownLinks.forEach((link) => {
          const name = link.dataset.dropdownLink;
          gsap.set(link, {
            display: name === clickedName ? 'none' : 'block',
          });
        });
      });
    }

    function dropdownOpen(): void {
      const tl = gsap.timeline({ overwrite: true });
      tl.set(dropdown, {
        autoAlpha: 1,
      })
        .to(dropdown, {
          height: 'auto',
          duration: 0.2,
          ease: 'power3.inOut',
        })
        .to(
          dropdownIcon,
          {
            rotation: 180,
            duration: 0.2,
            ease: 'power2.out',
          },
          '<'
        );
    }

    function dropdownClose(onComplete?: () => void): void {
      const tl = gsap.timeline({ overwrite: true, onComplete });
      tl.to(dropdownIcon, {
        rotation: 0,
        duration: 0.2,
        ease: 'power2.out',
      })
        .to(
          dropdown,
          {
            height: 0,
            duration: 0.2,
            ease: 'power3.inOut',
          },
          '<'
        )
        .set(dropdown, {
          autoAlpha: 0,
        });
    }

    function handleDropdown(): void {
      if (!isOpen) {
        dropdownOpen();
        isOpen = true;
      } else {
        dropdownClose();
        isOpen = false;
      }
    }

    if (dropdownTrigger) {
      dropdownTrigger.addEventListener('click', handleDropdown);
    }

    dropdownLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const name = link.dataset.dropdownLink ?? '';
        handleDropdownLink(name);
      });
    });
  });
}

export function compareTableMobileScroll(): void {
  const scroller = document.querySelector<HTMLElement>('[data-compare-scroll]');
  const dots = document.querySelectorAll<HTMLElement>('[data-compare-dot]');
  if (!scroller) return;

  let startX = 0;
  let startY = 0;
  let isAtEnd = true;

  scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
  scroller.style.overflow = 'hidden';

  function updateDots(): void {
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', isAtEnd ? i === 1 : i === 0);
    });
  }

  updateDots();

  scroller.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });

  scroller.addEventListener(
    'touchmove',
    (e) => {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > dy) e.preventDefault();
    },
    { passive: false }
  );

  scroller.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 30) return;

    if (diff > 0 && !isAtEnd) {
      scroller.scrollTo({ left: scroller.scrollWidth, behavior: 'smooth' });
      isAtEnd = true;
      updateDots();
    } else if (diff < 0 && isAtEnd) {
      scroller.scrollTo({ left: 0, behavior: 'smooth' });
      isAtEnd = false;
      updateDots();
    }
  });
}
