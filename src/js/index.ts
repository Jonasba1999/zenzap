import '../css/index.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { accordion } from './modules/accordion';
import { aiSetup, compareTableMobileScroll } from './modules/aiDropLanding';
import { fadeUpAnimation, textLineReveal } from './modules/animations';
import { assessmentOfHIPAA } from './modules/assessmentOfHIPAA';
import { controlSync } from './modules/controlSync';
import { copyButton } from './modules/copyButton';
import { desktopMenu } from './modules/desktopMenu';
import { navSolutionsCustomer } from './modules/desktopMenu';
import { formSubmitDisableState } from './modules/formSubmitDisableState';
import { refreshScrollTriggers } from './modules/gsap';
import { trackBtnClick, trackFormSubmit } from './modules/gtm';
import { horizontalScrollSteps } from './modules/horizontalScrollSteps';
import { imageSync } from './modules/imageSync';
import { integrationsMarquee } from './modules/integrationsMarquee';
import { logoRotate } from './modules/logoRotate';
import { clearTopicsOnSearch, marketplaceTitle } from './modules/marketplaceFilters';
import { mobileMenu } from './modules/mobileMenu';
import { partnersLogos, partnersLogosSequential } from './modules/partnersLogos';
import { popup } from './modules/popup';
import { pricingCards } from './modules/pricingCards';
import { stickyCta } from './modules/stickyCta';
import { surveyLanding } from './modules/survey/surveyLanding';
import { testimonialsSlider } from './modules/testimonialsSlider';
import { textFill } from './modules/textFill';
import { videoFallback } from './modules/videoFallback';
import { wistiaLazyLoad } from './modules/wistiaLazyLoad';

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
  wistiaLazyLoad();
  marketplaceTitle();
  clearTopicsOnSearch();
  assessmentOfHIPAA();
  surveyLanding();
});
