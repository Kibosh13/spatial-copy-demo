(function () {
  'use strict';

  const nativeFetch = window.fetch.bind(window);
  const CART_KEY = 'spatial-static-cart-v1';
  const AVAILABLE_ROUTES = new Set([
    '/spatial-copy-demo/',
    '/spatial-copy-demo/catalog/',
    '/spatial-copy-demo/3d-models/',
    '/spatial-copy-demo/your-projects/',
    '/spatial-copy-demo/ourteam/',
    '/spatial-copy-demo/news/',
    '/spatial-copy-demo/stock/',
    '/spatial-copy-demo/contacts/',
    '/spatial-copy-demo/policy/',
    '/spatial-copy-demo/personal/',
    '/spatial-copy-demo/payments/',
    '/spatial-copy-demo/contacts/index__sevastopol.html',
    '/spatial-copy-demo/contacts/index__moscow.html',
    '/spatial-copy-demo/spatial-index__curr_usd.html',
    '/spatial-copy-demo/spatial-index__curr_eur.html',
  ]);
  const MICRO_BRAND_TEXT = new Map([
    ['Каталог', 'Коллекции'],
    ['Складская программа', 'В наличии'],
    ['3D модели', '3D-модели'],
    ['Электронный каталог и 3D модели', 'Каталог и 3D-модели'],
    ['Ваши проекты', 'Проекты'],
    ['ВЫПОЛНЕННЫЕ ПРОЕКТЫ', 'РЕАЛИЗОВАННЫЕ ПРОЕКТЫ'],
    ['Команда SPATIAL', 'О бренде'],
    ['Новости', 'Журнал'],
    ['Светильники SPATIAL', 'Коллекции SPATIAL'],
    ['мы делаем свет', 'свет как искусство'],
    ['Стильное и модное освещение', 'Современный свет с характером'],
    ['ИЗГОТОВЛЕНО НА ЗАКАЗ', 'СОЗДАНО ДЛЯ ВАШЕГО ИНТЕРЬЕРА'],
    ['Все светильники Spatial изготавливаются вручную', 'Каждый светильник SPATIAL собирается вручную'],
    ['нашей командой специалистов', 'командой мастеров бренда'],
    [
      'Благодаря собственному производству, мы можем изготовить люстру в точном соответствии с вашими предпочтениями.',
      'Собственное производство позволяет точно адаптировать размер, отделку и композицию модели под ваш интерьер.',
    ],
    [
      'В работе мы используем оригинальные кристаллы, жемчуг, стекольные элементы и ткань.',
      'Мы работаем с кристаллами, жемчугом, стеклом и текстилем, внимательно подбирая сочетание материалов.',
    ],
    [
      'В ассортименте нашего бренда есть светильники как из складской программы, так и по индивидуальным эскизам, выполняемые в быстрые сроки.',
      'Доступны готовые коллекции и индивидуальное изготовление по эскизам дизайнера.',
    ],
    [
      '«SPATIAL» в переводе с английского означает «пространственный». Вся коллекция света нашего бренда - про воздух, эстетику и стиль.',
      'SPATIAL — свет, который формирует характер пространства. В основе коллекций — чистые линии, выразительные материалы и точный баланс эстетики и функции.',
    ],
    [
      'Наша команда имеет десятилетний опыт в дистрибьюции освещения, который помог нам создать собственный бренд дизайнерского света SPATIAL.',
      'Опыт команды в световом дизайне и производстве помогает создавать модели для частных и общественных интерьеров.',
    ],
    ['В основу бренда заложены важные аспекты современного освещения:', 'В каждой коллекции мы соединяем:'],
    ['трендовый минимализм;', 'выразительную лаконичность;'],
    ['безопасность использования;', 'продуманную безопасность;'],
    ['высокое качество продукции;', 'точность ручной сборки;'],
    ['новейшие возможности управления светом', 'современные сценарии управления светом'],
    [
      'Соглашаюсь на отправку я принимаю общие условия и политику конфиденциальности',
      'Отправляя форму, я принимаю условия обработки персональных данных и политику конфиденциальности.',
    ],
    ['Правила оплаты и безопасность платежей', 'Оплата и безопасность'],
  ]);
  const MICRO_BRAND_PALETTE = new Map([
    ['#3a3330', '#403936'],
    ['#231e1b', '#292321'],
    ['#2f2e2a', '#36312e'],
    ['#393331', '#3f3835'],
    ['#3b3330', '#403936'],
    ['#2f2927', '#302925'],
    ['#dfdbda', '#e4ddd4'],
    ['#f1cb7f', '#caa86e'],
    ['#f3cf82', '#d4b77e'],
    ['#daba77', '#c49d63'],
    ['#543c0d', '#80643b'],
    ['#816334', '#9b7444'],
  ]);
  let searchIndexPromise;

  window.ym = window.ym || function () {};

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadSearchIndex() {
    searchIndexPromise ||= nativeFetch('/spatial-copy-demo/search-index.json').then((response) =>
      response.ok ? response.json() : [],
    );
    return searchIndexPromise;
  }

  function searchResultHtml(items) {
    return items
      .map(
        (item) => `
          <a href="${escapeHtml(item.url)}" class="slnk" style="display:flex;gap:14px;padding:14px;align-items:center;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.05)">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" style="width:64px;height:64px;object-fit:cover;border-radius:8px;flex:none">` : ''}
            <div style="flex:1;min-width:0">
              <div style="color:#fff;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(item.title)}</div>
              ${item.price ? `<div style="color:#c7a56a;font-size:14px;padding-top:6px">${escapeHtml(item.price)}</div>` : ''}
            </div>
          </a>`,
      )
      .join('');
  }

  window.fetch = async function (input, init) {
    const rawUrl = typeof input === 'string' ? input : input && input.url;
    if (rawUrl) {
      const url = new URL(rawUrl, window.location.href);
      if (url.pathname === '/spatial-copy-demo/search_live.php') {
        const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase('ru');
        const index = await loadSearchIndex();
        const matches = !query
          ? []
          : index
              .filter((item) => item.search.includes(query))
              .slice(0, 8);
        return new Response(searchResultHtml(matches), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }
    }
    return nativeFetch(input, init);
  };

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  function currentProduct(quantity) {
    const title =
      document.querySelector('h1')?.textContent?.trim() ||
      document.querySelector('.zg')?.textContent?.trim() ||
      document.title.split('|')[0].split('—')[0].trim();
    const price = document.querySelector('#price')?.textContent?.trim() || '';
    const image =
      document.querySelector('img.caimg')?.getAttribute('src') ||
      document.querySelector('main img')?.getAttribute('src') ||
      '';
    return {
      id: window.location.pathname + window.location.search,
      title,
      price,
      image,
      quantity: Math.max(1, Number(quantity) || 1),
      url: window.location.pathname + window.location.search,
    };
  }

  function cartMarkup(items) {
    if (!items.length) {
      return '<div style="padding:45px 28px;color:#fff;text-align:center">Корзина пока пуста</div>';
    }
    return `<div style="padding:18px 22px;color:#fff;overflow:auto;height:calc(100vh - 85px)">
      ${items
        .map(
          (item, index) => `<div style="display:grid;grid-template-columns:72px 1fr auto;gap:14px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.14)">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:6px">` : '<div></div>'}
            <div><a href="${escapeHtml(item.url)}" style="color:#fff;text-decoration:none">${escapeHtml(item.title)}</a><div style="color:#c7a56a;padding-top:6px">${escapeHtml(item.price)}${item.price && !/[₽$€]/.test(item.price) ? ' ₽' : ''}</div><div style="opacity:.7;font-size:13px;padding-top:4px">Количество: ${item.quantity}</div></div>
            <button type="button" data-static-cart-remove="${index}" aria-label="Удалить" style="border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer">×</button>
          </div>`,
        )
        .join('')}
      <div style="padding-top:22px;font-size:13px;line-height:1.5;opacity:.8">Товары сохранены в этом браузере. Для оформления свяжитесь с SPATIAL по телефону +7 916 005-54-07 или по электронной почте spatial.su@yandex.ru.</div>
    </div>`;
  }

  function renderCart() {
    const container = document.getElementById('cartres');
    if (!container) return;
    container.innerHTML = cartMarkup(loadCart());
    container.querySelectorAll('[data-static-cart-remove]').forEach((button) => {
      button.addEventListener('click', function () {
        const items = loadCart();
        items.splice(Number(this.dataset.staticCartRemove), 1);
        saveCart(items);
        renderCart();
      });
    });
  }

  window.tocart = function () {
    const quantity = document.querySelector('#kolvo')?.value || 1;
    const item = currentProduct(quantity);
    const items = loadCart();
    const existing = items.find((candidate) => candidate.id === item.id);
    if (existing) existing.quantity += item.quantity;
    else items.push(item);
    saveCart(items);
    renderCart();
    document.getElementById('showcart')?.click();
  };

  window.cart = function () {
    renderCart();
  };

  function showOfflineNotice() {
    let notice = document.getElementById('spatial-recovery-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'spatial-recovery-notice';
      notice.setAttribute('role', 'dialog');
      notice.setAttribute('aria-modal', 'true');
      notice.style.cssText =
        'position:fixed;inset:0;z-index:10000000;background:rgba(35,30,27,.82);display:grid;place-items:center;padding:20px';
      notice.innerHTML = `<div style="width:min(520px,100%);background:#3a3330;color:#fff;padding:30px;border:1px solid rgba(255,255,255,.18);box-shadow:0 18px 70px rgba(0,0,0,.45);font-family:Montserrat,Arial,sans-serif">
        <div style="font-size:24px;margin-bottom:14px">Свяжитесь с SPATIAL</div>
        <div style="font-size:15px;line-height:1.7;opacity:.88">Эта форма была частью старого сервера и в восстановленной копии не отправляет данные. Оставить заявку можно напрямую:</div>
        <div style="margin-top:18px;line-height:1.9"><a href="tel:+79160055407" style="color:#fff">+7 916 005-54-07</a><br><a href="mailto:spatial.su@yandex.ru" style="color:#fff">spatial.su@yandex.ru</a></div>
        <button type="button" data-close-recovery-notice style="margin-top:22px;padding:11px 22px;border:1px solid #fff;background:#fff;color:#231e1b;cursor:pointer">Закрыть</button>
      </div>`;
      document.body.appendChild(notice);
      notice.querySelector('[data-close-recovery-notice]').addEventListener('click', () => notice.remove());
      notice.addEventListener('click', (event) => {
        if (event.target === notice) notice.remove();
      });
    }
  }

  function showProductPlaceholder() {
    let notice = document.getElementById('spatial-product-placeholder');
    if (notice) return;
    notice = document.createElement('div');
    notice.id = 'spatial-product-placeholder';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'true');
    notice.style.cssText =
      'position:fixed;inset:0;z-index:10000000;background:rgba(35,30,27,.82);display:grid;place-items:center;padding:20px';
    notice.innerHTML = `<div style="width:min(520px,100%);background:#3a3330;color:#fff;padding:30px;border:1px solid rgba(255,255,255,.18);box-shadow:0 18px 70px rgba(0,0,0,.45);font-family:Montserrat,Arial,sans-serif">
      <div style="font-size:24px;margin-bottom:14px">Позиция готова к обновлению</div>
      <div style="font-size:15px;line-height:1.7;opacity:.88">Карточка сохранена как визуальная заглушка, чтобы восстановленный сайт выглядел целостно. Новый товар, описание и характеристики можно добавить сюда после подготовки каталога.</div>
      <button type="button" data-close-product-placeholder style="margin-top:22px;padding:11px 22px;border:1px solid #fff;background:#fff;color:#231e1b;cursor:pointer">Закрыть</button>
    </div>`;
    document.body.appendChild(notice);
    notice.querySelector('[data-close-product-placeholder]').addEventListener('click', () => notice.remove());
    notice.addEventListener('click', (event) => {
      if (event.target === notice) notice.remove();
    });
  }

  document.addEventListener(
    'submit',
    function (event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.id === 'fsearch') {
        event.preventDefault();
        if (typeof window.runSearch === 'function') window.runSearch();
        return;
      }
      if ((form.method || 'get').toLowerCase() === 'post') {
        event.preventDefault();
        showOfflineNotice();
      }
    },
    true,
  );

  document.addEventListener(
    'click',
    function (event) {
      const target = event.target instanceof Element ? event.target.closest('a,button,[onclick]') : null;
      if (!target) return;
      const action = `${target.getAttribute('href') || ''} ${target.getAttribute('onclick') || ''}`;
      if (action.includes('proposal.php')) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showOfflineNotice();
        return;
      }

      const href = target.getAttribute('href');
      if (href && href.startsWith('/spatial-copy-demo/') && !href.startsWith('//')) {
        const url = new URL(href, window.location.href);
        const hasFileExtension = /\.[a-z0-9]{2,5}$/i.test(url.pathname);
        if (url.origin === window.location.origin && !hasFileExtension && !AVAILABLE_ROUTES.has(url.pathname)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showProductPlaceholder();
        }
      }
    },
    true,
  );

  const nativeSubmit = Object.getOwnPropertyDescriptor(
    HTMLFormElement.prototype,
    'submit',
  ).value;
  HTMLFormElement.prototype.submit = function () {
    if (this.id === 'fsearch') {
      if (typeof window.runSearch === 'function') window.runSearch();
      return;
    }
    if ((this.method || 'get').toLowerCase() === 'post') {
      showOfflineNotice();
      return;
    }
    Reflect.apply(nativeSubmit, this, []);
  };

  function replaceMicroBrandColors(value) {
    let result = value;
    MICRO_BRAND_PALETTE.forEach((replacement, original) => {
      result = result.replace(new RegExp(original, 'gi'), replacement);
    });
    return result;
  }

  function applyMicroBrandPalette() {
    document.querySelectorAll('[style]').forEach((element) => {
      const current = element.getAttribute('style') || '';
      const updated = replaceMicroBrandColors(current);
      if (updated !== current) element.setAttribute('style', updated);
    });

    document.querySelectorAll('style').forEach((style) => {
      const current = style.textContent || '';
      const updated = replaceMicroBrandColors(current);
      if (updated !== current) style.textContent = updated;
    });
  }

  function installMicroBrandStyles() {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', '#403936');

    const style = document.createElement('style');
    style.id = 'spatial-micro-brand-styles';
    style.textContent = `
      :root {
        --spatial-charcoal: #403936;
        --spatial-charcoal-deep: #292321;
        --spatial-champagne: #caa86e;
        --spatial-champagne-light: #e1c58e;
        --spatial-ivory: #f5f0e9;
      }

      html,
      body {
        background-color: var(--spatial-charcoal) !important;
      }

      #mens,
      #sear,
      .spatialCart,
      #cooksnows,
      .layout2,
      .layshow2 {
        background-color: var(--spatial-charcoal) !important;
      }

      #pcmnu,
      #showlangm,
      #showcurrm,
      #liveResults {
        background-color: var(--spatial-charcoal-deep) !important;
      }

      .drk2 {
        background-image: linear-gradient(to bottom, rgba(41, 35, 33, 0.98) 10%, transparent 100%) !important;
      }

      .drk22 {
        background-image: linear-gradient(to bottom, rgba(32, 27, 25, 0.94) 30%, transparent 98%) !important;
      }

      .smallbadaboom {
        background: var(--spatial-charcoal) !important;
        border-top: 1px solid rgba(225, 197, 142, 0.22);
      }

      .spatial-footer-intro {
        width: min(680px, calc(100% - 40px));
        margin: 0 auto 30px;
        color: rgba(255, 255, 255, 0.82);
        font: 400 18px/1.65 Doloman, Montserrat, Arial, sans-serif;
        letter-spacing: 0.015em;
      }

      a:hover,
      a:focus-visible {
        color: var(--spatial-champagne-light);
      }

      input[type="text"]:focus,
      input[type="tel"]:focus,
      input[type="email"]:focus,
      input[type="password"]:focus,
      select:focus,
      textarea:focus {
        border-color: var(--spatial-champagne) !important;
      }

      a.callback-bt3,
      .callback-bt.callback-bt2,
      .callback-bt.callbb {
        display: none !important;
      }

      #spatial-contact-hub {
        position: fixed;
        right: clamp(18px, 3vw, 42px);
        bottom: clamp(18px, 3vw, 34px);
        z-index: 10020;
        font-family: Montserrat, Arial, sans-serif;
        transition: bottom 0.25s ease;
      }

      #spatial-contact-hub.spatial-contact-hub--cookies-visible {
        bottom: 118px;
      }

      .spatial-contact-trigger {
        min-width: 152px;
        height: 54px;
        padding: 0 19px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 1px solid rgba(202, 168, 110, 0.82);
        border-radius: 999px;
        background: rgba(64, 57, 54, 0.97);
        color: #fff;
        box-shadow: 0 12px 34px rgba(0, 0, 0, 0.32);
        cursor: pointer;
        font: 500 13px/1 Montserrat, Arial, sans-serif;
        letter-spacing: 0.04em;
        transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
      }

      .spatial-contact-trigger:hover,
      .spatial-contact-trigger:focus-visible,
      #spatial-contact-hub.is-open .spatial-contact-trigger {
        transform: translateY(-2px);
        border-color: var(--spatial-champagne-light);
        background: var(--spatial-charcoal-deep);
        color: #fff;
        outline: none;
      }

      .spatial-contact-trigger i {
        color: var(--spatial-champagne-light);
        font-size: 18px;
      }

      .spatial-contact-menu {
        position: absolute;
        right: 0;
        bottom: calc(100% + 12px);
        width: min(286px, calc(100vw - 36px));
        padding: 10px;
        border: 1px solid rgba(64, 57, 54, 0.14);
        border-radius: 16px;
        background: var(--spatial-ivory);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.34);
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px) scale(0.98);
        transform-origin: right bottom;
        pointer-events: none;
        transition: opacity 0.18s ease, visibility 0.18s ease, transform 0.18s ease;
      }

      #spatial-contact-hub.is-open .spatial-contact-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .spatial-contact-title {
        padding: 8px 10px 10px;
        color: #756a64;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .spatial-contact-option {
        display: grid;
        grid-template-columns: 42px 1fr;
        gap: 11px;
        align-items: center;
        min-height: 58px;
        padding: 8px 10px;
        border-radius: 11px;
        color: var(--spatial-charcoal) !important;
        text-decoration: none;
        transition: background-color 0.18s ease, transform 0.18s ease;
      }

      .spatial-contact-option:hover,
      .spatial-contact-option:focus-visible {
        background: #eee7dc;
        color: var(--spatial-charcoal-deep) !important;
        transform: translateX(2px);
        outline: none;
      }

      .spatial-contact-option-icon {
        width: 42px;
        height: 42px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: #fff;
        font-size: 21px;
      }

      .spatial-contact-option-icon.whatsapp { background: #268f55; }
      .spatial-contact-option-icon.telegram { background: #2f88b7; }
      .spatial-contact-option-icon.max { background: #6550a4; }
      .spatial-contact-option-icon.max img { width: 27px; height: 27px; border-radius: 50%; }

      .spatial-contact-option strong,
      .spatial-contact-option small {
        display: block;
      }

      .spatial-contact-option strong {
        font-size: 14px;
        font-weight: 600;
      }

      .spatial-contact-option small {
        margin-top: 4px;
        color: #80756f;
        font-size: 11px;
        line-height: 1.35;
      }

      .mobo a:has(img[src*="spatial.su.svg"]) img {
        width: 110px !important;
        height: 20px;
        object-fit: cover;
        object-position: top;
      }

      .mobo a:has(img[src*="spatial.su.svg"])::after {
        content: 'свет как искусство';
        display: block;
        width: 110px;
        margin-top: 2px;
        color: rgba(255, 255, 255, 0.76);
        font: 500 7px/1.15 Montserrat, Arial, sans-serif;
        letter-spacing: 0.13em;
        text-align: center;
        text-transform: uppercase;
      }

      @media (max-width: 600px) {
        #spatial-contact-hub.spatial-contact-hub--cookies-visible { bottom: 140px; }

        .spatial-contact-trigger {
          min-width: 54px;
          width: 54px;
          padding: 0;
        }

        .spatial-contact-trigger span { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        #spatial-contact-hub,
        .spatial-contact-trigger,
        .spatial-contact-menu,
        .spatial-contact-option {
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyMicroBrandText() {
    if (MICRO_BRAND_TEXT.has(document.title)) {
      document.title = MICRO_BRAND_TEXT.get(document.title);
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, noscript, textarea')) continue;
      const current = node.nodeValue || '';
      const trimmed = current.trim();
      const replacement = MICRO_BRAND_TEXT.get(trimmed);
      if (!replacement) continue;
      node.nodeValue = current.replace(trimmed, replacement);
    }
  }

  function enhanceFooter() {
    const footer = document.querySelector('.smallbadaboom');
    if (!footer || footer.querySelector('.spatial-footer-intro')) return;

    const intro = document.createElement('div');
    intro.className = 'spatial-footer-intro';
    intro.textContent =
      'SPATIAL — авторский свет для частных и общественных интерьеров. Проектируем, изготавливаем и персонализируем светильники в собственной мастерской.';
    footer.prepend(intro);
  }

  function initContactHub() {
    if (document.getElementById('spatial-contact-hub')) return;

    const hub = document.createElement('div');
    hub.id = 'spatial-contact-hub';
    hub.innerHTML = `
      <div class="spatial-contact-menu" id="spatial-contact-menu" role="menu" aria-hidden="true">
        <div class="spatial-contact-title">Выберите мессенджер</div>
        <a class="spatial-contact-option" href="https://api.whatsapp.com/send?phone=79160055407" target="_blank" rel="noopener nofollow" role="menuitem">
          <span class="spatial-contact-option-icon whatsapp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></span>
          <span><strong>WhatsApp</strong><small>Быстрый вопрос менеджеру</small></span>
        </a>
        <a class="spatial-contact-option" href="https://t.me/+79160055407" target="_blank" rel="noopener nofollow" role="menuitem">
          <span class="spatial-contact-option-icon telegram"><i class="fa-brands fa-telegram" aria-hidden="true"></i></span>
          <span><strong>Telegram</strong><small>Обсудить проект в чате</small></span>
        </a>
        <a class="spatial-contact-option" href="https://max.ru/u/f9LHodD0cOKGcW3T_kZSubTOT54_X9Hmkwg1WDJCWlp--yc7D1dqydu40Og" target="_blank" rel="noopener nofollow" role="menuitem">
          <span class="spatial-contact-option-icon max"><img src="/spatial-copy-demo/i/max.png" alt=""></span>
          <span><strong>MAX</strong><small>Связаться через MAX</small></span>
        </a>
      </div>
      <button class="spatial-contact-trigger" type="button" aria-controls="spatial-contact-menu" aria-expanded="false" aria-label="Выбрать мессенджер">
        <i class="fa-solid fa-comment-dots" aria-hidden="true"></i>
        <span>Связаться</span>
      </button>
    `;
    document.body.appendChild(hub);

    const trigger = hub.querySelector('.spatial-contact-trigger');
    const menu = hub.querySelector('.spatial-contact-menu');
    const setOpen = (open) => {
      hub.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
    };

    trigger.addEventListener('click', () => setOpen(!hub.classList.contains('is-open')));
    document.addEventListener('click', (event) => {
      if (!hub.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });

    const cookieNotice = document.getElementById('cooksnows');
    if (cookieNotice) {
      const syncCookieOffset = () => {
        const cookieStyle = window.getComputedStyle(cookieNotice);
        const isVisible =
          cookieStyle.display !== 'none' &&
          cookieStyle.visibility !== 'hidden' &&
          Number(cookieStyle.opacity || 1) > 0 &&
          cookieNotice.getBoundingClientRect().height > 0;
        hub.classList.toggle('spatial-contact-hub--cookies-visible', isVisible);
      };
      syncCookieOffset();
      new MutationObserver(syncCookieOffset).observe(cookieNotice, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    applyMicroBrandPalette();
    installMicroBrandStyles();
    applyMicroBrandText();
    enhanceFooter();
    initContactHub();
  });
})();
