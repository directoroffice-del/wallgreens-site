/* ============================================================
   WALLGREENS — Shared Navigation + Global UI Script
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile hamburger ── */
  const ham   = document.getElementById('nav-hamburger');
  const drawer = document.getElementById('nav-mobile');
  if (ham && drawer) {
    ham.addEventListener('click', () => {
      ham.classList.toggle('open');
      drawer.classList.toggle('open');
    });
  }

  /* ── Mobile sub-menu toggles ── */
  document.querySelectorAll('.nm-link[data-toggle]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const item = link.closest('.nm-item');
      item.classList.toggle('open');
    });
  });

  /* ── Desktop nav: close dropdown on outside click ── */
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach(el => el.classList.remove('open'));
    }
  });

  /* ── Active nav link highlight ── */
  const path = window.location.pathname.replace(/\/$/, '') || '/index';
  document.querySelectorAll('.nav-link, .nm-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    const norm = href.replace(/\.html$/, '').replace(/\/$/, '');
    if (norm && path.endsWith(norm)) {
      a.classList.add('active');
    }
  });

  /* ── Sticky navbar ref (scroll state handled later via .scrolled class) ── */
  const navbar = document.getElementById('navbar');

  /* ── Back to top ── */
  const backTop = document.getElementById('back-top');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Tabs ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('[data-tabs]');
      if (!group) return;
      const target = btn.dataset.tab;
      group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const panel = group.querySelector(`.tab-content[data-tab="${target}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ── Stat counter animation ── */
  function animateStat(el) {
    const raw = el.dataset.val || el.textContent;
    const suffix = raw.replace(/[\d,]/g, '');
    const end = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(end)) return;
    let start = 0;
    const dur = 1400;
    const step = end / (dur / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      el.textContent = Math.floor(start).toLocaleString() + suffix;
      if (start >= end) clearInterval(timer);
    }, 16);
  }
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-val]').forEach(animateStat);
        statObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stats-row').forEach(r => statObserver.observe(r));

  /* ── Contact / enquiry form with EmailJS ── */
  // SETUP: replace these with your EmailJS credentials
  // Guide: https://www.emailjs.com/docs/sdk/send/
  const EJS_SERVICE  = 'YOUR_SERVICE_ID';
  const EJS_TEMPLATE = 'YOUR_TEMPLATE_ID';
  const EJS_KEY      = 'YOUR_PUBLIC_KEY';

  if (window.emailjs) emailjs.init({ publicKey: EJS_KEY });

  document.querySelectorAll('form[data-enquiry]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const inputs = form.querySelectorAll('input,select,textarea');
      const params = {};
      inputs.forEach(inp => { if (inp.name) params[inp.name] = inp.value; });

      if (!window.emailjs || EJS_SERVICE === 'YOUR_SERVICE_ID') {
        // Dev fallback: just show success
        showFormSuccess(form);
        return;
      }
      btn.textContent = 'Sending…';
      btn.disabled = true;
      emailjs.send(EJS_SERVICE, EJS_TEMPLATE, params)
        .then(() => showFormSuccess(form))
        .catch(err => {
          btn.disabled = false;
          btn.textContent = 'Submit Enquiry';
          alert('Could not send. Please call +91 93219 17724\nError: ' + (err.text || err));
        });
    });
  });

  function showFormSuccess(form) {
    form.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:48px;margin-bottom:16px">✅</div>
        <h3 style="font-family:'Barlow Condensed',sans-serif;font-size:24px;margin-bottom:8px">Enquiry Sent!</h3>
        <p style="color:#555;font-size:14px">Our team will respond to <strong>directoroffice@wallgreens.in</strong> within 24 hours.</p>
        <p style="margin-top:16px;font-size:13px;color:#D32F2F">📞 Urgent? Call <a href="tel:+919321917724" style="color:#D32F2F;font-weight:600">+91 93219 17724</a></p>
      </div>`;
  }

  /* ── Smooth scroll for # links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const h = a.getAttribute('href');
      if (!h || h === '#' || h.length < 2) return;
      let t = null;
      try { t = document.querySelector(h); } catch (_) { return; }
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ── Clients marquee: duplicate track for seamless loop ── */
  document.querySelectorAll('.clients-track').forEach(track => {
    const items = [...track.children];
    items.forEach(el => track.appendChild(el.cloneNode(true)));
  });

  /* ============================================================
     MOTION LAYER — scroll reveal + UX micro-interactions
     ============================================================ */

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Auto-tag common elements for reveal (no HTML edits needed) ── */
  const revealTargets = [
    'section', '.card', '.project-card', '.article-card', '.cat-card',
    '.icon-card', '.team-card', '.timeline-item', '.stat', '.stats-row',
    '.hero', '.section-title', '.section-sub', 'h2', 'h3',
    'table', '.cta', '.cta-section', 'blockquote', 'figure'
  ];
  document.querySelectorAll(revealTargets.join(',')).forEach(el => {
    if (el.closest('#navbar, #nav-mobile, footer')) return;
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
  });

  /* ── Auto-tag grids for stagger ── */
  document.querySelectorAll(
    '.project-grid, .article-grid, .product-cat-grid, .icon-card-grid, ' +
    '.team-grid, .cat-grid, [class*="grid"]:not([data-reveal-stagger])'
  ).forEach(g => {
    if (g.closest('#navbar, #nav-mobile, footer, .footer')) return;
    if (g.children.length > 1 && g.children.length < 40) {
      g.setAttribute('data-reveal-stagger', '');
    }
  });

  /* ── IntersectionObserver: toggle .in-view ── */
  if ('IntersectionObserver' in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => io.observe(el));
  } else {
    // Fallback: show everything
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]')
      .forEach(el => el.classList.add('in-view'));
  }

  /* ── Button cursor spotlight (radial hover position) ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 100) + '%');
      btn.style.setProperty('--ry', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ── Card tilt on pointer (subtle 3D) ── */
  document.querySelectorAll('.project-card, .article-card, .cat-card').forEach(card => {
    let raf = null;
    card.addEventListener('pointermove', e => {
      if (prefersReduced) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `translateY(-6px) perspective(900px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  /* ── Navbar scrolled class (cleaner than inline shadow) ── */
  if (navbar) {
    const setScrolled = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();
  }

  /* ── Ripple effect on buttons ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (prefersReduced) return;
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height) * 1.8;
      ripple.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${size}px;height:${size}px;
        left:${e.clientX - r.left - size/2}px;top:${e.clientY - r.top - size/2}px;
        background:radial-gradient(circle,rgba(255,255,255,0.5),transparent 60%);
        transform:scale(0);opacity:1;transition:transform 600ms ease-out,opacity 700ms ease-out;
      `;
      btn.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 750);
    });
  });

  /* ── Fade-in on image load (avoids flashing broken pixels) ── */
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) return;
    img.style.opacity = '0';
    img.style.transition = 'opacity 420ms ease';
    img.addEventListener('load', () => { img.style.opacity = '1'; }, { once: true });
    img.addEventListener('error', () => { img.style.opacity = '1'; }, { once: true });
  });

  /* ── Tab change: re-trigger reveal inside newly-activated panel ── */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        const group = btn.closest('[data-tabs]');
        if (!group) return;
        const panel = group.querySelector('.tab-content.active');
        if (!panel) return;
        panel.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => {
          el.classList.remove('in-view');
          void el.offsetWidth; // reflow
          el.classList.add('in-view');
        });
      }, 10);
    });
  });

  /* ── Parallax on hero background images ── */
  const parallaxEls = document.querySelectorAll('.hero[style*="background"], .hero-bg');
  if (parallaxEls.length && !prefersReduced) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      parallaxEls.forEach(el => {
        el.style.backgroundPositionY = `${y * 0.3}px`;
      });
    }, { passive: true });
  }

})();
