# Datacouch landing page

Open `index.html` in a browser. GSAP, Lenis, Three.js and the fonts come from CDNs, so you need to be online.

```
index.html
css/
  base.css           variables, themes, buttons, shared bits
  header.css
  hero.css
  programs.css       cards, stats, testimonial
  how-it-works.css   timeline
  contact.css        form
  footer.css
js/
  utils.js           shared helpers, loaded first
  theme.js           dark/light toggle
  nav.js             header on scroll, mobile menu
  smooth-scroll.js   Lenis + anchor links
  hero-intro.js      page load animation
  hero-network.js    three.js scene (768px and up only)
  programs.js        card entrance, hover tilt, counters, parallax
  timeline.js        scroll-drawn timeline
  contact-form.js    validation + success state
```

## Look and feel

Colours are Ink (#0C1222), Paper (#F4EFE6) and Signal (#FF6B3D). The dark ink keeps it serious enough for enterprise buyers, the warm paper stops it feeling like another cold blue tech site, and the single orange is saved for actions and the "learning" moments so it's always clear where to click.
Fonts are Fraunces for headings and Manrope for everything else. The serif gives HR and L&D readers something that feels editorial and trustworthy, and Manrope keeps the forms and numbers clean.
The logo is a couch made of connected nodes, data + couch, with the orange node as the learner in the middle.

## Notes

- The hero network is the team: nodes link up when they're close, and every couple of seconds one lights up and passes the glow to its neighbours.
- Below 768px Three.js isn't loaded at all. An SVG version of the network, animated with CSS, takes its place.
- With reduced motion turned on there are no entrance or scroll animations, the counters show their final numbers, the timeline is fully drawn and the 3D scene is a single still frame.
- The email in the brief is written as `hello@datacouchcom`. I left the visible text as given and pointed the `mailto:` link at `hello@datacouch.com`.
- There's no backend, so submitting the form fakes a short request and then shows the success message.
# Abhishek-assignment
