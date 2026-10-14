(() => {
  'use strict';
  const base = document.body.dataset.base;
  const shared = document.body.dataset.sharedBase;
  const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let catalogPromise;
  const catalog = () => catalogPromise ||= fetch(base + 'catalog.json').then((r) => {
    if (!r.ok) throw new Error('Catalog unavailable');
    return r.json();
  }).catch((error) => { catalogPromise = undefined; throw error; });

  const openDialog = (id) => {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    document.querySelectorAll('dialog[open]').forEach((open) => open.close());
    if (id === 'cart') renderCart();
    dialog.showModal();
    if (id === 'search') document.getElementById('search-input').focus();
  };
  document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => openDialog(button.dataset.open)));
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    openDialog('form-notice');
  });

  const cookie = document.querySelector('.cookie-notice');
  const updateCookieHeight = () => document.documentElement.style.setProperty('--cookie-height', `${cookie.hidden ? 0 : Math.ceil(cookie.getBoundingClientRect().height)}px`);
  cookie.hidden = document.cookie.split(';').some((entry) => entry.trim() === 'iagrees=1');
  document.getElementById('cookie-dismiss').addEventListener('click', () => {
    document.cookie = 'iagrees=1; Path=/; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    cookie.hidden = true;
    updateCookieHeight();
  });
  new ResizeObserver(updateCookieHeight).observe(cookie);
  updateCookieHeight();

  const contactTrigger = document.querySelector('.contact-trigger');
  const contactMenu = document.querySelector('.contact-menu');
  const setContactOpen = (open) => {
    contactMenu.hidden = !open;
    contactTrigger.setAttribute('aria-expanded', String(open));
  };
  contactTrigger.addEventListener('click', () => setContactOpen(contactMenu.hidden));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.contact-hub')) setContactOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !contactMenu.hidden) {
      setContactOpen(false);
      contactTrigger.focus();
    }
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const items = JSON.parse(hero.dataset.hero);
    const images = [...hero.querySelectorAll('[data-hero-image]')];
    const dots = [...hero.querySelectorAll('[data-hero-select]')];
    const counter = document.getElementById('hero-current');
    const model = document.getElementById('hero-model');
    const pause = hero.querySelector('.hero-pause');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0, timer, manuallyPaused = false, hovered = false, focused = false;
    images.forEach((image, i) => { image.hidden = false; image.setAttribute('aria-hidden', String(i !== index)); });
    const select = (next) => {
      index = next;
      images.forEach((image, i) => { image.classList.toggle('is-active', i === index); image.setAttribute('aria-hidden', String(i !== index)); });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        dot.setAttribute('aria-pressed', String(i === index));
      });
      counter.textContent = String(index + 1).padStart(2, '0');
      model.textContent = items[index].name;
      model.href = items[index].url;
    };
    const restart = () => {
      clearInterval(timer);
      if (!manuallyPaused && !hovered && !focused && !document.hidden && !reducedMotion.matches) timer = setInterval(() => select((index + 1) % items.length), 6000);
    };
    dots.forEach((dot) => dot.addEventListener('click', () => { select(Number(dot.dataset.heroSelect)); restart(); }));
    pause.addEventListener('click', () => {
      manuallyPaused = !manuallyPaused;
      pause.setAttribute('aria-pressed', String(manuallyPaused));
      pause.setAttribute('aria-label', manuallyPaused ? 'Продолжить слайды' : 'Приостановить слайды');
      pause.querySelector('span').textContent = manuallyPaused ? '▷' : 'Ⅱ';
      restart();
    });
    hero.addEventListener('mouseenter', () => { hovered = true; restart(); });
    hero.addEventListener('mouseleave', () => { hovered = false; restart(); });
    hero.addEventListener('focusin', () => { focused = true; restart(); });
    hero.addEventListener('focusout', (event) => { focused = hero.contains(event.relatedTarget); restart(); });
    document.addEventListener('visibilitychange', restart);
    reducedMotion.addEventListener('change', restart);
    restart();
  }

  document.querySelectorAll('.product-gallery').forEach((gallery) => {
    if (typeof window.Swiper !== 'function') return;
    const slider = gallery.querySelector('.product-swiper');
    const thumbs = gallery.querySelectorAll('[data-gallery-index]');
    const swiper = new window.Swiper(slider, {
      navigation: { prevEl: slider.querySelector('.swiper-button-prev'), nextEl: slider.querySelector('.swiper-button-next') },
      keyboard: { enabled: true, onlyInViewport: true },
      on: { slideChange() { thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === this.activeIndex))); } },
    });
    thumbs.forEach((thumb) => thumb.addEventListener('click', () => swiper.slideTo(Number(thumb.dataset.galleryIndex))));
  });

  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  let searchVersion = 0;
  input.addEventListener('input', async () => {
    const version = ++searchVersion;
    const query = input.value.trim().toLocaleLowerCase('ru');
    if (!query) {
      results.innerHTML = '<p class="muted search-hint">18 авторских моделей. Например, LUMINA или латунь.</p>';
      return;
    }
    try {
      const { products } = await catalog();
      if (version !== searchVersion) return;
      const matches = products.filter((p) => ('mirel мирел светильник ' + p.name + ' ' + p.specs.map((s) => s.value).join(' ')).toLocaleLowerCase('ru').includes(query));
      results.innerHTML = '<p class="search-status">' + (matches.length ? `Найдено моделей: ${matches.length}` : 'Ничего не найдено. Попробуйте другое название или материал.') + '</p>' + matches.slice(0, 8).map((p) => `<a class="search-result" href="${escape(p.url)}"><img src="${escape(p.cover)}" alt="" width="75" height="75"><div><span>${escape(p.name)}</span><small>${escape(p.price)}</small></div></a>`).join('');
    } catch {
      if (version === searchVersion) results.innerHTML = `<p class="search-hint">Не удалось загрузить поиск. <a class="text-link" href="${base}catalog/">Открыть каталог</a></p>`;
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
    if (event.key === 'Enter') { event.preventDefault(); results.querySelector('.search-result')?.click(); }
  });
  results.addEventListener('keydown', (event) => {
    const links = [...results.querySelectorAll('a')], index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = index + (event.key === 'ArrowDown' ? 1 : -1);
      (links[next] || input).focus();
    }
  });

  function renderCart() {
    let items;
    try { items = JSON.parse(localStorage.getItem('mirel-static-cart-v1') || '[]'); } catch { items = []; }
    if (!Array.isArray(items)) items = [];
    const container = document.getElementById('cart-items');
    container.innerHTML = items.length ? items.map((p, i) => {
      const current = new URL(p.url || base + 'catalog/', location.origin);
      const href = current.origin === location.origin && current.pathname.startsWith(shared) ? base + current.pathname.slice(shared.length).replace(/^rebrand\//, '') : base + 'catalog/';
      const image = typeof p.image === 'string' && p.image.startsWith(shared) ? `<img src="${escape(p.image)}" alt="">` : '<span></span>';
      return `<div class="cart-item">${image}<div><a href="${escape(href)}">${escape(p.title || 'Светильник MIREL')}</a><small>${escape(p.price || '')}</small><small>Количество: ${escape(p.quantity || 1)}</small></div><button type="button" data-remove="${i}" aria-label="Удалить из корзины">×</button></div>`;
    }).join('') : '<p class="empty-cart">Ваша корзина пока пуста.</p>';
    container.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
      items.splice(Number(button.dataset.remove), 1);
      try { localStorage.setItem('mirel-static-cart-v1', JSON.stringify(items)); } catch { /* Private browsing may deny storage. */ }
      renderCart();
    }));
  }
})();
