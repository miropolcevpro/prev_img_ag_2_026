
(function(){
  'use strict';

  const DEFAULT_CONFIG = {
    mountId: 'paverPriceAdmin',
    repoBase: 'https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/',
    publishEnabled: false,
    githubOwner: 'miropolcevpro',
    githubRepo: 'prev_img_ag_2_026',
    purgePaths: [
      'price_catalog.json',
      'admin_settings.json',
      'config/price_mapping.json',
      'config/logistics_rules.json',
      'admin/price-admin.js',
      'admin/price-admin.css',
      'paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js'
    ],
    files: {
      priceCatalog: 'price_catalog.json',
      adminSettings: 'admin_settings.json',
      priceMapping: 'config/price_mapping.json',
      logisticsRules: 'config/logistics_rules.json'
    },
    sheetJsUrl: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    warningChangePct: 30,
    criticalChangePct: 50
  };

  const state = {
    config: null,
    priceCatalog: null,
    adminSettings: null,
    priceMapping: null,
    logisticsRules: null,
    workbookRows: [],
    candidateCatalog: null,
    validation: null,
    activeTab: 'changes',
    logs: []
  };

  function log(msg){
    const time = new Date().toLocaleString('ru-RU');
    state.logs.unshift(`[${time}] ${msg}`);
    renderLog();
  }

  function norm(s){
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/ё/g,'е')
      .replace(/[^a-zа-я0-9]+/gi,' ')
      .trim()
      .replace(/\s+/g,' ');
  }
  function parseNum(v){
    if (v == null || v === '') return null;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    let s = String(v).replace(/\s+/g,'').replace(/₽|руб\.?/gi,'').replace(',', '.');
    s = s.replace(/[^0-9.\-]/g,'');
    if (!s || s === '-' || s === '.') return null;
    const n = Number(s);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
  }
  function money(n){ return n == null ? '—' : new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(n); }
  function pct(n){ return n == null ? '—' : `${Math.round(n*100)/100}%`; }
  function deepClone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function getBase(){
    const script = document.currentScript || Array.from(document.scripts).find(s => /price-admin\.js/.test(s.src));
    if (!script || !script.src) return '';
    return script.src.replace(/\/admin\/price-admin\.js.*$/, '/');
  }
  function assetUrl(path){
    const custom = window.PAVER_PRICE_ADMIN_CONFIG || {};
    const repoBase = custom.repoBase || DEFAULT_CONFIG.repoBase || getBase();
    return new URL(path, repoBase).toString() + `?t=${Date.now()}`;
  }

  function ensureCss(){
    if (document.querySelector('link[data-paver-admin-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('price-admin.css', (document.currentScript && document.currentScript.src) || location.href).toString().replace('/price-admin.js','/price-admin.css');
    link.dataset.paverAdminCss = '1';
    document.head.appendChild(link);
  }
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if (window.XLSX) return resolve();
      const s=document.createElement('script'); s.src=src; s.onload=resolve; s.onerror=()=>reject(new Error('Не удалось загрузить библиотеку XLSX'));
      document.head.appendChild(s);
    });
  }
  async function fetchJson(path){
    const res = await fetch(assetUrl(path), {cache:'no-store'});
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.json();
  }

  function flattenCatalog(catalog){
    const rows=[];
    if (!catalog) return rows;
    (catalog.pavers?.items || []).forEach(item => {
      (item.thickness || []).forEach(th => {
        rows.push({ sku:`paver::${item.id}::${th.mm}`, type:'paver', catalog_id:item.id, name:item.name, thickness_mm:th.mm, prices:th.prices||{}, packaging:th.packaging||{} });
      });
    });
    (catalog.curbstone?.items || []).forEach(item => {
      rows.push({ sku:`curbstone::${item.id}`, type:'curbstone', catalog_id:item.id, name:item.name, thickness_mm:null, prices:item.prices||{}, packaging:item.packaging||{} });
    });
    return rows;
  }

  function findItemBySku(catalog, sku){
    const [type,id,mm] = sku.split('::');
    if (type === 'paver') {
      const item = (catalog.pavers?.items || []).find(x => x.id === id);
      if (!item) return null;
      const th = (item.thickness || []).find(x => String(x.mm) === String(mm));
      return th ? {item, node: th, prices: th.prices || {}} : null;
    }
    if (type === 'curbstone') {
      const item = (catalog.curbstone?.items || []).find(x => x.id === id);
      return item ? {item, node: item, prices: item.prices || {}} : null;
    }
    return null;
  }

  function detectHeader(rows){
    const max = Math.min(rows.length, 30);
    const required = ['серый','цвет 1','цвет 2','колормикс'];
    let best = {idx:0, score:-1};
    for(let i=0;i<max;i++){
      const text = rows[i].map(norm).join(' | ');
      let score = required.reduce((a,x)=> a + (text.includes(x)?1:0), 0);
      if (/(наименование|название|форма|изделие|номенклатура)/.test(text)) score += 2;
      if (/(толщина|высота|мм)/.test(text)) score += 1;
      if (score > best.score) best = {idx:i, score};
    }
    return best.idx;
  }
  function rowsFromWorksheet(ws){
    const aoa = window.XLSX.utils.sheet_to_json(ws, {header:1, raw:false, defval:''});
    const headerIdx = detectHeader(aoa);
    const headers = aoa[headerIdx].map((h,i)=> String(h || `COL_${i}`).trim());
    const rows = [];
    for (let r=headerIdx+1; r<aoa.length; r++){
      const raw = aoa[r];
      const obj = {}; let nonEmpty=0;
      headers.forEach((h,i)=>{ obj[h] = raw[i] ?? ''; if(String(raw[i]??'').trim()) nonEmpty++; });
      if (nonEmpty) rows.push(obj);
    }
    return {headers, rows, headerIdx};
  }
  function pickColumn(headers, candidates){
    const norms = headers.map(h => ({h, n:norm(h)}));
    for (const c of candidates) {
      const nc = norm(c);
      const exact = norms.find(x => x.n === nc);
      if (exact) return exact.h;
    }
    for (const c of candidates) {
      const nc = norm(c);
      const partial = norms.find(x => x.n.includes(nc) || nc.includes(x.n));
      if (partial) return partial.h;
    }
    return null;
  }
  function makeColumnMap(headers, mapping){
    const priceCols = {};
    const configured = mapping?.columns?.prices || {};
    Object.entries(configured).forEach(([key, label]) => {
      priceCols[key] = pickColumn(headers, [label, key]);
    });
    return {
      name: pickColumn(headers, ['Наименование','Название','Форма','Изделие','Номенклатура','товар']),
      thickness: pickColumn(headers, ['Толщина','Высота','мм','Размер']),
      priceCols
    };
  }
  function rowMatchesMapping(row, colMap, item){
    const hay = norm(Object.values(row).join(' '));
    const nameText = norm(colMap.name ? row[colMap.name] : Object.values(row).slice(0,5).join(' '));
    const aliases = item.match?.aliases || [item.name, item.catalog_id].filter(Boolean);
    const aliasOk = aliases.some(a => nameText.includes(norm(a)) || hay.includes(norm(a)));
    if (!aliasOk) return false;
    const targetMm = item.match?.thickness_mm;
    if (targetMm == null) return true;
    const mmCandidate = colMap.thickness ? parseNum(row[colMap.thickness]) : null;
    if (mmCandidate != null && Math.abs(mmCandidate - Number(targetMm)) < 0.01) return true;
    return new RegExp(`(^|[^0-9])${String(targetMm)}([^0-9]|$)`).test(hay);
  }
  function extractPrices(row, colMap){
    const prices = {};
    Object.entries(colMap.priceCols).forEach(([key,col]) => {
      if (!col) return;
      const n = parseNum(row[col]);
      if (n != null) prices[key] = n;
    });
    return prices;
  }

  function buildCandidate(workbookRows, headers){
    const mapping = state.priceMapping;
    const oldCatalog = state.priceCatalog;
    const candidate = deepClone(oldCatalog);
    const report = {status:'passed', errors:[], warnings:[], changes:[], missing:[], unchanged:[], extras:[], metrics:{total:0, matched:0, changed:0, unchanged:0, errors:0, warnings:0}};
    const colMap = makeColumnMap(headers, mapping);
    if (!colMap.name) report.warnings.push({code:'NO_NAME_COLUMN', message:'Не найдена явная колонка с названием. Используется поиск по строке целиком.'});
    Object.entries(mapping?.columns?.prices || {}).forEach(([key,label])=>{ if(!colMap.priceCols[key]) report.warnings.push({code:'NO_PRICE_COLUMN', message:`Не найдена колонка цены: ${label} (${key})`}); });

    const usedRowIndexes = new Set();
    const items = mapping?.items || [];
    report.metrics.total = items.length;
    for (const m of items){
      const matches = [];
      workbookRows.forEach((row,idx)=>{ if(rowMatchesMapping(row,colMap,m)) matches.push({row,idx}); });
      if (!matches.length){
        const rec = {sku:m.sku, name:m.name, severity:m.required?'error':'warning', message:'Позиция не найдена в XLS'};
        if(m.required) report.errors.push(rec); else report.warnings.push(rec);
        report.missing.push(rec); continue;
      }
      if (matches.length > 1){
        report.warnings.push({sku:m.sku, name:m.name, code:'DUPLICATE_MATCH', message:`Найдено несколько строк: ${matches.length}. Использована первая.`});
      }
      const {row, idx} = matches[0]; usedRowIndexes.add(idx); report.metrics.matched++;
      const newPrices = extractPrices(row, colMap);
      const target = findItemBySku(candidate, m.sku);
      const oldTarget = findItemBySku(oldCatalog, m.sku);
      if (!target || !oldTarget){ report.errors.push({sku:m.sku, name:m.name, message:'SKU есть в mapping, но отсутствует в price_catalog.json'}); continue; }
      let rowChanged = false;
      Object.entries((mapping.columns && mapping.columns.prices) || {}).forEach(([priceKey]) => {
        const next = newPrices[priceKey];
        const old = oldTarget.prices[priceKey];
        if (next == null) {
          report.warnings.push({sku:m.sku, name:m.name, priceKey, message:`Пустая/нечисловая цена для ${priceKey}. Оставлена старая.`});
          return;
        }
        if (next <= 0) { report.errors.push({sku:m.sku, name:m.name, priceKey, message:`Некорректная цена ${next}`}); return; }
        const diff = old ? ((next - old) / old) * 100 : null;
        if (diff != null && Math.abs(diff) >= state.config.criticalChangePct) report.warnings.push({sku:m.sku, name:m.name, priceKey, old, next, diff_pct:diff, message:`Критически большое изменение цены: ${pct(diff)}`});
        else if (diff != null && Math.abs(diff) >= state.config.warningChangePct) report.warnings.push({sku:m.sku, name:m.name, priceKey, old, next, diff_pct:diff, message:`Сильное изменение цены: ${pct(diff)}`});
        if (old !== next) {
          target.prices[priceKey] = next; rowChanged = true;
          report.changes.push({sku:m.sku, name:m.name, priceKey, old, next, diff_pct:diff});
        }
      });
      if (rowChanged) report.metrics.changed++; else { report.metrics.unchanged++; report.unchanged.push({sku:m.sku,name:m.name}); }
    }
    workbookRows.forEach((row,idx)=>{ if(!usedRowIndexes.has(idx) && Object.values(row).join('').trim()) report.extras.push({row:idx+1, preview:Object.values(row).slice(0,6).join(' | ')}); });
    candidate.meta = candidate.meta || {};
    candidate.meta.generated_at = new Date().toISOString();
    candidate.meta.generated_by = 'paver-price-admin-step8';
    candidate.meta.logistics_status = candidate.meta.logistics_status || 'prepared_not_active';
    candidate.meta.source_file = state.currentFileName || 'uploaded.xlsx';
    report.metrics.errors = report.errors.length; report.metrics.warnings = report.warnings.length;
    report.status = report.errors.length ? 'failed' : (report.warnings.length ? 'warning' : 'passed');
    return {candidate, report, colMap};
  }

  function render(){
    const root = document.getElementById(state.config.mountId);
    if(!root) return;
    const v = state.validation;
    const statusClass = !v ? 'idle' : v.status === 'failed' ? 'err' : v.status === 'warning' ? 'warn' : 'ok';
    const statusText = !v ? 'Ожидание XLS' : v.status === 'failed' ? 'Есть ошибки' : v.status === 'warning' ? 'Можно публиковать с предупреждениями' : 'Можно публиковать';
    root.innerHTML = `
      <div class="paver-admin">
        <div class="pa-header">
          <div><h1 class="pa-title">Админка обновления цен</h1><div class="pa-muted">Загрузка XLS → проверка соответствий → подготовка файлов для GitHub Actions.</div></div>
          <div class="pa-status ${statusClass}">${statusText}</div>
        </div>
        <div class="pa-grid">
          <div class="pa-card pa-col-8">
            <h3>1. Загрузка актуального XLS-прайса</h3>
            <div class="pa-stack">
              <input class="pa-file" id="paFile" type="file" accept=".xls,.xlsx,.xlsm" />
              <div class="pa-row">
                <button class="pa-btn pa-btn-secondary" id="paReload">Перезагрузить базовые JSON</button>
                <button class="pa-btn" id="paDownloadCatalogTop" ${state.candidateCatalog?'':'disabled'}>Скачать price_catalog.generated.json</button>
                <button class="pa-btn pa-btn-secondary" id="paDownloadReportTop" ${v?'':'disabled'}>Скачать отчёт</button>
              </div>
              <div class="pa-muted">После успешной проверки скачайте подготовленные JSON и загрузите их в папку _admin_upload в GitHub. Публикация выполняется через GitHub Actions → Run workflow.</div>
            </div>
          </div>
          <div class="pa-card pa-col-4">
            <h3>Текущие данные</h3>
            <div class="pa-stack pa-muted">
              <div><b>Прайс:</b> ${escapeHtml(state.priceCatalog?.meta?.effective_from || '—')}</div>
              <div><b>Источник:</b> ${escapeHtml(state.priceCatalog?.meta?.source || '—')}</div>
              <div><b>Поддон:</b> ${money(state.adminSettings?.pallet?.empty_pallet_price)} ₽</div>
              <div><b>SKU в mapping:</b> ${(state.priceMapping?.items||[]).length}</div>
              <div><b>Логистика:</b> ${state.adminSettings?.logistics?.enabled ? 'включена' : 'подготовлена / выключена'}</div>
              <div><b>Правила логистики:</b> ${state.logisticsRules?.meta?.schema_version || '—'}</div>
            </div>
          </div>
          <div class="pa-card pa-col-12">
            <h3>2. Сводка валидации</h3>
            ${metricsHtml(v)}
          </div>
          <div class="pa-card pa-col-12">
            <h3>3. Детальный отчёт</h3>
            ${tabsHtml()}
            <div id="paTabContent">${tableHtml()}</div>
          </div>
          <div class="pa-card pa-col-6">
            <h3>4. Ручные параметры и логистика</h3>
            ${settingsHtml()}
          </div>
          <div class="pa-card pa-col-6">
            <h3>5. Публикация в GitHub</h3>
            ${publishHtml()}
          </div>
          <div class="pa-card pa-col-6">
            <h3>6. Журнал</h3>
            <div class="pa-log" id="paLog">${escapeHtml(state.logs.join('\n') || '—')}</div>
          </div>
        </div>
      </div>`;
    bind();
  }
  function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function metricsHtml(v){
    const m = v?.metrics || {total:0,matched:0,changed:0,unchanged:0,errors:0,warnings:0};
    return `<div class="pa-metrics">
      <div class="pa-metric"><span>Всего SKU</span><b>${m.total}</b></div><div class="pa-metric"><span>Найдено</span><b>${m.matched}</b></div><div class="pa-metric"><span>Изменено</span><b>${m.changed}</b></div><div class="pa-metric"><span>Без изменений</span><b>${m.unchanged}</b></div><div class="pa-metric"><span>Ошибки</span><b>${m.errors}</b></div><div class="pa-metric"><span>Предупреждения</span><b>${m.warnings}</b></div><div class="pa-metric"><span>Лишние строки</span><b>${(v?.extras||[]).length}</b></div><div class="pa-metric"><span>Статус</span><b>${v?escapeHtml(v.status):'—'}</b></div>
    </div>`;
  }
  function tabsHtml(){
    const tabs = [['changes','Изменения'],['errors','Ошибки'],['warnings','Предупреждения'],['missing','Не найдено'],['extras','Лишние строки']];
    return `<div class="pa-tabs">${tabs.map(([id,label])=>`<button class="pa-tab ${state.activeTab===id?'active':''}" data-tab="${id}">${label}</button>`).join('')}</div>`;
  }
  function tableHtml(){
    const v = state.validation; if(!v) return '<div class="pa-muted">Загрузите XLS, чтобы увидеть отчёт.</div>';
    const tab = state.activeTab;
    let rows = v[tab] || [];
    if(tab === 'changes') rows = v.changes || [];
    if(!rows.length) return '<div class="pa-muted">Нет записей.</div>';
    if(tab === 'changes') return `<div class="pa-table-wrap"><table class="pa-table"><thead><tr><th>SKU</th><th>Позиция</th><th>Поле</th><th>Старая</th><th>Новая</th><th>Изменение</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHtml(r.sku)}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.priceKey)}</td><td>${money(r.old)}</td><td>${money(r.next)}</td><td>${pct(r.diff_pct)}</td></tr>`).join('')}</tbody></table></div>`;
    if(tab === 'extras') return `<div class="pa-table-wrap"><table class="pa-table"><thead><tr><th>Строка</th><th>Превью</th></tr></thead><tbody>${rows.slice(0,300).map(r=>`<tr><td>${r.row}</td><td>${escapeHtml(r.preview)}</td></tr>`).join('')}</tbody></table></div>`;
    return `<div class="pa-table-wrap"><table class="pa-table"><thead><tr><th>Статус</th><th>SKU</th><th>Позиция</th><th>Поле</th><th>Сообщение</th></tr></thead><tbody>${rows.map(r=>`<tr><td><span class="pa-badge ${tab==='errors'?'err':'warn'}">${tab}</span></td><td>${escapeHtml(r.sku||'')}</td><td>${escapeHtml(r.name||'')}</td><td>${escapeHtml(r.priceKey||'')}</td><td>${escapeHtml(r.message||'')}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function publishHtml(){
    const canExport = state.candidateCatalog && state.validation && state.validation.status !== 'failed';
    const owner = state.config.githubOwner || 'miropolcevpro';
    const repo = state.config.githubRepo || 'prev_img_ag_2_026';
    const repoUrl = `https://github.com/${owner}/${repo}`;
    const uploadUrl = `${repoUrl}/tree/main/_admin_upload`;
    const actionsUrl = `${repoUrl}/actions/workflows/publish-prices.yml`;
    const rollbackUrl = `${repoUrl}/actions/workflows/rollback-prices.yml`;
    return `<div class="pa-stack">
      <div class="pa-notice">
        <b>Режим без backend / без Vercel.</b><br>
        Админка только готовит проверенные файлы. Публикация выполняется в GitHub Actions вручную через <b>Run workflow</b>. GitHub token не хранится в Tilda и не попадает во frontend.
      </div>
      <div class="pa-row">
        <button class="pa-btn" id="paDownloadCatalog" ${canExport?'':'disabled'}>Скачать price_catalog.generated.json</button>
        <button class="pa-btn pa-btn-secondary" id="paDownloadSettings" ${state.adminSettings?'':'disabled'}>Скачать admin_settings.generated.json</button>
        <button class="pa-btn pa-btn-secondary" id="paDownloadLogistics" ${state.logisticsRules?'':'disabled'}>Скачать logistics_rules.generated.json</button>
        <button class="pa-btn pa-btn-secondary" id="paDownloadReport" ${state.validation?'':'disabled'}>Скачать price_validation_report.json</button>
      </div>
      <ol class="pa-steps">
        <li>Скачайте 4 файла из админки.</li>
        <li>Откройте GitHub папку <code>_admin_upload</code> и загрузите туда файлы с указанными именами.</li>
        <li>Откройте GitHub Actions → <code>Publish prices from admin upload</code> → <b>Run workflow</b>.</li>
        <li>После успешного workflow откройте основную страницу Tilda и обновите версию <code>?v=...</code>, если нужно сбросить браузерный кэш.</li>
      </ol>
      <div class="pa-row">
        <a class="pa-btn pa-btn-secondary" href="${uploadUrl}" target="_blank" rel="noopener">Открыть _admin_upload</a>
        <a class="pa-btn" href="${actionsUrl}" target="_blank" rel="noopener">Открыть Publish workflow</a>
        <a class="pa-btn pa-btn-secondary" href="${rollbackUrl}" target="_blank" rel="noopener">Открыть Rollback workflow</a>
      </div>
      <div class="pa-muted">Если валидация показывает ошибки, публикация запрещена: workflow дополнительно проверит отчёт и остановится.</div>
    </div>`;
  }

  function settingsHtml(){
    const s = state.adminSettings || {};
    const l = state.logisticsRules || {};
    const logisticsEnabled = !!s.logistics?.enabled;
    return `<div class="pa-stack">
      <div class="pa-field"><label>Стоимость пустого поддона, ₽</label><input class="pa-input" id="paPalletPrice" type="number" step="0.01" value="${s.pallet?.empty_pallet_price ?? ''}"></div>
      <div class="pa-field"><label><input id="paLogisticsEnabled" type="checkbox" ${logisticsEnabled?'checked':''}> Включить логистику в будущем модуле</label><div class="pa-muted">Сейчас выключено: текущая калькуляция и Tilda payload не меняются.</div></div>
      <div class="pa-field"><label>admin_settings.json</label><textarea class="pa-textarea" id="paSettingsJson">${escapeHtml(JSON.stringify(s,null,2))}</textarea></div>
      <div class="pa-field"><label>config/logistics_rules.json</label><textarea class="pa-textarea" id="paLogisticsJson">${escapeHtml(JSON.stringify(l,null,2))}</textarea></div>
      <div class="pa-row"><button class="pa-btn pa-btn-secondary" id="paApplySettings">Применить локально</button><button class="pa-btn" id="paDownloadSettings">Скачать admin_settings.json</button><button class="pa-btn" id="paDownloadLogistics">Скачать logistics_rules.json</button></div>
    </div>`;
  }
  function bind(){
    document.getElementById('paFile')?.addEventListener('change', handleFile);
    document.getElementById('paReload')?.addEventListener('click', initLoad);
    document.getElementById('paDownloadCatalog')?.addEventListener('click', ()=>downloadJson('price_catalog.generated.json', state.candidateCatalog));
    document.getElementById('paDownloadCatalogTop')?.addEventListener('click', ()=>downloadJson('price_catalog.generated.json', state.candidateCatalog));
    document.getElementById('paDownloadReport')?.addEventListener('click', ()=>downloadJson('price_validation_report.json', state.validation));
    document.getElementById('paDownloadReportTop')?.addEventListener('click', ()=>downloadJson('price_validation_report.json', state.validation));
    document.getElementById('paDownloadSettings')?.addEventListener('click', ()=>downloadJson('admin_settings.generated.json', state.adminSettings));
    document.getElementById('paDownloadLogistics')?.addEventListener('click', ()=>downloadJson('logistics_rules.generated.json', state.logisticsRules));
    document.getElementById('paApplySettings')?.addEventListener('click', applySettings);
    document.querySelectorAll('.pa-tab').forEach(btn=>btn.addEventListener('click',()=>{state.activeTab=btn.dataset.tab; render();}));
  }
  function renderLog(){ const el=document.getElementById('paLog'); if(el) el.textContent = state.logs.join('\n') || '—'; }

  async function handleFile(e){
    const file = e.target.files && e.target.files[0]; if(!file) return;
    state.currentFileName = file.name;
    try{
      await loadScript(state.config.sheetJsUrl);
      const buf = await file.arrayBuffer();
      const wb = window.XLSX.read(buf, {type:'array'});
      const first = wb.SheetNames[0];
      const parsed = rowsFromWorksheet(wb.Sheets[first]);
      state.workbookRows = parsed.rows;
      const built = buildCandidate(parsed.rows, parsed.headers);
      state.candidateCatalog = built.candidate;
      state.validation = built.report;
      log(`XLS обработан: ${file.name}; лист: ${first}; строк: ${parsed.rows.length}; статус: ${built.report.status}`);
      render();
    }catch(err){
      state.validation = {status:'failed', errors:[{message:err.message}], warnings:[], changes:[], missing:[], extras:[], metrics:{total:0,matched:0,changed:0,unchanged:0,errors:1,warnings:0}};
      log(`Ошибка XLS: ${err.message}`); render();
    }
  }
  function applySettings(){
    try{
      const json = JSON.parse(document.getElementById('paSettingsJson').value);
      const logisticsJson = JSON.parse(document.getElementById('paLogisticsJson')?.value || '{}');
      const pallet = parseNum(document.getElementById('paPalletPrice').value);
      if (pallet != null) {
        json.pallet = json.pallet || {};
        json.pallet.empty_pallet_price = pallet;
      }
      json.logistics = json.logistics || {};
      json.logistics.enabled = !!document.getElementById('paLogisticsEnabled')?.checked;
      json.logistics.rules_file = json.logistics.rules_file || 'config/logistics_rules.json';
      json.meta = json.meta || {}; json.meta.updated_at = new Date().toISOString(); json.meta.updated_by = 'paver-price-admin-step8';
      logisticsJson.meta = logisticsJson.meta || {}; logisticsJson.meta.updated_at = new Date().toISOString(); logisticsJson.meta.updated_by = 'paver-price-admin-step8';
      state.adminSettings = json; state.logisticsRules = logisticsJson; log('Ручные параметры и логистические правила применены локально.'); render();
    }catch(err){ alert('admin_settings.json содержит ошибку JSON: '+err.message); }
  }
  function downloadJson(name, obj){
    if(!obj) return;
    const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json;charset=utf-8'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }

  async function initLoad(){
    try{
      log('Загрузка price_catalog.json, admin_settings.json, price_mapping.json, logistics_rules.json...');
      const files = state.config.files;
      const [pc, st, mp, lr] = await Promise.all([fetchJson(files.priceCatalog), fetchJson(files.adminSettings), fetchJson(files.priceMapping), fetchJson(files.logisticsRules).catch(()=>null)]);
      state.priceCatalog = pc; state.adminSettings = st; state.priceMapping = mp; state.logisticsRules = lr; state.candidateCatalog = null; state.validation = null;
      log('Базовые JSON успешно загружены.'); render();
    }catch(err){ log('Ошибка загрузки базовых JSON: '+err.message); render(); }
  }

  function init(){
    state.config = Object.assign({}, DEFAULT_CONFIG, window.PAVER_PRICE_ADMIN_CONFIG || {});
    state.config.files = Object.assign({}, DEFAULT_CONFIG.files, (window.PAVER_PRICE_ADMIN_CONFIG || {}).files || {});
    ensureCss();
    const root = document.getElementById(state.config.mountId);
    if(!root) return console.error('[PaverPriceAdmin] mount not found:', state.config.mountId);
    render(); initLoad();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
