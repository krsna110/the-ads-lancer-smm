/**
 * THE ADS LANCER — SMM Landing Page
 * Technical & Tracking Implementation
 * Features:
 * - GA4 & Meta Pixel event dispatchers (page_view, form_start, form_submit, cta_click, scroll_depth, faq_toggle)
 * - Automatic UTM capture & persistence (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
 * - 10-field qualification application form handling with Google Sheets webhook integration
 * - Frictionless application modal dialog with keyboard accessibility
 * - Scroll milestone tracker (25%, 50%, 75%, 90%)
 * - FAQ accordion with single-expand focus
 * - Header shrink & mobile drawer navigation
 * - Sticky bottom CTA bar with auto-visibility threshold
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     0. UTM Capture & Persistence
     ───────────────────────────────────────────────────────────── */
  var utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  var capturedUtms = {};

  try {
    var urlParams = new URLSearchParams(window.location.search);
    utmParams.forEach(function (param) {
      var val = urlParams.get(param);
      if (val) {
        capturedUtms[param] = val;
        sessionStorage.setItem('tal_' + param, val);
      } else {
        var stored = sessionStorage.getItem('tal_' + param);
        if (stored) capturedUtms[param] = stored;
      }
    });
  } catch (e) {
    // URLSearchParams fallback
  }

  /* ─────────────────────────────────────────────────────────────
     1. Analytics & Tracking Dispatcher (GA4, GTM, Meta Pixel)
     ───────────────────────────────────────────────────────────── */
  function trackEvent(eventName, params) {
    params = params || {};
    params.send_to_timestamp = new Date().toISOString();

    // 1. Google Tag Manager / dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, params));

    // 2. Google Analytics (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // 3. Meta Pixel (fbq)
    if (typeof window.fbq === 'function') {
      if (eventName === 'form_submit') {
        window.fbq('track', 'Lead', params);
      } else if (eventName === 'form_start') {
        window.fbq('trackCustom', 'FormStart', params);
      } else if (eventName === 'cta_click') {
        window.fbq('trackCustom', 'CtaClick', params);
      }
    }
  }

  // Fire initial page_view event
  trackEvent('page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });

  function init() {
    /* ───────────────────────────────────────────────────────────
       2. Header & Sticky Mobile CTA Scroll State
       ─────────────────────────────────────────────────────────── */
    var header = document.querySelector('.site-header');
    var stickyCta = document.getElementById('sticky-cta-bar');

    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset || 0;
      if (header) header.classList.toggle('scrolled', y > 24);
      if (stickyCta) stickyCta.classList.toggle('show', y > 520);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ───────────────────────────────────────────────────────────
       3. Mobile Navigation Drawer
       ─────────────────────────────────────────────────────────── */
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

    /* ───────────────────────────────────────────────────────────
       4. Scroll Reveal Animations & Count-Up
       ─────────────────────────────────────────────────────────── */
    var countUp = function (el) {
      var target = parseFloat(el.dataset.count || '0');
      var suffix = el.dataset.suffix || '';
      var start = performance.now();
      var dur = 1200;
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (target % 1 ? val.toFixed(1) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            el.classList.add('is-visible');
            el.querySelectorAll('[data-count]').forEach(countUp);
            io.unobserve(el);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
      );
      document.querySelectorAll('.reveal, [data-animate]').forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
        io.observe(el);
      });
    } else {
      document.querySelectorAll('.reveal, [data-animate]').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }

    /* ───────────────────────────────────────────────────────────
       5. Scroll Depth Tracking (25%, 50%, 75%, 90%)
       ─────────────────────────────────────────────────────────── */
    var reachedMilestones = {};
    var milestones = [25, 50, 75, 90];

    window.addEventListener(
      'scroll',
      function () {
        var h = document.documentElement;
        var b = document.body;
        var st = 'scrollTop';
        var sh = 'scrollHeight';
        var percent = Math.round(((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100);

        milestones.forEach(function (m) {
          if (percent >= m && !reachedMilestones[m]) {
            reachedMilestones[m] = true;
            trackEvent('scroll_depth', { percent_scrolled: m });
          }
        });
      },
      { passive: true }
    );

    /* ───────────────────────────────────────────────────────────
       6. CTA Click Tracking
       ─────────────────────────────────────────────────────────── */
    document.querySelectorAll('.btn, a.nav-link, button.open-apply-modal').forEach(function (cta) {
      cta.addEventListener('click', function () {
        var label = cta.textContent.trim().replace(/\s+/g, ' ');
        var closestSection = cta.closest('section');
        var sectionId = closestSection ? closestSection.id : (cta.closest('header') ? 'header' : (cta.closest('footer') ? 'footer' : 'sticky_bar'));
        trackEvent('cta_click', {
          cta_label: label,
          cta_section: sectionId,
          target_url: cta.getAttribute('href') || '#modal'
        });
      });
    });

    /* ───────────────────────────────────────────────────────────
       7. FAQ Accordion with Expansion Tracking
       ─────────────────────────────────────────────────────────── */
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
          trackEvent('faq_toggle', {
            faq_question: btn.textContent.trim()
          });
        }
      });
    });

    /* ───────────────────────────────────────────────────────────
       8. Modal Application Form & Lead Submission
       ─────────────────────────────────────────────────────────── */
    var modal = document.getElementById('apply-modal');
    var form = document.getElementById('application-form') || document.getElementById('audit-form');
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

      modal.addEventListener('cancel', function () {
        document.body.style.overflow = '';
      });
    }

    // Form Start Event Tracking (first field focus)
    var formStarted = false;
    if (form) {
      form.addEventListener('focusin', function () {
        if (!formStarted) {
          formStarted = true;
          trackEvent('form_start', { form_name: 'strategy_call_application' });
        }
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting application...';
        }

        var SHEET_URL = 'https://script.google.com/macros/s/AKfycbwYIAfo5b_oKtelXR9pwKrOiJSbw7uib6RT-oFf6a1WayxmuV_EtkkAAkMA6XESLRQo/exec';
        var SECRET    = 'tal-2026-krsna110';

        var payload = {
          secret:       SECRET,
          name:         form.elements['name']      ? form.elements['name'].value.trim()      : '',
          phone:        form.elements['whatsapp']  ? form.elements['whatsapp'].value.trim()  : '',
          instagram:    form.elements['instagram']  ? form.elements['instagram'].value.trim()  : '',
          niche:        form.elements['niche']      ? form.elements['niche'].value.trim()      : '',
          goal:         form.elements['goal']       ? form.elements['goal'].value              : '',
          utm_source:   capturedUtms.utm_source    || '',
          utm_medium:   capturedUtms.utm_medium    || '',
          utm_campaign: capturedUtms.utm_campaign  || '',
          utm_term:     capturedUtms.utm_term      || '',
          utm_content:  capturedUtms.utm_content   || '',
          source:       'The Ads Lancer SMM Landing Page',
          submittedAt:  new Date().toISOString()
        };

        var showSuccess = function () {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'APPLY FOR A STRATEGY CALL';
          }
          if (formView && successView) {
            formView.style.display = 'none';
            successView.style.display = 'block';
          }
          trackEvent('form_submit', {
            form_name: 'strategy_call_application',
            goal: payload.goal,
            niche: payload.niche
          });
        };

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
