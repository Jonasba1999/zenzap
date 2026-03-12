import { pricingCards } from './modules/pricingCards';
import { aiSetup, compareTableMobileScroll } from './modules/aiDropLanding';
import { copyButton } from './modules/copyButton';
import '../css/index.css';

window.Webflow ||= [];
window.Webflow.push(() => {
  pricingCards();
  aiSetup();
  compareTableMobileScroll();
  copyButton();
});
