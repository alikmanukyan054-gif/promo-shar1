/* ================================================
   ПРОМО ШАР — script.js
   Production-ready JS | Clean code | No frameworks
   ================================================ */

'use strict';

/* ===== LOADER ===== */
const initLoader = () => {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hide = () => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  };

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    setTimeout(hide, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
  }
};


/* ===== HEADER — scroll behaviour & burger ===== */
const initHeader = () => {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  if (!header) return;

  // Scroll class
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      nav.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    nav.querySelectorAll('.header__nav-link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && nav.classList.contains('open')) {
        burger.classList.remove('open');
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
};


/* ===== SMOOTH SCROLL ===== */
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};


/* ===== SCROLL REVEAL (IntersectionObserver) ===== */
const initScrollReveal = () => {
  const selectors = '.reveal-up, .reveal-left, .reveal-right, .reveal-fade';
  const elements  = document.querySelectorAll(selectors);
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  elements.forEach(el => observer.observe(el));
};


/* ===== COUNTER ANIMATION ===== */
const animateCounter = (el) => {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start    = performance.now();

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const step = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(easeOut(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const initCounters = () => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
};


/* ===== FAQ ACCORDION ===== */
const initFaq = () => {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-item__question')?.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
};


/* ===== PORTFOLIO FILTER ===== */
const initPortfolioFilter = () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('.portfolio-item');
  if (!filterBtns.length || !items.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
};


/* ===== REVIEWS SLIDER ===== */
const initReviewsSlider = () => {
  const track  = document.getElementById('reviewsTrack');
  const prev   = document.getElementById('reviewsPrev');
  const next   = document.getElementById('reviewsNext');
  const dotsEl = document.getElementById('reviewsDots');
  if (!track) return;

  const cards       = Array.from(track.querySelectorAll('.review-card'));
  let current       = 0;
  let autoInterval  = null;
  let isDragging    = false;
  let dragStartX    = 0;
  let dragOffsetX   = 0;

  const getVisible = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  };

  const maxIndex = () => Math.max(0, cards.length - getVisible());

  const buildDots = () => {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = `reviews__dot${i === current ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  };

  const updateDots = () => {
    dotsEl?.querySelectorAll('.reviews__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  };

  const getCardWidth = () => {
    if (!cards[0]) return 0;
    const gap = 32; // --space-xl
    const visible = getVisible();
    const trackW = track.parentElement.offsetWidth;
    return (trackW - gap * (visible - 1)) / visible + gap;
  };

  const goTo = (index) => {
    current = Math.max(0, Math.min(index, maxIndex()));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
  };

  const goPrev = () => goTo(current - 1);
  const goNext = () => { current < maxIndex() ? goTo(current + 1) : goTo(0); };

  const startAuto = () => {
    stopAuto();
    autoInterval = setInterval(goNext, 4500);
  };
  const stopAuto = () => clearInterval(autoInterval);

  // Arrow buttons
  prev?.addEventListener('click', () => { goPrev(); startAuto(); });
  next?.addEventListener('click', () => { goNext(); startAuto(); });

  // Drag / swipe
  const onDragStart = (e) => {
    isDragging  = true;
    dragStartX  = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    dragOffsetX = 0;
    track.style.transition = 'none';
    stopAuto();
  };
  const onDragMove = (e) => {
    if (!isDragging) return;
    const x    = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    dragOffsetX = x - dragStartX;
    track.style.transform = `translateX(${-current * getCardWidth() + dragOffsetX}px)`;
  };
  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    if (dragOffsetX < -60) goNext();
    else if (dragOffsetX > 60) goPrev();
    else goTo(current);
    startAuto();
  };

  track.addEventListener('mousedown',  onDragStart);
  track.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('mouseup',   onDragEnd);
  window.addEventListener('touchend',  onDragEnd);

  // Pause on hover
  track.parentElement?.addEventListener('mouseenter', stopAuto);
  track.parentElement?.addEventListener('mouseleave', startAuto);

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goTo(Math.min(current, maxIndex()));
      buildDots();
    }, 200);
  });

  buildDots();
  goTo(0);
  startAuto();
};


/* ===== CONTACT FORM ===== */
const initContactForm = () => {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const showError = (input, show) => {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.toggle('has-error', show);
    input.classList.toggle('error', show);
  };

  const validateField = (input) => {
    if (input.type === 'tel') {
      const val = input.value.replace(/\D/g, '');
      return val.length >= 10;
    }
    return input.value.trim().length > 0;
  };

  // Live validation
  form.querySelectorAll('.form-input[required]').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) showError(input, !validateField(input));
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) showError(input, !validateField(input));
    });
  });

  // Phone mask
  const phoneInput = form.querySelector('input[type="tel"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let val = phoneInput.value.replace(/\D/g, '');
      if (val.startsWith('8')) val = '7' + val.slice(1);
      if (!val.startsWith('7') && val.length > 0) val = '7' + val;
      val = val.slice(0, 11);

      let formatted = '+7';
      if (val.length > 1) formatted += ' (' + val.slice(1, 4);
      if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
      if (val.length >= 7) formatted += '-' + val.slice(7, 9);
      if (val.length >= 9) formatted += '-' + val.slice(9, 11);

      phoneInput.value = formatted;
    });
  }

  // Submit
  const submitBtn = form.querySelector('.form-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('.form-input[required]').forEach(input => {
      const ok = validateField(input);
      showError(input, !ok);
      if (!ok) valid = false;
    });

    if (!valid) return;

    // Simulate submission
    submitBtn?.classList.add('loading');
    submitBtn && (submitBtn.disabled = true);

    await new Promise(r => setTimeout(r, 1800));

    submitBtn?.classList.remove('loading');
    submitBtn && (submitBtn.disabled = false);

    // Show success
    form.style.display = 'none';
    if (success) {
      success.setAttribute('aria-hidden', 'false');
      success.style.display = 'flex';
    }
  });
};


/* ===== SCROLL TO TOP ===== */
const initScrollTop = () => {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};


/* ===== PARALLAX (subtle hero blobs) ===== */
const initParallax = () => {
  const blobs = document.querySelectorAll('.hero__blob');
  if (!blobs.length) return;

  const speeds = [0.04, 0.06, 0.03];

  const onScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > window.innerHeight) return;
    blobs.forEach((blob, i) => {
      blob.style.transform = `translateY(${scrollY * speeds[i]}px)`;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
};


/* ===== ACTIVE NAV LINK on scroll ===== */
const initActiveNav = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'header__nav-link--active',
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-70px 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
};


/* ===== HOVER GLOW on buttons (micro-animation) ===== */
const initButtonGlow = () => {
  document.querySelectorAll('.btn--primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      btn.style.setProperty('--glow-x', `${x}%`);
      btn.style.setProperty('--glow-y', `${y}%`);
    });
  });
};


/* ===== SERVICE CARD tilt on hover ===== */
const initCardTilt = () => {
  const cards = document.querySelectorAll('.service-card, .pricing-card, .counter-card');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = (-dy * 5).toFixed(2);
      const rotY   = ( dx * 5).toFixed(2);
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
};


/* ===== BALLOON hover in hero ===== */
const initBalloonHover = () => {
  const balloons = document.querySelectorAll('.balloon');
  balloons.forEach(b => {
    b.addEventListener('mouseenter', () => {
      b.style.transform = `translate(calc(-50% + var(--tx)), calc(-50% + var(--ty) - 30px)) scale(1.08)`;
      b.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    b.addEventListener('mouseleave', () => {
      b.style.transform = '';
      b.style.transition = '';
    });
  });
};


/* ===== STAGGER REVEAL for service cards ===== */
const initStagger = () => {
  const groups = [
    document.querySelectorAll('.service-card'),
    document.querySelectorAll('.pricing-card'),
    document.querySelectorAll('.portfolio-item'),
  ];

  groups.forEach(cards => {
    cards.forEach((card, i) => {
      if (!card.style.getPropertyValue('--delay')) {
        card.style.setProperty('--delay', `${i * 0.1}s`);
      }
    });
  });
};


/* ===== CURSOR TRAIL (subtle, desktop only) ===== */
const initCursorTrail = () => {
  if (window.matchMedia('(max-width: 768px)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const dots  = [];
  const count = 6;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed; pointer-events: none; z-index: 9998;
      width: ${6 - i}px; height: ${6 - i}px;
      border-radius: 50%;
      background: rgba(255, 107, 157, ${0.5 - i * 0.07});
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      left: 0; top: 0;
    `;
    document.body.appendChild(dot);
    dots.push({ el: dot, x: 0, y: 0 });
  }

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  let rafActive = true;
  const animate = () => {
    if (!rafActive) return;
    dots.forEach((dot, i) => {
      const prev = i === 0 ? { x: mx, y: my } : dots[i - 1];
      dot.x += (prev.x - dot.x) * 0.35;
      dot.y += (prev.y - dot.y) * 0.35;
      dot.el.style.left = `${dot.x}px`;
      dot.el.style.top  = `${dot.y}px`;
    });
    requestAnimationFrame(animate);
  };
  animate();

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => dots.forEach(d => { d.el.style.opacity = '0'; }));
  document.addEventListener('mouseenter', () => dots.forEach(d => { d.el.style.opacity = '1'; }));
};


/* ===== SECTION ENTRANCE ANIMATIONS (additional polish) ===== */
const initSectionAnimations = () => {
  // Animate process steps with stagger on reveal
  const processSteps = document.querySelectorAll('.process-step');
  const processObs   = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      processSteps.forEach((step, i) => {
        setTimeout(() => {
          step.style.opacity    = '1';
          step.style.transform  = 'translateY(0)';
        }, i * 130);
      });
      processObs.disconnect();
    }
  }, { threshold: 0.2 });

  if (processSteps.length) {
    processSteps.forEach(step => {
      step.style.opacity    = '0';
      step.style.transform  = 'translateY(30px)';
      step.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    processObs.observe(processSteps[0].closest('section') || processSteps[0]);
  }
};


/* ===== KEYBOARD NAVIGATION for FAQ ===== */
const initFaqKeyboard = () => {
  document.querySelectorAll('.faq-item__question').forEach((btn, i, all) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); all[Math.min(i + 1, all.length - 1)]?.focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); all[Math.max(i - 1, 0)]?.focus(); }
    });
  });
};


/* ===== TICKER pause on hover ===== */
const initTicker = () => {
  const track = document.querySelector('.ticker__track');
  if (!track) return;
  track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('mouseleave', () => { track.style.animationPlayState = ''; });
};


/* ===== PORTFOLIO item click for lightbox hint ===== */
const initPortfolioClick = () => {
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => {
      item.style.transform = 'scale(0.98)';
      setTimeout(() => { item.style.transform = ''; }, 150);
    });
  });
};


/* ===== INIT ALL ===== */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initHeader();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initFaq();
  initFaqKeyboard();
  initPortfolioFilter();
  initPortfolioClick();
  initReviewsSlider();
  initContactForm();
  initScrollTop();
  initParallax();
  initActiveNav();
  initButtonGlow();
  initCardTilt();
  initBalloonHover();
  initStagger();
  initCursorTrail();
  initSectionAnimations();
  initTicker();
});
