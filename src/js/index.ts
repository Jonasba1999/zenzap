declare const gsap: any;
declare const ScrollTrigger: any;
declare const SplitText: any;

import '../css/index.css';

import { pricingCards } from './modules/pricingCards';
import { aiSetup, compareTableMobileScroll } from './modules/aiDropLanding';
import { copyButton } from './modules/copyButton';
import { popup } from './modules/popup';
import { formSubmitDisableState } from './modules/formSubmitDisableState';
import { accordion } from './modules/accordion';
import { testimonialsSlider } from './modules/testimonialsSlider';
import { textFill } from './modules/textFill';
import { integrationsMarquee } from './modules/integrationsMarquee';
import { textLineReveal, fadeUpAnimation } from './modules/animations';

gsap.registerPlugin(ScrollTrigger, SplitText);

window.Webflow ||= [];
window.Webflow.push(() => {
  pricingCards();
  aiSetup();
  compareTableMobileScroll();
  copyButton();
  popup();
  formSubmitDisableState();
  accordion();
  testimonialsSlider();
  textFill();
  integrationsMarquee();
  textLineReveal();
  fadeUpAnimation();
});
