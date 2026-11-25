// Shared state for the other scripts. Loaded first.
window.dc = (() => {
  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    window.dcReady = true;
  } else {
    // GSAP didn't load, so drop the pre-animation hidden states
    root.classList.remove('js');
  }

  return {
    root,
    motionQuery,
    hasGsap,
    reduceMotion: motionQuery.matches,
    canAnimate: hasGsap && !motionQuery.matches,
    lenis: null,
    $: (sel, ctx = document) => ctx.querySelector(sel),
    $$: (sel, ctx = document) => [...ctx.querySelectorAll(sel)],
  };
})();
