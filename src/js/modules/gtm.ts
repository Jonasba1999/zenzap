declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// GTM Button Click Tracker
export function trackBtnClick(): void {
  const eventMap = {
    demo: 'demoButtonClick',
    start: 'startButtonClick',
  };

  const buttons = document.querySelectorAll('[data-gtm-button]');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      const value = button.getAttribute('data-gtm-button') as keyof typeof eventMap;
      const eventName = eventMap[value];

      if (eventName) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: eventName });
      }
    });
  });
}

export function trackFormSubmit(): void {
  window.addEventListener('message', (event) => {
    if (!event.origin.includes('fillout.com')) return;

    // Only react to the structured submit event, not the string one
    if (event.data?.type !== 'form_submit') return;

    const PERSONAL_DOMAINS = [
      'gmail.com',
      'yahoo.com',
      'icloud.com',
      'outlook.com',
      'hotmail.com',
      'aol.com',
      'me.com',
      'live.com',
      'btinternet.com',
      'msn.com',
      'mail.com',
      'protonmail.com',
      'comcast.net',
      'mac.com',
      'att.net',
    ];

    function isPersonalEmail(email: string): boolean {
      if (!email) return false;

      const domain = (email.split('@').pop() ?? '').toLowerCase().trim();
      return PERSONAL_DOMAINS.includes(domain);
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'bookDemoForm' });

    const companySize = event.data.questions?.find(
      (q: { name: string; value: string }) => q.name === 'Company Size'
    )?.value;

    const email = event.data.questions?.find(
      (q: { name: string; value: string }) => q.name === 'Work Email'
    )?.value;

    const isBusinessEmail = !isPersonalEmail(email);

    // Meta lead event
    if (companySize && companySize !== '0-20' && companySize !== '1-20' && isBusinessEmail) {
      window.dataLayer.push({ event: 'bookDemoFormMetaLead' });
      console.log('✅ bookDemoFormMetaLead pushed, company size:', companySize);
    }
  });
}
