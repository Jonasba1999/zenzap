import '../css/index.css';

import { pricingCards } from './modules/pricingCards';
import { aiSetup, compareTableMobileScroll } from './modules/aiDropLanding';
import { copyButton } from './modules/copyButton';
import { popup } from './modules/popup';
import { formSubmitDisableState } from './modules/formSubmitDisableState';
import { accordion } from './modules/accordion';

window.Webflow ||= [];
window.Webflow.push(() => {
  pricingCards();
  aiSetup();
  compareTableMobileScroll();
  copyButton();
  popup();
  formSubmitDisableState();
  accordion();
});
