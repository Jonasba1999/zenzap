import gsap from 'gsap';

const initializedTriggers = new WeakSet<HTMLElement>();

export function accordion(): void {
  const accordions = document.querySelectorAll<HTMLElement>('[data-accordion]');

  if (!accordions.length) return;

  function open(item: HTMLElement, trigger: HTMLElement, expand: HTMLElement): void {
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    gsap.killTweensOf(expand);

    gsap.to(expand, {
      height: 'auto',
      duration: 0.3,
      ease: 'power3.inOut',
    });
  }

  function close(item: HTMLElement, trigger: HTMLElement, expand: HTMLElement): void {
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');

    gsap.killTweensOf(expand);

    gsap.to(expand, {
      height: 0,
      duration: 0.3,
      ease: 'power3.inOut',
    });
  }

  function closeOtherItems(activeItem: HTMLElement, accordionElement: HTMLElement): void {
    const items = accordionElement.querySelectorAll<HTMLElement>('[data-item]');

    items.forEach((item) => {
      if (item === activeItem || !item.classList.contains('is-open')) {
        return;
      }

      const trigger = item.querySelector<HTMLElement>('[data-trigger]');

      const expand = item.querySelector<HTMLElement>('[data-expand]');

      if (trigger && expand) {
        close(item, trigger, expand);
      }
    });
  }

  function handleAccordion(
    item: HTMLElement,
    trigger: HTMLElement,
    expand: HTMLElement,
    isSingle: boolean,
    accordionElement: HTMLElement
  ): void {
    if (item.classList.contains('is-open')) {
      close(item, trigger, expand);
      return;
    }

    if (isSingle) {
      closeOtherItems(item, accordionElement);
    }

    open(item, trigger, expand);
  }

  accordions.forEach((accordionElement) => {
    const isSingle = accordionElement.dataset.accordion === 'single';

    const items = accordionElement.querySelectorAll<HTMLElement>('[data-item]');

    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>('[data-trigger]');

      const expand = item.querySelector<HTMLElement>('[data-expand]');

      if (!trigger || !expand) return;

      /*
       * IMPORTANT:
       *
       * Do not initialize the same trigger more than once.
       *
       * accordion() can safely be called after every Finsweet
       * filtering/rendering operation.
       */
      if (initializedTriggers.has(trigger)) {
        return;
      }

      initializedTriggers.add(trigger);

      // Accessibility
      const expandId = expand.id || `accordion-expand-${Math.random().toString(36).slice(2, 7)}`;

      expand.id = expandId;

      trigger.setAttribute('aria-controls', expandId);

      expand.setAttribute('role', 'region');

      if (!trigger.hasAttribute('tabindex') && trigger.tagName !== 'BUTTON') {
        trigger.setAttribute('tabindex', '0');
      }

      /*
       * Set the initial state ONLY during first initialization.
       *
       * Do not reset an already initialized accordion every time
       * accordion() is called.
       */
      if (item.classList.contains('is-open')) {
        trigger.setAttribute('aria-expanded', 'true');

        gsap.set(expand, {
          height: 'auto',
        });
      } else {
        trigger.setAttribute('aria-expanded', 'false');

        gsap.set(expand, {
          height: 0,
        });
      }

      trigger.addEventListener('click', () => {
        handleAccordion(item, trigger, expand, isSingle, accordionElement);
      });

      trigger.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();

          handleAccordion(item, trigger, expand, isSingle, accordionElement);
        }
      });
    });
  });
}
