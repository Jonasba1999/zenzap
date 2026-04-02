import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

export function testimonialsSlider() {
  const sections = document.querySelectorAll<HTMLElement>('[data-swiper="testimonials"]');

  if (!sections.length) return;

  sections.forEach((section) => {
    const target = section.querySelector<HTMLElement>('[data-swiper-target]');

    if (!target) return;

    const swiper = new Swiper(target, {
      modules: [Navigation, Pagination],

      slidesPerView: 1.2,
      spaceBetween: 16,

      breakpoints: {
        768: {
          slidesPerView: 3.3,
          spaceBetween: 32,
        },
      },

      navigation: {
        nextEl: section.querySelector<HTMLElement>('[data-swiper-next]'),
        prevEl: section.querySelector<HTMLElement>('[data-swiper-prev]'),
      },

      pagination: {
        el: section.querySelector<HTMLElement>('[data-swiper-pagination]'),
        type: 'bullets',
        bulletClass: 'zenzap-swiper-bullet',
      },
    });
  });
}
