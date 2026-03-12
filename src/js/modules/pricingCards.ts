import { getPricingData, isUKUser } from './utils';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/scale.css';

export async function pricingCards(): Promise<void> {
  const sections = document.querySelectorAll('[data-pricing-cards-block]');

  if (!sections.length) return;

  const isUk = await isUKUser();
  const pricingData = getPricingData(isUk);

  const tiersData = [
    { plan: '20-users', label: 'Up to 20 users' },
    { plan: '50-users', label: 'Up to 50 users' },
    { plan: '100-users', label: 'Up to 100 users' },
    { plan: '250-users', label: 'Up to 250 users' },
    { plan: '500-users', label: 'Up to 500 users' },
    { plan: '1000-users', label: 'Up to 1000 users' },
    { plan: 'custom-pricing', label: '1000+ users' },
  ];

  function updatePrices(
    period: string,
    tier: string,
    proEl: HTMLElement,
    businessEl: HTMLElement
  ): void {
    const currency = isUk ? '£' : '$';
    proEl.textContent = currency + pricingData.pro[period][tier];
    businessEl.textContent = currency + pricingData.business[period][tier];
  }

  function toggleCustomPricing(
    customState: boolean,
    customPricingEl: NodeListOf<HTMLElement>,
    tierPricingEl: NodeListOf<HTMLElement>
  ): void {
    customPricingEl.forEach((el) => {
      el.style.display = customState ? 'block' : 'none';
    });
    tierPricingEl.forEach((el) => {
      el.style.display = customState ? 'none' : 'flex';
    });
  }

  function updateUserCountText(userCountEl: NodeListOf<HTMLElement>, tierIndex: number): void {
    userCountEl.forEach((el) => {
      el.textContent = tiersData[tierIndex].label;
    });
  }

  function togglePackageType(
    packageType: string,
    fixedPackageEl: NodeListOf<HTMLElement>,
    userPackageEl: NodeListOf<HTMLElement>
  ): void {
    const showFixed = packageType === 'fixed';
    fixedPackageEl.forEach((el) => {
      el.style.display = showFixed ? 'flex' : 'none';
    });
    userPackageEl.forEach((el) => {
      el.style.display = showFixed ? 'none' : 'flex';
    });
  }

  function setActiveItem(
    items: NodeListOf<HTMLElement>,
    dataKey: string,
    activeValue: string
  ): void {
    items.forEach((item) =>
      item.classList.toggle('is-active', item.dataset[dataKey] === activeValue)
    );
  }

  function initTooltips(tooltips: NodeListOf<HTMLElement>) {
    tippy(tooltips, {
      animation: 'scale',
      duration: 200,
      arrow: true,
      delay: [0, 50],
      theme: 'light',
      maxWidth: 220,
    });
  }

  sections.forEach((section) => {
    let currentPeriod = 'yearly';
    let tierPlan = tiersData[0].plan;

    // Fixed package price placeholders
    const proFixedPriceEl = section.querySelector<HTMLElement>('[data-fixed-price="pro"]');
    const businessFixedPriceEl = section.querySelector<HTMLElement>(
      '[data-fixed-price="business"]'
    );

    // User package price placeholders
    const proUserPriceEl = section.querySelector<HTMLElement>('[data-user-price="pro"]');
    const businessUserPriceEl = section.querySelector<HTMLElement>('[data-user-price="business"]');

    // Custom and Tier pricing elements
    const customPricingEl = section.querySelectorAll<HTMLElement>('[data-pricing="custom"]');
    const tierPricingEl = section.querySelectorAll<HTMLElement>('[data-pricing="tier"]');

    // User count placeholders
    const userCountEl = section.querySelectorAll<HTMLElement>('[data-user-count-el]');

    // Package elements (controlled by radio)
    const packageSelectors = section.querySelectorAll<HTMLElement>('[data-package-select]');
    const fixedPackageEl = section.querySelectorAll<HTMLElement>('[data-package="fixed"]');
    const userPackageEl = section.querySelectorAll<HTMLElement>('[data-package="user"]');

    // Tooltip elements
    const tooltips = section.querySelectorAll<HTMLElement>('.tippy');

    // Period triggers
    const periodTriggers = section.querySelectorAll<HTMLElement>('[data-period-trigger]');

    if (!proFixedPriceEl || !businessFixedPriceEl) {
      return;
    }

    // Init user range sliders
    const sliders = section.querySelectorAll<HTMLElement>('[data-slider]');
    createSliders(Array.from(sliders), (index) => {
      tierPlan = tiersData[index].plan;

      if (tierPlan !== 'custom-pricing') {
        toggleCustomPricing(false, customPricingEl, tierPricingEl);
        updatePrices(currentPeriod, tierPlan, proFixedPriceEl, businessFixedPriceEl);
        updateUserCountText(userCountEl, index);
      } else {
        toggleCustomPricing(true, customPricingEl, tierPricingEl);
        updateUserCountText(userCountEl, index);
      }
    });

    // Handle package selectors
    if (packageSelectors.length) {
      packageSelectors.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const packageType = trigger.dataset.packageSelect ?? '';
          togglePackageType(packageType, fixedPackageEl, userPackageEl);
          setActiveItem(packageSelectors, 'packageSelect', packageType);
        });
      });
    }

    // Handle period change
    if (periodTriggers.length) {
      periodTriggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          currentPeriod = trigger.dataset.periodTrigger ?? '';
          setActiveItem(periodTriggers, 'periodTrigger', currentPeriod);
          updatePrices(currentPeriod, tierPlan, proFixedPriceEl, businessFixedPriceEl);
          if (proUserPriceEl && businessUserPriceEl) {
            updatePrices(currentPeriod, 'per-user', proUserPriceEl, businessUserPriceEl);
          }
        });
      });
    }

    // Init on load
    updatePrices(currentPeriod, tierPlan, proFixedPriceEl, businessFixedPriceEl);
    updateUserCountText(userCountEl, 0);
    togglePackageType('fixed', fixedPackageEl, userPackageEl);
    toggleCustomPricing(false, customPricingEl, tierPricingEl);
    if (proUserPriceEl && businessUserPriceEl) {
      updatePrices(currentPeriod, 'per-user', proUserPriceEl, businessUserPriceEl);
    }
    if (tooltips.length) {
      initTooltips(tooltips);
    }
  });
}

type Slider = { container: HTMLElement; update: (index: number) => void };

function createSliders(containers: HTMLElement[], onChange: (index: number) => void): void {
  const sliders = containers.map(initSlider).filter((s): s is Slider => s !== undefined);

  function updateAll(index: number, source?: HTMLElement): void {
    sliders.forEach(({ container, update }) => {
      if (container !== source) update(index);
    });
    onChange(index);
  }

  function initSlider(container: HTMLElement): Slider | undefined {
    const track = container.querySelector<HTMLElement>('[data-slider-track]');
    const thumb = container.querySelector<HTMLElement>('[data-slider-thumb]');
    const fill = container.querySelector<HTMLElement>('[data-slider-fill]');

    if (!track || !thumb || !fill) return;

    const SNAP_POINTS = 7;
    let isDragging = false;
    let currentIndex = 0;

    function getIndexFromX(clientX: number): number {
      const rect = track.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(percent * (SNAP_POINTS - 1));
    }

    function update(index: number): void {
      if (!thumb || !fill) return;

      const percent = (index / (SNAP_POINTS - 1)) * 100;
      thumb.style.left = `${percent}%`;
      fill.style.width = `${percent}%`;
      currentIndex = index;
    }

    thumb.addEventListener('mousedown', () => {
      isDragging = true;
      thumb.classList.add('is-dragging');
      document.body.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const index = getIndexFromX(e.clientX);
      if (index !== currentIndex) {
        update(index);
        updateAll(index, container);
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      thumb.classList.remove('is-dragging');
      document.body.style.cursor = '';
    });

    thumb.addEventListener('touchstart', () => (isDragging = true));
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const index = getIndexFromX(e.touches[0].clientX);
      if (index !== currentIndex) {
        update(index);
        updateAll(index, container);
      }
    });
    window.addEventListener('touchend', () => (isDragging = false));

    track.addEventListener('click', (e) => {
      const index = getIndexFromX(e.clientX);
      update(index);
      updateAll(index, container);
    });

    update(0);

    return { container, update };
  }
}
