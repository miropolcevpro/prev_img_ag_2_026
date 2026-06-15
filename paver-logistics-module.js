(function(){
  'use strict';

  var VERSION = 'paver-logistics-single-shadow-autolayout-20260611-disabled-ready-1';
  var MODULE_KEY = '__PAVER_LOGISTICS_SINGLE_MODULE__';
  var ROOT_ID = (window.PAVER_LOGISTICS_CONFIG && window.PAVER_LOGISTICS_CONFIG.mountRootId) || 'paverConf2026';

  // Полная очистка старых логистических слоёв, чтобы не смешивались версии.
  [
    '__PAVER_LOGISTICS_CLEAN__',
    '__PAVER_LOGISTICS_ADDON__',
    '__PAVER_LOGISTICS_ABOVE_CART_V2__',
    '__PAVER_LOGISTICS_SINGLE_MODULE__',
    '__PAVER_LOGISTICS_PRO__'
  ].forEach(function(key){
    if (key !== MODULE_KEY && window[key] && typeof window[key].destroy === 'function') {
      try { window[key].destroy(); } catch (_) {}
    }
  });

  if (window[MODULE_KEY] && typeof window[MODULE_KEY].destroy === 'function') {
    try { window[MODULE_KEY].destroy(); } catch (_) {}
  }

  // Безопасный флаг включения. По умолчанию модуль включён для обратной совместимости.
  // Для временного отключения перед подключением файла задайте:
  // window.PAVER_LOGISTICS_CONFIG = { enabled: false };
  var MODULE_ENABLED = !(window.PAVER_LOGISTICS_CONFIG && window.PAVER_LOGISTICS_CONFIG.enabled === false);

  function cleanupDisabledState(){
    var selectors = [
      '#paver-logistics-single-host',
      '[data-role="paverLogisticsAddon"]',
      '.paverLogisticsAddon',
      '[data-role="paverLogisticsClean"]',
      '[data-role="paverLogisticsAboveCartV2"]',
      '[data-role="paverLogisticsSingle"]',
      '[data-role="paverLogisticsSingleHost"]'
    ].join(',');
    document.querySelectorAll(selectors).forEach(function(el){
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    var style = document.getElementById('paverLogisticsGlobalGuardStyle');
    if (style && style.parentNode) style.parentNode.removeChild(style);
  }

  if (!MODULE_ENABLED) {
    cleanupDisabledState();
    var disabledApi = {
      version: VERSION,
      enabled: false,
      destroy: cleanupDisabledState,
      render: function(){ cleanupDisabledState(); },
      diagnose: function(){
        return {
          version: VERSION,
          enabled: false,
          host: false,
          message: 'Логистический модуль безопасно отключён через PAVER_LOGISTICS_CONFIG.enabled=false'
        };
      }
    };
    window[MODULE_KEY] = disabledApi;
    window.PaverLogisticsSingle = disabledApi;
    window.PaverLogisticsClean = disabledApi;
    window.PaverLogisticsPro = disabledApi;
    return;
  }

  var RULES = {
    version: 'inline-transport-rules-20260611-shadow-1',
    vehicles: [
      { id:'manipulator_5t',  category:'manipulator', name:'Манипулятор г/п до 5 т.',  short_name:'Манипулятор 5 т',  payload_kg:5000,  tile_pallet_capacity:6,  curb_pallet_capacity:6,  enabled:true },
      { id:'manipulator_11t', category:'manipulator', name:'Манипулятор г/п до 11 т.', short_name:'Манипулятор 11 т', payload_kg:11000, tile_pallet_capacity:8,  curb_pallet_capacity:8,  enabled:true },
      { id:'manipulator_15t', category:'manipulator', name:'Манипулятор г/п до 15 т.', short_name:'Манипулятор 15 т', payload_kg:15000, tile_pallet_capacity:12, curb_pallet_capacity:12, enabled:true },
      { id:'manipulator_20t', category:'manipulator', name:'Манипулятор г/п до 20 т.', short_name:'Манипулятор 20 т', payload_kg:20000, tile_pallet_capacity:14, curb_pallet_capacity:12, enabled:true },
      { id:'flatbed_21t',     category:'flatbed',     name:'Бортовой длинномер г/п до 21 т.', short_name:'Длинномер 21 т', payload_kg:21500, tile_pallet_capacity:20, curb_pallet_capacity:20, enabled:true },
      { id:'flatbed_22t',     category:'flatbed',     name:'Бортовой длинномер г/п до 22 т.', short_name:'Длинномер 22 т', payload_kg:22000, tile_pallet_capacity:20, curb_pallet_capacity:20, enabled:true },
      { id:'flatbed_25t',     category:'flatbed',     name:'Бортовой длинномер г/п до 25 т.', short_name:'Длинномер 25 т', payload_kg:25000, tile_pallet_capacity:20, curb_pallet_capacity:20, enabled:true }
    ]
  };

  var panelOpen = false;
  var detailsOpen = false;
  var selectedVehicleId = loadSession('paver_logistics_vehicle_id') || '';
  var host = null;
  var shadow = null;
  var observer = null;
  var renderTimer = 0;
  var pollTimer = 0;
  var destroyed = false;
  var lastResult = null;
  var lastSignature = '';

  function loadSession(key){ try { return sessionStorage.getItem(key) || ''; } catch (_) { return ''; } }
  function saveSession(key, val){ try { sessionStorage.setItem(key, val || ''); } catch (_) {} }
  function root(){ return document.getElementById(ROOT_ID) || document.querySelector('[data-paver-root]') || document.querySelector('.pcWrap'); }
  function scope(){ return root() || document; }
  function q(sel){ return scope().querySelector(sel); }
  function qa(sel){ return Array.prototype.slice.call(scope().querySelectorAll(sel)); }

  function num(v){
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v == null) return 0;
    var s = String(v).replace(/\u00a0/g, ' ').replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  function fmt(n, decimals){ return num(n).toLocaleString('ru-RU', { maximumFractionDigits: decimals == null ? 1 : decimals, minimumFractionDigits: 0 }); }
  function fmtInt(n){ return fmt(n, 0); }
  function fmtKg(n){ return fmtInt(n) + ' кг'; }
  function fmtPct(v){ return fmt(num(v) * 100, 0) + '%'; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  function addGlobalGuardStyle(){
    var old = document.getElementById('paverLogisticsGlobalGuardStyle');
    if (old) old.parentNode.removeChild(old);
    var style = document.createElement('style');
    style.id = 'paverLogisticsGlobalGuardStyle';
    style.textContent = [
      '[data-role="paverLogisticsAddon"],.paverLogisticsAddon,[data-role="paverLogisticsClean"],[data-role="paverLogisticsAboveCartV2"],[data-role="paverLogisticsSingle"]{display:none!important}',
      '#paver-logistics-single-host{display:block!important;clear:both;width:100%;max-width:100%;box-sizing:border-box;position:relative;z-index:1;margin:0 0 16px 0!important;padding:0!important}',
      '.pcCart #paver-logistics-single-host{display:none!important}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function removeLegacyNodes(){
    var selectors = [
      '[data-role="paverLogisticsAddon"]',
      '.paverLogisticsAddon',
      '[data-role="paverLogisticsClean"]',
      '[data-role="paverLogisticsAboveCartV2"]',
      '[data-role="paverLogisticsSingle"]'
    ].join(',');
    document.querySelectorAll(selectors).forEach(function(el){
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function findCart(){
    var r = root();
    if (!r) return null;
    return r.querySelector('.pcCart[data-role="cartBlock"], [data-role="cartBlock"], .pcCart');
  }

  function ensureHost(){
    var r = root();
    if (!r) return null;
    removeLegacyNodes();

    if (!host || !document.documentElement.contains(host)) {
      host = document.getElementById('paver-logistics-single-host') || document.createElement('div');
      host.id = 'paver-logistics-single-host';
      host.setAttribute('data-version', VERSION);
      host.setAttribute('data-role', 'paverLogisticsSingleHost');
      if (!host.shadowRoot) shadow = host.attachShadow({ mode:'open' }); else shadow = host.shadowRoot;
    }

    var cart = findCart();
    if (cart && cart.parentNode) {
      // Если host случайно оказался внутри корзины — немедленно выносим его наружу.
      if (cart.contains(host)) cart.parentNode.insertBefore(host, cart);
      if (host.parentNode !== cart.parentNode || host.nextElementSibling !== cart) {
        cart.parentNode.insertBefore(host, cart);
      }
      return host;
    }

    var right = r.querySelector('.pcLayout__right') || r;
    if (host.parentNode !== right) right.appendChild(host);
    return host;
  }

  function ensureHidden(name){
    var form = q('form') || document.querySelector('form');
    if (!form) return null;
    var el = form.querySelector('input[name="' + name + '"]');
    if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = name; form.appendChild(el); }
    return el;
  }
  function setHidden(name, value){ var el = ensureHidden(name); if (el) el.value = value == null ? '' : String(value); }

  function normalizePosition(p){
    if (!p || typeof p !== 'object') return null;
    var blob = [p.type, p.product_type, p.form_name, p.form, p.name, p.title, p.thickness_label, p.curb_label, p.curb_size, p.qty_unit].join(' ').toLowerCase();
    var type = (p.type === 'curb' || /борд|curb|бр\s*\d|пог/.test(blob)) ? 'curb' : 'tile';
    var pallets = num(p.pallets || p.pallet_count || p.pallets_count);
    var per = num(p.per_pallet_qty || p.m2_per_pallet || p.curb_lm_per_pallet);
    var qty = num(p.ship_qty || p.qty_value || p.area_m2 || p.qty);
    if (!(pallets > 0) && per > 0 && qty > 0) pallets = Math.ceil(qty / per);
    var weight = num(p.ship_weight_kg || p.weight_kg || p.total_weight_kg);
    var palletWeight = num(p.pallet_weight_kg || p.weight_per_pallet_kg);
    if (!(weight > 0) && pallets > 0 && palletWeight > 0) weight = pallets * palletWeight;
    if (!(pallets > 0)) return null;
    return { type:type, pallets:pallets, weight_kg:weight, raw:p };
  }

  function textOf(role){ var el = q('[data-role="' + role + '"]'); return el ? (el.textContent || el.value || '') : ''; }

  function getCurrentFromDom(){
    var pallets = num(textOf('pallets'));
    var weight = num(textOf('shipW'));
    if (!(pallets > 0)) return null;
    var blob = [textOf('shipUnitLabel'), textOf('calcFormName'), textOf('curbLmPerPallet'), textOf('thLabel')].join(' ').toLowerCase();
    var type = /борд|curb|пог/.test(blob) ? 'curb' : 'tile';
    return { type:type, pallets:pallets, weight_kg:weight, raw:{ source:'dom_current' } };
  }

  function getPositions(){
    var cart = window.__pcCart && Array.isArray(window.__pcCart.positions) ? window.__pcCart.positions : [];
    var positions = [];
    cart.forEach(function(p){ var n = normalizePosition(p); if (n) positions.push(n); });
    if (positions.length) return { source:'cart', positions:positions };
    var current = getCurrentFromDom();
    if (current) return { source:'current', positions:[current] };
    return { source:'empty', positions:[] };
  }

  function summarize(positions){
    var s = { tile_pallets:0, curb_pallets:0, total_pallets:0, total_weight_kg:0 };
    positions.forEach(function(p){
      var pallets = num(p.pallets), weight = num(p.weight_kg);
      if (p.type === 'curb') s.curb_pallets += pallets; else s.tile_pallets += pallets;
      s.total_pallets += pallets; s.total_weight_kg += weight;
    });
    return s;
  }

  function vehicleOption(v, summary){
    var tileCap = Math.max(1, num(v.tile_pallet_capacity));
    var curbCap = Math.max(1, num(v.curb_pallet_capacity || v.tile_pallet_capacity));
    var palletRatio = (summary.tile_pallets / tileCap) + (summary.curb_pallets / curbCap);
    var tripsByPallets = Math.max(1, Math.ceil(palletRatio || 0));
    var payload = Math.max(1, num(v.payload_kg));
    var tripsByWeight = Math.max(1, Math.ceil((summary.total_weight_kg || 0) / payload));
    var trips = Math.max(tripsByPallets, tripsByWeight);
    return { vehicle:v, trips:trips, trips_by_pallets:tripsByPallets, trips_by_weight:tripsByWeight, pallet_utilization: trips ? palletRatio / trips : 0, weight_utilization: trips ? (summary.total_weight_kg / payload) / trips : 0, payload_kg:payload, tile_capacity_per_trip:tileCap, curb_capacity_per_trip:curbCap, limiting: tripsByWeight > tripsByPallets ? 'weight' : 'pallets' };
  }
  function categoryPriority(v){ return v.category === 'manipulator' ? 0 : 1; }

  function analyze(){
    var data = getPositions();
    var summary = summarize(data.positions);
    var options = RULES.vehicles.filter(function(v){ return v && v.enabled !== false; }).map(function(v){ return vehicleOption(v, summary); }).sort(function(a,b){
      return (a.trips - b.trips) || (categoryPriority(a.vehicle) - categoryPriority(b.vehicle)) || (a.payload_kg - b.payload_kg);
    });
    var recommended = options[0] || null;
    var selected = recommended;
    if (selectedVehicleId) options.forEach(function(o){ if (o.vehicle.id === selectedVehicleId) selected = o; });
    return { module_version:VERSION, rules_version:RULES.version, source:data.source, positions:data.positions, summary:summary, options:options, recommended:recommended, selected:selected };
  }

  function syncHidden(res){
    setHidden('order_logistics_text', '');
    setHidden('order_logistics_json', '');
    setHidden('order_logistics_vehicle', '');
    setHidden('order_logistics_trips', '');
    var s = res.summary || {}, sel = res.selected;
    if (!sel || !s.total_pallets) return;
    var text = 'Логистика: ' + (sel.vehicle.name || sel.vehicle.id) + '; рейсов: ' + sel.trips + '; поддонов всего: ' + fmtInt(s.total_pallets) + '; плитка/бордюр: ' + fmtInt(s.tile_pallets) + '/' + fmtInt(s.curb_pallets) + '; вес: ' + fmtKg(s.total_weight_kg) + '. Стоимость доставки согласует менеджер.';
    setHidden('order_logistics_text', text);
    setHidden('order_logistics_json', JSON.stringify({ summary:s, selected:sel, source:res.source, module_version:VERSION, rules_version:RULES.version }));
    setHidden('order_logistics_vehicle', sel.vehicle.id || '');
    setHidden('order_logistics_trips', sel.trips);
  }

  function css(){
    return '<style>' + [
      ':host{all:initial;display:block;box-sizing:border-box;width:100%;max-width:100%;font-family:Arial,Helvetica,sans-serif;color:#111827}',
      '*,*:before,*:after{box-sizing:border-box}',
      'button{font-family:inherit;-webkit-tap-highlight-color:transparent;touch-action:manipulation}',
      '.box{width:100%;max-width:100%;margin:0 0 16px 0;border:1px solid rgba(31,107,58,.24);border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.04);overflow:hidden}',
      '.summary{width:100%;border:0;background:linear-gradient(180deg,rgba(31,107,58,.045),rgba(255,255,255,.98));padding:18px;display:grid;grid-template-columns:minmax(0,1fr) 46px;gap:14px;align-items:center;text-align:left;cursor:pointer;color:inherit;min-height:92px}',
      '.content{min-width:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px;align-items:start}',
      '.title{font-size:22px;line-height:1.05;font-weight:950;letter-spacing:-.03em;white-space:normal;overflow-wrap:anywhere}',
      '.mode{justify-self:start;display:inline-flex;align-items:center;max-width:100%;min-height:28px;border-radius:999px;padding:0 12px;background:rgba(31,107,58,.11);color:#1f6b3a;font-size:12px;line-height:1.1;font-weight:950;white-space:normal;text-align:left}',
      '.mode.manual{background:rgba(27,116,255,.12);color:#1b74ff}',
      '.label{font-size:11px;line-height:1;text-transform:uppercase;letter-spacing:.04em;color:rgba(17,24,39,.48);font-weight:900}',
      '.value{font-size:15px;line-height:1.3;color:rgba(17,24,39,.76);font-weight:750;overflow-wrap:anywhere}',
      '.trips{font-size:15px;line-height:1.25;color:#1f6b3a;font-weight:950}',
      '.dataPill{justify-self:start;display:inline-flex;align-items:center;max-width:100%;min-height:32px;border-radius:999px;padding:7px 13px;background:rgba(31,107,58,.12);color:#1f6b3a;font-size:13px;line-height:1.1;font-weight:950;white-space:normal;text-align:left}',
      '.chev{width:46px;height:46px;min-width:46px;border-radius:999px;border:1px solid rgba(31,107,58,.24);background:#fff;display:grid;place-items:center;justify-self:center;align-self:center;color:#1f6b3a;box-shadow:0 2px 8px rgba(0,0,0,.04);padding:0}',
      '.chev:before{content:"";display:block;width:10px;height:10px;border-right:2.6px solid currentColor;border-bottom:2.6px solid currentColor;transform:rotate(45deg);margin-top:-4px}.open .chev:before{transform:rotate(225deg);margin-top:4px}',
      '.panel{display:none;border-top:1px solid rgba(17,24,39,.08);padding:16px 18px 18px;background:linear-gradient(180deg,rgba(31,107,58,.025),#fff)}.open .panel{display:block}',
      '.hint{font-size:14px;line-height:1.42;color:rgba(17,24,39,.64);margin:0 0 13px 0}.placeholder{border:1px dashed rgba(17,24,39,.16);border-radius:16px;padding:13px;color:rgba(17,24,39,.62);font-size:14px;line-height:1.4;background:#fff}',
      '.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0}.metric{padding:12px;border:1px solid rgba(17,24,39,.08);border-radius:16px;background:#fff;min-width:0}.metric span{display:block;font-size:12px;color:rgba(17,24,39,.58);line-height:1.15}.metric b{display:block;margin-top:6px;font-size:17px;line-height:1.1;font-weight:950;color:#111827}',
      '.vehicle{border:1px solid rgba(17,24,39,.08);border-radius:18px;background:#fff;padding:14px;margin-top:10px}.vehicleTop{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start}.vehicleName{font-size:17px;font-weight:950;line-height:1.2;color:#111827}.vehicleTrips{font-size:16px;font-weight:950;color:#1f6b3a;line-height:1.2;white-space:nowrap}',
      '.bars{margin-top:12px;display:grid;gap:9px}.barRow{display:grid;grid-template-columns:74px minmax(0,1fr) 48px;gap:8px;align-items:center;font-size:13px;color:rgba(17,24,39,.66)}.bar{height:9px;border-radius:999px;background:rgba(17,24,39,.09);overflow:hidden}.bar i{display:block;height:100%;max-width:100%;border-radius:999px;background:#1f6b3a}.bar.warn i{background:#b87400}',
      '.actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:13px}.btn{min-height:44px;border:1px solid rgba(17,24,39,.14);border-radius:15px;background:#fff;padding:0 14px;font-size:14px;line-height:1.1;font-weight:950;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#111827}.btn.primary{background:#1f6b3a;color:#fff;border-color:#1f6b3a}.micro{font-size:12.5px;line-height:1.38;color:rgba(17,24,39,.58);margin-top:10px}',
      '.details{display:none;margin-top:12px}.details.show{display:block}.options{display:grid;gap:8px}.option{width:100%;border:1px solid rgba(17,24,39,.1);border-radius:16px;background:#fff;text-align:left;padding:12px;cursor:pointer;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:center;color:#111827}.option.selected{border-color:rgba(31,107,58,.46);background:rgba(31,107,58,.07)}.optionName{font-size:14.5px;font-weight:950;line-height:1.2}.optionMeta{margin-top:5px;font-size:12.3px;line-height:1.3;color:rgba(17,24,39,.6)}.optionTrips{font-size:14px;font-weight:950;color:#1f6b3a;white-space:nowrap}.tag{display:inline-flex;margin-left:6px;border-radius:999px;background:rgba(31,107,58,.12);color:#1f6b3a;padding:3px 7px;font-size:10.5px;font-weight:950}',
      '@media(max-width:720px){.summary{grid-template-columns:minmax(0,1fr) 44px;padding:16px 14px;gap:12px;min-height:104px}.title{font-size:21px}.mode{font-size:11.5px;min-height:27px}.value,.trips{font-size:14.5px}.dataPill{font-size:12.5px}.chev{width:44px;height:44px;min-width:44px}.metrics{grid-template-columns:1fr}.metric{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.metric b{margin-top:0;text-align:right}.vehicleTop{grid-template-columns:1fr}.vehicleTrips{white-space:normal}.barRow{grid-template-columns:64px minmax(0,1fr) 44px}.option{grid-template-columns:1fr}.optionTrips{justify-self:start;white-space:normal}}',
      '@media(max-width:420px){.box{border-radius:18px}.summary{grid-template-columns:minmax(0,1fr) 42px;padding:15px 12px;gap:10px}.title{font-size:20px}.chev{width:42px;height:42px;min-width:42px}.panel{padding:14px 12px 16px}.mode,.dataPill{border-radius:14px}.barRow{grid-template-columns:58px minmax(0,1fr) 42px;font-size:12.5px}}'
    ].join('\n') + '</style>';
  }

  function summaryHtml(res){
    var s = res.summary || {}, sel = res.selected;
    var hasData = !!(s.total_pallets && sel);
    var manual = hasData && res.recommended && res.recommended.vehicle && sel.vehicle.id !== res.recommended.vehicle.id;
    var mode = manual ? 'Выбранный транспорт' : 'Рекомендация по транспорту';
    var vehicle = hasData ? (sel.vehicle.short_name || sel.vehicle.name || sel.vehicle.id) : 'после выбора позиции';
    var trips = hasData ? (sel.trips + ' рейс(ов)') : '—';
    var pill = hasData ? (fmtInt(s.total_pallets) + ' подд. · ' + fmtKg(s.total_weight_kg)) : 'расчёт скрыт';
    return '<button type="button" class="summary" data-action="panel" aria-expanded="' + (panelOpen ? 'true' : 'false') + '">' +
      '<span class="content">' +
        '<span class="title">Логистика</span>' +
        '<span class="mode' + (manual ? ' manual' : '') + '">' + esc(mode) + '</span>' +
        '<span class="label">Транспорт</span>' +
        '<span class="value">' + esc(vehicle) + '</span>' +
        '<span class="label">Количество рейсов</span>' +
        '<span class="trips">' + esc(trips) + '</span>' +
        '<span class="dataPill">' + esc(pill) + '</span>' +
      '</span><span class="chev" aria-hidden="true"></span></button>';
  }

  function renderEmpty(res){
    return '<div class="box' + (panelOpen ? ' open' : '') + '" data-version="' + esc(VERSION) + '">' + summaryHtml(res) +
      '<div class="panel"><div class="placeholder">Выберите позицию и площадь. Логистика не влияет на цены, скидки и товарную калькуляцию.</div></div></div>';
  }

  function sourceLabel(src){ return src === 'cart' ? 'по корзине' : 'по текущему расчёту'; }

  function renderResult(res){
    var s = res.summary, sel = res.selected, rec = res.recommended, v = sel.vehicle;
    var manual = !!(rec && rec.vehicle && rec.vehicle.id !== v.id);
    var palPct = Math.min(100, Math.round(sel.pallet_utilization * 100));
    var weightPct = Math.min(100, Math.round(sel.weight_utilization * 100));
    var optionsHtml = res.options.map(function(o){
      var ov = o.vehicle;
      var isSelected = ov.id === v.id;
      var isRecommended = rec && rec.vehicle && ov.id === rec.vehicle.id;
      return '<button type="button" class="option' + (isSelected ? ' selected' : '') + '" data-vehicle="' + esc(ov.id) + '"><span><span class="optionName">' + esc(ov.short_name || ov.name || ov.id) + (isRecommended ? '<span class="tag">рекомендовано</span>' : '') + '</span><span class="optionMeta">' + o.trips + ' рейс(ов) · поддоны ' + esc(fmtPct(o.pallet_utilization)) + ' · вес ' + esc(fmtPct(o.weight_utilization)) + ' · вместимость ' + esc(o.tile_capacity_per_trip) + '/' + esc(o.curb_capacity_per_trip) + ' подд.</span></span><span class="optionTrips">' + o.trips + ' рейс.</span></button>';
    }).join('');
    return '<div class="box' + (panelOpen ? ' open' : '') + '" data-version="' + esc(VERSION) + '">' + summaryHtml(res) +
      '<div class="panel">' +
        '<div class="hint">Расчёт ' + esc(sourceLabel(res.source)) + ': транспорт подбирается по вместимости поддонов и грузоподъёмности. Стоимость доставки согласует менеджер.</div>' +
        '<div class="metrics"><div class="metric"><span>Поддоны всего</span><b>' + fmtInt(s.total_pallets) + ' шт.</b></div><div class="metric"><span>Плитка / бордюр</span><b>' + fmtInt(s.tile_pallets) + ' / ' + fmtInt(s.curb_pallets) + '</b></div><div class="metric"><span>Вес заказа</span><b>' + fmtKg(s.total_weight_kg) + '</b></div></div>' +
        '<div class="vehicle"><div class="vehicleTop"><div class="vehicleName">' + esc(v.name || v.id) + '</div><div class="vehicleTrips">' + sel.trips + ' рейс(ов)</div></div><div class="bars"><div class="barRow"><span>Поддоны</span><div class="bar"><i style="width:' + palPct + '%"></i></div><b>' + fmtPct(sel.pallet_utilization) + '</b></div><div class="barRow"><span>Вес</span><div class="bar ' + (sel.limiting === 'weight' ? 'warn' : '') + '"><i style="width:' + weightPct + '%"></i></div><b>' + fmtPct(sel.weight_utilization) + '</b></div></div></div>' +
        '<div class="actions"><button type="button" class="btn primary" data-action="details">' + (detailsOpen ? 'Скрыть варианты' : 'Выбрать другой транспорт') + '</button>' + (manual ? '<button type="button" class="btn" data-action="reset">Вернуть рекомендацию</button>' : '') + '</div>' +
        '<div class="micro">За 1 рейс: плитка ' + sel.tile_capacity_per_trip + ' подд., бордюр ' + sel.curb_capacity_per_trip + ' подд.; грузоподъёмность ' + fmtKg(sel.payload_kg) + '.</div>' +
        '<div class="details' + (detailsOpen ? ' show' : '') + '"><div class="options">' + optionsHtml + '</div></div>' +
      '</div></div>';
  }

  function signatureOf(res){
    var s = res.summary || {};
    var selected = res.selected && res.selected.vehicle ? res.selected.vehicle.id : '';
    return [res.source, s.tile_pallets, s.curb_pallets, s.total_pallets, s.total_weight_kg, selected, panelOpen, detailsOpen].join('|');
  }

  function render(force){
    if (destroyed) return;
    addGlobalGuardStyle();
    var h = ensureHost();
    if (!h || !shadow) return;
    var res = analyze();
    lastResult = res;
    syncHidden(res);
    var sig = signatureOf(res);
    if (!force && sig === lastSignature) {
      // Даже без перерендера гарантируем, что блок остался над корзиной.
      ensureHost();
      return;
    }
    lastSignature = sig;
    shadow.innerHTML = css() + (!res.summary.total_pallets || !res.selected ? renderEmpty(res) : renderResult(res));
    bindShadowEvents();
  }

  function schedule(force){
    if (renderTimer) cancelAnimationFrame(renderTimer);
    renderTimer = requestAnimationFrame(function(){ renderTimer = 0; render(!!force); });
  }

  function bindShadowEvents(){
    if (!shadow) return;
    shadow.querySelectorAll('[data-action]').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        var action = el.getAttribute('data-action');
        if (action === 'panel') { panelOpen = !panelOpen; if (!panelOpen) detailsOpen = false; }
        if (action === 'details') { panelOpen = true; detailsOpen = !detailsOpen; }
        if (action === 'reset') { selectedVehicleId = ''; saveSession('paver_logistics_vehicle_id', ''); panelOpen = true; detailsOpen = true; }
        schedule(true);
      });
    });
    shadow.querySelectorAll('[data-vehicle]').forEach(function(el){
      el.addEventListener('click', function(e){
        e.preventDefault(); e.stopPropagation();
        selectedVehicleId = el.getAttribute('data-vehicle') || '';
        saveSession('paver_logistics_vehicle_id', selectedVehicleId);
        panelOpen = true; detailsOpen = false; schedule(true);
      });
    });
  }

  function destroy(){
    destroyed = true;
    if (observer) observer.disconnect(); observer = null;
    if (pollTimer) clearInterval(pollTimer); pollTimer = 0;
    if (renderTimer) cancelAnimationFrame(renderTimer); renderTimer = 0;
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = null; shadow = null;
    var style = document.getElementById('paverLogisticsGlobalGuardStyle');
    if (style && style.parentNode) style.parentNode.removeChild(style);
  }

  function init(){
    addGlobalGuardStyle();
    schedule(true);
    var r = root();
    if (r && window.MutationObserver) {
      observer = new MutationObserver(function(){ schedule(false); });
      observer.observe(r, { childList:true, subtree:true, characterData:true });
    }
    pollTimer = setInterval(function(){ schedule(false); }, 800);
  }

  window[MODULE_KEY] = {
    version: VERSION,
    destroy: destroy,
    render: function(){ schedule(true); },
    diagnose: function(){
      var cart = findCart();
      return {
        version: VERSION,
        host: !!host,
        root: !!root(),
        cart: !!cart,
        aboveCart: !!(host && cart && host.nextElementSibling === cart && host.parentNode === cart.parentNode),
        insideCart: !!(host && cart && cart.contains(host)),
        panel_open: panelOpen,
        details_open: detailsOpen,
        selected_vehicle_id: selectedVehicleId,
        result: lastResult || analyze()
      };
    }
  };
  window.PaverLogisticsSingle = window[MODULE_KEY];
  window.PaverLogisticsClean = window[MODULE_KEY];
  window.PaverLogisticsPro = window[MODULE_KEY];

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();
