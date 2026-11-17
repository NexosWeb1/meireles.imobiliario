(function () {
  'use strict';

  var CFG = window.MEIRELES_CONFIG || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ---------------------------------------------
     Contatos e links de WhatsApp
  --------------------------------------------- */
  function waLink(message) {
    var url = 'https://wa.me/' + (CFG.whatsapp || '');
    return message ? url + '?text=' + encodeURIComponent(message) : url;
  }

  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-wa')));
  });

  var contactHref = {
    phone: CFG.phone ? 'tel:' + CFG.phone : null,
    email: CFG.email ? 'mailto:' + CFG.email : null,
    instagram: CFG.instagramUser ? 'https://instagram.com/' + CFG.instagramUser : null
  };
  var contactText = {
    phone: CFG.phoneLabel,
    email: CFG.email,
    whatsapp: CFG.whatsappLabel,
    instagram: CFG.instagramUser ? '@' + CFG.instagramUser : null,
    location: CFG.location
  };
  document.querySelectorAll('[data-contact]').forEach(function (el) {
    var href = contactHref[el.getAttribute('data-contact')];
    if (href) el.setAttribute('href', href);
  });
  document.querySelectorAll('[data-contact-text]').forEach(function (el) {
    var txt = contactText[el.getAttribute('data-contact-text')];
    if (txt) el.textContent = txt;
  });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------
     Smooth scroll (Lenis)
  --------------------------------------------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  var header = document.getElementById('header');
  var navbar = header.querySelector('.navbar');

  function scrollToTarget(target) {
    var offset = target.id === 'inicio' ? 0 : -(navbar.offsetHeight - 1);
    if (lenis) {
      lenis.scrollTo(target, { offset: offset, duration: 1.4 });
    } else {
      var y = target.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ---------------------------------------------
     Cabeçalho
  --------------------------------------------- */
  var lastY = window.pageYOffset;
  function onScroll() {
    var y = window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 30);
    if (!document.body.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > 500);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------
     Menu mobile
  --------------------------------------------- */
  var toggle = document.getElementById('menuToggle');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    if (lenis) lenis.start();
  }
  toggle.addEventListener('click', function () {
    var open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    header.classList.remove('is-hidden');
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1024) closeMenu(); });

  /* ---------------------------------------------
     Item ativo do menu
  --------------------------------------------- */
  var navLinks = document.querySelectorAll('.nav__link');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------
     Slider do hero
  --------------------------------------------- */
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dot');
  var current = 0;
  var timer = null;
  var DELAY = 7000;

  function loadSlide(slide) {
    slide.querySelectorAll('[data-srcset]').forEach(function (s) {
      s.setAttribute('srcset', s.getAttribute('data-srcset'));
      s.removeAttribute('data-srcset');
    });
    var img = slide.querySelector('img[data-src]');
    if (img) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
  }

  var counter = document.querySelector('.hero__count-cur');
  var animating = false;

  function setActiveDot(i) {
    dots.forEach(function (d, k) {
      d.classList.toggle('is-active', k === i);
      d.setAttribute('aria-selected', String(k === i));
    });
    if (counter) {
      counter.textContent = (i < 9 ? '0' : '') + (i + 1);
      if (window.gsap && !reduceMotion) {
        window.gsap.fromTo(counter, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out' });
      }
    }
  }

  function goTo(i) {
    if (i === current || animating) return;
    loadSlide(slides[i]);
    var prev = slides[current];
    var next = slides[i];
    current = i;
    setActiveDot(i);
    restart();

    if (window.gsap && !reduceMotion) {
      var gsap = window.gsap;
      var img = next.querySelector('img');
      animating = true;
      next.classList.add('is-entering');
      gsap.fromTo(img, { scale: 1.32, xPercent: -5 }, { scale: 1.14, xPercent: 0, duration: 1.8, ease: 'expo.out' });
      gsap.fromTo(next, { clipPath: 'inset(0% 0% 0% 100%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut',
        onComplete: function () {
          next.classList.add('is-active');
          next.classList.remove('is-entering');
          prev.classList.remove('is-active');
          gsap.set(next, { clearProps: 'clipPath' });
          gsap.set(img, { clearProps: 'transform' });
          animating = false;
        }
      });
    } else {
      prev.classList.remove('is-active');
      next.classList.add('is-active');
    }
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(function () { goTo((current + 1) % slides.length); }, DELAY);
  }
  dots.forEach(function (dot, i) { dot.addEventListener('click', function () { goTo(i); }); });

  window.addEventListener('load', function () {
    slides.forEach(loadSlide);
    restart();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearInterval(timer); else restart();
  });

  /* ---------------------------------------------
     Animações (GSAP + ScrollTrigger)
  --------------------------------------------- */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    nodes.forEach(function (node) {
      var parent = el;
      if (node.nodeType === 1) {
        parent = node.cloneNode(false);
        el.appendChild(parent);
      }
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
        var line = document.createElement('span');
        line.className = 'split-line';
        line.setAttribute('aria-hidden', 'true');
        var word = document.createElement('span');
        word.className = 'split-word';
        word.textContent = part;
        line.appendChild(word);
        parent.appendChild(line);
      });
    });
  }

  if (!hasGsap || reduceMotion) {
    root.classList.add('no-anim');
    return;
  }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // Entrada do hero
  var heroTitle = document.querySelector('.hero__title');
  splitWords(heroTitle);
  var heroItems = document.querySelectorAll('[data-hero]');

  gsap.set([heroTitle, '.hero__nav', '.hero__scroll', '.hero__ticker'], { visibility: 'visible' });
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
  intro
    .from('.hero__slides', { scale: 1.12, duration: 2.4, ease: 'power3.out' }, 0)
    .set('.hero__mark', { autoAlpha: 1 }, 0.2)
    .fromTo('.hero__mark path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.18, ease: 'power2.inOut' }, 0.2)
    .fromTo(heroItems[1], { autoAlpha: 0, y: 20, letterSpacing: '0.5em' }, { autoAlpha: 1, y: 0, letterSpacing: '0.24em', duration: 1.6 }, 0.35)
    .from('.hero__title .split-word', { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.07 }, 0.5)
    .fromTo(heroItems[2], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.15)
    .fromTo(heroItems[3], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.3)
    .from('.hero__nav, .hero__scroll', { autoAlpha: 0, y: 20, duration: 1 }, 1.5)
    .from('.hero__ticker', { yPercent: 100, autoAlpha: 0, duration: 1.2 }, 1.4)
    .from('.navbar__inner > *', { autoAlpha: 0, y: -20, duration: 1, stagger: 0.08, clearProps: 'opacity,visibility,transform' }, 0.4);

  // Parallax do hero acompanhando o mouse
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var hero = document.querySelector('.hero');
    var bgX = gsap.quickTo('.hero__slides', 'x', { duration: 1.2, ease: 'power3.out' });
    var bgY = gsap.quickTo('.hero__slides', 'y', { duration: 1.2, ease: 'power3.out' });
    var fgX = gsap.quickTo('.hero__content', 'x', { duration: 1.4, ease: 'power3.out' });
    var fgY = gsap.quickTo('.hero__content', 'y', { duration: 1.4, ease: 'power3.out' });
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      bgX(nx * -26); bgY(ny * -18);
      fgX(nx * 10); fgY(ny * 6);
    });
    hero.addEventListener('mouseleave', function () { bgX(0); bgY(0); fgX(0); fgY(0); });
  }

  // Parallax do hero ao rolar
  gsap.to('.hero__content', {
    yPercent: 22, autoAlpha: 0.15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero__slides', {
    yPercent: 14, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Revelações genéricas
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, {
      autoAlpha: 0, y: 50, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  gsap.utils.toArray('[data-stagger]').forEach(function (group) {
    gsap.from(group.children, {
      autoAlpha: 0, y: 60, duration: 1.1, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 82%', once: true }
    });
  });

  // Imagens com cortina
  gsap.utils.toArray('[data-clip]').forEach(function (fig) {
    var img = fig.querySelector('img');
    var tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 82%', once: true } });
    tl.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' })
      .from(img, { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.2);
  });

  // Moldura do selo "Sobre"
  gsap.from('.about__corner', {
    width: 0, height: 0, duration: 1.4, ease: 'expo.out', stagger: 0.15,
    scrollTrigger: { trigger: '.about__badge', start: 'top 85%', once: true }
  });

  // Parallax interno das imagens
  gsap.to('.consulting__img img', {
    yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.consulting__img', start: 'top bottom', end: 'bottom top', scrub: true }
  });
  gsap.to('.about__img--small', {
    y: -60, ease: 'none',
    scrollTrigger: { trigger: '.about__media', start: 'top bottom', end: 'bottom top', scrub: true }
  });
  gsap.fromTo('.cta-band__bg', { yPercent: -10 }, {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  // Ícones das etapas
  gsap.from('.step__icon', {
    scale: 0.4, rotate: -30, autoAlpha: 0, duration: 1, ease: 'back.out(1.8)', stagger: 0.15,
    scrollTrigger: { trigger: '.steps', start: 'top 80%', once: true }
  });

  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();

/* ---------------------------------------------
   Formulário de contato
--------------------------------------------- */
(function () {
  'use strict';

  var CFG = window.MEIRELES_CONFIG || {};
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  if (!form) return;

  var status = form.querySelector('.form__status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var whats = form.querySelector('#f-whats');

  // Máscara de telefone (00) 0 0000-0000
  whats.addEventListener('input', function () {
    var d = whats.value.replace(/\D/g, '').slice(0, 11);
    var out = d;
    if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 7) {
      out = d.length === 11
        ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 3) + ' ' + d.slice(3, 7) + '-' + d.slice(7)
        : '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    }
    whats.value = out;
  });

  var messages = {
    nome: 'Informe seu nome.',
    whatsapp: 'Informe um WhatsApp válido com DDD.',
    email: 'Informe um e-mail válido.',
    cidade: 'Informe sua cidade e estado.',
    segmento: 'Selecione o segmento de atuação.'
  };

  function setError(field, msg) {
    var wrap = field.closest('.field');
    var err = wrap.querySelector('.field__error');
    if (msg) {
      wrap.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      if (!err) {
        err = document.createElement('span');
        err.className = 'field__error';
        err.id = field.id + '-err';
        wrap.appendChild(err);
        field.setAttribute('aria-describedby', err.id);
      }
      err.textContent = msg;
    } else {
      wrap.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    }
  }

  function validate(field) {
    var v = field.value.trim();
    var bad = false;
    if (field.required && !v) bad = true;
    if (field.name === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) bad = true;
    if (field.name === 'whatsapp' && v && v.replace(/\D/g, '').length < 10) bad = true;
    setError(field, bad ? messages[field.name] : '');
    return !bad;
  }

  form.querySelectorAll('input[required], select[required]').forEach(function (f) {
    f.addEventListener('blur', function () { validate(f); });
    f.addEventListener('change', function () { if (f.closest('.is-invalid')) validate(f); });
  });

  function buildMessage(d) {
    return [
      'Olá! Gostaria de solicitar um atendimento da Meireles Mobiliário.',
      '',
      'Nome: ' + d.nome,
      d.empresa ? 'Empresa: ' + d.empresa : null,
      'WhatsApp: ' + d.whatsapp,
      'E-mail: ' + d.email,
      'Cidade/Estado: ' + d.cidade,
      'Segmento: ' + d.segmento,
      d.mensagem ? 'Necessidade: ' + d.mensagem : null
    ].filter(function (l) { return l !== null; }).join('\n');
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';

    var fields = form.querySelectorAll('input[required], select[required]');
    var firstBad = null;
    fields.forEach(function (f) { if (!validate(f) && !firstBad) firstBad = f; });
    if (firstBad) { firstBad.focus(); return; }

    var fd = new FormData(form);
    if (fd.get('_gotcha')) return; // spam

    var data = {};
    fd.forEach(function (v, k) { if (k !== '_gotcha') data[k] = String(v).trim(); });

    if (!CFG.formEndpoint) {
      window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(buildMessage(data)), '_blank', 'noopener');
      showSuccess();
      form.reset();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn__label').textContent = 'Enviando...';

    fetch(CFG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({ _subject: 'Nova solicitação pelo site: ' + data.nome }, data))
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showSuccess();
        form.reset();
      })
      .catch(function () {
        status.innerHTML = 'Não foi possível enviar agora. <a href="https://wa.me/' + CFG.whatsapp +
          '?text=' + encodeURIComponent(buildMessage(data)) + '" target="_blank" rel="noopener" style="color:#B99A62;text-decoration:underline">Envie pelo WhatsApp</a>.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn__label').textContent = 'Solicitar atendimento';
      });
  });

  document.getElementById('formReset').addEventListener('click', function () {
    success.hidden = true;
    form.hidden = false;
    form.querySelector('input').focus();
  });
})();
