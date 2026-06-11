(function(){
  'use strict';

  var VERSION = 'paver-logistics-pro-autolayout-20260611-1';
  var MODULE_KEY = '__PAVER_LOGISTICS_PRO_MODULE__';
  var ROOT_ID = (window.PAVER_LOGISTICS_CONFIG && window.PAVER_LOGISTICS_CONFIG.mountRootId) || 'paverConf2026';

  var LEGACY_KEYS = [
    '__PAVER_LOGISTICS_CLEAN__',
    '__PAVER_LOGISTICS_ADDON__',
    '__PAVER_LOGISTICS_ABOVE_CART_V2__',
    '__PAVER_LOGISTICS_SINGLE_MODULE__',
    '__PAVER_LOGISTICS_PRO_MODULE__'
  ];

  LEGACY_KEYS.forEach(function(key){
    if (key !== MODULE_KEY && window[key] && typeof window[key].destroy === 'function') {
      try { window[key].destroy(); } catch (_) {}
    }
  });

  if (window[MODULE_KEY] && typeof window[MODULE_KEY].destroy === 'function') {
    try { window[MODULE_KEY].destroy(); } catch (_) {}
  }

  var VEHICLES = [
    { id:'manipulator_5t', category:'manipulator', name:'Манипулятор г/п до 5 т.', short:'Манипулятор 5 т', payload:5000, tileCap:6, curbCap:6 },
    { id:'manipulator_11t', category:'manipulator', name:'Манипулятор г/п до 11 т.', short:'Манипулятор 11 т', payload:11000, tileCap:8, curbCap:8 },
    { id:'manipulator_15t', category:'manipulator', name:'Манипулятор г/п до 15 т.', short:'Манипулятор 15 т', payload:15000, tileCap:12, curbCap:12 },
    { id:'manipulator_20t', category:'manipulator', name:'Манипулятор г/п до 20 т.', short:'Манипулятор 20 т', payload:20000, tileCap:14, curbCap:12 },
    { id:'flatbed_21t', category:'flatbed', name:'Бортовой длинномер г/п до 21 т.', short:'Длинномер 21 т', payload:21500, tileCap:20, curbCap:20 },
    { id:'flatbed_22t', category:'flatbed', name:'Бортовой длинномер г/п до 22 т.', short:'Длинномер 22 т', payload:22000, tileCap:20, curbCap:20 },
    { id:'flatbed_25t', category:'flatbed', name:'Бортовой длинномер г/п до 25 т.', short:'Длинномер 25 т', payload:25000, tileCap:20, curbCap:20 }
  ];

  var state = {
    open: false,
    variantsOpen: false,
    selectedVehicleId: loadSession('paver_logistics_selected_vehicle') || '',
    destroyed: false,
    observer: null,
    renderTimer: 0,
    pollTimer: 0,
    lastSignature: '',
    lastResult: null
  };

  function loadSession(key){ try { return sessionStorage.getItem(key) || ''; } catch (_) { return ''; } }
  function saveSession(key, value){ try { sessionStorage.setItem(key, value || ''); } catch (_) {} }
  function root(){ return document.getElementById(ROOT_ID) || document.querySelector('[data-paver-root]') || document.querySelector('.pcWrap'); }
  function scope(){ return root() || document; }
  function q(selector){ return scope().querySelector(selector); }
  function qa(selector){ return Array.prototype.slice.call(scope().querySelectorAll(selector)); }
  function num(value){
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (value == null) return 0;
    var text = String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
    var parsed = parseFloat(text);
    return isFinite(parsed) ? parsed : 0;
  }
  function fmt(value, digits){ return num(value).toLocaleString('ru-RU', { maximumFractionDigits: digits == null ? 1 : digits, minimumFractionDigits: 0 }); }
  function fmtInt(value){ return fmt(value, 0); }
  function fmtKg(value){ return fmtInt(value) + ' кг'; }
  function fmtPct(value){ return fmt(num(value) * 100, 0) + '%'; }
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function ensureStyle(){
    ['paverLogisticsSingleModuleStyle','paverLogisticsCleanStyle','paverLogisticsProStyle'].forEach(function(id){
      var old = document.getElementById(id);
      if (old && old.parentNode) old.parentNode.removeChild(old);
    });
    var style = document.createElement('style');
    style.id = 'paverLogisticsProStyle';
    style.textContent = [
      '[data-role="paverLogisticsAddon"],[data-role="paverLogisticsClean"],[data-role="paverLogisticsAboveCartV2"],[data-role="paverLogisticsSingle"]{display:none!important}',
      '.plogBox,.plogBox *{box-sizing:border-box}.plogBox{width:100%;max-width:100%;margin:0 0 14px;font-family:inherit;color:var(--pcT,rgba(0,0,0,.92))}.plogCard{width:100%;border:1px solid rgba(31,107,58,.22);border-radius:18px;background:#fff;box-shadow:0 8px 22px rgba(0,0,0,.045);overflow:hidden}',
      '.plogToggle{width:100%;border:0;background:linear-gradient(180deg,rgba(31,107,58,.045),rgba(255,255,255,.98));padding:16px;display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:14px;align-items:center;text-align:left;color:inherit;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}.plogToggle:focus-visible{outline:3px solid rgba(31,107,58,.25);outline-offset:-3px}',
      '.plogSummary{min-width:0;display:grid;grid-template-columns:1fr;gap:9px}.plogTitle{font-size:21px;font-weight:950;line-height:1.05;letter-spacing:-.025em}.plogMode{justify-self:start;display:inline-flex;align-items:center;min-height:28px;border-radius:999px;padding:0 12px;background:rgba(31,107,58,.11);color:#1f6b3a;font-size:12px;font-weight:950;line-height:1;white-space:normal}.plogMode.isManual{background:rgba(27,116,255,.12);color:#1b74ff}',
      '.plogTransport{display:grid;grid-template-columns:1fr;gap:3px;min-width:0}.plogLabel{font-size:11.5px;font-weight:800;line-height:1.1;color:rgba(0,0,0,.52);text-transform:none}.plogValue{font-size:14px;font-weight:850;line-height:1.24;color:rgba(0,0,0,.78);overflow-wrap:anywhere}.plogValueStrong{font-size:15px;font-weight:950;color:#1f6b3a}.plogPill{justify-self:start;display:inline-flex;align-items:center;justify-content:center;min-height:32px;border-radius:999px;padding:0 12px;background:rgba(31,107,58,.12);color:#1f6b3a;font-size:13px;font-weight:950;line-height:1.05;white-space:normal;text-align:center}',
      '.plogChevron{width:44px;height:44px;border-radius:999px;border:1px solid rgba(31,107,58,.22);background:#fff;display:grid;place-items:center;justify-self:center;align-self:center;color:#1f6b3a;box-shadow:0 2px 7px rgba(0,0,0,.035);transition:transform .16s ease}.plogChevron:before{content:"";display:block;width:10px;height:10px;border-right:2.4px solid currentColor;border-bottom:2.4px solid currentColor;transform:rotate(45deg);margin-top:-4px}.plogBox.isOpen .plogChevron{transform:rotate(180deg)}',
      '.plogPanel{display:none;border-top:1px solid rgba(0,0,0,.07);padding:14px 16px 16px;background:linear-gradient(180deg,rgba(31,107,58,.025),rgba(255,255,255,1))}.plogBox.isOpen .plogPanel{display:block}.plogHint{font-size:13px;line-height:1.35;color:rgba(0,0,0,.62);margin:0 0 12px}.plogPlaceholder{border:1px dashed rgba(0,0,0,.16);border-radius:15px;padding:12px;font-size:13.5px;line-height:1.4;color:rgba(0,0,0,.64);background:#fff}',
      '.plogMetrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.plogMetric{min-width:0;padding:11px;border:1px solid rgba(0,0,0,.075);border-radius:15px;background:#fff}.plogMetric span{display:block;font-size:12px;color:rgba(0,0,0,.62);line-height:1.15}.plogMetric b{display:block;margin-top:5px;font-size:17px;font-weight:950;line-height:1.1}',
      '.plogVehicle{border:1px solid rgba(0,0,0,.08);border-radius:17px;background:#fff;padding:13px;margin-top:10px}.plogVehicleTop{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start}.plogVehicleName{min-width:0;font-size:16px;font-weight:950;line-height:1.18}.plogTripBox{display:grid;gap:2px;text-align:right;white-space:nowrap}.plogTripBox span{font-size:11.5px;font-weight:800;color:rgba(0,0,0,.52);line-height:1.1}.plogTripBox b{font-size:15px;font-weight:950;color:#1f6b3a;line-height:1.15}',
      '.plogBars{margin-top:11px;display:grid;gap:8px}.plogBarRow{display:grid;grid-template-columns:70px minmax(0,1fr) 48px;gap:8px;align-items:center;font-size:12.5px;color:rgba(0,0,0,.68)}.plogBar{height:9px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden}.plogBar i{display:block;height:100%;border-radius:999px;background:#1f6b3a;max-width:100%}.plogBar.isWarn i{background:#b87400}',
      '.plogActions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.plogBtn{min-height:42px;border:1px solid rgba(0,0,0,.14);border-radius:14px;background:#fff;padding:0 13px;font:inherit;font-size:13.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;-webkit-tap-highlight-color:transparent;touch-action:manipulation}.plogBtn:hover{border-color:rgba(31,107,58,.38)}.plogBtn:active{transform:translateY(1px)}.plogBtnPrimary{background:#1f6b3a;color:#fff;border-color:#1f6b3a}.plogNote{font-size:12.5px;line-height:1.35;color:rgba(0,0,0,.6);margin-top:9px}',
      '.plogVariants{display:none;margin-top:12px}.plogBox.isVariantsOpen .plogVariants{display:grid;grid-template-columns:1fr;gap:8px}.plogOption{width:100%;border:1px solid rgba(0,0,0,.1);border-radius:15px;background:#fff;text-align:left;padding:11px;cursor:pointer;font:inherit;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.plogOption:hover{border-color:rgba(31,107,58,.36)}.plogOption.isSelected{border-color:rgba(31,107,58,.42);background:rgba(31,107,58,.07)}.plogOptionName{font-size:14.5px;font-weight:900;line-height:1.2}.plogOptionMeta{margin-top:5px;font-size:12.2px;color:rgba(0,0,0,.62);line-height:1.25}.plogOptionTrips{font-size:14px;font-weight:950;color:#1f6b3a;white-space:nowrap}.plogTag{display:inline-block;border-radius:999px;background:rgba(31,107,58,.12);color:#1f6b3a;padding:3px 7px;margin-left:7px;font-size:10.5px;font-weight:950;vertical-align:middle}',
      '@media(max-width:760px){.plogBox{margin-bottom:12px}.plogToggle{padding:15px 14px;grid-template-columns:minmax(0,1fr) 44px;gap:12px}.plogTitle{font-size:20px}.plogPanel{padding:13px 14px 14px}.plogMetrics{grid-template-columns:1fr;gap:7px}.plogMetric{display:flex;justify-content:space-between;gap:12px;align-items:center}.plogMetric b{margin-top:0;font-size:16px;text-align:right}.plogActions{display:grid;grid-template-columns:1fr}.plogBtn{width:100%}.plogOption{grid-template-columns:1fr}.plogOptionTrips{white-space:normal}.plogBarRow{grid-template-columns:62px minmax(0,1fr) 44px}}',
      '@media(max-width:430px){.plogToggle{padding:14px 12px;grid-template-columns:minmax(0,1fr) 42px}.plogChevron{width:42px;height:42px}.plogTitle{font-size:19px}.plogMode{font-size:11.5px;min-height:27px;padding:0 10px}.plogValue{font-size:13.5px}.plogPill{font-size:12.5px;min-height:30px}.plogVehicleTop{grid-template-columns:1fr}.plogTripBox{text-align:left;white-space:normal}}'
    ].join('');
    document.head.appendChild(style);
  }

  function removeLegacyNodes(){
    qa('[data-role="paverLogisticsAddon"], [data-role="paverLogisticsClean"], [data-role="paverLogisticsAboveCartV2"], [data-role="paverLogisticsSingle"]').forEach(function(el){
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    qa('[data-role="paverLogisticsPro"]').forEach(function(el, index){
      if (index > 0 && el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function findCart(){
    var r = root();
    if (!r) return null;
    return r.querySelector('.pcCart[data-role="cartBlock"]') || r.querySelector('[data-role="cartBlock"]') || r.querySelector('.pcCart');
  }

  function placeBox(box){
    var r = root();
    if (!r || !box) return false;
    var cart = findCart();
    if (cart && cart.parentNode && cart !== box && !box.contains(cart)) {
      var parent = cart.parentNode;
      if (box.parentNode !== parent || box.nextElementSibling !== cart) parent.insertBefore(box, cart);
      return true;
    }
    var right = r.querySelector('.pcLayout__right');
    if (right && right !== box && !box.contains(right)) {
      if (box.parentNode !== right) right.insertBefore(box, right.firstChild);
      return true;
    }
    var calc = r.querySelector('.pcCalc') || r.querySelector('[data-role="calcBlock"]') || r.querySelector('[data-role="previewBlock"]');
    if (calc && calc.parentNode && calc !== box && !box.contains(calc)) {
      if (box.parentNode !== calc.parentNode || box.previousElementSibling !== calc) calc.parentNode.insertBefore(box, calc.nextSibling);
      return true;
    }
    if (box.parentNode !== r) r.appendChild(box);
    return true;
  }

  function ensureBox(){
    var r = root();
    if (!r) return null;
    removeLegacyNodes();
    var box = r.querySelector('[data-role="paverLogisticsPro"]') || document.querySelector('[data-role="paverLogisticsPro"]');
    if (!box) {
      box = document.createElement('section');
      box.setAttribute('data-role', 'paverLogisticsPro');
      box.className = 'plogBox';
    }
    box.setAttribute('data-version', VERSION);
    placeBox(box);
    return box;
  }

  function ensureHidden(name){
    var form = q('form') || document.querySelector('form');
    if (!form) return null;
    var input = form.querySelector('input[name="' + name + '"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    return input;
  }
  function setHidden(name, value){ var input = ensureHidden(name); if (input) input.value = value == null ? '' : String(value); }

  function textOf(role){ var el = q('[data-role="' + role + '"]'); return el ? (el.textContent || el.value || '') : ''; }

  function normalizePosition(item){
    if (!item || typeof item !== 'object') return null;
    var blob = [item.type, item.product_type, item.form_name, item.form, item.name, item.title, item.thickness_label, item.curb_label, item.curb_size, item.qty_unit].join(' ').toLowerCase();
    var type = (item.type === 'curb' || /борд|curb|бр\s*\d|пог/.test(blob)) ? 'curb' : 'tile';
    var pallets = num(item.pallets || item.pallet_count || item.pallets_count);
    var perPallet = num(item.per_pallet_qty || item.m2_per_pallet || item.curb_lm_per_pallet);
    var qty = num(item.ship_qty || item.qty_value || item.area_m2 || item.qty);
    if (!(pallets > 0) && perPallet > 0 && qty > 0) pallets = Math.ceil(qty / perPallet);
    var weight = num(item.ship_weight_kg || item.weight_kg || item.total_weight_kg);
    var palletWeight = num(item.pallet_weight_kg || item.weight_per_pallet_kg);
    if (!(weight > 0) && pallets > 0 && palletWeight > 0) weight = pallets * palletWeight;
    if (!(pallets > 0)) return null;
    return { type:type, pallets:pallets, weight:weight, raw:item };
  }

  function currentPositionFromDom(){
    var pallets = num(textOf('pallets'));
    var weight = num(textOf('shipW'));
    if (!(pallets > 0)) return null;
    var blob = [textOf('shipUnitLabel'), textOf('calcFormName'), textOf('curbLmPerPallet'), textOf('thLabel')].join(' ').toLowerCase();
    var type = /борд|curb|пог/.test(blob) ? 'curb' : 'tile';
    return { type:type, pallets:pallets, weight:weight, raw:{ source:'current_dom' } };
  }

  function getPositions(){
    var cart = window.__pcCart && Array.isArray(window.__pcCart.positions) ? window.__pcCart.positions : [];
    var positions = [];
    cart.forEach(function(item){ var p = normalizePosition(item); if (p) positions.push(p); });
    if (positions.length) return { source:'cart', positions:positions };
    var current = currentPositionFromDom();
    if (current) return { source:'current', positions:[current] };
    return { source:'empty', positions:[] };
  }

  function summarize(positions){
    var summary = { tilePallets:0, curbPallets:0, totalPallets:0, totalWeight:0 };
    positions.forEach(function(p){
      var pallets = num(p.pallets);
      if (p.type === 'curb') summary.curbPallets += pallets; else summary.tilePallets += pallets;
      summary.totalPallets += pallets;
      summary.totalWeight += num(p.weight);
    });
    return summary;
  }

  function vehicleOption(vehicle, summary){
    var tileCap = Math.max(1, num(vehicle.tileCap));
    var curbCap = Math.max(1, num(vehicle.curbCap || vehicle.tileCap));
    var palletRatio = summary.tilePallets / tileCap + summary.curbPallets / curbCap;
    var tripsByPallets = Math.max(1, Math.ceil(palletRatio || 0));
    var payload = Math.max(1, num(vehicle.payload));
    var tripsByWeight = Math.max(1, Math.ceil((summary.totalWeight || 0) / payload));
    var trips = Math.max(tripsByPallets, tripsByWeight);
    return {
      vehicle: vehicle,
      trips: trips,
      tripsByPallets: tripsByPallets,
      tripsByWeight: tripsByWeight,
      palletUtilization: trips ? palletRatio / trips : 0,
      weightUtilization: trips ? (summary.totalWeight / payload) / trips : 0,
      limiting: tripsByWeight > tripsByPallets ? 'weight' : 'pallets'
    };
  }

  function categoryPriority(vehicle){ return vehicle.category === 'manipulator' ? 0 : 1; }
  function analyze(){
    var data = getPositions();
    var summary = summarize(data.positions);
    var options = VEHICLES.map(function(vehicle){ return vehicleOption(vehicle, summary); }).sort(function(a, b){
      return (a.trips - b.trips) || (categoryPriority(a.vehicle) - categoryPriority(b.vehicle)) || (a.vehicle.payload - b.vehicle.payload);
    });
    var recommended = options[0] || null;
    var selected = recommended;
    if (state.selectedVehicleId) {
      options.forEach(function(option){ if (option.vehicle.id === state.selectedVehicleId) selected = option; });
    }
    return { version:VERSION, source:data.source, positions:data.positions, summary:summary, options:options, recommended:recommended, selected:selected };
  }

  function syncHidden(result){
    setHidden('order_logistics_text', '');
    setHidden('order_logistics_json', '');
    setHidden('order_logistics_vehicle', '');
    setHidden('order_logistics_trips', '');
    var summary = result.summary;
    var selected = result.selected;
    if (!selected || !summary.totalPallets) return;
    var text = 'Логистика: ' + selected.vehicle.name + '; рейсов: ' + selected.trips + '; поддонов всего: ' + fmtInt(summary.totalPallets) + '; плитка/бордюр: ' + fmtInt(summary.tilePallets) + '/' + fmtInt(summary.curbPallets) + '; вес: ' + fmtKg(summary.totalWeight) + '. Стоимость доставки согласует менеджер.';
    setHidden('order_logistics_text', text);
    setHidden('order_logistics_json', JSON.stringify({ summary:summary, selected:selected, source:result.source, module_version:VERSION }));
    setHidden('order_logistics_vehicle', selected.vehicle.id);
    setHidden('order_logistics_trips', selected.trips);
  }

  function modeText(result){
    return result.recommended && result.selected && result.recommended.vehicle.id !== result.selected.vehicle.id ? 'Выбранный транспорт' : 'Рекомендация по транспорту';
  }

  function headerHtml(result){
    var summary = result.summary;
    var selected = result.selected;
    var hasData = !!(summary.totalPallets && selected);
    var isManual = hasData && result.recommended && result.recommended.vehicle.id !== selected.vehicle.id;
    var transport = hasData ? (selected.vehicle.short || selected.vehicle.name) : 'Транспорт подберётся после выбора позиции';
    var trips = hasData ? (selected.trips + ' рейс(ов)') : '—';
    var cargo = hasData ? (fmtInt(summary.totalPallets) + ' подд. · ' + fmtKg(summary.totalWeight)) : 'нет данных';
    return '' +
      '<button type="button" class="plogToggle" data-plog-action="toggle-panel" aria-expanded="' + (state.open ? 'true' : 'false') + '">' +
        '<span class="plogSummary">' +
          '<span class="plogTitle">Логистика</span>' +
          '<span class="plogMode' + (isManual ? ' isManual' : '') + '">' + esc(modeText(result)) + '</span>' +
          '<span class="plogTransport"><span class="plogLabel">Транспорт</span><span class="plogValue">' + esc(transport) + '</span></span>' +
          '<span class="plogTransport"><span class="plogLabel">Количество рейсов</span><span class="plogValue plogValueStrong">' + esc(trips) + '</span></span>' +
          '<span class="plogPill">' + esc(cargo) + '</span>' +
        '</span>' +
        '<span class="plogChevron" aria-hidden="true"></span>' +
      '</button>';
  }

  function panelHtml(result){
    if (!state.open) return '';
    var summary = result.summary;
    var selected = result.selected;
    if (!summary.totalPallets || !selected) {
      return '<div class="plogPanel"><div class="plogPlaceholder">Выберите позицию и площадь. Логистика считается отдельно и не влияет на цену товара, скидки и корзину.</div></div>';
    }
    var v = selected.vehicle;
    var palPct = Math.min(100, Math.round(selected.palletUtilization * 100));
    var weightPct = Math.min(100, Math.round(selected.weightUtilization * 100));
    var options = result.options.map(function(option){
      var ov = option.vehicle;
      var isSelected = ov.id === v.id;
      var isRecommended = result.recommended && ov.id === result.recommended.vehicle.id;
      return '' +
        '<button type="button" class="plogOption' + (isSelected ? ' isSelected' : '') + '" data-plog-vehicle="' + esc(ov.id) + '">' +
          '<span><span class="plogOptionName">' + esc(ov.short || ov.name) + (isRecommended ? '<span class="plogTag">рекомендовано</span>' : '') + '</span>' +
          '<span class="plogOptionMeta">' + option.trips + ' рейс(ов) · поддоны ' + esc(fmtPct(option.palletUtilization)) + ' · вес ' + esc(fmtPct(option.weightUtilization)) + ' · вместимость ' + esc(ov.tileCap) + '/' + esc(ov.curbCap) + ' подд.</span></span>' +
          '<span class="plogOptionTrips">' + option.trips + ' рейс.</span>' +
        '</button>';
    }).join('');
    var sourceText = result.source === 'cart' ? 'по корзине' : 'по текущему расчёту';
    var manual = result.recommended && result.recommended.vehicle.id !== v.id;
    return '' +
      '<div class="plogPanel">' +
        '<p class="plogHint">Расчёт ' + esc(sourceText) + ': транспорт подбирается по вместимости поддонов и грузоподъёмности. Стоимость доставки не включена в итог.</p>' +
        '<div class="plogMetrics">' +
          '<div class="plogMetric"><span>Поддоны всего</span><b>' + fmtInt(summary.totalPallets) + ' шт.</b></div>' +
          '<div class="plogMetric"><span>Плитка / бордюр</span><b>' + fmtInt(summary.tilePallets) + ' / ' + fmtInt(summary.curbPallets) + '</b></div>' +
          '<div class="plogMetric"><span>Вес заказа</span><b>' + fmtKg(summary.totalWeight) + '</b></div>' +
        '</div>' +
        '<div class="plogVehicle">' +
          '<div class="plogVehicleTop"><div class="plogVehicleName">' + esc(v.name) + '</div><div class="plogTripBox"><span>Количество рейсов</span><b>' + selected.trips + ' рейс(ов)</b></div></div>' +
          '<div class="plogBars">' +
            '<div class="plogBarRow"><span>Поддоны</span><div class="plogBar"><i style="width:' + palPct + '%"></i></div><b>' + fmtPct(selected.palletUtilization) + '</b></div>' +
            '<div class="plogBarRow"><span>Вес</span><div class="plogBar' + (selected.limiting === 'weight' ? ' isWarn' : '') + '"><i style="width:' + weightPct + '%"></i></div><b>' + fmtPct(selected.weightUtilization) + '</b></div>' +
          '</div>' +
        '</div>' +
        '<div class="plogActions"><button type="button" class="plogBtn plogBtnPrimary" data-plog-action="toggle-variants">' + (state.variantsOpen ? 'Скрыть варианты' : 'Выбрать другой транспорт') + '</button>' + (manual ? '<button type="button" class="plogBtn" data-plog-action="reset">Вернуть рекомендацию</button>' : '') + '</div>' +
        '<div class="plogNote">За 1 рейс: плитка ' + esc(v.tileCap) + ' подд., бордюр ' + esc(v.curbCap) + ' подд.; грузоподъёмность ' + fmtKg(v.payload) + '.</div>' +
        '<div class="plogVariants">' + options + '</div>' +
      '</div>';
  }

  function render(force){
    if (state.destroyed) return;
    ensureStyle();
    var box = ensureBox();
    if (!box) return;
    var result = analyze();
    state.lastResult = result;
    syncHidden(result);
    var signature = JSON.stringify({
      source: result.source,
      summary: result.summary,
      selected: result.selected && result.selected.vehicle.id,
      open: state.open,
      variantsOpen: state.variantsOpen,
      version: VERSION
    });
    if (!force && signature === state.lastSignature) return;
    state.lastSignature = signature;
    box.className = 'plogBox' + (state.open ? ' isOpen' : '') + (state.variantsOpen ? ' isVariantsOpen' : '');
    box.setAttribute('data-version', VERSION);
    box.innerHTML = '<div class="plogCard">' + headerHtml(result) + panelHtml(result) + '</div>';
    placeBox(box);
  }

  function schedule(force){
    if (state.renderTimer) cancelAnimationFrame(state.renderTimer);
    state.renderTimer = requestAnimationFrame(function(){
      state.renderTimer = 0;
      render(!!force);
    });
  }

  function handleClick(event){
    var target = event.target;
    if (!target || !target.closest) return;
    var box = target.closest('[data-role="paverLogisticsPro"]');
    if (!box) return;
    var action = target.closest('[data-plog-action]');
    var vehicle = target.closest('[data-plog-vehicle]');
    if (action || vehicle) {
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    }
    if (action) {
      var type = action.getAttribute('data-plog-action');
      if (type === 'toggle-panel') {
        state.open = !state.open;
        if (!state.open) state.variantsOpen = false;
      }
      if (type === 'toggle-variants') state.variantsOpen = !state.variantsOpen;
      if (type === 'reset') {
        state.selectedVehicleId = '';
        saveSession('paver_logistics_selected_vehicle', '');
        state.open = true;
        state.variantsOpen = true;
      }
      schedule(true);
      return;
    }
    if (vehicle) {
      state.selectedVehicleId = vehicle.getAttribute('data-plog-vehicle') || '';
      saveSession('paver_logistics_selected_vehicle', state.selectedVehicleId);
      state.open = true;
      state.variantsOpen = false;
      schedule(true);
    }
  }

  function destroy(){
    state.destroyed = true;
    if (state.observer) state.observer.disconnect();
    if (state.pollTimer) clearInterval(state.pollTimer);
    if (state.renderTimer) cancelAnimationFrame(state.renderTimer);
    document.removeEventListener('click', handleClick, true);
    var box = document.querySelector('[data-role="paverLogisticsPro"]');
    if (box && box.parentNode) box.parentNode.removeChild(box);
    var style = document.getElementById('paverLogisticsProStyle');
    if (style && style.parentNode) style.parentNode.removeChild(style);
  }

  function init(){
    ensureStyle();
    removeLegacyNodes();
    schedule(true);
    document.addEventListener('click', handleClick, true);
    var r = root();
    if (r && window.MutationObserver) {
      state.observer = new MutationObserver(function(){ schedule(false); });
      state.observer.observe(r, { childList:true, subtree:true, characterData:true });
    }
    state.pollTimer = setInterval(function(){ schedule(false); }, 800);
  }

  window[MODULE_KEY] = {
    version: VERSION,
    destroy: destroy,
    render: function(){ schedule(true); },
    diagnose: function(){
      var box = document.querySelector('[data-role="paverLogisticsPro"]');
      var cart = findCart();
      return {
        version: VERSION,
        box: !!box,
        boxRole: box ? box.getAttribute('data-role') : null,
        root: !!root(),
        cart: !!cart,
        aboveCart: !!(box && cart && box.nextElementSibling === cart),
        open: state.open,
        variantsOpen: state.variantsOpen,
        selectedVehicleId: state.selectedVehicleId,
        result: state.lastResult || analyze()
      };
    }
  };

  window.PaverLogisticsSingle = window[MODULE_KEY];
  window.PaverLogisticsClean = window[MODULE_KEY];
  window.PaverLogisticsPro = window[MODULE_KEY];

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
