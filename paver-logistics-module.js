(function(){
  'use strict';

  var VERSION = 'paver-logistics-accordion-20260611-1';
  var MODULE_KEY = '__PAVER_LOGISTICS_CLEAN__';

  // Stop an earlier copy of the same clean module if the page was re-rendered by Tilda.
  if (window[MODULE_KEY] && typeof window[MODULE_KEY].destroy === 'function') {
    try { window[MODULE_KEY].destroy(); } catch (_) {}
  }

  var DEFAULT_RULES = {
    version: '2026-06-11-clean-inline-rules-1',
    enabled: true,
    mode: 'pallet_capacity',
    cost_mode: 'manager_request',
    recommendation: {
      strategy: 'min_trips_then_manipulator_then_smallest_payload',
      mixed_formula: 'tile_pallets/tile_capacity + curb_pallets/curb_capacity'
    },
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

  var config = window.PAVER_LOGISTICS_CONFIG || {};
  var rootId = config.mountRootId || 'paverConf2026';
  var rulesUrl = config.rulesUrl || resolveAssetUrl('logistics_rules.json');
  var rules = clone(DEFAULT_RULES);
  var selectedVehicleId = loadSession('paver_logistics_vehicle_id') || '';
  var panelOpen = false;
  var detailsOpen = false;
  var renderTimer = 0;
  var pollTimer = 0;
  var observer = null;
  var lastSignature = '';
  var lastResult = null;
  var destroyed = false;

  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function resolveAssetUrl(file){
    try {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].getAttribute('src') || '';
        if (src.indexOf('paver-logistics-module.js') !== -1 || src.indexOf('paver-logistics-addon-final.js') !== -1) {
          return new URL(file, src).toString();
        }
      }
    } catch (_) {}
    return file;
  }

  function loadSession(key){ try { return sessionStorage.getItem(key) || ''; } catch (_) { return ''; } }
  function saveSession(key, val){ try { sessionStorage.setItem(key, val || ''); } catch (_) {} }

  function root(){ return document.getElementById(rootId) || document.querySelector('[data-paver-root]') || document.querySelector('.pcWrap'); }
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

  function ensureStyle(){
    var old = document.getElementById('paverLogisticsCleanStyle');
    if (old) old.parentNode.removeChild(old);
    var style = document.createElement('style');
    style.id = 'paverLogisticsCleanStyle';
    style.textContent = [
      '[data-role="paverLogisticsAddon"],.paverLogisticsAddon{display:none!important}',
      '.plcBox{margin:12px 0;padding:0;border:1px solid rgba(31,107,58,.22);border-radius:18px;background:linear-gradient(180deg,rgba(31,107,58,.045),rgba(255,255,255,.98));box-shadow:0 8px 22px rgba(0,0,0,.045);font-family:inherit;color:var(--pcT,rgba(0,0,0,.92));max-width:100%;overflow:hidden}',
      '.plcCollapsed{width:100%;border:0;background:transparent;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;text-align:left;font:inherit;color:inherit}.plcCollapsedMain{min-width:0}.plcCollapsedTitle{font-size:17px;font-weight:950;line-height:1.15}.plcCollapsedSub{font-size:12.5px;color:rgba(0,0,0,.58);line-height:1.25;margin-top:4px}.plcCollapsedMeta{display:flex;align-items:center;gap:8px;flex-shrink:0}.plcChevron{width:30px;height:30px;border-radius:999px;border:1px solid rgba(31,107,58,.18);background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#1f6b3a;transition:transform .16s ease}.plcBox.isPanelOpen .plcChevron{transform:rotate(180deg)}.plcPanel{padding:0 16px 16px}.plcDivider{height:1px;background:rgba(0,0,0,.07);margin:0 16px 12px}',
      '.plcBox,.plcBox *{box-sizing:border-box}.plcBox button{-webkit-tap-highlight-color:transparent;touch-action:manipulation}.plcHead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}.plcTitle{font-size:18px;font-weight:950;line-height:1.15}.plcHint{font-size:13px;line-height:1.35;color:rgba(0,0,0,.62);margin-top:5px;max-width:560px}.plcBadge{font-size:11.5px;font-weight:900;border-radius:999px;padding:7px 10px;background:rgba(31,107,58,.13);color:#1f6b3a;white-space:nowrap}.plcBadgeManual{background:rgba(27,116,255,.12);color:#1b74ff}',
      '.plcPlaceholder{border:1px dashed rgba(0,0,0,.16);border-radius:15px;padding:12px;font-size:13.5px;line-height:1.4;color:rgba(0,0,0,.64);background:#fff}.plcMetrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.plcMetric{padding:11px;border:1px solid rgba(0,0,0,.075);border-radius:15px;background:#fff;min-width:0}.plcMetric span{display:block;font-size:12px;color:rgba(0,0,0,.62);line-height:1.15}.plcMetric b{display:block;margin-top:5px;font-size:17px;font-weight:950;line-height:1.1}',
      '.plcVehicle{border:1px solid rgba(0,0,0,.08);border-radius:17px;background:#fff;padding:13px;margin-top:10px}.plcVehicleTop{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.plcVehicleName{font-size:16px;font-weight:950;line-height:1.18}.plcTrips{font-size:15px;font-weight:950;color:#1f6b3a;white-space:nowrap}.plcBars{margin-top:11px;display:flex;flex-direction:column;gap:8px}.plcBarRow{display:grid;grid-template-columns:70px 1fr 50px;gap:8px;align-items:center;font-size:12.5px;color:rgba(0,0,0,.68)}.plcBar{height:9px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden}.plcBar i{display:block;height:100%;border-radius:999px;background:#1f6b3a;max-width:100%}.plcBarWarn i{background:#b87400}',
      '.plcActions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.plcBtn{min-height:42px;border:1px solid rgba(0,0,0,.14);border-radius:14px;background:#fff;padding:0 13px;font:inherit;font-size:13.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}.plcBtn:hover{border-color:rgba(31,107,58,.38)}.plcBtn:active{transform:translateY(1px)}.plcBtnPrimary{background:#1f6b3a;color:#fff;border-color:#1f6b3a}.plcDetails{display:none;margin-top:12px}.plcBox.isOpen .plcDetails{display:block}.plcMicro{font-size:12.5px;line-height:1.35;color:rgba(0,0,0,.6);margin-top:9px}',
      '.plcOptions{display:grid;grid-template-columns:1fr;gap:8px}.plcOption{width:100%;border:1px solid rgba(0,0,0,.1);border-radius:15px;background:#fff;text-align:left;padding:11px;cursor:pointer;font:inherit;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.plcOption:hover{border-color:rgba(31,107,58,.36)}.plcOption.isSelected{border-color:rgba(31,107,58,.42);background:rgba(31,107,58,.07)}.plcOptionName{font-size:14.5px;font-weight:900;line-height:1.2}.plcOptionMeta{margin-top:5px;font-size:12.2px;color:rgba(0,0,0,.62);line-height:1.25}.plcOptionTrips{font-size:14px;font-weight:950;color:#1f6b3a;white-space:nowrap}.plcTag{display:inline-block;border-radius:999px;background:rgba(31,107,58,.12);color:#1f6b3a;padding:3px 7px;margin-left:7px;font-size:10.5px;font-weight:950;vertical-align:middle}',
      '@media(max-width:640px){.plcBox{border-radius:18px}.plcHead{display:block}.plcBadge{display:inline-flex;margin-top:9px}.plcMetrics{grid-template-columns:1fr;gap:7px}.plcMetric{display:flex;justify-content:space-between;gap:12px;align-items:center}.plcMetric b{margin-top:0;font-size:16px;text-align:right}.plcVehicleTop{align-items:flex-start}.plcBarRow{grid-template-columns:62px 1fr 44px}.plcActions{display:grid;grid-template-columns:1fr}.plcBtn{width:100%}.plcOption{grid-template-columns:1fr}.plcOptionTrips{white-space:normal}}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureHidden(name){
    var form = q('form') || document.querySelector('form');
    if (!form) return null;
    var el = form.querySelector('input[name="' + name + '"]');
    if (!el) {
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.appendChild(el);
    }
    return el;
  }

  function setHidden(name, value){ var el = ensureHidden(name); if (el) el.value = value == null ? '' : String(value); }

  function mountAfterTarget(box){
    var r = root();
    if (!r) return false;
    var target = q('[data-role="cartBlock"]') || q('[data-role="previewBlock"]') || q('[data-role="calcBlock"]') || r.lastElementChild;
    if (target && target.parentNode) {
      target.parentNode.insertBefore(box, target.nextSibling);
      return true;
    }
    r.appendChild(box);
    return true;
  }

  function ensureBox(){
    var r = root();
    if (!r) return null;
    qa('[data-role="paverLogisticsClean"]').forEach(function(el, idx){ if (idx > 0 && el.parentNode) el.parentNode.removeChild(el); });
    var box = q('[data-role="paverLogisticsClean"]');
    if (!box) {
      box = document.createElement('section');
      box.className = 'plcBox';
      box.setAttribute('data-role', 'paverLogisticsClean');
      box.setAttribute('data-version', VERSION);
      mountAfterTarget(box);
    }
    return box;
  }

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
      var pallets = num(p.pallets);
      var weight = num(p.weight_kg);
      if (p.type === 'curb') s.curb_pallets += pallets; else s.tile_pallets += pallets;
      s.total_pallets += pallets;
      s.total_weight_kg += weight;
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
    return {
      vehicle:v,
      trips:trips,
      trips_by_pallets:tripsByPallets,
      trips_by_weight:tripsByWeight,
      pallet_utilization: trips ? palletRatio / trips : 0,
      weight_utilization: trips ? (summary.total_weight_kg / payload) / trips : 0,
      payload_kg:payload,
      tile_capacity_per_trip:tileCap,
      curb_capacity_per_trip:curbCap,
      limiting: tripsByWeight > tripsByPallets ? 'weight' : 'pallets'
    };
  }

  function categoryPriority(v){ return v.category === 'manipulator' ? 0 : 1; }

  function analyze(){
    var data = getPositions();
    var summary = summarize(data.positions);
    var vehicles = (rules.vehicles || []).filter(function(v){ return v && v.enabled !== false; });
    var options = vehicles.map(function(v){ return vehicleOption(v, summary); }).sort(function(a,b){
      return (a.trips - b.trips) || (categoryPriority(a.vehicle) - categoryPriority(b.vehicle)) || (a.payload_kg - b.payload_kg);
    });
    var recommended = options[0] || null;
    var selected = recommended;
    if (selectedVehicleId) {
      options.forEach(function(o){ if (o.vehicle.id === selectedVehicleId) selected = o; });
    }
    return { module_version:VERSION, rules_version:rules.version, enabled:rules.enabled !== false, source:data.source, positions:data.positions, summary:summary, options:options, recommended:recommended, selected:selected };
  }

  function syncHidden(res){
    setHidden('order_logistics_text', '');
    setHidden('order_logistics_json', '');
    setHidden('order_logistics_vehicle', '');
    setHidden('order_logistics_trips', '');
    var s = res.summary || {};
    var sel = res.selected;
    if (!sel || !s.total_pallets) return;
    var text = 'Логистика: ' + (sel.vehicle.name || sel.vehicle.id) + '; рейсов: ' + sel.trips + '; поддонов всего: ' + fmtInt(s.total_pallets) + '; плитка/бордюр: ' + fmtInt(s.tile_pallets) + '/' + fmtInt(s.curb_pallets) + '; вес: ' + fmtKg(s.total_weight_kg) + '. Стоимость доставки согласует менеджер.';
    setHidden('order_logistics_text', text);
    setHidden('order_logistics_json', JSON.stringify({ summary:s, selected:sel, source:res.source, module_version:VERSION, rules_version:rules.version }));
    setHidden('order_logistics_vehicle', sel.vehicle.id || '');
    setHidden('order_logistics_trips', sel.trips);
  }

  function renderCollapsed(box, res){
    var s = res.summary || {};
    var sel = res.selected;
    var hasData = !!(s.total_pallets && sel);
    var sub = hasData
      ? ('Рекомендация: ' + (sel.vehicle.short_name || sel.vehicle.name || sel.vehicle.id) + ' · ' + sel.trips + ' рейс(ов)')
      : 'Расчёт транспорта по поддонам и весу';
    var badge = hasData ? (fmtInt(s.total_pallets) + ' подд. · ' + fmtKg(s.total_weight_kg)) : 'скрыто';
    box.className = 'plcBox';
    box.innerHTML = '' +
      '<button type="button" class="plcCollapsed" data-plc-action="panel-toggle" aria-expanded="false">' +
        '<span class="plcCollapsedMain"><span class="plcCollapsedTitle">Логистика</span><span class="plcCollapsedSub">' + esc(sub) + '</span></span>' +
        '<span class="plcCollapsedMeta"><span class="plcBadge">' + esc(badge) + '</span><span class="plcChevron" aria-hidden="true">⌄</span></span>' +
      '</button>';
  }

  function renderEmpty(box){
    box.className = 'plcBox isPanelOpen';
    box.innerHTML = '' +
      '<button type="button" class="plcCollapsed" data-plc-action="panel-toggle" aria-expanded="true">' +
        '<span class="plcCollapsedMain"><span class="plcCollapsedTitle">Логистика</span><span class="plcCollapsedSub">Расчёт транспорта по поддонам и весу</span></span>' +
        '<span class="plcCollapsedMeta"><span class="plcBadge">готово</span><span class="plcChevron" aria-hidden="true">⌄</span></span>' +
      '</button><div class="plcDivider"></div><div class="plcPanel"><div class="plcPlaceholder">Выберите позицию и площадь. Блок не влияет на цены, скидки и товарную калькуляцию. Данные логистики отдельно попадут в заявку для менеджера.</div></div>';
  }

  function sourceLabel(src){ return src === 'cart' ? 'по корзине' : 'по текущему расчёту'; }

  function renderResult(box, res){
    var s = res.summary;
    var sel = res.selected;
    var rec = res.recommended;
    var v = sel.vehicle;
    var manual = !!(rec && rec.vehicle && rec.vehicle.id !== v.id);
    var palPct = Math.min(100, Math.round(sel.pallet_utilization * 100));
    var weightPct = Math.min(100, Math.round(sel.weight_utilization * 100));
    var optionsHtml = res.options.map(function(o){
      var ov = o.vehicle;
      var isSelected = ov.id === v.id;
      var isRecommended = rec && rec.vehicle && ov.id === rec.vehicle.id;
      return '<button type="button" class="plcOption' + (isSelected ? ' isSelected' : '') + '" data-plc-vehicle="' + esc(ov.id) + '"><div><div class="plcOptionName">' + esc(ov.short_name || ov.name || ov.id) + (isRecommended ? '<span class="plcTag">рекомендовано</span>' : '') + '</div><div class="plcOptionMeta">' + o.trips + ' рейс(ов) · поддоны ' + esc(fmtPct(o.pallet_utilization)) + ' · вес ' + esc(fmtPct(o.weight_utilization)) + ' · вместимость ' + esc(o.tile_capacity_per_trip) + '/' + esc(o.curb_capacity_per_trip) + ' подд.</div></div><div class="plcOptionTrips">' + o.trips + ' рейс.</div></button>';
    }).join('');

    box.className = 'plcBox isPanelOpen' + (detailsOpen ? ' isOpen' : '');
    box.innerHTML = '' +
      '<button type="button" class="plcCollapsed" data-plc-action="panel-toggle" aria-expanded="true">' +
        '<span class="plcCollapsedMain"><span class="plcCollapsedTitle">Логистика</span><span class="plcCollapsedSub">' + esc((v.short_name || v.name || v.id) + ' · ' + sel.trips + ' рейс(ов)') + '</span></span>' +
        '<span class="plcCollapsedMeta"><span class="plcBadge ' + (manual ? 'plcBadgeManual' : '') + '">' + (manual ? 'выбрано' : 'авто') + '</span><span class="plcChevron" aria-hidden="true">⌄</span></span>' +
      '</button><div class="plcDivider"></div><div class="plcPanel">' +
      '<div class="plcHead"><div><div class="plcHint">Расчёт ' + esc(sourceLabel(res.source)) + ': транспорт подбирается по вместимости поддонов и грузоподъёмности.</div></div></div>' +
      '<div class="plcMetrics"><div class="plcMetric"><span>Поддоны всего</span><b>' + fmtInt(s.total_pallets) + ' шт.</b></div><div class="plcMetric"><span>Плитка / бордюр</span><b>' + fmtInt(s.tile_pallets) + ' / ' + fmtInt(s.curb_pallets) + '</b></div><div class="plcMetric"><span>Вес заказа</span><b>' + fmtKg(s.total_weight_kg) + '</b></div></div>' +
      '<div class="plcVehicle"><div class="plcVehicleTop"><div class="plcVehicleName">' + esc(v.name || v.id) + '</div><div class="plcTrips">' + sel.trips + ' рейс(ов)</div></div><div class="plcBars"><div class="plcBarRow"><span>Поддоны</span><div class="plcBar"><i style="width:' + palPct + '%"></i></div><b>' + fmtPct(sel.pallet_utilization) + '</b></div><div class="plcBarRow"><span>Вес</span><div class="plcBar ' + (sel.limiting === 'weight' ? 'plcBarWarn' : '') + '"><i style="width:' + weightPct + '%"></i></div><b>' + fmtPct(sel.weight_utilization) + '</b></div></div></div>' +
      '<div class="plcActions"><button type="button" class="plcBtn plcBtnPrimary" data-plc-action="toggle">' + (detailsOpen ? 'Скрыть варианты' : 'Выбрать другой транспорт') + '</button>' + (manual ? '<button type="button" class="plcBtn" data-plc-action="reset">Вернуть рекомендацию</button>' : '') + '</div>' +
      '<div class="plcMicro">За 1 рейс: плитка ' + sel.tile_capacity_per_trip + ' подд., бордюр ' + sel.curb_capacity_per_trip + ' подд.; грузоподъёмность ' + fmtKg(sel.payload_kg) + '. Стоимость доставки не включена в итог.</div>' +
      '<div class="plcDetails"><div class="plcOptions">' + optionsHtml + '</div></div></div>';
  }

  function signatureOf(res){
    var s = res.summary || {};
    var selected = res.selected && res.selected.vehicle ? res.selected.vehicle.id : '';
    return [res.source, s.tile_pallets, s.curb_pallets, s.total_pallets, s.total_weight_kg, selected, panelOpen, detailsOpen, rules.version].join('|');
  }

  function render(force){
    if (destroyed) return;
    ensureStyle();
    var box = ensureBox();
    if (!box) return;
    var res = analyze();
    lastResult = res;
    syncHidden(res);
    var sig = signatureOf(res);
    if (!force && sig === lastSignature) return;
    lastSignature = sig;
    if (!panelOpen) { renderCollapsed(box, res); return; }
    if (!res.enabled || !res.summary.total_pallets || !res.selected) renderEmpty(box); else renderResult(box, res);
  }

  function schedule(force){
    if (renderTimer) cancelAnimationFrame(renderTimer);
    renderTimer = requestAnimationFrame(function(){ renderTimer = 0; render(!!force); });
  }

  function handleClick(e){
    var target = e.target;
    if (!target || !target.closest) return;
    var box = target.closest('[data-role="paverLogisticsClean"]');
    if (!box) return;
    var action = target.closest('[data-plc-action]');
    var vehicle = target.closest('[data-plc-vehicle]');
    if (action || vehicle) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    if (action) {
      var a = action.getAttribute('data-plc-action');
      if (a === 'panel-toggle') { panelOpen = !panelOpen; if (!panelOpen) detailsOpen = false; }
      if (a === 'toggle') detailsOpen = !detailsOpen;
      if (a === 'reset') { selectedVehicleId = ''; saveSession('paver_logistics_vehicle_id', ''); detailsOpen = true; panelOpen = true; }
      schedule(true);
      return;
    }
    if (vehicle) {
      selectedVehicleId = vehicle.getAttribute('data-plc-vehicle') || '';
      saveSession('paver_logistics_vehicle_id', selectedVehicleId);
      detailsOpen = false;
      panelOpen = true;
      schedule(true);
    }
  }

  function loadRules(){
    if (!rulesUrl || config.disableExternalRules === true) return Promise.resolve(false);
    return fetch(rulesUrl, { cache:'no-store' }).then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(json){
      if (json && Array.isArray(json.vehicles) && json.vehicles.length) {
        rules = json;
        schedule(true);
        return true;
      }
      return false;
    }).catch(function(err){
      console.warn('[PaverLogisticsClean] external logistics_rules.json ignored; inline rules are used.', err && err.message ? err.message : err);
      return false;
    });
  }

  function destroy(){
    destroyed = true;
    if (observer) observer.disconnect();
    observer = null;
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = 0;
    if (renderTimer) cancelAnimationFrame(renderTimer);
    renderTimer = 0;
    document.removeEventListener('click', handleClick, true);
    var box = document.querySelector('[data-role="paverLogisticsClean"]');
    if (box && box.parentNode) box.parentNode.removeChild(box);
    var style = document.getElementById('paverLogisticsCleanStyle');
    if (style && style.parentNode) style.parentNode.removeChild(style);
  }

  function init(){
    ensureStyle();
    schedule(true);
    document.addEventListener('click', handleClick, true);
    var r = root();
    if (r && window.MutationObserver) {
      observer = new MutationObserver(function(){ schedule(false); });
      observer.observe(r, { childList:true, subtree:true, characterData:true });
    }
    pollTimer = setInterval(function(){ schedule(false); }, 900);
    loadRules();
  }

  window[MODULE_KEY] = {
    version: VERSION,
    destroy: destroy,
    render: function(){ schedule(true); },
    diagnose: function(){
      var box = document.querySelector('[data-role="paverLogisticsClean"]');
      return {
        version: VERSION,
        box: !!box,
        root: !!root(),
        rules_version: rules.version,
        selected_vehicle_id: selectedVehicleId,
        panel_open: panelOpen,
        details_open: detailsOpen,
        result: lastResult || analyze()
      };
    }
  };
  window.PaverLogisticsClean = window[MODULE_KEY];

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();
