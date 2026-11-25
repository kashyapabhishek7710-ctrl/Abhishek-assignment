// Page-load sequence: headline line by line, sub-headline, then the CTAs
(() => {
  if (!window.dc.canAnimate) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });

  // y: 0 overrides the CSS translateY used to hide the lines before JS runs
  tl.fromTo('.hero__title .line__inner',
    { y: 0, yPercent: 110 },
    { y: 0, yPercent: 0, duration: 1.05, stagger: 0.14 })
    .fromTo('.hero__sub',
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.8 }, '-=0.55')
    .fromTo('.reveal-cta',
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12 }, '-=0.45')
    .fromTo('.hero__trust',
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.3')
    .fromTo('.hero__visual',
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1.4, ease: 'power1.out' }, 0.2);
})();
