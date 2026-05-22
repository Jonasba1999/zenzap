import '../css/index.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { refreshScrollTriggers } from './modules/gsap';
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
import { logoRotate } from './modules/logoRotate';
import { desktopMenu } from './modules/desktopMenu';
import { mobileMenu } from './modules/mobileMenu';
import { navSolutionsCustomer } from './modules/desktopMenu';
import { partnersLogos, partnersLogosSequential } from './modules/partnersLogos';
import { imageSync } from './modules/imageSync';
import { controlSync } from './modules/controlSync';
import { stickyCta } from './modules/stickyCta';
import { trackBtnClick, trackFormSubmit } from './modules/gtm';
import { videoFallback } from './modules/videoFallback';
import { horizontalScrollSteps } from './modules/horizontalScrollSteps';

gsap.registerPlugin(ScrollTrigger, SplitText);

window.Webflow ||= [];
window.Webflow.push(() => {
  refreshScrollTriggers();
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
  logoRotate();
  desktopMenu();
  mobileMenu();
  navSolutionsCustomer();
  // partnersLogos(); Removed because using partnersLogosSequential
  partnersLogosSequential();
  imageSync();
  controlSync();
  stickyCta();
  trackBtnClick();
  trackFormSubmit();
  videoFallback();
  horizontalScrollSteps();
});
