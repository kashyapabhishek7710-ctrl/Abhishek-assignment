// Lenis smooth scrolling + in-page anchor links
(() => {
  const dc = window.dc;
  const header = dc.$('.site-header');

  if (dc.canAnimate && window.Lenis) {
    dc.lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    // keep ScrollTrigger in sync with Lenis, otherwise scrubbed animations lag
    dc.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => dc.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const firstField = dc.$('#f-name');

  dc.$$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      const target = hash.length > 1 && dc.$(hash);
      if (!target) return;

      e.preventDefault();
      dc.closeMenu?.();

      // quote/consultation buttons drop you straight into the form
      const focusForm = () => {
        if (link.hasAttribute('data-focus-form')) firstField.focus({ preventScroll: true });
      };

      if (dc.lenis) {
        dc.lenis.scrollTo(target, { offset: -header.offsetHeight + 1, onComplete: focusForm });
      } else {
        target.scrollIntoView({ behavior: dc.reduceMotion ? 'auto' : 'smooth' });
        setTimeout(focusForm, dc.reduceMotion ? 0 : 700);
      }

      history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
    });
  });
})();
