import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function stickyFilter() {
  const filterSection = document.querySelector('.section_survey-filter');

  let isStuck = false;

  ScrollTrigger.create({
    trigger: filterSection,
    start: 'top top',
    onEnter: () => setStuck(true),
    onLeaveBack: () => setStuck(false),
  });

  function setStuck(stuck) {
    if (isStuck === stuck) return;
    isStuck = stuck;

    if (stuck) {
      filterSection?.classList.add('is-stuck');
      gsap.to(filterSection, {
        paddingTop: '100px',
        top: 0,
        borderRadius: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      filterSection?.classList.remove('is-stuck');
      gsap.to(filterSection, {
        paddingTop: '2rem',
        borderTopLeftRadius: '3.75rem',
        borderTopRightRadius: '3.75rem',
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }
}
