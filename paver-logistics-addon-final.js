(function(){
  'use strict';
  var VERSION = 'logistics-addon-final-20260611-1';
  if (window.__PAVER_LOGISTICS_ADDON_VERSION === VERSION) return;
  window.__PAVER_LOGISTICS_ADDON_VERSION = VERSION;

  var RULES = {
    version: '2026-06-11-addon-inline-1',
    enabled: true,
    vehicles: [
      { id:'manipulator_5t',  category:'manipulator', name:'Манипулятор г/п до 5 т.',  short_name:'Манипулятор 5 т',  payload_kg:5000,  tile_pallet_capacity:6,  curb_pallet_capacity:6,  enabled:true },
      { id:'manipulator_11t', category:'manipulator', name:'Манипулятор г/п до 11 т.', short_name:'Манипулятор 11 т', payload_kg:11000, tile_pallet_capacity:8,  curb_pallet_capacity:8,  enabled:true },
      { id:'manipulator_15t', category:'manipulator', name:'Манипулятор г/п до 15 т.', short_name:'Манипулятор 15 т', payload_kg:15000, tile_pallet_capacity:12, curb_pallet_capacity:12, enabled:true },
      { id:'manipulator_20t', category:'manipulator', name:'Манипулятор г/п до 20 т.', short_name:'Манипулятор 20 т', payload_kg:20000, tile_pallet_capacity:14, curb_pallet_capacity:12, enabled:true },
      { id:'flatbed_21t',     category:'flatbed',     name:'Бортовой длинномер г/п до 21 т.', short_name:'Длинномер 21 т', payload_kg:21000, tile_pallet_capacity:20, curb_pallet_capacity:20, enabled:true },
      { id:'flatbed_22t',     category:'flatbed',     name:'Бортовой длинномер г/п до 22 т.', short_name:'Длинномер 22 т', payload_kg:22000, tile_pallet_capacity:20, curb_pallet_capacity:20, enabled:true },
      { id:'flatbed_25t',     category:'flatbed',     name:'Бортовой длинномер г/п до 25 т.', short_name:'Длинномер 25 т', payload_kg:25000, tile_pallet_capacity:20, curb_pallet_capacity:20, enabled:true }
    ]
  };

  var selectedVehicleId = '';
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
      '.paverLogisticsAddon{margin:14px 0;padding:14px;border:1px solid rgba(31,107,58,.24);border-radius:18px;background:linear-gradient(180deg,rgba(31,107,58,.075),rgba(255,255,255,.98));box-shadow:0 10px 24px rgba(0,0,0,.07);font-family:inherit;color:var(--pcT,rgba(0,0,0,.92));}',
      '.paverLogisticsAddon *{box-sizing:border-box}.paverLogisticsAddon__head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px}.paverLogisticsAddon__title{font-size:17px;font-weight:950;line-height:1.12}.paverLogisticsAddon__hint{font-size:12.8px;line-height:1.28;color:var(--pcM,rgba(0,0,0,.62));margin-top:4px}.paverLogisticsAddon__badge{font-size:11px;font-weight:900;border-radius:999px;padding:6px 9px;white-space:nowrap;background:rgba(31,107,58,.13);color:#1f6b3a}.paverLogisticsAddon__badge--manual{background:rgba(27,116,255,.12);color:#1b74ff}',
      '.paverLogisticsAddon__placeholder{border:1px dashed rgba(0,0,0,.18);border-radius:14px;padding:11px;font-size:13px;line-height:1.35;color:var(--pcM,rgba(0,0,0,.64));background:#fff}.paverLogisticsAddon__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}.paverLogisticsAddon__metric{padding:10px;border:1px solid rgba(0,0,0,.08);border-radius:14px;background:#fff}.paverLogisticsAddon__metric span{display:block;font-size:11.5px;color:var(--pcM,rgba(0,0,0,.62));line-height:1.1}.paverLogisticsAddon__metric b{display:block;margin-top:5px;font-size:15px;font-weight:950;line-height:1.1}',
      '.paverLogisticsAddon__vehicle{border:1px solid rgba(0,0,0,.08);border-radius:16px;background:#fff;padding:11px;margin-top:9px}.paverLogisticsAddon__vehicleTop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.paverLogisticsAddon__vehicleName{font-size:14px;font-weight:950;line-height:1.15}.paverLogisticsAddon__trips{font-size:13px;font-weight:950;color:#1f6b3a;white-space:nowrap}',
      '.paverLogisticsAddon__bars{margin-top:9px;display:flex;flex-direction:column;gap:7px}.paverLogisticsAddon__barRow{display:grid;grid-template-columns:64px 1fr 48px;gap:8px;align-items:center;font-size:12px;color:rgba(0,0,0,.68)}.paverLogisticsAddon__bar{height:8px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden}.paverLogisticsAddon__bar i{display:block;height:100%;border-radius:999px;background:#1f6b3a}.paverLogisticsAddon__bar--warn i{background:#b87400}',
      '.paverLogisticsAddon__control{display:flex;gap:8px;margin-top:10px}.paverLogisticsAddon__select{flex:1;min-width:0;height:38px;border:1px solid rgba(0,0,0,.16);border-radius:12px;padding:0 10px;font:inherit;font-size:13px;background:#fff}.paverLogisticsAddon__btn{height:38px;border:1px solid rgba(0,0,0,.16);border-radius:12px;background:#fff;padding:0 11px;font:inherit;font-size:12.5px;font-weight:900;cursor:pointer}.paverLogisticsAddon__details{display:none;margin-top:10px;overflow:auto}.paverLogisticsAddon.is-open .paverLogisticsAddon__details{display:block}.paverLogisticsAddon__table{width:100%;border-collapse:separate;border-spacing:0;font-size:12px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:12px;overflow:hidden}.paverLogisticsAddon__table th,.paverLogisticsAddon__table td{padding:7px 8px;border-bottom:1px solid rgba(0,0,0,.06);text-align:left;white-space:nowrap}.paverLogisticsAddon__table th{font-weight:900;color:rgba(0,0,0,.62);background:rgba(0,0,0,.03)}.paverLogisticsAddon__table tr.is-selected td{background:rgba(31,107,58,.08);font-weight:800}',
      '@media(max-width:760px){.paverLogisticsAddon{padding:12px;border-radius:16px}.paverLogisticsAddon__head{flex-direction:column}.paverLogisticsAddon__grid{grid-template-columns:1fr}.paverLogisticsAddon__control{flex-direction:column}.paverLogisticsAddon__select,.paverLogisticsAddon__btn{width:100%}.paverLogisticsAddon__barRow{grid-template-columns:56px 1fr 44px}}'
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
  function setHidden(name, value){
    qAll('[name="' + name + '"]').forEach(function(el){ el.value = value == null ? '' : String(value); });
  }

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
    return {
      vehicle:v, trips:trips,
      trips_by_pallets:tripsByPallet, trips_by_weight:tripsByWeight,
      pallet_utilization: trips ? palRatio / trips : 0,
      weight_utilization: trips ? (s.total_weight_kg / payload) / trips : 0,
      payload_kg:payload,
      tile_capacity_per_trip:tileCap,
      curb_capacity_per_trip:curbCap,
      limiting: tripsByWeight > tripsByPallet ? 'weight' : 'pallets'
    };
  }
  function analyze(){
    var d = getPositions();
    var s = summarize(d.positions);
    var vehicles = (RULES.vehicles || []).filter(function(v){ return v && v.enabled !== false; });
    var options = vehicles.map(function(v){ return optionForVehicle(v, s); }).sort(function(a,b){
      return (a.trips - b.trips) || ((a.vehicle.category === 'manipulator' ? 0 : 1) - (b.vehicle.category === 'manipulator' ? 0 : 1)) || (a.payload_kg - b.payload_kg);
    });
    var recommended = options[0] || null, selected = recommended;
    if (selectedVehicleId) options.forEach(function(o){ if (o.vehicle.id === selectedVehicleId) selected = o; });
    return { addon_version:VERSION, enabled:RULES.enabled !== false, source:d.source, positions:d.positions, summary:s, options:options, recommended:recommended, selected:selected };
  }
  function syncHidden(res){
    ensureHidden('order_logistics_text'); ensureHidden('order_logistics_json'); ensureHidden('order_logistics_vehicle'); ensureHidden('order_logistics_trips');
    var s = res.summary || {}, sel = res.selected, text = '';
    if (sel && s.total_pallets) text = 'Логистика: ' + (sel.vehicle.name || sel.vehicle.id) + ', рейсов: ' + sel.trips + ', поддонов: ' + fmt(s.total_pallets,0) + ', вес: ' + fmtKg(s.total_weight_kg);
    setHidden('order_logistics_text', text);
    setHidden('order_logistics_json', text ? JSON.stringify(res) : '');
    setHidden('order_logistics_vehicle', sel && text ? (sel.vehicle.id || '') : '');
    setHidden('order_logistics_trips', sel && text ? sel.trips : '');
  }
  function render(){
    var box = ensureBox(); if (!box) return;
    var res = analyze(); lastResult = res; syncHidden(res);
    if (!res.enabled) { box.innerHTML = '<div class="paverLogisticsAddon__head"><div><div class="paverLogisticsAddon__title">Логистика</div><div class="paverLogisticsAddon__hint">Расчет логистики отключен.</div></div></div>'; return; }
    if (!res.summary.total_pallets || !res.selected) {
      box.innerHTML = '<div class="paverLogisticsAddon__head"><div><div class="paverLogisticsAddon__title">Логистика по поддонам</div><div class="paverLogisticsAddon__hint">Блок активен. Выберите позицию и площадь — транспорт появится автоматически.</div></div><div class="paverLogisticsAddon__badge">готово</div></div><div class="paverLogisticsAddon__placeholder">Расчет транспорта будет выполнен по количеству поддонов и весу. Стоимость доставки не включается в итог и согласуется менеджером.</div>';
      return;
    }
    var s=res.summary, sel=res.selected, rec=res.recommended, v=sel.vehicle;
    var manual = rec && rec.vehicle && rec.vehicle.id !== v.id;
    var palPct = Math.min(100, Math.round(sel.pallet_utilization * 100));
    var weightPct = Math.min(100, Math.round(sel.weight_utilization * 100));
    var sourceLabel = res.source === 'cart' ? 'по корзине' : 'по текущему расчету';
    var optsHtml = res.options.map(function(o){
      var label = (o.vehicle.short_name || o.vehicle.name || o.vehicle.id) + ' — ' + o.trips + ' рейс.' + (rec && rec.vehicle && o.vehicle.id === rec.vehicle.id ? ' · рекомендовано' : '');
      return '<option value="' + esc(o.vehicle.id) + '" ' + (o.vehicle.id === v.id ? 'selected' : '') + '>' + esc(label) + '</option>';
    }).join('');
    var rows = res.options.map(function(o){
      return '<tr' + (o.vehicle.id === v.id ? ' class="is-selected"' : '') + '><td>' + esc(o.vehicle.short_name || o.vehicle.name) + '</td><td>' + o.trips + '</td><td>' + esc(fmtPct(o.pallet_utilization)) + '</td><td>' + esc(fmtPct(o.weight_utilization)) + '</td><td>' + o.tile_capacity_per_trip + ' / ' + o.curb_capacity_per_trip + '</td></tr>';
    }).join('');
    box.innerHTML = '<div class="paverLogisticsAddon__head"><div><div class="paverLogisticsAddon__title">Логистика по поддонам</div><div class="paverLogisticsAddon__hint">Расчет ' + esc(sourceLabel) + '. Транспорт подбирается по вместимости поддонов и весу.</div></div><div class="paverLogisticsAddon__badge ' + (manual ? 'paverLogisticsAddon__badge--manual' : '') + '">' + (manual ? 'выбрано вручную' : 'авто-рекомендация') + '</div></div>' +
      '<div class="paverLogisticsAddon__grid"><div class="paverLogisticsAddon__metric"><span>Поддоны всего</span><b>' + fmt(s.total_pallets,0) + ' шт.</b></div><div class="paverLogisticsAddon__metric"><span>Плитка / бордюр</span><b>' + fmt(s.tile_pallets,0) + ' / ' + fmt(s.curb_pallets,0) + '</b></div><div class="paverLogisticsAddon__metric"><span>Вес заказа</span><b>' + fmtKg(s.total_weight_kg) + '</b></div></div>' +
      '<div class="paverLogisticsAddon__vehicle"><div class="paverLogisticsAddon__vehicleTop"><div class="paverLogisticsAddon__vehicleName">' + esc(v.name || v.id) + '</div><div class="paverLogisticsAddon__trips">' + sel.trips + ' рейс(ов)</div></div><div class="paverLogisticsAddon__bars"><div class="paverLogisticsAddon__barRow"><span>Поддоны</span><div class="paverLogisticsAddon__bar"><i style="width:' + palPct + '%"></i></div><b>' + fmtPct(sel.pallet_utilization) + '</b></div><div class="paverLogisticsAddon__barRow"><span>Вес</span><div class="paverLogisticsAddon__bar ' + (sel.limiting === 'weight' ? 'paverLogisticsAddon__bar--warn' : '') + '"><i style="width:' + weightPct + '%"></i></div><b>' + fmtPct(sel.weight_utilization) + '</b></div></div></div>' +
      '<div class="paverLogisticsAddon__control"><select class="paverLogisticsAddon__select" data-role="paverLogisticsVehicleSelect">' + optsHtml + '</select><button type="button" class="paverLogisticsAddon__btn" data-role="paverLogisticsDetailsToggle">Варианты</button></div>' +
      '<div class="paverLogisticsAddon__hint">Вместимость за 1 рейс: плитка ' + sel.tile_capacity_per_trip + ' подд., бордюр ' + sel.curb_capacity_per_trip + ' подд.; грузоподъемность ' + fmtKg(sel.payload_kg) + '. Для смешанного заказа загрузка считается как сумма долей по типам.</div>' +
      '<div class="paverLogisticsAddon__details"><table class="paverLogisticsAddon__table"><thead><tr><th>Транспорт</th><th>Рейсы</th><th>Поддоны</th><th>Вес</th><th>Плитка/бордюр</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    var select = box.querySelector('[data-role="paverLogisticsVehicleSelect"]');
    if (select) select.onchange = function(){ selectedVehicleId = select.value || ''; try { sessionStorage.setItem('paver_logistics_addon_vehicle', selectedVehicleId); } catch(e) {} schedule(true); };
    var btn = box.querySelector('[data-role="paverLogisticsDetailsToggle"]');
    if (btn) btn.onclick = function(){ box.classList.toggle('is-open'); };
  }
  function schedule(force){
    if (timer && !force) return;
    clearTimeout(timer);
    timer = setTimeout(function(){ timer = null; try { render(); } catch(e) { console.error('[PaverLogisticsAddon] render failed', e); } }, force ? 20 : 160);
  }
  function bind(){
    ensureBox();
    if (!observer) {
      var r = root();
      if (r && window.MutationObserver) {
        try { observer = new MutationObserver(function(){ schedule(false); }); observer.observe(r, { childList:true, subtree:true, characterData:true, attributes:true }); } catch(e) {}
      }
    }
    if (!window.__PAVER_LOGISTICS_ADDON_EVENTS) {
      window.__PAVER_LOGISTICS_ADDON_EVENTS = true;
      ['click','input','change'].forEach(function(evt){ document.addEventListener(evt, function(){ setTimeout(function(){ schedule(true); }, 80); }, true); });
      setInterval(function(){ ensureBox(); schedule(false); }, 700);
    }
  }
  window.PaverLogisticsAddon = {
    version: VERSION,
    recalc: function(){ schedule(true); return lastResult || analyze(); },
    diagnose: function(){ var d = getPositions(); return { addon_version:VERSION, embed_version:window.__paverConfiguratorEmbedVersion || '', box:!!q('[data-role="paverLogisticsAddon"]'), source:d.source, positions:d.positions, result:lastResult || analyze() }; },
    getResult: function(){ return lastResult || analyze(); }
  };
  function start(){ bind(); schedule(true); setTimeout(function(){ schedule(true); }, 500); setTimeout(function(){ schedule(true); }, 1500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
