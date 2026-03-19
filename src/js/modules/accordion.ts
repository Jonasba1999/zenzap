declare const gsap: any;

export function accordion(): void {
  const accordions = document.querySelectorAll<HTMLElement>('[data-accordion]');

  if (!accordions.length) return;

  function open(item: HTMLElement, trigger: HTMLElement, expand: HTMLElement): void {
    item.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    gsap.to(expand, {
      height: 'auto',
      duration: 0.3,
      ease: 'power3.inOut',
    });
  }

  function close(item: HTMLElement, trigger: HTMLElement, expand: HTMLElement): void {
    item.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');

    gsap.to(expand, {
      height: 0,
      duration: 0.3,
      ease: 'power3.inOut',
    });
  }

  function closeOtherItems(activeItem: HTMLElement, accordion: HTMLElement): void {
    const items = accordion.querySelectorAll<HTMLElement>('[data-item]');

    items.forEach((item) => {
      if (item === activeItem || !item.classList.contains('is-open')) return;

      const trigger = item.querySelector<HTMLElement>('[data-trigger]');
      const expand = item.querySelector<HTMLElement>('[data-expand]');
      if (trigger && expand) close(item, trigger, expand);
    });
  }

  function handleAccordion(
    item: HTMLElement,
    trigger: HTMLElement,
    expand: HTMLElement,
    isSingle: boolean,
    accordion: HTMLElement
  ): void {
    if (!item.classList.contains('is-open')) {
      if (isSingle) closeOtherItems(item, accordion);
      open(item, trigger, expand);
    } else {
      close(item, trigger, expand);
    }
  }

  accordions.forEach((accordion) => {
    const isSingle = accordion.dataset.accordion === 'single';
    const items = accordion.querySelectorAll<HTMLElement>('[data-item]');

    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector<HTMLElement>('[data-trigger]');
      const expand = item.querySelector<HTMLElement>('[data-expand]');

      if (!trigger || !expand) return;

      // Accessibility attributes
      const expandId = expand.id || `accordion-expand-${Math.random().toString(36).slice(2, 7)}`;
      expand.id = expandId;
      trigger.setAttribute('aria-controls', expandId);
      expand.setAttribute('role', 'region');

      if (!trigger.hasAttribute('tabindex') && trigger.tagName !== 'BUTTON') {
        trigger.setAttribute('tabindex', '0');
      }

      // Respect pre-existing open state; otherwise collapse via GSAP
      if (item.classList.contains('is-open')) {
        trigger.setAttribute('aria-expanded', 'true');
        gsap.set(expand, { height: 'auto' });
      } else {
        trigger.setAttribute('aria-expanded', 'false');
        gsap.set(expand, { height: 0 });
      }

      trigger.addEventListener('click', () => {
        handleAccordion(item, trigger, expand, isSingle, accordion);
      });

      trigger.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAccordion(item, trigger, expand, isSingle, accordion);
        }
      });
    });
  });
}
