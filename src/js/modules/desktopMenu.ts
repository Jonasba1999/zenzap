import { computePosition, shift, offset, autoUpdate } from '@floating-ui/dom';
import gsap from 'gsap';

export function desktopMenu() {
  const triggers = document.querySelectorAll<HTMLElement>('[data-menu-trigger]');

  if (!triggers.length) return;

  function openMenu(menu: HTMLElement, inner: HTMLElement) {
    gsap
      .timeline({ overwrite: true })
      .set(menu, {
        visibility: 'visible',
      })
      .to(inner, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power3.out',
      });
  }

  function closeMenu(menu: HTMLElement, inner: HTMLElement) {
    gsap
      .timeline({ overwrite: true })
      .to(inner, {
        y: 24,
        opacity: 0,
        duration: 0.2,
        ease: 'power3.out',
      })
      .set(menu, {
        visibility: 'hidden',
      });
  }

  function setMenuPosition(trigger: HTMLElement, menu: HTMLElement) {
    computePosition(trigger, menu, {
      placement: 'bottom-start',
      middleware: [offset({ mainAxis: 0, crossAxis: -24 }), shift({ padding: 40 })],
    }).then(({ x, y }) => {
      Object.assign(menu.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  // Add Event listeners to triggers
  triggers.forEach((trigger) => {
    const menu = trigger.querySelector<HTMLElement>('[data-menu-dropdown]');

    if (!menu) return;

    const menuContent = menu.querySelector<HTMLElement>('[data-dropdown-content]');

    if (!menuContent) return;

    // Set menu position
    autoUpdate(trigger, menu, () => {
      setMenuPosition(trigger, menu);
    });

    trigger.addEventListener('mouseenter', () => {
      openMenu(menu, menuContent);
    });
    trigger.addEventListener('mouseleave', () => {
      closeMenu(menu, menuContent);
    });
  });
}

export function navSolutionsCustomer() {
  const links = document.querySelectorAll<HTMLElement>('[data-solution-nav]');
  const customers = document.querySelectorAll<HTMLElement>('[data-nav-customer]');
  const customersWrap = document.querySelector<HTMLElement>('[data-nav-customers-wrap]');

  if (!links.length || !customers.length || !customersWrap) return;

  let activeCustomer = '';
  let maxCustomerHeight = 0;

  function showCustomer(customerName: string): void {
    if (activeCustomer === customerName) return;

    const newCustomer = customersMap.get(customerName);
    const oldCustomer = customersMap.get(activeCustomer);

    if (!newCustomer) return;

    if (oldCustomer) {
      // Animate previous out
      gsap.to(oldCustomer, {
        autoAlpha: 0,
        duration: 0.2,
      });
    }

    // Animate new in
    gsap.to(newCustomer, {
      autoAlpha: 1,
      duration: 0.2,
    });

    // Set as new active
    activeCustomer = customerName;
  }

  // Store all customers and set container height
  const customersMap = new Map<string, HTMLElement>();

  customers.forEach((customer) => {
    const customerName = customer.dataset.navCustomer;

    if (!customerName) return;

    customersMap.set(customerName, customer);

    // Store max height value
    maxCustomerHeight = Math.max(maxCustomerHeight, customer.scrollHeight);

    // Hide
    gsap.set(customer, {
      autoAlpha: 0,
    });
  });

  // Set height to list container
  gsap.set(customersWrap, {
    height: `${maxCustomerHeight}px`,
  });

  // Add event listeners to links
  links.forEach((link) => {
    const customerName = link.dataset.solutionNav ?? null;
    if (!customerName) return;

    link.addEventListener('mouseenter', () => {
      showCustomer(customerName);
    });
  });

  // Set initial to show
  showCustomer('cali-bbq');
}
