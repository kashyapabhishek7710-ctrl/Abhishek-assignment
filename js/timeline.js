// "How it works" timeline: line fills with scroll, steps light up as it reaches them
(() => {
  const dc = window.dc;
  const timeline = dc.$('.timeline');
  const track = dc.$('.timeline__track');
  const fill = dc.$('.timeline__fill');
  const steps = dc.$$('.step');
  const markers = dc.$$('.step__marker');

  // the last step has text under its marker, so CSS alone can't size the track
  const fitTrack = () => {
    const top = timeline.getBoundingClientRect().top;
    const first = markers[0].getBoundingClientRect();
    const last = markers[markers.length - 1].getBoundingClientRect();
    const start = first.top - top + first.height / 2;
    const end = last.top - top + last.height / 2;

    track.style.top = `${start}px`;
    track.style.bottom = 'auto';
    track.style.height = `${end - start}px`;
  };

  fitTrack();
  window.addEventListener('resize', fitTrack);

  if (!dc.hasGsap) {
    steps.forEach((step) => step.classList.add('is-active'));
    return;
  }

  ScrollTrigger.addEventListener('refreshInit', fitTrack);

  // fill and highlights use the same trigger line so they stay in step
  const TRIGGER_LINE = 'center 60%';

  if (!dc.reduceMotion) {
    gsap.fromTo(fill, { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: markers[0],
        start: TRIGGER_LINE,
        endTrigger: markers[markers.length - 1],
        end: TRIGGER_LINE,
        scrub: 0.6,
      },
    });

    gsap.from('.how__head', {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.how__head', start: 'top 85%', once: true },
    });
  }

  // class toggles only, so this still works with reduced motion
  markers.forEach((marker, i) => {
    ScrollTrigger.create({
      trigger: marker,
      start: TRIGGER_LINE,
      onEnter: () => steps[i].classList.add('is-active'),
      onLeaveBack: () => steps[i].classList.remove('is-active'),
    });
  });

  // web fonts change line heights, so re-measure once they're in
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
