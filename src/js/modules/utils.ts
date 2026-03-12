export async function isUKUser(): Promise<boolean> {
  const cached = localStorage.getItem('userCountry');
  if (cached) return cached === 'GB';

  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    localStorage.setItem('userCountry', data.country_code);
    return data.country_code === 'GB';
  } catch {
    return false;
  }
}

export type PricingData = Record<string, Record<string, Record<string, string>>>;

export function getPricingData(isUk: boolean): PricingData {
  const cmsPlans = document.querySelectorAll<HTMLElement>('[data-cms-pricing-plan]');

  if (!cmsPlans.length) {
    return {};
  }

  const priceSelector = isUk ? '[data-pound-price]' : '[data-dollar-price]';
  const priceDataset = isUk ? 'poundPrice' : 'dollarPrice';
  const pricingData: PricingData = {};

  cmsPlans.forEach((plan) => {
    const planName = plan.dataset.cmsPricingPlan;
    const periods = plan.querySelectorAll<HTMLElement>('[data-period]');

    if (!planName) return;

    if (!pricingData[planName]) {
      pricingData[planName] = {};
    }

    periods.forEach((period) => {
      const periodName = period.dataset.period;

      if (!periodName) return;

      if (!pricingData[planName][periodName]) {
        pricingData[planName][periodName] = {};
      }

      period.querySelectorAll<HTMLElement>(priceSelector).forEach((price) => {
        const priceTier = price.dataset[priceDataset] ?? '';
        const priceValue = price.textContent ?? '';
        pricingData[planName][periodName][priceTier] = priceValue;
      });
    });
  });

  return pricingData;
}
