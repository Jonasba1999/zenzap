declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

// HubSpot form submit GTM tracking (legacy - replaced by Fillout)
// window.addEventListener('hs-form-event:on-submission:success', async function (event) {
//   var form = HubSpotFormsV4.getFormFromEvent(event);
//   if (form && form.getFormId() === '8f7d78bf-0f85-40e1-9ce4-5d1185accda0') {
//     window.dataLayer = window.dataLayer || [];
//     window.dataLayer.push({ event: 'bookDemoForm' });
//
//     var fields = await form.getFormFieldValues();
//     var companySizeField = fields.find(function (f) {
//       return f.name === '0-1/number_of_employees';
//     });
//     var companySize = companySizeField ? companySizeField.value : null;
//
//     if (companySize && companySize !== '0-20') {
//       window.dataLayer.push({ event: 'bookDemoFormMetaLead' });
//       console.log('✅ bookDemoFormMetaLead pushed, company size:', companySize);
//     }
//   }
// });

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
