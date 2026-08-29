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
    } catch (_error) {
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

  const nativeSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function () {
    if (this.id === 'fsearch') {
      if (typeof window.runSearch === 'function') window.runSearch();
      return;
    }
    if ((this.method || 'get').toLowerCase() === 'post') {
      showOfflineNotice();
      return;
    }
    nativeSubmit.call(this);
  };

  document.addEventListener('DOMContentLoaded', renderCart);
})();
