/**
 * THE ADS LANCER — Social Media Management Landing Page Interactions
 * Dynamic animations, mobile drawer, scroll spy, FAQ accordion,
 * interactive growth estimator, modal dialog, and lead submission handling.
 */
(function () {
  function init() {
    /* 1. Header and Sticky Bottom CTA scroll state */
    var header = document.querySelector('.site-header');
    var stickyCta = document.getElementById('sticky-cta-bar');
    if (header || stickyCta) {
      var onScroll = function () {
        if (header) header.classList.toggle('scrolled', window.scrollY > 24);
        if (stickyCta) stickyCta.classList.toggle('show', window.scrollY > 500);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* 2. Mobile navigation drawer */
    var toggle = document.getElementById('mobile-toggle');
    var drawer = document.getElementById('mobile-drawer');
    if (toggle && drawer) {
      toggle.addEventListener('click', function () {
        var isOpen = drawer.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      drawer.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', function () {
          drawer.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* 3. Scroll reveal animations & count-up stats */
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
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal, [data-animate]').forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 80 + 'ms';
      io.observe(el);
    });

    /* 4. Active nav link on scroll (Scroll Spy) */
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
        { threshold: 0.3 }
      );
      sections.forEach(function (s) { spy.observe(s); });
    }

    /* 5. FAQ accordion */
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      if (!btn || !panel) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (other) {
          other.classList.remove('open');
          var p = other.querySelector('.faq-a');
          if (p) p.style.maxHeight = '0px';
          var b = other.querySelector('.faq-q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* 6. Interactive Inbound Growth Estimator */
    var audienceRange = document.getElementById('calc-audience');
    var nicheSelect = document.getElementById('calc-niche');
    var estInquiries = document.getElementById('est-inquiries');
    var estReach = document.getElementById('est-reach');
    var estContent = document.getElementById('est-content');

    function updateCalculator() {
      if (!audienceRange || !nicheSelect || !estInquiries) return;
      var aud = parseInt(audienceRange.value, 10) || 5000;
      var nicheMultiplier = parseFloat(nicheSelect.value) || 1.0;

      // Calculate realistic inbound traction ranges
      var inquiries = Math.max(8, Math.round((aud * 0.0035 * nicheMultiplier) + 12));
      var reach = Math.round(aud * 3.8 * nicheMultiplier);
      var contentPieces = aud > 15000 ? '20-24 assets / mo' : '14-18 assets / mo';

      var audLabel = document.getElementById('calc-audience-val');
      if (audLabel) {
        audLabel.textContent = aud.toLocaleString() + ' followers';
      }

      estInquiries.textContent = inquiries + '+';
      if (estReach) estReach.textContent = (reach > 1000 ? (reach / 1000).toFixed(1) + 'k' : reach);
      if (estContent) estContent.textContent = contentPieces;
    }

    if (audienceRange && nicheSelect) {
      audienceRange.addEventListener('input', updateCalculator);
      nicheSelect.addEventListener('change', updateCalculator);
      updateCalculator();
    }

    /* 7. Application Modal Handling & Google Sheet Integration */
    var modal = document.getElementById('apply-modal');
    var form = document.getElementById('audit-form');
    var formView = document.getElementById('modal-form-content');
    var successView = document.getElementById('modal-success-content');
    var closeBtn = document.getElementById('modal-close-btn');

    function openModal() {
      if (!modal) return;
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
      if (formView && successView) {
        formView.style.display = 'block';
        successView.style.display = 'none';
      }
    }

    function closeModal() {
      if (!modal) return;
      if (typeof modal.close === 'function') {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.open-apply-modal').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        var rect = modal.getBoundingClientRect();
        var isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          closeModal();
        }
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting application...';
        }

        var SHEET_URL = 'https://script.google.com/macros/s/AKfycbyE7kPHDTgvXQLxcPKYp5fFzES9j8ku0T9lWd53Gf-ihYz2G4GBrWdcG5xPwaTsMSsppw/exec';
        var SECRET    = 'tal-2026-krsna110';

        var payload = {
          secret:      SECRET,
          name:        form.elements['name'] ? form.elements['name'].value : '',
          whatsapp:    form.elements['whatsapp'] ? form.elements['whatsapp'].value : '',
          email:       form.elements['email'] ? form.elements['email'].value : '',
          profession:  form.elements['profession'] ? form.elements['profession'].value : '',
          instagram:   form.elements['instagram'] ? form.elements['instagram'].value : '',
          help_needed: form.elements['help_needed'] ? form.elements['help_needed'].value : '',
          budget:      form.elements['budget'] ? form.elements['budget'].value : '',
          challenge:   form.elements['challenge'] ? form.elements['challenge'].value : '',
          source:      'SMM Landing Page',
          submittedAt: new Date().toISOString()
        };

        var showSuccess = function () {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'APPLY FOR SOCIAL MEDIA MANAGEMENT';
          }
          if (formView && successView) {
            formView.style.display = 'none';
            successView.style.display = 'block';
          }
        };

        // Send to backend sheet with timeout safeguard
        var didRespond = false;
        var timeoutId = setTimeout(function () {
          if (!didRespond) {
            didRespond = true;
            showSuccess();
          }
        }, 2200);

        fetch(SHEET_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        })
          .then(function () {
            if (!didRespond) {
              didRespond = true;
              clearTimeout(timeoutId);
              showSuccess();
            }
          })
          .catch(function () {
            // Graceful fallback: show confirmation even if CORS opaque response occurs
            if (!didRespond) {
              didRespond = true;
              clearTimeout(timeoutId);
              showSuccess();
            }
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
