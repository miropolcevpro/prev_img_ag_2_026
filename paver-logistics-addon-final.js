(function(){
  'use strict';
  var VERSION = 'logistics-addon-uxpolish-20260611-1';
  if (window.__PAVER_LOGISTICS_ADDON_VERSION === VERSION) return;
  window.__PAVER_LOGISTICS_ADDON_VERSION = VERSION;

  var RULES = {
    version: '2026-06-11-addon-inline-uxpolish-1',
    enabled: true,
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

  var selectedVehicleId = '';
  var detailsOpen = false;
  var lastResult = null;
  var timer = null;
  var observer = null;
  try { selectedVehicleId = sessionStorage.getItem('paver_logistics_addon_vehicle') || ''; } catch(e) {}

  function root(){ return document.getElementById('paverConf2026') || document.querySelector('.paverConf2026'); }
  function q(sel){ var r = root(); return r ? r.querySelector(sel) : document.querySelector(sel); }
  function qAll(sel){ var r = root(); return Array.prototype.slice.call(r ? r.querySelectorAll(sel) : document.querySelectorAll(sel)); }
  function num(v){
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (v == null) return 0;
    var s = String(v).replace(/\u00a0/g,' ').replace(/\s+/g,'').replace(',', '.').replace(/[^0-9.\-]/g, '');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  }
  function fmt(n, d){ return num(n).toLocaleString('ru-RU', { maximumFractionDigits: d == null ? 1 : d, minimumFractionDigits: 0 }); }
  function fmtKg(n){ return fmt(n,0) + ' кг'; }
  function fmtPct(n){ return fmt(num(n) * 100, 0) + '%'; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }

  function ensureStyle(){
    if (document.getElementById('paverLogisticsAddonStyle')) return;
    var css = document.createElement('style');
    css.id = 'paverLogisticsAddonStyle';
    css.textContent = [
      '.paverLogisticsAddon{margin:16px 0;padding:16px;border:1px solid rgba(31,107,58,.22);border-radius:20px;background:linear-gradient(180deg,rgba(31,107,58,.055),rgba(255,255,255,.98));box-shadow:0 8px 22px rgba(0,0,0,.055);font-family:inherit;color:var(--pcT,rgba(0,0,0,.92));max-width:100%;overflow:hidden}',
      '.paverLogisticsAddon *{box-sizing:border-box}.paverLogisticsAddon button{-webkit-tap-highlight-color:transparent}.paverLogisticsAddon__head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.paverLogisticsAddon__title{font-size:18px;font-weight:950;line-height:1.15}.paverLogisticsAddon__hint{font-size:13px;line-height:1.35;color:var(--pcM,rgba(0,0,0,.62));margin-top:5px;max-width:520px}.paverLogisticsAddon__badge{font-size:11.5px;font-weight:900;border-radius:999px;padding:7px 10px;white-space:nowrap;background:rgba(31,107,58,.13);color:#1f6b3a}.paverLogisticsAddon__badge--manual{background:rgba(27,116,255,.12);color:#1b74ff}',
      '.paverLogisticsAddon__placeholder{border:1px dashed rgba(0,0,0,.16);border-radius:15px;padding:12px;font-size:13.5px;line-height:1.4;color:var(--pcM,rgba(0,0,0,.64));background:#fff}.paverLogisticsAddon__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}.paverLogisticsAddon__metric{padding:11px;border:1px solid rgba(0,0,0,.075);border-radius:15px;background:#fff;min-width:0}.paverLogisticsAddon__metric span{display:block;font-size:12px;color:var(--pcM,rgba(0,0,0,.62));line-height:1.15}.paverLogisticsAddon__metric b{display:block;margin-top:5px;font-size:17px;font-weight:950;line-height:1.1}',
      '.paverLogisticsAddon__vehicle{border:1px solid rgba(0,0,0,.08);border-radius:17px;background:#fff;padding:13px;margin-top:10px}.paverLogisticsAddon__vehicleTop{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.paverLogisticsAddon__vehicleName{font-size:16px;font-weight:950;line-height:1.18}.paverLogisticsAddon__trips{font-size:15px;font-weight:950;color:#1f6b3a;white-space:nowrap}.paverLogisticsAddon__bars{margin-top:11px;display:flex;flex-direction:column;gap:8px}.paverLogisticsAddon__barRow{display:grid;grid-template-columns:70px 1fr 50px;gap:8px;align-items:center;font-size:12.5px;color:rgba(0,0,0,.68)}.paverLogisticsAddon__bar{height:9px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden}.paverLogisticsAddon__bar i{display:block;height:100%;border-radius:999px;background:#1f6b3a;max-width:100%}.paverLogisticsAddon__bar--warn i{background:#b87400}',
      '.paverLogisticsAddon__actions{display:flex;gap:8px;margin-top:12px}.paverLogisticsAddon__btn{min-height:42px;border:1px solid rgba(0,0,0,.14);border-radius:14px;background:#fff;padding:0 13px;font:inherit;font-size:13.5px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}.paverLogisticsAddon__btn:hover{border-color:rgba(31,107,58,.38)}.paverLogisticsAddon__btn:active{transform:translateY(1px)}.paverLogisticsAddon__btnPrimary{background:#1f6b3a;color:#fff;border-color:#1f6b3a}.paverLogisticsAddon__details{display:none;margin-top:12px}.paverLogisticsAddon.is-open .paverLogisticsAddon__details{display:block}.paverLogisticsAddon__micro{font-size:12.5px;line-height:1.35;color:rgba(0,0,0,.6);margin-top:9px}',
      '.paverLogisticsAddon__options{display:grid;grid-template-columns:1fr;gap:8px}.paverLogisticsAddon__option{width:100%;border:1px solid rgba(0,0,0,.1);border-radius:15px;background:#fff;text-align:left;padding:11px;cursor:pointer;font:inherit;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.paverLogisticsAddon__option:hover{border-color:rgba(31,107,58,.36)}.paverLogisticsAddon__option.is-selected{border-color:rgba(31,107,58,.42);background:rgba(31,107,58,.07)}.paverLogisticsAddon__optionName{font-size:14.5px;font-weight:900;line-height:1.2}.paverLogisticsAddon__optionMeta{margin-top:5px;font-size:12.2px;color:rgba(0,0,0,.62);line-height:1.25}.paverLogisticsAddon__optionTrips{font-size:14px;font-weight:950;color:#1f6b3a;white-space:nowrap}.paverLogisticsAddon__tag{display:inline-block;border-radius:999px;background:rgba(31,107,58,.1);color:#1f6b3a;font-size:11.5px;font-weight:850;padding:3px 7px;margin-left:6px}',
      '@media(max-width:760px){.paverLogisticsAddon{padding:13px;border-radius:18px;margin:12px 0}.paverLogisticsAddon__head{display:block}.paverLogisticsAddon__badge{display:inline-block;margin-top:10px}.paverLogisticsAddon__grid{grid-template-columns:1fr}.paverLogisticsAddon__vehicleTop{display:block}.paverLogisticsAddon__trips{margin-top:6px}.paverLogisticsAddon__actions{flex-direction:column}.paverLogisticsAddon__btn{width:100%}.paverLogisticsAddon__barRow{grid-template-columns:60px 1fr 44px}.paverLogisticsAddon__option{grid-template-columns:1fr}.paverLogisticsAddon__optionTrips{margin-top:3px}}'
    ].join('');
    document.head.appendChild(css);
  }

  function ensureBox(){
    ensureStyle();
    var r = root();
    if (!r) return null;
    var box = r.querySelector('[data-role="paverLogisticsAddon"]');
    if (box) return box;
    box = document.createElement('div');
    box.className = 'paverLogisticsAddon';
    box.setAttribute('data-role', 'paverLogisticsAddon');
    box.setAttribute('data-version', VERSION);
    var cartBlock = r.querySelector('[data-role="cartBlock"]') || r.querySelector('.pcCart');
    var formTitle = r.querySelector('.pcCalc__formTitle');
    if (cartBlock && cartBlock.parentNode) cartBlock.parentNode.insertBefore(box, cartBlock.nextSibling);
    else if (formTitle && formTitle.parentNode) formTitle.parentNode.insertBefore(box, formTitle);
    else (r.querySelector('.pcCalc') || r).appendChild(box);
    ensureHidden('order_logistics_text');
    ensureHidden('order_logistics_json');
    ensureHidden('order_logistics_vehicle');
    ensureHidden('order_logistics_trips');
    return box;
  }

  function ensureHidden(name){
    var forms = [];
    var lf = document.getElementById('paverLeadForm');
    if (lf) forms.push(lf);
    var tf = document.querySelector('form.t-form') || document.querySelector('.t-form');
    if (tf && forms.indexOf(tf) < 0) forms.push(tf);
    forms.forEach(function(f){
      if (!f || !f.appendChild) return;
      var el = f.querySelector('[name="' + name + '"]');
      if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = name; f.appendChild(el); }
    });
  }
  function setHidden(name, value){ qAll('[name="' + name + '"]').forEach(function(el){ el.value = value == null ? '' : String(value); }); }

  function normalizePosition(p){
    if (!p) return null;
    var type = p.type || p.product_type || '';
    var nameBlob = [p.form_name, p.form, p.name, p.title, p.thickness_label, p.curb_label, p.curb_size, p.qty_unit].join(' ').toLowerCase();
    if (!type) type = /борд|curb|бр\s*\d|пог/.test(nameBlob) ? 'curb' : 'tile';
    if (type !== 'curb') type = 'tile';
    var pallets = num(p.pallets || p.pallet_count || p.pallets_count);
    var per = num(p.per_pallet_qty || p.m2_per_pallet || p.curb_lm_per_pallet);
    var qty = num(p.ship_qty || p.qty_value || p.area_m2 || p.qty);
    if (!(pallets > 0) && per > 0 && qty > 0) pallets = Math.ceil(qty / per);
    var weight = num(p.ship_weight_kg || p.weight_kg || p.total_weight_kg);
    var palWeight = num(p.pallet_weight_kg || p.weight_per_pallet_kg);
    if (!(weight > 0) && pallets > 0 && palWeight > 0) weight = pallets * palWeight;
    if (!(pallets > 0)) return null;
    return { type:type, pallets:pallets, weight_kg:weight, raw:p };
  }
  function getCartPositions(){
    var out = [], cart = window.__pcCart;
    if (cart && Array.isArray(cart.positions)) cart.positions.forEach(function(p){ var n = normalizePosition(p); if (n) out.push(n); });
    return out;
  }
  function getSnapshotPosition(){
    try { if (typeof window.__pcCartSnapshotCurrent === 'function') { var n = normalizePosition(window.__pcCartSnapshotCurrent()); if (n) return n; } } catch(e) {}
    return null;
  }
  function parseTextNum(sel){ var el = q(sel); return el ? num(el.textContent || el.value) : 0; }
  function getDomCurrentPosition(){
    var pallets = parseTextNum('[data-role="pallets"]');
    var weight = parseTextNum('[data-role="shipW"]');
    if (!(pallets > 0)) return null;
    var blob = [
      q('[data-role="calcFormName"]') && q('[data-role="calcFormName"]').textContent,
      q('[data-role="shipUnitLabel"]') && q('[data-role="shipUnitLabel"]').textContent,
      q('[data-role="thLabel"]') && q('[data-role="thLabel"]').textContent
    ].join(' ').toLowerCase();
    var type = /борд|curb|пог/.test(blob) ? 'curb' : 'tile';
    return { type:type, pallets:pallets, weight_kg:weight, raw:{ source:'dom' } };
  }
  function getPositions(){
    var cart = getCartPositions();
    if (cart.length) return { source:'cart', positions:cart };
    var snap = getSnapshotPosition();
    if (snap) return { source:'current', positions:[snap] };
    var dom = getDomCurrentPosition();
    if (dom) return { source:'current_dom', positions:[dom] };
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
  function optionForVehicle(v, s){
    var tileCap = Math.max(1, num(v.tile_pallet_capacity));
    var curbCap = Math.max(1, num(v.curb_pallet_capacity || v.tile_pallet_capacity));
    var palRatio = (s.tile_pallets / tileCap) + (s.curb_pallets / curbCap);
    var tripsByPallet = Math.max(1, Math.ceil(palRatio || 0));
    var payload = Math.max(1, num(v.payload_kg));
    var tripsByWeight = Math.max(1, Math.ceil((s.total_weight_kg || 0) / payload));
    var trips = Math.max(tripsByPallet, tripsByWeight);
    return { vehicle:v, trips:trips, trips_by_pallets:tripsByPallet, trips_by_weight:tripsByWeight, pallet_utilization: trips ? palRatio / trips : 0, weight_utilization: trips ? (s.total_weight_kg / payload) / trips : 0, payload_kg:payload, tile_capacity_per_trip:tileCap, curb_capacity_per_trip:curbCap, limiting: tripsByWeight > tripsByPallet ? 'weight' : 'pallets' };
  }
  function analyze(){
    var d = getPositions();
    var s = summarize(d.positions);
    var vehicles = (RULES.vehicles || []).filter(function(v){ return v && v.enabled !== false; });
    var options = vehicles.map(function(v){ return optionForVehicle(v, s); }).sort(function(a,b){ return (a.trips - b.trips) || ((a.vehicle.category === 'manipulator' ? 0 : 1) - (b.vehicle.category === 'manipulator' ? 0 : 1)) || (a.payload_kg - b.payload_kg); });
    var recommended = options[0] || null, selected = recommended;
    if (selectedVehicleId) options.forEach(function(o){ if (o.vehicle.id === selectedVehicleId) selected = o; });
    return { addon_version:VERSION, enabled:RULES.enabled !== false, source:d.source, positions:d.positions, summary:s, options:options, recommended:recommended, selected:selected };
  }
  function syncHidden(res){
    ensureHidden('order_logistics_text'); ensureHidden('order_logistics_json'); ensureHidden('order_logistics_vehicle'); ensureHidden('order_logistics_trips');
    var s = res.summary || {}, sel = res.selected, text = '';
    if (sel && s.total_pallets) text = 'Логистика: ' + (sel.vehicle.name || sel.vehicle.id) + ', рейсов: ' + sel.trips + ', поддонов: ' + fmt(s.total_pallets,0) + ', вес: ' + fmtKg(s.total_weight_kg);
    setHidden('order_logistics_text', text);
    setHidden('order_logistics_json', text ? JSON.stringify({ summary:s, selected:sel, source:res.source, addon_version:VERSION }) : '');
    setHidden('order_logistics_vehicle', sel && text ? (sel.vehicle.id || '') : '');
    setHidden('order_logistics_trips', sel && text ? sel.trips : '');
  }
  function sourceText(src){ return src === 'cart' ? 'по корзине' : 'по текущему расчету'; }
  function render(){
    var box = ensureBox(); if (!box) return;
    var wasOpen = detailsOpen || box.classList.contains('is-open');
    var res = analyze(); lastResult = res; syncHidden(res);
    if (!res.enabled) { box.innerHTML = '<div class="paverLogisticsAddon__head"><div><div class="paverLogisticsAddon__title">Логистика</div><div class="paverLogisticsAddon__hint">Расчет логистики отключен.</div></div></div>'; return; }
    if (!res.summary.total_pallets || !res.selected) {
      box.classList.remove('is-open'); detailsOpen = false;
      box.innerHTML = '<div class="paverLogisticsAddon__head"><div><div class="paverLogisticsAddon__title">Логистика</div><div class="paverLogisticsAddon__hint">Выберите позицию и площадь — транспорт рассчитается автоматически. Стоимость доставки не включается в итог.</div></div><div class="paverLogisticsAddon__badge">готово</div></div><div class="paverLogisticsAddon__placeholder">Расчет будет выполнен по поддонам и весу. Менеджер увидит выбранный транспорт в заявке.</div>';
      return;
    }
    var s=res.summary, sel=res.selected, rec=res.recommended, v=sel.vehicle;
    var manual = rec && rec.vehicle && rec.vehicle.id !== v.id;
    var palPct = Math.min(100, Math.round(sel.pallet_utilization * 100));
    var weightPct = Math.min(100, Math.round(sel.weight_utilization * 100));
    var optionsHtml = res.options.map(function(o){
      var isSel = o.vehicle.id === v.id;
      var isRec = rec && rec.vehicle && o.vehicle.id === rec.vehicle.id;
      return '<button type="button" class="paverLogisticsAddon__option' + (isSel ? ' is-selected' : '') + '" data-vehicle-id="' + esc(o.vehicle.id) + '"><div><div class="paverLogisticsAddon__optionName">' + esc(o.vehicle.short_name || o.vehicle.name) + (isRec ? '<span class="paverLogisticsAddon__tag">рекомендовано</span>' : '') + '</div><div class="paverLogisticsAddon__optionMeta">Поддоны: ' + esc(fmtPct(o.pallet_utilization)) + ' · вес: ' + esc(fmtPct(o.weight_utilization)) + ' · вместимость: ' + o.tile_capacity_per_trip + '/' + o.curb_capacity_per_trip + ' подд.</div></div><div class="paverLogisticsAddon__optionTrips">' + o.trips + ' рейс.</div></button>';
    }).join('');
    box.className = 'paverLogisticsAddon' + (wasOpen ? ' is-open' : '');
    detailsOpen = wasOpen;
    box.innerHTML = '<div class="paverLogisticsAddon__head"><div><div class="paverLogisticsAddon__title">Логистика</div><div class="paverLogisticsAddon__hint">Расчет ' + esc(sourceText(res.source)) + ': подбираем транспорт по поддонам и весу.</div></div><div class="paverLogisticsAddon__badge ' + (manual ? 'paverLogisticsAddon__badge--manual' : '') + '">' + (manual ? 'выбрано вручную' : 'авто-рекомендация') + '</div></div>' +
      '<div class="paverLogisticsAddon__grid"><div class="paverLogisticsAddon__metric"><span>Поддоны</span><b>' + fmt(s.total_pallets,0) + ' шт.</b></div><div class="paverLogisticsAddon__metric"><span>Плитка / бордюр</span><b>' + fmt(s.tile_pallets,0) + ' / ' + fmt(s.curb_pallets,0) + '</b></div><div class="paverLogisticsAddon__metric"><span>Вес</span><b>' + fmtKg(s.total_weight_kg) + '</b></div></div>' +
      '<div class="paverLogisticsAddon__vehicle"><div class="paverLogisticsAddon__vehicleTop"><div class="paverLogisticsAddon__vehicleName">' + esc(v.name || v.id) + '</div><div class="paverLogisticsAddon__trips">' + sel.trips + ' рейс(ов)</div></div><div class="paverLogisticsAddon__bars"><div class="paverLogisticsAddon__barRow"><span>Поддоны</span><div class="paverLogisticsAddon__bar"><i style="width:' + palPct + '%"></i></div><b>' + fmtPct(sel.pallet_utilization) + '</b></div><div class="paverLogisticsAddon__barRow"><span>Вес</span><div class="paverLogisticsAddon__bar ' + (sel.limiting === 'weight' ? 'paverLogisticsAddon__bar--warn' : '') + '"><i style="width:' + weightPct + '%"></i></div><b>' + fmtPct(sel.weight_utilization) + '</b></div></div></div>' +
      '<div class="paverLogisticsAddon__actions"><button type="button" class="paverLogisticsAddon__btn paverLogisticsAddon__btnPrimary" data-role="paverLogisticsDetailsToggle">' + (wasOpen ? 'Скрыть варианты' : 'Выбрать другой транспорт') + '</button></div>' +
      '<div class="paverLogisticsAddon__micro">За 1 рейс: плитка ' + sel.tile_capacity_per_trip + ' подд., бордюр ' + sel.curb_capacity_per_trip + ' подд.; грузоподъемность ' + fmtKg(sel.payload_kg) + '. Доставка согласуется менеджером.</div>' +
      '<div class="paverLogisticsAddon__details"><div class="paverLogisticsAddon__options">' + optionsHtml + '</div></div>';
    bindBoxEvents(box);
  }
  function bindBoxEvents(box){
    var btn = box.querySelector('[data-role="paverLogisticsDetailsToggle"]');
    if (btn) btn.onclick = function(e){ if (e) { e.preventDefault(); e.stopPropagation(); } detailsOpen = !detailsOpen; render(); };
    Array.prototype.slice.call(box.querySelectorAll('[data-vehicle-id]')).forEach(function(el){
      el.onclick = function(e){ if (e) { e.preventDefault(); e.stopPropagation(); } selectedVehicleId = el.getAttribute('data-vehicle-id') || ''; try { sessionStorage.setItem('paver_logistics_addon_vehicle', selectedVehicleId); } catch(err) {} detailsOpen = false; render(); };
    });
  }
  function schedule(force){
    if (timer && !force) return;
    clearTimeout(timer);
    timer = setTimeout(function(){ timer = null; try { render(); } catch(e) { console.error('[PaverLogisticsAddon] render failed', e); } }, force ? 30 : 180);
  }
  function bind(){
    ensureBox();
    if (!observer) {
      var r = root();
      if (r && window.MutationObserver) {
        try {
          observer = new MutationObserver(function(muts){
            for (var i=0;i<muts.length;i++) {
              var t = muts[i].target;
              if (t && t.closest && t.closest('[data-role="paverLogisticsAddon"]')) continue;
              schedule(false); return;
            }
          });
          observer.observe(r, { childList:true, subtree:true, characterData:true, attributes:true });
        } catch(e) {}
      }
    }
    if (!window.__PAVER_LOGISTICS_ADDON_EVENTS_UX) {
      window.__PAVER_LOGISTICS_ADDON_EVENTS_UX = true;
      ['input','change'].forEach(function(evt){ document.addEventListener(evt, function(e){ if (e && e.target && e.target.closest && e.target.closest('[data-role="paverLogisticsAddon"]')) return; setTimeout(function(){ schedule(true); }, 100); }, true); });
      document.addEventListener('click', function(e){ if (e && e.target && e.target.closest && e.target.closest('[data-role="paverLogisticsAddon"]')) return; setTimeout(function(){ schedule(false); }, 180); }, true);
      setInterval(function(){ ensureBox(); schedule(false); }, 900);
    }
  }
  window.PaverLogisticsAddon = {
    version: VERSION,
    recalc: function(){ schedule(true); return lastResult || analyze(); },
    diagnose: function(){ var d = getPositions(); return { addon_version:VERSION, embed_version:window.__paverConfiguratorEmbedVersion || '', box:!!q('[data-role="paverLogisticsAddon"]'), open:detailsOpen, source:d.source, positions:d.positions, result:lastResult || analyze() }; },
    getResult: function(){ return lastResult || analyze(); }
  };
  function start(){ bind(); schedule(true); setTimeout(function(){ schedule(true); }, 500); setTimeout(function(){ schedule(true); }, 1500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
