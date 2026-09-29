import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll('.h2, .rv, .stage');

    if (isReduced || !('IntersectionObserver' in window)) {
      targets.forEach((e) => e.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
          } else {
            // Remove 'in' when scrolled out of view so animations re-trigger every time scrolling back
            entry.target.classList.remove('in');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
