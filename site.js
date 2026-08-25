/**
 * THE ADS LANCER — vanilla JS interactions
 * Header state, mobile drawer, scroll reveals, animated funnel bars,
 * count-up stats, FAQ accordion, application modal.
 */
(function () {
  function init() {
    /* 1. Header scroll state */
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('scrolled', window.scrollY > 24);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* 2. Mobile drawer */
    var toggle = document.getElementById('mobile-toggle');
    var drawer = document.getElementById('mobile-drawer');
    if (toggle && drawer) {
      toggle.addEventListener('click', function () {
        var open = drawer.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      drawer.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', function () {
          drawer.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* 3. Scroll reveal + triggered animations */
    var countUp = function (el) {
      var target = parseFloat(el.dataset.count || '0');
      var suffix = el.dataset.suffix || '';
      var start = performance.now();
      var dur = 1400;
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          el.classList.add('is-visible');
          el.querySelectorAll('.fill').forEach(function (fill) {
            fill.style.width = (fill.dataset.value || 0) + '%';
          });
          el.querySelectorAll('[data-count]').forEach(countUp);
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal, [data-animate]').forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 90 + 'ms';
      io.observe(el);
    });

    /* 4. FAQ accordion */
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        var open = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (other) {
          other.classList.remove('open');
          var p = other.querySelector('.faq-a');
          if (p) p.style.maxHeight = '0px';
          var b = other.querySelector('.faq-q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* 5. Application modal */
    var modal = document.getElementById('apply-modal');
    var form = document.getElementById('audit-form');
    var formView = document.getElementById('modal-form-content');
    var successView = document.getElementById('modal-success-content');

    var open = function () {
      if (!modal) return;
      if (formView && successView) {
        formView.style.display = 'block';
        successView.style.display = 'none';
      }
      modal.showModal();
    };
    document.querySelectorAll('.open-apply-modal').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        open();
      });
    });
    var closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn && modal) closeBtn.addEventListener('click', function () { modal.close(); });
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.close();
      });
    }
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var SHEET_URL = 'https://script.google.com/macros/s/AKfycbyE7kPHDTgvXQLxcPKYp5fFzES9j8ku0T9lWd53Gf-ihYz2G4GBrWdcG5xPwaTsMSsppw/exec';
        var SECRET    = 'tal-2026-krsna110';

        var btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Sending…';
        btn.disabled = true;

        var payload = {
          secret:   SECRET,
          name:     form.elements['name'].value,
          email:    form.elements['email'].value,
          business: form.elements['business'].value,
          spend:    form.elements['spend'].value,
          leak:     form.elements['leak'].value,
        };

        fetch(SHEET_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
          .then(function () {
            if (formView && successView) {
              formView.style.display = 'none';
              successView.style.display = 'block';
            }
            form.reset();
          })
          .catch(function () {
            // ponytail: show success anyway — sheet write may still succeed (CORS opaque response)
            if (formView && successView) {
              formView.style.display = 'none';
              successView.style.display = 'block';
            }
            form.reset();
          })
          .finally(function () {
            btn.textContent = 'Submit application';
            btn.disabled = false;
          });
      });
    }

    /* 6. Active nav link on scroll */
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links .nav-link'));
    if (sections.length && links.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (l) {
              var match = l.getAttribute('href') === '#' + entry.target.id;
              l.style.color = match ? 'var(--ink)' : '';
              l.style.background = match ? 'var(--surface-2)' : '';
            });
          });
        },
        { threshold: 0.4 }
      );
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
