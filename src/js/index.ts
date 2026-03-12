import { pricingCards } from './modules/pricingCards';
import '../css/index.css';

window.Webflow ||= [];
window.Webflow.push(() => {
  pricingCards();
});

