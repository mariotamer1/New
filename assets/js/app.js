(() => {
  'use strict';

  const OWNER_EMAIL = 'tamermario1@gmail.com';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const iconFor = (category) => {
    const icons = {
      electronics: '<path d="M4 6h16v10H4z"/><path d="M9 20h6"/><path d="M12 16v4"/>',
      home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
      apparel: '<path d="M8 4l4 3 4-3 4 4-3 3v10H7V11L4 8z"/>',
      tools: '<path d="M14 7l3 3-8 8-3-3z"/><path d="M17.5 3.5a3 3 0 104 4L18 11l-3-3z"/>',
      toys: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 010-5C11 3 12 8 12 8"/><path d="M16.5 8a2.5 2.5 0 000-5C13 3 12 8 12 8"/>'
    };
    return icons[category] || icons.home;
  };

  const photoTile = (category) => `
    <div class="photo-tile cat-${category}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconFor(category)}</svg>
      <span>Photo Pending</span>
    </div>`;

  const fmtPrice = (n) => `$${n.toFixed(2)}`;

  const CATEGORIES = [
    {
      key: 'electronics', label: 'Electronics & Accessories', theme: 'light', layout: 'shelf',
      icon: '<rect x="4" y="6" width="16" height="10" rx="1.5"/><path d="M9 20h6M12 16v4"/>'
    },
    {
      key: 'home', label: 'Home & Living', theme: 'dark', layout: 'bento',
      icon: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>'
    },
    {
      key: 'apparel', label: 'Apparel & Bags', theme: 'light', layout: 'offset',
      icon: '<path d="M8 4l4 3 4-3 4 4-3 3v10H7V11L4 8z"/>'
    },
    {
      key: 'tools', label: 'Tools & Hardware', theme: 'dark', layout: 'spotlight',
      icon: '<path d="M14 7l3 3-8 8-3-3z"/><path d="M17.5 3.5a3 3 0 104 4L18 11l-3-3z"/>'
    },
    {
      key: 'toys', label: 'Toys & Games', theme: 'light', layout: 'shelf',
      icon: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 010-5C11 3 12 8 12 8"/><path d="M16.5 8a2.5 2.5 0 000-5C13 3 12 8 12 8"/>'
    }
  ];

  /* ---------------- Load products ---------------- */
  fetch('assets/data/products.json')
    .then((r) => r.json())
    .then((products) => {
      renderCategorySections(products);
      renderDeals(products.slice(0, 8));
      initJumpLinks();
      initReveal();
      initTilt();
      initCounters();
    })
    .catch(() => {
      const wrap = document.getElementById('categorySections');
      if (wrap) wrap.innerHTML = '<p style="text-align:center;color:#8a8471;padding:60px 0">Listings failed to load. Refresh to try again.</p>';
    });

  /* ---------------- Product card ---------------- */
  function productCard(p) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.category = p.category;
    card.innerHTML = `
      <div class="product-media">
        ${photoTile(p.category)}
        <span class="product-condition">${p.condition}</span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <div class="product-meta">
          <span class="product-price">${fmtPrice(p.price)}</span>
          <span class="product-moq">${p.moq}</span>
        </div>
        <div class="offer-box">
          <button class="offer-toggle" type="button" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Make an Offer
          </button>
          <div class="offer-panel">
            <div class="offer-panel-inner">
              <form class="offer-form" novalidate>
                <div class="offer-row">
                  <div class="field">
                    <label>Your Offer (USD)</label>
                    <input type="number" min="1" step="0.01" required placeholder="e.g. 75.00" />
                  </div>
                  <div class="field">
                    <label>Quantity</label>
                    <input type="number" min="1" step="1" value="1" required />
                  </div>
                </div>
                <div class="field">
                  <label>Contact Email</label>
                  <input type="email" required placeholder="you@example.com" />
                </div>
                <button type="submit" class="btn btn-dark btn-block btn-sm">Send Offer</button>
                <div class="offer-confirm">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  <span>Opening your email app…</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;

    const toggle = card.querySelector('.offer-toggle');
    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('offer-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    const form = card.querySelector('.offer-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const [offerInput, qtyInput] = form.querySelectorAll('input[type="number"]');
      const emailInput = form.querySelector('input[type="email"]');
      const offer = offerInput.value;
      const qty = qtyInput.value;
      const buyerEmail = emailInput.value;

      const subject = encodeURIComponent(`Offer on: ${p.title}`);
      const body = encodeURIComponent(
        `Item: ${p.title}\nListed price: ${fmtPrice(p.price)}\nMy offer: $${offer}\nQuantity: ${qty}\nMy email: ${buyerEmail}`
      );
      window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;

      const confirm = form.querySelector('.offer-confirm');
      confirm.classList.add('show');
      showToast(`Offer for "${trimTitle(p.title)}" ready to send`);
    });

    return card;
  }

  function trimTitle(t) { return t.length > 38 ? t.slice(0, 38) + '…' : t; }

  function renderCategorySections(products) {
    const wrap = document.getElementById('categorySections');
    const frag = document.createDocumentFragment();

    CATEGORIES.forEach((cat) => {
      const items = products.filter((p) => p.category === cat.key);
      if (!items.length) return;

      const section = document.createElement('section');
      section.className = `category-section theme-${cat.theme}`;
      section.id = `cat-${cat.key}`;

      const isShelf = cat.layout === 'shelf';
      section.innerHTML = `
        <div class="container">
          <div class="category-head">
            <div class="category-title">
              <span class="category-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${cat.icon}</svg>
              </span>
              <div>
                <h2 class="reveal">${cat.label}</h2>
                <span>${items.length} active listing${items.length === 1 ? '' : 's'}</span>
              </div>
            </div>
            ${isShelf ? `
            <div class="category-nav">
              <span class="shelf-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5l7 7-7 7M5 12h14"/></svg> Swipe</span>
              <button class="carousel-arrow shelf-prev" aria-label="Scroll left"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
              <button class="carousel-arrow shelf-next" aria-label="Scroll right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>
            </div>` : ''}
          </div>
          <div class="items-wrap layout-${cat.layout}"></div>
        </div>`;

      const itemsWrap = section.querySelector('.items-wrap');
      if (cat.layout === 'bento') {
        const featured = productCard(items[0]);
        const side = document.createElement('div');
        side.className = 'bento-side';
        items.slice(1).forEach((p) => side.appendChild(productCard(p)));
        itemsWrap.appendChild(featured);
        itemsWrap.appendChild(side);
      } else {
        items.forEach((p) => itemsWrap.appendChild(productCard(p)));
      }

      if (isShelf) {
        const prev = section.querySelector('.shelf-prev');
        const next = section.querySelector('.shelf-next');
        const scrollByCard = (dir) => {
          const card = itemsWrap.querySelector('.product-card');
          const width = card ? card.getBoundingClientRect().width + 22 : 280;
          itemsWrap.scrollBy({ left: dir * width, behavior: 'smooth' });
        };
        prev.addEventListener('click', () => scrollByCard(-1));
        next.addEventListener('click', () => scrollByCard(1));
      }

      frag.appendChild(section);
    });

    wrap.appendChild(frag);
  }

  function initJumpLinks() {
    document.querySelectorAll('#filterBar [data-jump]').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const target = document.getElementById(chip.dataset.jump);
        if (!target) return;
        e.preventDefault();
        const navHeight = document.getElementById('siteNav').offsetHeight + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
  }

  /* ---------------- Nav scroll + mobile toggle ---------------- */
  const nav = document.getElementById('siteNav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------------- Footer email ---------------- */
  const footerEmail = document.getElementById('footerEmail');
  const footerMailIcon = document.getElementById('footerMailIcon');
  const mailHref = `mailto:${OWNER_EMAIL}`;
  footerEmail.outerHTML = `<a href="${mailHref}">${OWNER_EMAIL}</a>`;
  footerMailIcon.setAttribute('href', mailHref);
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Hero counters ---------------- */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (prefersReducedMotion) { el.textContent = target; return; }
      const dur = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------------- Scroll reveal + parallax (GSAP) ---------------- */
  function initReveal() {
    if (typeof gsap === 'undefined') {
      document.querySelectorAll('.reveal').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    if (prefersReducedMotion) {
      gsap.set('.reveal, .product-card', { opacity: 1, y: 0 });
    } else {
      document.querySelectorAll('.section, .hero, .category-section').forEach((section) => {
        const items = section.querySelectorAll('.reveal');
        if (!items.length) return;
        gsap.to(items, {
          opacity: 1, y: 0,
          duration: 0.7, ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true }
        });
      });

      document.querySelectorAll('.category-section').forEach((section) => {
        const isOffset = !!section.querySelector('.layout-offset');
        const cards = section.querySelectorAll('.product-card');
        if (!cards.length) return;
        const trigger = { trigger: section, start: 'top 75%', once: true };
        if (isOffset) {
          /* Offset layout already has a static translateY rhythm via CSS
             (nth-child(even)); animate opacity only so it never fights that transform. */
          gsap.set(cards, { opacity: 0 });
          gsap.to(cards, { opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.07, scrollTrigger: trigger });
        } else {
          gsap.set(cards, { opacity: 0, y: 26 });
          gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.07, scrollTrigger: trigger });
        }
      });

      gsap.utils.toArray('.parallax-layer').forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed || '0.2');
        gsap.to(layer, {
          yPercent: speed * 60,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      });
    }
  }

  /* ---------------- 3D tilt on product + deal cards (spring-smoothed) ---------------- */
  function initTilt() {
    if (!canHover || prefersReducedMotion) return;

    document.body.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.product-card, .deal-card.is-active');
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card._tiltTargetX = py * -8;
      card._tiltTargetY = px * 10;
      startSpringLoop(card);
    });

    document.body.addEventListener('pointerleave', (e) => {
      const card = e.target.closest && e.target.closest('.product-card, .deal-card.is-active');
      if (!card) return;
      card._tiltTargetX = 0;
      card._tiltTargetY = 0;
      startSpringLoop(card);
    }, true);
  }

  function startSpringLoop(card) {
    if (card._springRunning) return;
    card._springRunning = true;
    card._curX = card._curX || 0;
    card._curY = card._curY || 0;
    card._velX = 0;
    card._velY = 0;

    const stiffness = 0.12;
    const damping = 0.72;

    function step() {
      const tx = card._tiltTargetX || 0;
      const ty = card._tiltTargetY || 0;

      const forceX = (tx - card._curX) * stiffness;
      card._velX = (card._velX + forceX) * damping;
      card._curX += card._velX;

      const forceY = (ty - card._curY) * stiffness;
      card._velY = (card._velY + forceY) * damping;
      card._curY += card._velY;

      card.style.transform = `perspective(900px) rotateX(${card._curX.toFixed(2)}deg) rotateY(${card._curY.toFixed(2)}deg)`;

      if (Math.abs(card._velX) > 0.01 || Math.abs(card._velY) > 0.01 || Math.abs(tx - card._curX) > 0.05 || Math.abs(ty - card._curY) > 0.05) {
        requestAnimationFrame(step);
      } else {
        card._springRunning = false;
        if (tx === 0 && ty === 0) card.style.transform = '';
      }
    }
    requestAnimationFrame(step);
  }

  /* ---------------- Deals carousel: real drag + swipe + momentum ---------------- */
  function renderDeals(products) {
    const track = document.getElementById('dealsTrack');
    const dotsWrap = document.getElementById('dealDots');
    const viewport = document.getElementById('dealsViewport');

    products.forEach((p) => {
      const card = document.createElement('div');
      card.className = 'deal-card';
      card.innerHTML = `
        <div class="deal-thumb">${photoTile(p.category)}</div>
        <h4>${p.title}</h4>
        <div class="deal-price">${fmtPrice(p.price)}</div>
        <div class="deal-moq">${p.moq}</div>`;
      track.appendChild(card);
    });

    const cards = Array.from(track.children);
    cards.forEach((c, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to deal ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    let index = 0;
    let currentX = 0;

    function cardStep() {
      const card = cards[0];
      const style = getComputedStyle(track);
      const gap = parseFloat(style.gap || style.columnGap || '26');
      return card.getBoundingClientRect().width + gap;
    }

    function update(animate = true) {
      const step = cardStep();
      const viewportWidth = viewport.getBoundingClientRect().width;
      const offset = -(index * step) + (viewportWidth / 2 - step / 2 + parseFloat(getComputedStyle(track.parentElement).paddingLeft || 0));
      currentX = offset;
      track.style.transition = animate ? `transform 480ms cubic-bezier(0.23,1,0.32,1)` : 'none';
      track.style.transform = `translateX(${offset}px)`;
      cards.forEach((c, i) => c.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(cards.length - 1, i));
      update(true);
    }

    document.getElementById('dealPrev').addEventListener('click', () => goTo(index - 1));
    document.getElementById('dealNext').addEventListener('click', () => goTo(index + 1));

    /* Pointer drag with velocity + momentum projection (per Apple fluid-interfaces model) */
    let dragging = false, startX = 0, startTranslate = 0, lastX = 0, lastT = 0, velocity = 0;

    viewport.addEventListener('pointerdown', (e) => {
      dragging = true;
      viewport.classList.add('grabbing');
      viewport.setPointerCapture(e.pointerId);
      startX = lastX = e.clientX;
      lastT = performance.now();
      startTranslate = currentX;
      track.style.transition = 'none';
      velocity = 0;
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(1, now - lastT);
      velocity = dx / dt;
      lastX = e.clientX;
      lastT = now;

      currentX = startTranslate + (e.clientX - startX);
      track.style.transform = `translateX(${currentX}px)`;
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove('grabbing');

      const step = cardStep();
      const projected = (velocity * 1000 * 0.15); // momentum projection
      const movedBy = currentX - startTranslate;
      const effectiveMove = movedBy + projected;

      let deltaCards = -Math.round(effectiveMove / step);
      if (deltaCards === 0 && Math.abs(movedBy) > step * 0.18) {
        deltaCards = movedBy < 0 ? 1 : -1;
      }
      goTo(index + deltaCards);
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', () => { if (dragging) endDrag(); });

    window.addEventListener('resize', () => update(false));
    update(false);
  }
})();
