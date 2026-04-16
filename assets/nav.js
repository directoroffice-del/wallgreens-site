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

  /* ── Contact / enquiry form with Web3Forms ── */
  // Emails delivered to directoroffice@wallgreens.in via web3forms.com
  const W3F_ACCESS_KEY = 'cd1dcb74-a9e7-4593-aa40-05beda0be453';

  document.querySelectorAll('form[data-enquiry]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalBtnText = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

      // Build payload from all named inputs
      const formData = new FormData(form);
      formData.set('access_key', W3F_ACCESS_KEY);
      // Clean subject line shown in the email
      const name = formData.get('from_name') || formData.get('name') || 'Website visitor';
      const product = formData.get('product') || formData.get('subject') || '';
      formData.set('subject', `New enquiry — ${name}${product ? ' · ' + product : ''} (formwork.in)`);
      formData.set('from_name', 'Wallgreens Website');
      formData.set('replyto', formData.get('email') || '');
      // Honeypot spam guard (Web3Forms reads `botcheck`)
      if (!formData.has('botcheck')) formData.set('botcheck', '');

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          showFormSuccess(form);
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = originalBtnText || 'Submit Enquiry'; }
        alert('Could not send your enquiry right now. Please call +91 93219 17724 or email directoroffice@wallgreens.in directly.\n\nError: ' + err.message);
      }
    });
  });

  function showFormSuccess(form) {
    form.innerHTML = `
      <div style="text-align:center;padding:40px 20px">
        <div style="font-size:48px;margin-bottom:16px">✅</div>
        <h3 style="font-family:'Barlow Condensed',sans-serif;font-size:24px;margin-bottom:8px">Enquiry Sent!</h3>
        <p style="color:#555;font-size:14px">Our team will respond from <strong>directoroffice@wallgreens.in</strong> within 72 hours.</p>
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

/* ============================================================
   PDF DOWNLOAD GATE — Every PDF on the site is blocked behind
   a lead-capture form. Users must submit name, company, phone,
   email (city optional) before the file downloads. The lead is
   sent to Web3Forms; the download fires instantly so users are
   never blocked by a slow network.
   ============================================================ */
(function () {
  'use strict';

  var W3F_KEY = 'cd1dcb74-a9e7-4593-aa40-05beda0be453';

  var MODAL_HTML =
    '<div class="pdf-modal" id="pdf-modal" hidden aria-hidden="true" role="dialog" aria-labelledby="pdf-modal-heading">' +
      '<div class="pdf-modal__backdrop" data-pdf-dismiss></div>' +
      '<div class="pdf-modal__panel">' +
        '<button type="button" class="pdf-modal__close" data-pdf-dismiss aria-label="Close">&times;</button>' +
        '<div id="pdf-modal-form-wrap">' +
          '<h3 id="pdf-modal-heading">Download <span id="pdf-modal-title">Brochure</span></h3>' +
          '<p class="pdf-modal__sub">Share a few quick details and your PDF will download as soon as you submit. We will also email you a copy for your records.</p>' +
          '<form id="pdf-request-form" novalidate>' +
            '<input type="hidden" name="pdf_requested" id="pdf-field-name"/>' +
            '<label>Full Name *<input name="name" type="text" required autocomplete="name"/></label>' +
            '<label>Company / Site *<input name="company" type="text" required autocomplete="organization"/></label>' +
            '<label>Phone *<input name="phone" type="tel" required autocomplete="tel" pattern="[0-9 +\\-]{7,20}"/></label>' +
            '<label>Email *<input name="email" type="email" required autocomplete="email"/></label>' +
            '<label>City<input name="city" type="text" autocomplete="address-level2"/></label>' +
            '<div class="pdf-honeypot" aria-hidden="true"><label>Leave this blank<input type="text" name="botcheck" tabindex="-1" autocomplete="off"/></label></div>' +
            '<button type="submit" class="btn btn--red">Submit &amp; Download PDF &rarr;</button>' +
            '<p class="pdf-modal__fineprint">We respect your privacy. Your details are only used to follow up on your enquiry and are never sold or shared.</p>' +
          '</form>' +
        '</div>' +
        '<div id="pdf-modal-success" class="pdf-modal__success" hidden>' +
          '<div class="pdf-modal__success-icon">✅</div>' +
          '<h3>Your download has started</h3>' +
          '<p>Check your browser\'s downloads folder.</p>' +
          '<p>If nothing downloaded, <a href="#" id="pdf-manual-link" style="color:var(--red);font-weight:600">click here to retry</a>.</p>' +
          '<p style="margin-top:16px;font-size:13px">Questions? Call <a href="tel:+919321917724" style="color:var(--red);font-weight:600">+91 93219 17724</a>.</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  function init() {
    // Inject modal once per page
    if (!document.getElementById('pdf-modal')) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = MODAL_HTML;
      document.body.appendChild(wrapper.firstChild);
    }

    var modal       = document.getElementById('pdf-modal');
    var formWrap    = document.getElementById('pdf-modal-form-wrap');
    var successWrap = document.getElementById('pdf-modal-success');
    var form        = document.getElementById('pdf-request-form');
    var titleEl     = document.getElementById('pdf-modal-title');
    var pdfField    = document.getElementById('pdf-field-name');
    var manualLink  = document.getElementById('pdf-manual-link');

    var currentPdf   = '';
    var currentTitle = '';

    function openModal(pdfUrl, title) {
      currentPdf   = pdfUrl;
      currentTitle = title;
      titleEl.innerHTML = title;
      pdfField.value    = title;
      form.reset();
      formWrap.hidden    = false;
      successWrap.hidden = true;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('pdf-modal-open');
      var firstInput = form.querySelector('input[name="name"]');
      if (firstInput) setTimeout(function () { firstInput.focus(); }, 50);
    }

    function closeModal() {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('pdf-modal-open');
    }

    function triggerDownload(url, filename) {
      var a = document.createElement('a');
      a.href = url;
      a.download = filename || '';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 100);
    }

    function resolveTitle(el) {
      if (el.dataset && el.dataset.title) return el.dataset.title;
      var cta = el.closest('.product-cta-box');
      if (cta) {
        var h = cta.querySelector('h4');
        if (h) return h.textContent.trim();
      }
      var card = el.closest('.download-card');
      if (card) {
        var name = card.querySelector('.download-name');
        if (name) return name.textContent.trim();
      }
      var h1 = document.querySelector('h1');
      if (h1) return h1.textContent.trim();
      return 'Brochure';
    }

    function resolvePdf(el) {
      return el.getAttribute('data-pdf') || '';
    }

    function wireTrigger(el) {
      if (el.dataset.pdfGated === '1') return;
      el.dataset.pdfGated = '1';
      el.addEventListener('click', function (e) {
        // Block all click types — strict gate
        e.preventDefault();
        e.stopPropagation();
        var url = resolvePdf(el);
        if (!url) return;
        openModal(url, resolveTitle(el));
      });
    }

    // Wire every element flagged as a PDF download trigger
    document.querySelectorAll('[data-pdf]').forEach(wireTrigger);

    // Dismiss wiring
    modal.querySelectorAll('[data-pdf-dismiss]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // Manual retry link inside the success panel
    if (manualLink) {
      manualLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentPdf) triggerDownload(currentPdf, currentPdf.split('/').pop());
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var data = new FormData(form);
      data.set('access_key', W3F_KEY);
      var visitorName = data.get('name') || 'Website visitor';
      data.set('from_name', 'Wallgreens Website');
      data.set('subject', 'PDF download request — ' + currentTitle + ' · ' + visitorName + ' (formwork.in)');
      data.set('replyto', data.get('email') || '');

      // Trigger download immediately — never block customer on network
      var filename = currentPdf.split('/').pop();
      triggerDownload(currentPdf, filename);

      // Fire-and-forget lead capture
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
        .catch(function () { /* lead capture failed silently */ });

      formWrap.hidden    = true;
      successWrap.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
