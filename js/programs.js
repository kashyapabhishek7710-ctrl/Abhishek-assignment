// Programs section: card entrance, hover tilt, stat counters, parallax
(() => {
  const dc = window.dc;
  const { $$ } = dc;

  const formatNumber = (value, decimals) =>
    value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  if (dc.canAnimate) {
    // animate the <li>, not the .card, so the hover transform isn't overwritten
    gsap.from('.cards__item', {
      y: 60,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cards', start: 'top 82%', once: true },
    });

    gsap.from('.programs .section__head', {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.programs .section__head', start: 'top 85%', once: true },
    });

    // the real numbers are in the HTML; we only reset to 0 once we know we can animate
    $$('.counter').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = Number(el.dataset.decimals || 0);
      const counter = { value: 0 };

      el.textContent = formatNumber(0, decimals);

      gsap.to(counter, {
        value: target,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = formatNumber(counter.value, decimals); },
        scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true },
      });
    });

    $$('.parallax').forEach((el) => {
      const speed = parseFloat(el.dataset.speed || -20);
      gsap.fromTo(el, { yPercent: -speed / 2 }, {
        yPercent: speed / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    gsap.from('.testimonial__quote, .testimonial__by', {
      y: 30,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.testimonial', start: 'top 80%', once: true },
    });
  }

  // tilt only makes sense with a real mouse
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasMouse || dc.reduceMotion) return;

  const MAX_TILT = 8; // degrees, total range

  $$('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      card.style.setProperty('--ry', `${((x - 0.5) * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${((0.5 - y) * MAX_TILT).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();
