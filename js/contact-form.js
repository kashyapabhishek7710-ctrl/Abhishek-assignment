// Contact form: client-side validation and a fake submit (there's no backend)
(() => {
  const dc = window.dc;
  const { $, $$ } = dc;

  const form = $('#contact-form');
  const success = $('#form-success');
  const submitBtn = $('button[type="submit"]', form);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validators = {
    name: (v) => (v.trim() ? '' : 'Please enter your full name.'),
    email: (v) => {
      if (!v.trim()) return 'Please enter your work email.';
      return emailPattern.test(v.trim()) ? '' : 'Please enter a valid email address, like name@company.com.';
    },
    company: (v) => (v.trim() ? '' : 'Please enter your company name.'),
    teamSize: (v) => (v ? '' : 'Please select your team size.'),
    interest: (v) => (v ? '' : 'Please select a training interest.'),
  };

  const checkField = (input) => {
    const validate = validators[input.name];
    if (!validate) return true;

    const message = validate(input.value);
    input.closest('.field').classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    $(`#${input.getAttribute('aria-describedby')}`).textContent = message;
    return !message;
  };

  const fields = $$('input, select', form);

  fields.forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value) checkField(input);
    });
    // once a field has shown an error, clear it as soon as it's fixed
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') checkField(input);
    });
    if (input.tagName === 'SELECT') input.addEventListener('change', () => checkField(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const invalid = fields.filter((input) => !checkField(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.setAttribute('aria-busy', 'true');

    // stand-in for a real request
    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('aria-busy');
      form.reset();
      form.hidden = true;
      success.hidden = false;
      success.focus();

      if (dc.canAnimate) gsap.from(success, { autoAlpha: 0, y: 16, duration: 0.5, ease: 'power2.out' });
      if (dc.hasGsap) ScrollTrigger.refresh();
    }, 900);
  });

  $('#form-reset').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
    $$('.field', form).forEach((field) => field.classList.remove('has-error'));
    $$('.field__error', form).forEach((el) => { el.textContent = ''; });
    fields.forEach((input) => input.removeAttribute('aria-invalid'));
    $('#f-name').focus();
    if (dc.hasGsap) ScrollTrigger.refresh();
  });

  if (dc.canAnimate) {
    gsap.from('.contact__intro', {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.contact__intro', start: 'top 85%', once: true },
    });
    gsap.from('.form-card', {
      y: 50,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.form-card', start: 'top 85%', once: true },
    });
  }
})();
