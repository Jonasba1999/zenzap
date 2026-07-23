import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/scale.css';

import gsap from 'gsap';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import tippy from 'tippy.js';

import { getPricingData, isUKUser } from './utils';

export async function pricingCardsV2(): Promise<void> {
  const sections = document.querySelectorAll('[data-pricing-cards-block-v2]');

  if (!sections.length) return;

  const isUk = await isUKUser();
  const pricingData = getPricingData(isUk);

  const tiersData = [
    { plan: '20-users', label: 'Up to 20', count: 20 },
    { plan: '50-users', label: 'Up to 50', count: 50 },
    { plan: '100-users', label: 'Up to 100', count: 100 },
    { plan: '250-users', label: 'Up to 250', count: 250 },
    { plan: '500-users', label: 'Up to 500', count: 500 },
    { plan: '1000-users', label: 'Up to 1000', count: 1000 },
    { plan: 'custom-pricing', label: '1000+' },
  ];

  function updatePrices(
    period: string,
    tier: string,
    proEls: NodeListOf<HTMLElement>,
    businessEls: NodeListOf<HTMLElement>
  ): void {
    const currency = isUk ? '£' : '$';
    proEls.forEach((el) => (el.textContent = currency + pricingData.pro[period][tier]));
    businessEls.forEach((el) => (el.textContent = currency + pricingData.business[period][tier]));

    const pricesElPro = document.querySelector<HTMLElement>('[data-user-count-price="pro"]');
    const pricesElBusiness = document.querySelector<HTMLElement>(
      '[data-user-count-price="business"]'
    );

    const userCount = tier.replace('-users', '');
    if (pricesElPro) {
      const pricePro = pricingData.pro[period][tier] / userCount;
      pricesElPro.textContent = currency + pricePro.toFixed(2);
    }

    if (pricesElBusiness) {
      const priceBusiness = pricingData.business[period][tier] / userCount;
      pricesElBusiness.textContent = currency + priceBusiness.toFixed(2);
    }
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
    const prefixes = document.querySelectorAll<HTMLElement>('[data-user-count-prefix]');

    userCountEl.forEach((el) => {
      if (el.getAttribute('data-user-count-el') === 'no-prefix') {
        el.textContent = tiersData[tierIndex].label.replace('Up to ', '');
      } else {
        el.textContent = tiersData[tierIndex].label + ' ';
      }

      if (prefixes) {
        if (tiersData[tierIndex].plan == 'custom-pricing') {
          prefixes.forEach((prefix) => {
            prefix.style.display = 'none';
          });
        } else {
          prefixes.forEach((prefix) => {
            prefix.style.display = 'inline-block';
          });
        }
      }
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
      theme: 'zenzap',
      maxWidth: 220,

      placement: 'top-end',
      arrow: true,
      offset: [32, 8],
      popperOptions: {
        modifiers: [
          {
            name: 'arrow',
            options: { padding: 32 }, // min distance arrow keeps from box edges
          },
        ],
      },
    });
  }

  sections.forEach((section) => {
    let currentPeriod = 'yearly';
    let tierPlan = tiersData[1].plan;

    // Fixed package price placeholders
    const proFixedPriceEl = section.querySelectorAll<HTMLElement>('[data-fixed-price="pro"]');
    const businessFixedPriceEl = section.querySelectorAll<HTMLElement>(
      '[data-fixed-price="business"]'
    );

    // User package price placeholders
    const proUserPriceEl = section.querySelectorAll<HTMLElement>('[data-user-price="pro"]');
    const businessUserPriceEl = section.querySelectorAll<HTMLElement>(
      '[data-user-price="business"]'
    );

    // Custom and Tier pricing elements
    const customPricingEl = section.querySelectorAll<HTMLElement>('[data-pricing="custom"]');
    const tierPricingEl = section.querySelectorAll<HTMLElement>('[data-pricing="tier"]');

    // User count placeholders
    const userCountEl = document.querySelectorAll<HTMLElement>('[data-user-count-el]');

    // Package elements (controlled by radio)
    const packageSelectors = document.querySelectorAll<HTMLElement>('[data-package-select]');
    const fixedPackageEl = document.querySelectorAll<HTMLElement>('[data-package="fixed"]');
    const userPackageEl = document.querySelectorAll<HTMLElement>('[data-package="user"]');

    // Tooltip elements
    const tooltips = section.querySelectorAll<HTMLElement>('.tippy');

    // Period triggers
    const periodTriggers = document.querySelectorAll<HTMLElement>('[data-period-trigger]');

    // Period text elements
    const periodTextEls = document.querySelectorAll<HTMLElement>('[data-period-text]');

    // if (!proFixedPriceEl.length && !businessFixedPriceEl.length) {
    //   return;
    // }

    // Init user range sliders
    const sliders = document.querySelectorAll<HTMLElement>('[data-slider]');
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
    // Package elements (controlled by toggle)

    if (packageSelectors.length) {
      packageSelectors.forEach((toggleWrap) => {
        const switchEl = toggleWrap.querySelector<HTMLElement>('.pricing-toggle_switch');

        const fixedLabel = toggleWrap.querySelector<HTMLElement>('[data-package-choice="fixed"]');
        const userLabel = toggleWrap.querySelector<HTMLElement>('[data-package-choice="user"]');
        const labels = toggleWrap.querySelectorAll<HTMLElement>('[data-package-choice]');

        if (!fixedLabel || !userLabel) return;

        if (toggleWrap.dataset.toggleInitialized === 'true') return;
        toggleWrap.dataset.toggleInitialized = 'true';

        function activate(packageType: string): void {
          togglePackageType(packageType, fixedPackageEl, userPackageEl);

          packageSelectors.forEach((wrap) => {
            const sEl = wrap.querySelector<HTMLElement>('.pricing-toggle_switch');
            const lbls = wrap.querySelectorAll<HTMLElement>('[data-package-choice]');
            setActiveItem(lbls, 'packageChoice', packageType);
            if (sEl) sEl.setAttribute('aria-checked', packageType === 'user' ? 'true' : 'false');
          });

          document?.querySelectorAll('.pricing-plans_pill-btn[data-package]').forEach((btn) => {
            btn.classList.remove('is-active');
          });
          document
            ?.querySelector(`.pricing-plans_pill-btn[data-package-choice='${packageType}']`)
            ?.classList.add('is-active');
        }

        fixedLabel.addEventListener('click', () => {
          activate('fixed');
        });

        userLabel.addEventListener('click', () => {
          activate('user');
        });

        if (switchEl) {
          switchEl.addEventListener('click', () => {
            const isCurrentlyUser = switchEl.getAttribute('aria-checked') === 'true';
            activate(isCurrentlyUser ? 'fixed' : 'user');

            document?.querySelectorAll('.pricing-plans_pill-btn[data-package]').forEach((btn) => {
              btn.classList.remove('is-active');
            });

            document
              ?.querySelector(`.pricing-plans_pill-btn[data-package-choice='${isCurrentlyUser}']`)
              ?.classList.add('is-active');
          });
        }

        const initiallyActive = toggleWrap.querySelector<HTMLElement>(
          '[data-package-choice].is-active'
        );
        activate(initiallyActive?.dataset.packageChoice ?? 'fixed');
      });
    }

    // Handle period change
    if (periodTriggers.length) {
      periodTriggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          currentPeriod = trigger.dataset.periodTrigger ?? '';
          setActiveItem(periodTriggers, 'periodTrigger', currentPeriod);
          updatePrices(currentPeriod, tierPlan, proFixedPriceEl, businessFixedPriceEl);
          if (proUserPriceEl.length || businessUserPriceEl.length) {
            updatePrices(currentPeriod, 'per-user', proUserPriceEl, businessUserPriceEl);
          }
          periodTextEls.forEach((el) => {
            el.style.display = el.dataset.periodText === currentPeriod ? 'block' : 'none';
          });
        });
      });
    }

    // Init on load
    periodTextEls.forEach((el) => {
      el.style.display = el.dataset.periodText === currentPeriod ? 'block' : 'none';
    });
    updatePrices(currentPeriod, tierPlan, proFixedPriceEl, businessFixedPriceEl);
    updateUserCountText(userCountEl, 1);
    togglePackageType('fixed', fixedPackageEl, userPackageEl);
    toggleCustomPricing(false, customPricingEl, tierPricingEl);
    if (proUserPriceEl.length && businessUserPriceEl.length) {
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
    let currentIndex = 1;

    function getIndexFromX(clientX: number): number {
      const rect = track!.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(percent * (SNAP_POINTS - 1));
    }

    function update(index: number): void {
      if (!thumb || !fill) return;

      const percent = (index / (SNAP_POINTS - 1)) * 100;
      thumb.style.left = `${percent}%`;
      fill.style.left = '-12px';
      fill.style.width = percent === 0 ? `${percent}%` : `calc(${percent}% + 24px)`;
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

    update(1);

    return { container, update };
  }

  function initPricingSwiper() {
    const swiperEl = document.querySelector<HTMLElement>('[data-swiper="pricing"]');

    if (!swiperEl) return;

    const MOBILE_BREAKPOINT = 991;
    let swiperInstance: Swiper | null = null;
    let resizeTimeout: ReturnType<typeof setTimeout>;

    function createSwiper() {
      if (swiperInstance) return;
      if (swiperEl && swiperEl.dataset.swiperInitialized === 'true') return; // prevent cross-closure double-init
      swiperEl.dataset.swiperInitialized = 'true';

      swiperInstance = new Swiper(swiperEl, {
        modules: [Pagination],

        slidesPerView: 1.2,
        spaceBetween: 12,
        slidesPerGroup: 1,
        speed: 600,
        initialSlide: 2,
        centeredSlides: true,

        breakpoints: {
          768: {
            slidesPerView: 1.5,
            spaceBetween: 32,
            speed: 900,
          },
        },

        pagination: {
          el: swiperEl?.querySelector<HTMLElement>('[data-swiper-pagination]'),
          clickable: true,
          // renderBullet(_index, className) {
          //   return `<span class="${className}"></span>`;
          // },
        },

        on: {
          breakpoint(sw) {
            if (sw.params.pagination && typeof sw.params.pagination === 'object') {
              sw.pagination.destroy();
              sw.pagination.init();
              sw.pagination.render();
              sw.pagination.update();
            }
          },
        },
      });
    }

    function destroySwiper() {
      if (!swiperInstance) return;

      swiperInstance.destroy(true, true);
      swiperInstance = null;
    }

    function handleResize() {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

        if (isMobile && !swiperInstance) {
          createSwiper();
        } else if (!isMobile && swiperInstance) {
          destroySwiper();
        }
      }, 150);
    }

    // initial run
    const isMobileInitial = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobileInitial) {
      createSwiper();
    }

    window.addEventListener('resize', handleResize);

    // optional: expose a cleanup function so the caller can tear everything down
    // (e.g. on route change in an SPA)
    return function cleanup() {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      destroySwiper();
    };
  }

  function initCollapsedTable() {
    const wrap = document.querySelector('[data-pricing-table]');

    if (!wrap) return;
    const table = wrap.querySelector('[data-collapsed-table]');
    const fade = wrap.querySelector('.pricing-copmarison_fade');
    const toggleBtn = document.querySelector('[data-collapsed-table="toggle"]');
    const toggleText = toggleBtn?.querySelector('[data-collapsed-table="toggle-text"]');

    const COLLAPSED_HEIGHT = 200;
    let isExpanded = false;

    // set initial state
    gsap.set(table, { height: COLLAPSED_HEIGHT, overflow: 'hidden' });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const fullHeight = table.scrollHeight;

        if (!isExpanded) {
          // expand
          gsap.to(table, {
            height: fullHeight,
            duration: 0.5,
            ease: 'power2.inOut',
          });
          gsap.to(fade, {
            opacity: 0,
            duration: 0.4,
            ease: 'power1.out',
          });
          toggleText.textContent = 'Show less';
        } else {
          // collapse
          gsap.to(table, {
            height: COLLAPSED_HEIGHT,
            duration: 0.5,
            ease: 'power2.inOut',
          });
          gsap.to(fade, {
            opacity: 1,
            duration: 0.4,
            delay: 0.1,
            ease: 'power1.in',
          });
          toggleText.textContent = 'Show full comparison';

          wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        isExpanded = !isExpanded;
      });
    }
  }
  initCollapsedTable();
  initPricingSwiper();
}
