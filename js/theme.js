// Dark / light toggle. The saved choice is applied in <head> to avoid a flash.
(() => {
  const { root, $ } = window.dc;
  const button = $('.theme-toggle');
  const metaTheme = $('meta[name="theme-color"]');

  const updateButton = () => {
    const isDark = root.dataset.theme !== 'light';
    button.setAttribute('aria-pressed', String(!isDark));
    button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    metaTheme.setAttribute('content', isDark ? '#0C1222' : '#F4EFE6');
  };

  button.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;

    try {
      localStorage.setItem('dc-theme', next);
    } catch (err) {
      // private mode etc. - theme just won't persist
    }

    updateButton();
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });

  updateButton();
})();
