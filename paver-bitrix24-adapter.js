(function () {
  'use strict';

  var VERSION = 'paver-bitrix24-adapter-20260615-2-ui-copy';
  if (window.__PaverBitrix24AdapterLoaded === VERSION) return;
  window.__PaverBitrix24AdapterLoaded = VERSION;

  var defaults = {
    enabled: true,
    rootId: 'paverConf2026',
    formId: 10,
    formCode: 'inline/10/6me0os',
    loaderUrl: 'https://cdn-ru.bitrix24.ru/b10322535/crm/form/loader_10.js',
    useOwnModal: true,
    hideCalculatorLeadForm: true,
    buttonText: 'Отправить',
    consentPrefix: 'Я даю согласие на обработку персональных данных в соответствии с ',
    afterText: 'Мы свяжемся с вами для уточнения заказа.',
    source: 'Калькулятор на сайте Стройторг',
    privacyPolicyUrl: 'https://st-ru.com/policy/_1.0.6_index.php',
    privacyPolicyText: 'политикой конфиденциальности',
    catalogUrl: 'https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/price_catalog.json',
    markers: {
      orderText: 'paver_order_text',
      orderJson: 'paver_order_json',
      total: 'paver_total',
      discount: 'paver_discount',
      pallets: 'paver_pallets',
      weight: 'paver_weight',
      priceVersion: 'paver_price_version',
      pageUrl: 'paver_page_url',
      source: 'paver_source',
      logistics: 'paver_logistics'
    }
  };

  var userConfig = window.PAVER_BITRIX24_CONFIG || {};
  var config = Object.assign({}, defaults, userConfig);
  config.markers = Object.assign({}, defaults.markers, userConfig.markers || {});
  if (config.enabled === false) return;

  var state = {
    root: null,
    modal: null,
    formHost: null,
    bitrixForms: [],
    latestPayload: null,
    priceVersion: window.__paverConfiguratorEmbedVersion || '',
    observer: null,
    formInjected: false,
    initialized: false
  };

  function finiteNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function round(value, precision) {
    var factor = Math.pow(10, precision || 0);
    return Math.round((finiteNumber(value) + Number.EPSILON) * factor) / factor;
  }

  function readHidden(name) {
    var root = state.root || document;
    var field = root.querySelector('[name="' + name + '"]') || document.querySelector('[name="' + name + '"]');
    return field && typeof field.value === 'string' ? field.value : '';
  }

  function makeFallbackText(positions, totals) {
    if (!positions.length) return '';
    var lines = positions.map(function (position, index) {
      var qtyUnit = position.qty_unit === 'lm' ? 'пог. м' : 'м²';
      return [
        'Позиция ' + (index + 1) + ': ' + (position.form_name || '—'),
        (position.tech_name || '—') + ' · ' + (position.color_name || '—') + (position.thickness_label ? ' · ' + position.thickness_label : ''),
        'Количество: ' + finiteNumber(position.qty_value) + ' ' + qtyUnit,
        'Поддонов: ' + finiteNumber(position.pallets),
        'Вес: ' + finiteNumber(position.weight_kg || position.ship_weight_kg) + ' кг',
        'Итого: ' + finiteNumber(position.grand_total) + ' руб.'
      ].join('\n');
    });
    lines.push('ИТОГО ПО КОРЗИНЕ: ' + totals.total + ' руб.');
    return lines.join('\n\n────────\n\n');
  }

  function buildPayload() {
    try {
      if (typeof window.cartUpdateHiddenFields === 'function') {
        window.cartUpdateHiddenFields();
      }
    } catch (error) {
      console.warn('[Paver Bitrix24] hidden fields sync failed', error);
    }

    var cart = window.__pcCart && Array.isArray(window.__pcCart.positions)
      ? window.__pcCart
      : { positions: [] };
    var positions = cart.positions.slice();

    var totals = positions.reduce(function (acc, position) {
      acc.total += finiteNumber(position && position.grand_total);
      acc.discount += finiteNumber(position && position.discount_savings);
      acc.pallets += finiteNumber(position && position.pallets);
      acc.weight += finiteNumber(position && (position.weight_kg || position.ship_weight_kg));
      return acc;
    }, { total: 0, discount: 0, pallets: 0, weight: 0 });

    totals.total = round(totals.total, 2);
    totals.discount = round(totals.discount, 2);
    totals.pallets = round(totals.pallets, 2);
    totals.weight = round(totals.weight, 2);

    var orderText = readHidden('order_positions_text') || makeFallbackText(positions, totals);
    var orderObject = {
      schema: 'paver-order-v1',
      generatedAt: new Date().toISOString(),
      pageUrl: window.location.href,
      source: config.source,
      priceVersion: state.priceVersion || window.__paverConfiguratorEmbedVersion || '',
      positions: positions,
      totals: totals,
      logistics: { enabled: false, text: 'Отключена' }
    };

    var orderJson = '{}';
    try { orderJson = JSON.stringify(orderObject); } catch (error) {}

    return {
      orderText: orderText,
      orderJson: orderJson,
      total: String(totals.total),
      discount: String(totals.discount),
      pallets: String(totals.pallets),
      weight: String(totals.weight),
      priceVersion: String(state.priceVersion || window.__paverConfiguratorEmbedVersion || 'Не указано'),
      pageUrl: window.location.href,
      source: config.source,
      logistics: 'Отключена',
      positionsCount: positions.length
    };
  }

  function applyPayloadToForm(form, payload) {
    if (!form || typeof form.setProperty !== 'function' || !payload) return;
    var markers = config.markers;
    var values = {
      orderText: payload.orderText,
      orderJson: payload.orderJson,
      total: payload.total,
      discount: payload.discount,
      pallets: payload.pallets,
      weight: payload.weight,
      priceVersion: payload.priceVersion,
      pageUrl: payload.pageUrl,
      source: payload.source,
      logistics: payload.logistics
    };

    Object.keys(values).forEach(function (key) {
      var marker = markers[key];
      if (!marker) return;
      try { form.setProperty(marker, String(values[key] == null ? '' : values[key])); }
      catch (error) { console.warn('[Paver Bitrix24] setProperty failed:', marker, error); }
    });
  }

  function syncAllForms() {
    state.latestPayload = buildPayload();
    state.bitrixForms.forEach(function (form) {
      applyPayloadToForm(form, state.latestPayload);
    });
    window.dispatchEvent(new CustomEvent('paver:order-change', { detail: state.latestPayload }));
    return state.latestPayload;
  }

  function formMatches(form) {
    if (!form) return false;
    var id = form.identification && form.identification.id;
    return !config.formId || String(id) === String(config.formId);
  }

  window.addEventListener('b24:form:init', function (event) {
    var form = event && event.detail && event.detail.object;
    if (!form || !formMatches(form)) return;
    if (state.bitrixForms.indexOf(form) === -1) state.bitrixForms.push(form);
    applyPayloadToForm(form, state.latestPayload || syncAllForms());
  });

  function updatePrivacyLink() {
    if (!state.root) return;
    var link = state.root.querySelector('.pcForm__consent a');
    if (!link) return;
    link.href = config.privacyPolicyUrl;
    link.textContent = config.privacyPolicyText;
  }

  function addStyles() {
    if (document.getElementById('paverBitrix24AdapterStyles')) return;
    var style = document.createElement('style');
    style.id = 'paverBitrix24AdapterStyles';
    style.textContent = [
      '.pcB24Launch{margin-top:14px;padding:14px;border:1px solid rgba(0,0,0,.10);border-radius:14px;background:#fff;}',
      '.pcB24Launch__consent{font-size:12.5px;line-height:1.45;color:rgba(0,0,0,.68);margin-bottom:10px;}',
      '.pcB24Launch__consent a{color:inherit;text-decoration:underline;text-underline-offset:2px;}',
      '.pcB24Launch__after{font-size:12.5px;line-height:1.4;color:rgba(0,0,0,.62);margin-top:9px;text-align:center;}',
      '.pcB24Launch__button{display:flex;width:100%;min-height:44px;align-items:center;justify-content:center;border:0;border-radius:12px;background:#111;color:#fff;font:900 14px/1.2 Roboto,Arial,sans-serif;cursor:pointer;padding:11px 14px;text-align:center;}',
      '.pcB24Launch__button:disabled{opacity:.55;cursor:not-allowed;}',
      '.pcB24Modal{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.62);backdrop-filter:blur(5px);}',
      '.pcB24Modal.is-open{display:flex;}',
      '.pcB24Modal__dialog{position:relative;width:min(680px,100%);max-height:calc(100vh - 36px);overflow:auto;border-radius:18px;background:#fff;box-shadow:0 24px 80px rgba(0,0,0,.28);padding:18px;}',
      '.pcB24Modal__close{position:sticky;top:0;z-index:3;margin-left:auto;display:grid;place-items:center;width:38px;height:38px;border:0;border-radius:50%;background:#f1f5f9;color:#111;font-size:24px;line-height:1;cursor:pointer;}',
      '.pcB24Modal__heading{margin:-30px 48px 12px 0;font:900 20px/1.2 Roboto,Arial,sans-serif;color:#111;}',
      '.pcB24Modal__form{min-height:280px;}',
      'body.pcB24ModalOpen{overflow:hidden;}',
      '@media(max-width:520px){.pcB24Modal{padding:0;align-items:flex-end}.pcB24Modal__dialog{width:100%;max-height:94vh;border-radius:18px 18px 0 0;padding:14px}.pcB24Modal__heading{font-size:18px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function createLaunchBlock() {
    if (!state.root || document.getElementById('paverBitrix24Launch')) return;
    var cart = state.root.querySelector('[data-role="cartBlock"]');
    if (!cart) return;

    var block = document.createElement('div');
    block.id = 'paverBitrix24Launch';
    block.className = 'pcB24Launch';
    block.innerHTML = '<div class="pcB24Launch__consent">' +
      config.consentPrefix +
      '<a href="' + config.privacyPolicyUrl + '" target="_blank" rel="noopener noreferrer">' +
      config.privacyPolicyText +
      '</a></div>' +
      '<button type="button" class="pcB24Launch__button">' + config.buttonText + '</button>' +
      '<div class="pcB24Launch__after">' + config.afterText + '</div>';

    cart.insertAdjacentElement('afterend', block);
    block.querySelector('button').addEventListener('click', function () {
      var payload = syncAllForms();
      if (!payload.positionsCount) {
        var empty = state.root.querySelector('[data-role="cartEmpty"]');
        if (empty) empty.style.display = '';
        alert('Добавьте хотя бы одну позицию в корзину перед отправкой расчёта.');
        return;
      }
      if (config.useOwnModal) openModal();
    });
  }

  function hideInternalLeadForm() {
    if (!config.hideCalculatorLeadForm || !state.root) return;
    var form = state.root.querySelector('#paverLeadForm');
    if (form) form.style.display = 'none';
    var title = state.root.querySelector('.pcCalc__formTitle');
    if (title) title.style.display = 'none';
  }

  function createModal() {
    if (!config.useOwnModal || state.modal) return;
    var modal = document.createElement('div');
    modal.className = 'pcB24Modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = '<div class="pcB24Modal__dialog" role="dialog" aria-modal="true" aria-label="Отправить расчёт">' +
      '<button type="button" class="pcB24Modal__close" aria-label="Закрыть">×</button>' +
      '<div class="pcB24Modal__heading">Отправить расчёт</div>' +
      '<div class="pcB24Modal__form"></div>' +
      '</div>';
    document.body.appendChild(modal);
    state.modal = modal;
    state.formHost = modal.querySelector('.pcB24Modal__form');

    modal.querySelector('.pcB24Modal__close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  function injectBitrixForm() {
    if (!state.formHost || state.formInjected) return;
    state.formInjected = true;
    var script = document.createElement('script');
    script.setAttribute('data-b24-form', config.formCode);
    script.setAttribute('data-skip-moving', 'true');
    script.text = "(function(w,d,u){var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/180000|0);var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);})(window,document," + JSON.stringify(config.loaderUrl) + ");";
    state.formHost.appendChild(script);
  }

  function openModal() {
    createModal();
    syncAllForms();
    state.modal.classList.add('is-open');
    state.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('pcB24ModalOpen');
    injectBitrixForm();
  }

  function closeModal() {
    if (!state.modal) return;
    state.modal.classList.remove('is-open');
    state.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('pcB24ModalOpen');
  }

  function watchCart() {
    if (!state.root || state.observer) return;
    var cart = state.root.querySelector('[data-role="cartBlock"]');
    if (!cart || !window.MutationObserver) return;
    var timer = null;
    state.observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(syncAllForms, 80);
    });
    state.observer.observe(cart, { childList: true, subtree: true, characterData: true });
  }

  function patchCartSync() {
    var attempts = 0;
    var interval = setInterval(function () {
      attempts += 1;
      if (typeof window.cartUpdateHiddenFields === 'function' && !window.cartUpdateHiddenFields.__paverB24Wrapped) {
        var original = window.cartUpdateHiddenFields;
        var wrapped = function () {
          var result = original.apply(this, arguments);
          setTimeout(syncAllForms, 0);
          return result;
        };
        wrapped.__paverB24Wrapped = true;
        window.cartUpdateHiddenFields = wrapped;
        clearInterval(interval);
      }
      if (attempts > 100) clearInterval(interval);
    }, 100);
  }

  function loadPriceVersion() {
    if (!config.catalogUrl || typeof fetch !== 'function') return;
    fetch(config.catalogUrl, { cache: 'no-store' })
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (catalog) {
        var effective = catalog && catalog.meta && catalog.meta.effective_from;
        if (effective) state.priceVersion = effective;
        syncAllForms();
      })
      .catch(function () {});
  }

  function init() {
    if (state.initialized) return;
    state.root = document.getElementById(config.rootId);
    if (!state.root) return;
    state.initialized = true;

    addStyles();
    updatePrivacyLink();
    hideInternalLeadForm();
    createLaunchBlock();
    createModal();
    watchCart();
    patchCartSync();
    loadPriceVersion();
    syncAllForms();
  }

  var waitAttempts = 0;
  var waitTimer = setInterval(function () {
    waitAttempts += 1;
    if (document.getElementById(config.rootId)) {
      clearInterval(waitTimer);
      init();
    } else if (waitAttempts > 150) {
      clearInterval(waitTimer);
      console.error('[Paver Bitrix24] calculator root not found:', config.rootId);
    }
  }, 100);

  window.PaverBitrix24Adapter = {
    version: VERSION,
    sync: syncAllForms,
    open: openModal,
    close: closeModal,
    diagnose: function () {
      return {
        version: VERSION,
        root: !!state.root,
        formId: config.formId,
        initializedForms: state.bitrixForms.length,
        modalReady: !!state.modal,
        formInjected: state.formInjected,
        payload: state.latestPayload || buildPayload()
      };
    }
  };
})();
