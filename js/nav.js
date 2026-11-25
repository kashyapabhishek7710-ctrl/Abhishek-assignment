// Header background on scroll + mobile menu
(() => {
  const { $ } = window.dc;
  const header = $('.site-header');
  const menu = $('#nav-menu');
  const toggle = $('.nav__toggle');

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  // close when tapping outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });

  window.dc.closeMenu = () => setMenu(false);
})();
