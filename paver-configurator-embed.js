(async function(){
  const root = document.getElementById('paverConf2026');
  const CDN0 = (root.dataset.cdn || '').trim().replace(/\/?$/,'/');
  const ASSET_VER = (root.getAttribute('data-assets-ver') || 'de15d55');

  const FORMS_JSON  = 'forms.json';
  const PRICE_JSON  = 'price_catalog.json';
  const PALS = {
    stonemix: 'palettes_stonemix.json',
    colormix: 'palettes_colormix.json',
    mono:     'palettes_mono.json'
  };

  // ===== Inline fallback data (so configurator works even if CDN is cached/broken) =====
  const INLINE_DATA = {"forms":[{"id":"antika","name":"Антика","preview":"forms/antika/preview.webp","image":"forms/antika/image.webp"},{"id":"bruschatka","name":"Брусчатка","preview":"forms/bruschatka/preview.webp","image":"forms/bruschatka/image.webp"},{"id":"staryy_gorod","name":"Старый Город","preview":"forms/staryy_gorod/preview.webp","image":"forms/staryy_gorod/image.webp"},{"id":"klassika","name":"Классика","preview":"forms/klassika/preview.webp","image":"forms/klassika/image.webp"},{"id":"megapolis","name":"Мегаполис","preview":"forms/megapolis/preview.webp","image":"forms/megapolis/image.webp"},{"id":"novyy_gorod","name":"Новый город","preview":"forms/novyy_gorod/preview.webp","image":"forms/novyy_gorod/image.webp"},{"id":"paladio","name":"Паладио","preview":"forms/paladio/preview.webp","image":"forms/paladio/image.webp"},{"id":"poligonal","name":"Полигональ","preview":"forms/poligonal/preview.webp","image":"forms/poligonal/image.webp"},{"id":"promenad_i","name":"Променад I (40–60мм)","preview":"forms/promenad_i/preview.webp","image":"forms/promenad_i/image.webp"},{"id":"promenad_ii","name":"Променад  II","preview":"forms/promenad_ii/preview.webp","image":"forms/promenad_ii/image.webp"},{"id":"rigel","name":"Ригель","preview":"forms/rigel/preview.webp","image":"forms/rigel/image.webp"},{"id":"gazonnaya_reshetka","name":"Газонная Решетка","preview":"forms/gazonnaya_reshetka/preview.webp","image":"forms/gazonnaya_reshetka/image.webp"},{"id":"bordyur_sadovyy","name":"Бордюр садовый","preview":"forms/bordyur_sadovyy/preview.webp","image":"forms/bordyur_sadovyy/image.webp"},{"id":"bordyur_dorozhnyy","name":"Бордюр дорожный","preview":"forms/bordyur_dorozhnyy/preview.webp","image":"forms/bordyur_dorozhnyy/image.webp"}],"palettes":{"stonemix":{"tech":"stonemix","title":"StoneMix","size":[320,320],"format":"webp_lossless_transparentpad","colors":[{"id":"staryy_krym_grafit","name":"Старый Крым графит","file":"technologies/stonemix/colors/staryy_krym_grafit.webp"},{"id":"staryy_krym_cherno_belyy","name":"Старый Крым черно-белый","file":"technologies/stonemix/colors/staryy_krym_cherno_belyy.webp"},{"id":"novyy_svet","name":"Новый свет","file":"technologies/stonemix/colors/novyy_svet.webp"},{"id":"staryy_krym_temnyy","name":"Старый Крым темный","file":"technologies/stonemix/colors/staryy_krym_temnyy.webp"},{"id":"koktebel","name":"Коктебель","file":"technologies/stonemix/colors/koktebel.webp"},{"id":"kara_dag","name":"Кара-Даг","file":"technologies/stonemix/colors/kara_dag.webp"},{"id":"kalamit","name":"Каламит","file":"technologies/stonemix/colors/kalamit.webp"},{"id":"staryy_krym_belyy","name":"Старый Крым белый","file":"technologies/stonemix/colors/staryy_krym_belyy.webp"},{"id":"terrakot","name":"Терракот","file":"technologies/stonemix/colors/terrakot.webp"},{"id":"staryy_krym_chernyy","name":"Старый Крым черный","file":"technologies/stonemix/colors/staryy_krym_chernyy.webp"},{"id":"laspi","name":"Ласпи","file":"technologies/stonemix/colors/laspi.webp"},{"id":"kazantip","name":"Казантип","file":"technologies/stonemix/colors/kazantip.webp"},{"id":"neapol","name":"Неаполь","file":"technologies/stonemix/colors/neapol.webp"}]},"colormix":{"tech":"colormix","title":"ColorMix","colors":[{"tech":"colormix","index":1,"id":"ai_petri","name":"Ай-Петри","file":"technologies/colormix/colors/ai_petri.webp","mix_colors":2,"mix_label":"2 цвета"},{"tech":"colormix","index":2,"id":"ayu_dag","name":"Аю-Даг","file":"technologies/colormix/colors/ayu_dag.webp","mix_colors":2,"mix_label":"2 цвета"},{"tech":"colormix","index":3,"id":"gurzuf","name":"Гурзуф","file":"technologies/colormix/colors/gurzuf.webp","mix_colors":2,"mix_label":"2 цвета"},{"tech":"colormix","index":4,"id":"zolotye_vorota","name":"Золотые ворота","file":"technologies/colormix/colors/zolotye_vorota.webp","mix_colors":3,"mix_label":"3 цвета"},{"tech":"colormix","index":5,"id":"kara_dag","name":"Кара-Даг","file":"technologies/colormix/colors/kara_dag.webp","mix_colors":2,"mix_label":"2 цвета"},{"tech":"colormix","index":6,"id":"koktebel","name":"Коктебель","file":"technologies/colormix/colors/koktebel.webp","mix_colors":3,"mix_label":"3 цвета"},{"tech":"colormix","index":7,"id":"neapol","name":"Неаполь","file":"technologies/colormix/colors/neapol.webp","mix_colors":2,"mix_label":"2 цвета"},{"tech":"colormix","index":8,"id":"novyi_svet","name":"Новый свет","file":"technologies/colormix/colors/novyi_svet.webp","mix_colors":2,"mix_label":"2 цвета"},{"tech":"colormix","index":9,"id":"solnechnaya_dolina","name":"Солнечная долина","file":"technologies/colormix/colors/solnechnaya_dolina.webp","mix_colors":3,"mix_label":"3 цвета"},{"tech":"colormix","index":10,"id":"foros","name":"Форос","file":"technologies/colormix/colors/foros.webp","mix_colors":3,"mix_label":"3 цвета"},{"tech":"colormix","index":11,"id":"hersones","name":"Херсонес","file":"technologies/colormix/colors/hersones.webp","mix_colors":2,"mix_label":"2 цвета"}]},"mono":{"tech":"mono","title":"Однотонная","count":12,"colors":[{"id":"seryy","index":1,"name":"Серый","file":"technologies/mono/colors/seryy.webp"},{"id":"belyy","index":2,"name":"Белый","file":"technologies/mono/colors/belyy.webp"},{"id":"grafit","index":3,"name":"Графит","file":"technologies/mono/colors/grafit.webp"},{"id":"zheltyy_yarkiy","index":4,"name":"Желтый-яркий","file":"technologies/mono/colors/zheltyy_yarkiy.webp"},{"id":"zheltyy_gorchichnyy","index":5,"name":"Жёлтый (горчичный)","file":"technologies/mono/colors/zheltyy_gorchichnyy.webp"},{"id":"korichnevyy","index":6,"name":"Коричневый","file":"technologies/mono/colors/korichnevyy.webp"},{"id":"krasnyy_yarkiy","index":7,"name":"Красный яркий","file":"technologies/mono/colors/krasnyy_yarkiy.webp"},{"id":"krasnyy","index":8,"name":"Красный","file":"technologies/mono/colors/krasnyy.webp"},{"id":"svetlo_korichnevyy","index":9,"name":"Светло-коричневый","file":"technologies/mono/colors/svetlo_korichnevyy.webp"},{"id":"svetlo_seryy","index":10,"name":"Светло-серый","file":"technologies/mono/colors/svetlo_seryy.webp"},{"id":"terrakot","index":11,"name":"Терракот","file":"technologies/mono/colors/terrakot.webp"},{"id":"chernyy","index":12,"name":"Черный","file":"technologies/mono/colors/chernyy.webp"}]}},"technologies":[{"id":"mono","name":"Однотонная","palette":"palettes_mono.json"},{"id":"colormix","name":"ColorMix","palette":"palettes_colormix.json"},{"id":"stonemix","name":"StoneMix","palette":"palettes_stonemix.json"},{"id":"colormix_fakt","name":"Фактурный ColorMix","palette":"palettes_colormix.json"}],"price":{"meta":{"source":"РЕКОМЕНДОВАННЫЕ РОЗНИЧНЫЕ ЦЕНЫ ЗАВОДА «АКТИВ ГРУПП»","vat_percent":22,"effective_from":"2026-01-01","unit_note":"цены указаны без учета доставки и тары; продажа от 1 поддона (плитка) / от 1 поддона (камень бортовой)"},"pavers":{"unit":"m2","items":[{"id":"антика","name":"Антика","thickness":[{"mm":60,"prices":{"grey":1062.4515,"mono_color1":1238.3406,"mono_color2":1371.5283,"colormix_2":1688.7387,"colormix_3":1836.1602,"colormix_fakt":1892.0787,"stonemix":2624.1027},"packaging":{"pcs_per_pallet":"192 240 240 336 240","pcs_per_m2":"97,50 107,40 120,90 136,70 159,50","m2_per_pallet":10.2,"pallet_weight_kg":1400.0}}]},{"id":"брусчатка","name":"Брусчатка","thickness":[{"mm":80,"prices":{"grey":1188.5223,"mono_color1":1435.5804,"mono_color2":1647.054,"colormix_2":2054.7507,"colormix_3":2230.6398,"colormix_fakt":2286.5583,"stonemix":3046.0332},"packaging":{"pcs_per_pallet":432,"pcs_per_m2":50,"m2_per_pallet":8.64,"pallet_weight_kg":1610.0}}]},{"id":"газонная_решетка","name":"Газонная решетка","thickness":[{"mm":80,"prices":{"grey":1315.6098,"mono_color1":1554.5343,"mono_color2":"по запросу","colormix_2":"по запросу","colormix_3":"по запросу","colormix_fakt":"по запросу","stonemix":"-"},"packaging":{"pcs_per_pallet":40,"pcs_per_m2":4.17,"m2_per_pallet":9.6,"pallet_weight_kg":1070.0}}]},{"id":"классика","name":"Классика","thickness":[{"mm":60,"prices":{"grey":978.0654,"mono_color1":1168.1883,"mono_color2":1294.2591,"colormix_2":1547.4174,"colormix_3":1660.2711,"colormix_fakt":1808.7093,"stonemix":2392.2951},"packaging":{"pcs_per_pallet":840,"pcs_per_m2":75.06,"m2_per_pallet":11.2,"pallet_weight_kg":1430.0}}]},{"id":"мегаполис","name":"Мегаполис","thickness":[{"mm":80,"prices":{"grey":1554.5343,"mono_color1":1681.6218,"mono_color2":1885.9785,"colormix_2":2413.6458,"colormix_3":2561.0673,"colormix_fakt":2645.4534,"stonemix":3349.0098},"packaging":{"pcs_per_pallet":40,"pcs_per_m2":5.555555555555556,"m2_per_pallet":7.2,"pallet_weight_kg":1300.0}}]},{"id":"новый_город","name":"Новый город","thickness":[{"mm":40,"prices":{"grey":766.5918,"mono_color1":900.7962,"mono_color2":992.2992,"colormix_2":1210.8897,"colormix_3":1301.376,"colormix_fakt":1414.2297,"stonemix":1730.4234},"packaging":{"pcs_per_pallet":"160 160 160","pcs_per_m2":"39,06 31,25 26,04","m2_per_pallet":15.36,"pallet_weight_kg":1475.0}},{"mm":60,"prices":{"grey":970.9485,"mono_color1":1168.1883,"mono_color2":1273.9251,"colormix_2":1576.9017,"colormix_3":1744.6572,"colormix_fakt":1780.2417,"stonemix":2336.3766},"packaging":{"pcs_per_pallet":"120 120 120","pcs_per_m2":"39,06 31,25 26,04","m2_per_pallet":11.52,"pallet_weight_kg":1560.0}},{"mm":80,"prices":{"grey":1188.5223,"mono_color1":1435.5804,"mono_color2":1647.054,"colormix_2":2054.7507,"colormix_3":2230.6398,"colormix_fakt":2286.5583,"stonemix":3046.0332},"packaging":{"pcs_per_pallet":"90 90 90","pcs_per_m2":"39.06 31.25 26.04","m2_per_pallet":8.64,"pallet_weight_kg":1610.0}}]},{"id":"палладио","name":"Палладио","thickness":[{"mm":80,"prices":{"grey":1188.5223,"mono_color1":1435.5804,"mono_color2":1647.054,"colormix_2":2054.7507,"colormix_3":2230.6398,"colormix_fakt":2286.5583,"stonemix":3046.0332},"packaging":{"pcs_per_pallet":108,"pcs_per_m2":12.5,"m2_per_pallet":8.64,"pallet_weight_kg":1610.0}}]},{"id":"полигональ","name":"Полигональ","thickness":[{"mm":60,"prices":{"grey":1464.048,"mono_color1":1600.2858,"mono_color2":1741.6071,"colormix_2":2257.074,"colormix_3":2400.4287,"colormix_fakt":2503.1154,"stonemix":3037.8996},"packaging":{"pcs_per_pallet":"12 12 12 12 12 12","pcs_per_m2":"9,92 10,03 17,35 11,50 11,42 8,23","m2_per_pallet":6.65,"pallet_weight_kg":930.0}}]},{"id":"променад_i","name":"Променад I","thickness":[{"mm":40,"prices":{"grey":766.5918,"mono_color1":900.7962,"mono_color2":992.2992,"colormix_2":1210.8897,"colormix_3":1301.376,"colormix_fakt":1414.2297,"stonemix":1730.4234},"packaging":{"pcs_per_pallet":768,"pcs_per_m2":50,"m2_per_pallet":15.36,"pallet_weight_kg":1475.0}},{"mm":60,"prices":{"grey":970.9485,"mono_color1":1168.1883,"mono_color2":1273.9251,"colormix_2":1576.9017,"colormix_3":1744.6572,"colormix_fakt":1780.2417,"stonemix":2336.3766},"packaging":{"pcs_per_pallet":576,"pcs_per_m2":50,"m2_per_pallet":11.52,"pallet_weight_kg":1560.0}}]},{"id":"променад_ii","name":"Променад II","thickness":[{"mm":40,"prices":{"grey":766.5918,"mono_color1":900.7962,"mono_color2":992.2992,"colormix_2":1210.8897,"colormix_3":1301.376,"colormix_fakt":1414.2297,"stonemix":1730.4234},"packaging":{"pcs_per_pallet":"168 112","pcs_per_m2":"25 16,7","m2_per_pallet":13.44,"pallet_weight_kg":1290.0}},{"mm":60,"prices":{"grey":970.9485,"mono_color1":1168.1883,"mono_color2":1273.9251,"colormix_2":1576.9017,"colormix_3":1744.6572,"colormix_fakt":1780.2417,"stonemix":2336.3766},"packaging":{"pcs_per_pallet":"144 96","pcs_per_m2":"25 16,7","m2_per_pallet":11.52,"pallet_weight_kg":1560.0}}]},{"id":"ригель","name":"Ригель","thickness":[{"mm":60,"prices":{"grey":970.9485,"mono_color1":1168.1883,"mono_color2":1273.9251,"colormix_2":1576.9017,"colormix_3":1744.6572,"colormix_fakt":1780.2417,"stonemix":2336.3766},"packaging":{"pcs_per_pallet":384,"pcs_per_m2":33.33,"m2_per_pallet":11.52,"pallet_weight_kg":1560.0}}]},{"id":"старый_город","name":"Старый город","thickness":[{"mm":60,"prices":{"grey":1005.5163,"mono_color1":1203.7728,"mono_color2":1322.7267,"colormix_2":1611.4695,"colormix_3":1695.8556,"colormix_fakt":1850.394,"stonemix":2462.4474},"packaging":{"pcs_per_pallet":"180 252 252","pcs_per_m2":"138,89 69,44 46,29","m2_per_pallet":10.37,"pallet_weight_kg":1370.0}}]}]},"curbstone":{"unit":"piece","items":[{"id":"бр_100.20.8_1000х200х80","name":"БР 100.20.8 1000х200х80","width_mm":80,"prices":{"grey":331.4442,"mono_color1":471.7488,"mono_color2":485.9826,"colormix_2":527.6673,"colormix_3":556.1349,"colormix_fakt":583.5858,"stonemix":619.1703},"packaging":{"pcs_per_pallet":36,"pallet_weight_kg":1340.0}},{"id":"бр_100.30.15_1000х300х150","name":"БР 100.30.15 1000х300х150","width_mm":150,"prices":{"grey":752.358,"mono_color1":"по запросу","mono_color2":"по запросу","colormix_2":"по запросу","colormix_3":"по запросу","colormix_fakt":"-","stonemix":"-"},"packaging":{"pcs_per_pallet":15,"pallet_weight_kg":1500.0}},{"id":"бр_100.30.18_1000х300х180","name":"БР 100.30.18 1000х300х180","width_mm":180,"prices":{"grey":844.8777,"mono_color1":"по запросу","mono_color2":"по запросу","colormix_2":"по запросу","colormix_3":"по запросу","colormix_fakt":"-","stonemix":"-"},"packaging":{"pcs_per_pallet":12,"pallet_weight_kg":1450.0}}]},"pricing_columns":{"grey":"Серый","mono_color1":"Цвет 1*","mono_color2":"Цвет 2*","colormix_2":"Колормикс (2 цвета)","colormix_3":"Колормикс (3 цвета)","colormix_fakt":"Фактурный колормикс","stonemix":"Стоунмикс"},"mono_color_groups":{"color1_names":["красный","черный","графит","светло-серый","жёлтый (горчичный)","коричневый","светло-коричневый","терракот"],"color2_names":["белый","желтый-яркий"],"grey_name":["серый"]}}};
  function hasPackagingInPrice(pr){
    try{
      var items = (pr && pr.pavers && pr.pavers.items) ? pr.pavers.items : [];
      for (var i=0;i<items.length;i++){
        var it = items[i];
        var th = it && it.thickness ? it.thickness : [];
        for (var j=0;j<th.length;j++){
          var t = th[j];
          var p = t && t.packaging ? t.packaging : null;
          if (p && (toNum(p.m2_per_pallet)>0 || toNum(p.pallet_weight_kg)>0)) return true;
        }
      }
      var citems = (pr && pr.curbstone && pr.curbstone.items) ? pr.curbstone.items : [];
      for (var k=0;k<citems.length;k++){
        var cit = citems[k];
        var cp = cit && cit.packaging ? cit.packaging : null;
        if (cp && (toNum(cp.pcs_per_pallet)>0 || toNum(cp.pallet_weight_kg)>0)) return true;
      }
      return false;
    }catch(e){ return false; }
  }

  function curbLmPerPallet(formId, sizeKey){
    // Fixed business rules (пог. м в 1 поддоне) for curbstone
    if (formId === 'bordyur_sadovyy') return 36;
    if (formId === 'bordyur_dorozhnyy'){
      var k = String(sizeKey || '');
      if (k.indexOf('100.30.18') !== -1 || k.indexOf('300х180') !== -1 || k.indexOf('300x180') !== -1) return 12;
      return 15; // 1000×300×150
    }
    return 0;
  }

    // Curbstone: пог. м в 1 поддоне (задаём жёстко по ТЗ)
  var CURB_LM_PER_PALLET = {
    'бр_100.20.8_1000х200х80': 36,
    'бр_100.30.18_1000х300х180': 12,
    'бр_100.30.15_1000х300х150': 15
  };
  if (typeof CURB_LM_PER_PALLET === 'undefined' || !CURB_LM_PER_PALLET) CURB_LM_PER_PALLET = {};


const CURB_FORM_MAP = {
    bordyur_sadovyy: ["бр_100.20.8_1000х200х80"],
    bordyur_dorozhnyy: ["бр_100.30.15_1000х300х150", "бр_100.30.18_1000х300х180"]
  };

  function isCurbForm(formObj){
    return !!(formObj && CURB_FORM_MAP[formObj.id]);
  }

  function parseDimsFromName(s){
    const m = String(s||'').match(/(\d+)\s*[хx]\s*(\d+)\s*[хx]\s*(\d+)/i);
    if(!m) return null;
    return { L: Number(m[1]), H: Number(m[2]), W: Number(m[3]) };
  }

  function fmtDims(d){
    if(!d) return '';
    return `${d.L}×${d.H}×${d.W} мм`;
  }

  const FORM_ID_MAP = {
    antika: 'антика',
    bruschatka: 'брусчатка',
    gazonnaya_reshetka: 'газонная_решетка',
    klassika: 'классика',
    megapolis: 'мегаполис',
    novyy_gorod: 'новый_город',
    paladio: 'палладио',
    poligonal: 'полигональ',
    promenad_i: 'променад_i',
    promenad_ii: 'променад_ii',
    rigel: 'ригель',
    staryy_gorod: 'старый_город'
  };

  const COLORMIX_3 = new Set(['форос','золотые ворота','коктебель','солнечная долина'].map(s=>s.toLowerCase().replace(/ё/g,'е')));

  const elForms   = root.querySelector('[data-role="forms"]');
  const elTechTabs= root.querySelector('[data-role="techTabs"]');
  const elTechHint= root.querySelector('[data-role="techHint"]');
  const elColors  = root.querySelector('[data-role="colors"]');
  const elPicked  = root.querySelector('[data-role="picked"]');
  const elStatus  = root.querySelector('[data-role="status"]');
  const elThTabs  = root.querySelector('[data-role="thicknessTabs"]');
  const elThWrap  = root.querySelector('[data-role="thicknessWrap"]');
  const elQty     = root.querySelector('[data-role="qty"]');

  const elUnit    = root.querySelector('[data-role="unitPrice"]');
  const elTotal   = root.querySelector('[data-role="totalPrice"]');
  const elThLabel = root.querySelector('[data-role="thLabel"]');

  const elM2Pal   = root.querySelector('[data-role="m2Pallet"]');
  const elWPal    = root.querySelector('[data-role="wPallet"]');
  const elPallets = root.querySelector('[data-role="pallets"]');
  const elShipM2  = root.querySelector('[data-role="shipM2"]');
  const elOverM2  = root.querySelector('[data-role="overM2"]');
  const elShipW   = root.querySelector('[data-role="shipW"]');

  const elPalCostOne   = root.querySelector('[data-role="palletCostOne"]');
  const elPalCostTotal = root.querySelector('[data-role="palletCostTotal"]');
  const elGrandTotal   = root.querySelector('[data-role="grandTotal"]');

  // Cart DOM
  const elCartList = root.querySelector('[data-role="cartList"]');
  const elCartGrand = root.querySelector('[data-role="cartGrand"]');
  const elCartAddBtn = root.querySelector('[data-role="cartAddBtn"]');
  const elCartEmpty = root.querySelector('[data-role="cartEmpty"]');
  const elCartFooter = root.querySelector('[data-role=\"cartFooter\"]');
  const elPreviewBody = root.querySelector('[data-role="previewBody"]');
  const elCartTitle = root.querySelector('[data-role="cartTitle"]');

  const elMoreBtn   = root.querySelector('[data-role="moreBtn"]');
  const elMorePanel = root.querySelector('[data-role="morePanel"]');
  if (elMoreBtn && elMorePanel){
    const chev = elMoreBtn.querySelector('.pcCalc__chev');
    elMoreBtn.addEventListener('click', ()=>{
      const isOpen = !elMorePanel.hasAttribute('hidden');
      if (isOpen){
        elMorePanel.setAttribute('hidden','');
        elMoreBtn.setAttribute('aria-expanded','false');
        if (chev) chev.textContent = '▾';
      }else{
        elMorePanel.removeAttribute('hidden');
        elMoreBtn.setAttribute('aria-expanded','true');
        if (chev) chev.textContent = '▴';
      }
    });
  }

    var lastCalcResult = null;
const state = {
    forms: [],
    price: null,
    palettes: { stonemix:null, colormix:null, mono:null },

    form: null,
    tech: { id:'colormix', name:'ColorMix' },
    color: null,
    thickness: null
  };



  const FORM_PREVIEW_IMAGE_MAP = {
    antika: 'forms2/antika.webp',
    bruschatka: 'forms2/bruschatka.webp',
    gazonnaya_reshetka: 'forms2/gazon_reshetka.webp',
    klassika: 'forms2/klassika.webp',
    megapolis: 'forms2/megalopolis.webp',
    novyy_gorod: 'forms2/new_gorod.webp',
    paladio: 'forms2/palladio.webp',
    poligonal: 'forms2/poligonal.webp',
    promenad_i: 'forms2/promenad1.webp',
    promenad_ii: 'forms2/promenad2.webp',
    rigel: 'forms2/rigel.webp',
    staryy_gorod: 'forms2/stary_gorod.webp',
    bordyur_sadovyy: 'curb_preview/bordyur_sadovyy.webp',
    bordyur_dorozhnyy: 'curb_preview/bordyur_dorozhnyy.webp'
  };
  const STONEMIX_PREVIEW_IMAGE_MAP = {
    staryy_krym_grafit: 'stonemix_preview/staryy_krym_grafit.webp',
    staryy_krym_cherno_belyy: 'stonemix_preview/staryy_krym_cherno_belyy.webp',
    novyy_svet: 'stonemix_preview/novyy_svet.webp',
    staryy_krym_temnyy: 'stonemix_preview/staryy_krym_temnyy.webp',
    koktebel: 'stonemix_preview/koktebel.webp',
    kara_dag: 'stonemix_preview/kara_dag.webp',
    kalamit: 'stonemix_preview/kalamit.webp',
    staryy_krym_belyy: 'stonemix_preview/staryy_krym_belyy.webp',
    terrakot: 'stonemix_preview/terrakot.webp',
    staryy_krym_chernyy: 'stonemix_preview/staryy_krym_chernyy.webp',
    laspi: 'stonemix_preview/laspi.webp',
    kazantip: 'stonemix_preview/kazantip.webp',
    neapol: 'stonemix_preview/neapol.webp'
  };
  const COLORMIX_PREVIEW_IMAGE_MAP = {
    ai_petri: 'colormix_preview/ai_petri.webp',
    ayu_dag: 'colormix_preview/ayu_dag.webp',
    gurzuf: 'colormix_preview/gurzuf.webp',
    zolotye_vorota: 'colormix_preview/zolotye_vorota.webp',
    kara_dag: 'colormix_preview/kara_dag.webp',
    koktebel: 'colormix_preview/koktebel.webp',
    neapol: 'colormix_preview/neapol.webp',
    novyi_svet: 'colormix_preview/novyi_svet.webp',
    solnechnaya_dolina: 'colormix_preview/solnechnaya_dolina.webp',
    foros: 'colormix_preview/foros.webp',
    hersones: 'colormix_preview/hersones.webp'
  };
  const MONO_PREVIEW_IMAGE = 'mono_preview/mono.webp';

  const elFormPreview = root.querySelector('[data-role="formPreview"]');
  const elFormPreviewBtn = root.querySelector('[data-role="formPreviewBtn"]');
  const elFormPreviewImg = root.querySelector('[data-role="formPreviewImg"]');
  const elFormPreviewCaption = root.querySelector('[data-role="formPreviewCaption"]');
  const elColorPreview = root.querySelector('[data-role="colorPreview"]');
  const elColorPreviewBtn = root.querySelector('[data-role="colorPreviewBtn"]');
  const elColorPreviewImg = root.querySelector('[data-role="colorPreviewImg"]');
  const elColorPreviewCaption = root.querySelector('[data-role="colorPreviewCaption"]');
  const elFormLightbox = document.querySelector('[data-role="formLightbox"]');
  const elFormLightboxImg = document.querySelector('[data-role="formLightboxImg"]');
  const elFormLightboxClose = document.querySelector('[data-role="formLightboxClose"]');
  const elFormLightboxPrev = document.querySelector('[data-role="formLightboxPrev"]');
  const elFormLightboxNext = document.querySelector('[data-role="formLightboxNext"]');
  const elFormLightboxCounter = document.querySelector('[data-role="formLightboxCounter"]');
  const elMbarPreview = document.querySelector('[data-role="mbarPreview"]');
  const elMbarFormPreviewBtn = document.querySelector('[data-role="mbarFormPreviewBtn"]');
  const elMbarFormPreviewImg = document.querySelector('[data-role="mbarFormPreviewImg"]');
  const elMbarColorPreviewBtn = document.querySelector('[data-role="mbarColorPreviewBtn"]');
  const elMbarColorPreviewImg = document.querySelector('[data-role="mbarColorPreviewImg"]');

  const previewGalleryState = {
    form: { items: [], index: 0 },
    color: { items: [], index: 0 }
  };
  let activeLightboxKind = null;


  (function injectLightboxArrowLayoutStyles(){
    try{
      if (document.getElementById('pcLightboxArrowLayoutStyles')) return;
      var css = '' +
        '[data-role="formLightbox"]{position:fixed;}' +
        '[data-role="formLightboxPrev"],[data-role="formLightboxNext"]{' +
          'position:fixed !important;' +
          'top:50% !important;' +
          'transform:translateY(-50%) !important;' +
          'z-index:10002 !important;' +
          'width:44px !important;height:44px !important;' +
          'border-radius:999px !important;' +
          'display:flex !important;align-items:center !important;justify-content:center !important;' +
        '}' +
        '[data-role="formLightboxPrev"]{left:12px !important;right:auto !important;}' +
        '[data-role="formLightboxNext"]{right:12px !important;left:auto !important;}' +
        '@media (max-width: 980px){' +
          '[data-role="formLightboxPrev"],[data-role="formLightboxNext"]{' +
            'top:auto !important;bottom:calc(14px + env(safe-area-inset-bottom,0px)) !important;' +
            'transform:none !important;' +
            'width:38px !important;height:38px !important;' +
          '}' +
          '[data-role="formLightboxPrev"]{left:calc(50% - 52px) !important;right:auto !important;}' +
          '[data-role="formLightboxNext"]{left:calc(50% + 14px) !important;right:auto !important;}' +
          '[data-role="formLightboxCounter"]{bottom:calc(64px + env(safe-area-inset-bottom,0px)) !important;}' +
          '[data-role="formLightboxImg"]{max-height:calc(100vh - 120px) !important;}' +
        '}';
      var style = document.createElement('style');
      style.id = 'pcLightboxArrowLayoutStyles';
      style.textContent = css;
      document.head.appendChild(style);
    } catch(e) {}
  })();

  function formPreviewSrcFor(formObj){
    if (!formObj || !formObj.id) return '';
    const rel = FORM_PREVIEW_IMAGE_MAP[formObj.id];
    return rel ? absUrl(rel) : '';
  }

  function colorPreviewSrcFor(colorObj, techObj){
    if (!colorObj || !techObj) return '';
    const techId = String(techObj.id || '');
    let rel = '';
    if (techId === 'stonemix') rel = STONEMIX_PREVIEW_IMAGE_MAP[colorObj.id] || '';
    else if (techId === 'colormix' || techId === 'colormix_fakt') rel = COLORMIX_PREVIEW_IMAGE_MAP[colorObj.id] || '';
    else if (techId === 'mono') rel = MONO_PREVIEW_IMAGE;
    return rel ? absUrl(rel) : '';
  }

  function uniquePreviewItems(list){
    const out = [];
    const seen = new Set();
    (list || []).forEach(function(item){
      if (!item || !item.src) return;
      if (seen.has(item.src)) return;
      seen.add(item.src);
      out.push(item);
    });
    return out;
  }

  function formPreviewItemsFor(formObj){
    if (!formObj) return [];
    return uniquePreviewItems([
      { src: formPreviewSrcFor(formObj), title: cleanText(formObj && (formObj.name || formObj.id) || '') },
      { src: absUrl(formObj.preview || formObj.image || ''), title: cleanText(formObj && (formObj.name || formObj.id) || '') }
    ]);
  }

  function colorPreviewItemsFor(colorObj, techObj){
    if (!colorObj || !techObj) return [];
    return uniquePreviewItems([
      { src: colorPreviewSrcFor(colorObj, techObj), title: cleanText(colorObj && (colorObj.name || colorObj.id) || '') },
      { src: absUrl(colorObj.file || colorObj.img || colorObj.preview || ''), title: cleanText(colorObj && (colorObj.name || colorObj.id) || '') }
    ]);
  }

  function setPreviewEmpty(wrapEl, imgEl, captionEl, btnEl, caption){
    if (!wrapEl || !imgEl || !captionEl) return;
    wrapEl.classList.add('is-empty');
    if (btnEl) btnEl.classList.remove('has-gallery');
    imgEl.removeAttribute('src');
    imgEl.alt = '';
    captionEl.textContent = caption;
    if (btnEl) btnEl.disabled = true;
    var mobileBtn = (wrapEl === elFormPreview) ? elMbarFormPreviewBtn : elMbarColorPreviewBtn;
    var mobileImg = (wrapEl === elFormPreview) ? elMbarFormPreviewImg : elMbarColorPreviewImg;
    if (mobileBtn) mobileBtn.classList.add('is-empty');
    if (mobileBtn) mobileBtn.disabled = true;
    if (mobileImg){ mobileImg.removeAttribute('src'); mobileImg.alt = ''; }
  }

  function renderPreviewGallery(kind, opts){
    const st = previewGalleryState[kind];
    if (!st) return;
    st.items = (opts && opts.items) || [];
    st.index = 0;

    const isForm = kind === 'form';
    const wrapEl = isForm ? elFormPreview : elColorPreview;
    const imgEl = isForm ? elFormPreviewImg : elColorPreviewImg;
    const captionEl = isForm ? elFormPreviewCaption : elColorPreviewCaption;
    const btnEl = isForm ? elFormPreviewBtn : elColorPreviewBtn;
    const fallbackCaption = (opts && opts.fallbackCaption) || '';

    if (!st.items.length){
      setPreviewEmpty(wrapEl, imgEl, captionEl, btnEl, fallbackCaption);
      return;
    }

    function paint(){
      const current = st.items[st.index] || st.items[0];
      wrapEl.classList.remove('is-empty');
      if (btnEl) btnEl.disabled = false;
      imgEl.src = current.src;
      imgEl.alt = current.title || '';
      captionEl.textContent = current.title || fallbackCaption;
      if (btnEl) btnEl.classList.toggle('has-gallery', st.items.length > 1);
      var mobileBtn = isForm ? elMbarFormPreviewBtn : elMbarColorPreviewBtn;
      var mobileImg = isForm ? elMbarFormPreviewImg : elMbarColorPreviewImg;
      if (mobileBtn){ mobileBtn.disabled = false; mobileBtn.classList.remove('is-empty'); }
      if (mobileImg){ mobileImg.src = current.src; mobileImg.alt = current.title || ''; }
      if (activeLightboxKind === kind) paintLightbox();
    }

    st.paint = paint;
    paint();
  }

  function stepPreviewGallery(kind, step){
    const st = previewGalleryState[kind];
    if (!st || !st.items || st.items.length < 2) return;
    st.index = (st.index + step + st.items.length) % st.items.length;
    if (typeof st.paint === 'function') st.paint();
  }

  function paintLightbox(){
    if (!activeLightboxKind || !elFormLightboxImg) return;
    const st = previewGalleryState[activeLightboxKind];
    if (!st || !st.items || !st.items.length) return;
    const current = st.items[st.index] || st.items[0];
    elFormLightboxImg.src = current.src;
    elFormLightboxImg.alt = current.title || '';
    const hasGallery = st.items.length > 1;
    if (elFormLightboxPrev) elFormLightboxPrev.disabled = !hasGallery;
    if (elFormLightboxNext) elFormLightboxNext.disabled = !hasGallery;
    if (elFormLightboxCounter){
      elFormLightboxCounter.style.display = hasGallery ? '' : 'none';
      elFormLightboxCounter.textContent = hasGallery ? ((st.index + 1) + ' / ' + st.items.length) : '';
    }
  }
  function setEmptyFormPreview(){
    renderPreviewGallery('form', { items: [], fallbackCaption: 'Выберите форму' });
  }

  function setEmptyColorPreview(){
    renderPreviewGallery('color', { items: [], fallbackCaption: 'Выберите цвет' });
  }

  function updateFormPreview(formObj){
    renderPreviewGallery('form', {
      items: formPreviewItemsFor(formObj),
      fallbackCaption: 'Выбранная форма'
    });
  }

  function updateColorPreview(colorObj, techObj){
    renderPreviewGallery('color', {
      items: colorPreviewItemsFor(colorObj, techObj),
      fallbackCaption: 'Выбранный цвет'
    });
  }

  function syncChoicePreviews(){
    updateFormPreview(state.form);
    updateColorPreview(state.color, state.tech);
  }

  function openFormLightbox(kind){
    const st = previewGalleryState[kind];
    if (!elFormLightbox || !elFormLightboxImg || !st || !st.items || !st.items.length) return;
    activeLightboxKind = kind;
    paintLightbox();
    elFormLightbox.classList.add('is-open');
    elFormLightbox.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeFormLightbox(){
    if (!elFormLightbox) return;
    activeLightboxKind = null;
    elFormLightbox.classList.remove('is-open');
    elFormLightbox.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }

  const EMPTY_PALLET_PRICE = 457.50;

  function status(t){ elStatus.textContent = t || ''; }

  function cleanText(s){
    if (s == null) return '';
    const str = String(s);
    try { return str.normalize('NFC').trim(); } catch(e) { return str.trim(); }
  }

  function normName(s){
    return cleanText(s).toLowerCase().replace(/\s+/g,' ').replace(/ё/g,'е');
  }

  function absUrl(rel){
    if (!rel) return '';
    if (/^https?:\/\//i.test(rel)) return rel;
    return CDN0 + rel.replace(/^\//,'');
  }

  async function fetchJson(url){
    const r = await fetch(url, { cache:'no-store' });
    if (!r.ok) throw new Error(url + ' -> ' + r.status);
    return await r.json();
  }

  function fmtRub(n){
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ₽';
  }
  function fmtRub2(n){
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' ₽';
  }
  function fmtNum(n, digits=2){
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  }

  function toNum(x){
    if (x === null || x === undefined) return 0;
    if (typeof x === 'number') return isFinite(x) ? x : 0;
    // strings like "1 234,56" or "10,2" or "10.2"
    let s = String(x).trim();
    if (!s) return 0;
    s = s.replace(/\s+/g,'');
    s = s.replace(',', '.');
    // keep digits, dot, minus
    s = s.replace(/[^0-9.\-]/g,'');
    const n = Number(s);
    return isFinite(n) ? n : 0;
  }

function setPackWarning(msg){
    var el = document.querySelector('[data-role="packWarning"]');
    if (!el) return;
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }

  function fillOrderFields(payload){
    var form = document.querySelector('.paverConf2026__leadForm form') || document.querySelector('form');
    if (!form || !payload) return;

    function setVal(name, val){
      var inp = form.querySelector('[name="' + name + '"]');
      if (!inp) return;
      inp.value = (val === null || val === undefined) ? '' : String(val);
    }

    setVal('order_form', payload.form_name);
    setVal('order_technology', payload.technology_label);
    setVal('order_color', payload.color_name);
    setVal('order_thickness_mm', payload.thickness_mm);
    setVal('order_area_m2', payload.area_m2);
    setVal('order_m2_per_pallet', payload.m2_per_pallet);
    setVal('order_pallets', payload.pallets);
    setVal('order_ship_m2', payload.ship_m2);
    setVal('order_over_m2', payload.over_m2);
    setVal('order_weight_kg', payload.total_weight_kg);
    setVal('order_unit_price', payload.unit_price);
    setVal('order_total_price', payload.total_price);
  }


  function makeCard({ imgSrc, title, active, onClick }){
    const card = document.createElement('div');
    card.className = 'paverConf2026__card' + (active ? ' is-active' : '');

    const imgWrap = document.createElement('div');
    imgWrap.className = 'paverConf2026__img';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = title;
    img.src = imgSrc;
    imgWrap.appendChild(img);

    const name = document.createElement('div');
    name.className = 'paverConf2026__name';
    name.textContent = title;

    card.appendChild(imgWrap);
    card.appendChild(name);
    card.addEventListener('click', onClick);
    return card;
  }

  function renderPicked(){
    const f  = state.form ? cleanText(state.form.name || state.form.id) : '—';
    const t  = state.tech ? cleanText(state.tech.name) : '—';
    const c  = state.color ? cleanText(state.color.name || state.color.id) : '—';
    const th = state.thickness ? (state.thickness + ' мм') : '—';
    elPicked.innerHTML = `<b>Вы выбрали:</b> ${f} · ${t} · ${c} · ${th}`;
    var elCalcFormName = root.querySelector('[data-role="calcFormName"]');
    var elCalcColorName = root.querySelector('[data-role="calcColorName"]');
    if (elCalcFormName) elCalcFormName.textContent = (state.form && state.form.name) ? state.form.name : '—';
    if (elCalcColorName) elCalcColorName.textContent = (state.color && state.color.name) ? state.color.name : '—';
    var elCalcFormName2 = root.querySelector('[data-role="calcFormName2"]');
    var elCalcColorName2 = root.querySelector('[data-role="calcColorName2"]');
    if (elCalcFormName2) elCalcFormName2.textContent = (state.form && state.form.name) ? state.form.name : '—';
    if (elCalcColorName2) elCalcColorName2.textContent = (state.color && state.color.name) ? state.color.name : '—';
    syncChoicePreviews();
  }

  function renderForms(){
    elForms.innerHTML = '';
    state.forms.forEach(f=>{
      const title = cleanText(f.name || f.id);
      const imgSrc = absUrl(f.preview || f.image || '');
      elForms.appendChild(makeCard({
        imgSrc,
        title,
        active: state.form && state.form.id === f.id,
        onClick: ()=>{
          state.form = f;
          state.thickness = null;
          updateFormPreview(f);
          if (isCurbForm(f)){
            // Curbstone UX: default explicitly to Однотонная → Серый (visibly selected)
            state.tech = { id:'mono', name:'Однотонная' };
            state.color = null; // will be set after palette load
          }
          renderForms();
          renderThickness();
          renderPicked();
          safeCompute();
          if (isCurbForm(f)){
            // Load mono palette and select real "Серый" card so user sees the default
            ensurePaletteLoaded().then(function(){
              var pal = state.palettes && state.palettes.mono ? state.palettes.mono : [];
              var picked = null;
              for (var i=0;i<pal.length;i++){
                if (String(pal[i].name || '').trim().toLowerCase() === 'серый'){
                  picked = pal[i]; break;
                }
              }
              if (picked) state.color = picked;
              renderTechTabs();
              renderColors();
              renderPicked();
              safeCompute();
            }).catch(function(){
              // ignore
            });
          }
        }
      }));
    });
  }

  
  function updateTechHint(){
    var el = root.querySelector('[data-role="techHint"]');
    if(!el) return;

    var tid = (state.tech && state.tech.id) ? state.tech.id : 'colormix';
    var tname = (state.tech && state.tech.name) ? state.tech.name : '';

    var hints = {
      mono: 'Ровный цвет по всей поверхности. Базовый и самый универсальный вариант.',
      colormix: 'Смешивание 2–3 пигментов. Гладкая поверхность и уникальная палитра.',
      stonemix: 'Премиальная поверхность с каменной крошкой разных фракций.',
      colormix_fakt: 'Особый отмыв создаёт фактурную поверхность с микро-рельефом.'
    };

    var body = hints[tid] || '';
    el.innerHTML = (tname ? ('<b>'+tname+'</b> — ') : '') + body;
  }

function renderTechTabs(){
    const items = [
      { id:'colormix',      name:'ColorMix',          hint:'Технология смешивания 2–3 пигментов. Гладкая поверхность с уникальной палитрой.' },
      { id:'mono',          name:'Однотонная',        hint:'Ровный цвет по всей поверхности. Базовый и самый универсальный вариант.' },
      { id:'stonemix',      name:'StoneMix',          hint:'Премиальная поверхность из различных видов каменной крошки.' },
      { id:'colormix_fakt', name:'Фактурный ColorMix', hint:'Особый отмыв плитки: фактурная поверхность с микро‑рельефом.' },
    ];

    elTechTabs.innerHTML = '';
    items.forEach(t=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'paverConf2026__tab' + ((state.tech && state.tech.id) === t.id ? ' is-active' : '');
      b.textContent = t.name;
      b.addEventListener('click', async ()=>{
        state.tech = { id:t.id, name:t.name };
        updateTechHint();
        state.color = null;

        await ensurePaletteLoaded();
        state.color = firstColorForTech();

        renderTechTabs();
        renderColors();
        renderPicked();
        safeCompute();
      });
      elTechTabs.appendChild(b);
    });

    const active = items.find(x=>x.id === (state.tech && state.tech.id));
    elTechHint.textContent = active ? active.hint : '';
  }

  function paletteKeyForTech(){
    if ((state.tech && state.tech.id) === 'stonemix') return 'stonemix';
    if ((state.tech && state.tech.id) === 'mono') return 'mono';
    return 'colormix';
  }

  async function ensurePaletteLoaded(){
    const key = paletteKeyForTech();
    if (state.palettes[key]) return;

    var raw = (INLINE_DATA && INLINE_DATA.palettes) ? INLINE_DATA.palettes[key] : null;
    // normalize palette shapes
    var colors = raw;
    if (colors && typeof colors === 'object' && !Array.isArray(colors) && Array.isArray(colors.colors)) colors = colors.colors;
    if (!Array.isArray(colors)) colors = [];

    state.palettes[key] = colors.map(function(c, idx){
      return {
        id: c.id || String(idx+1),
        name: cleanText(c.name || ''),
        file: c.file || c.img || c.preview || '',
        mix_colors: Number(c.mix_colors || c.mix_c || c.mix || c.mixColors || 0) || 0
      };
    });
  }

  function firstColorForTech(){
    const key = paletteKeyForTech();
    const arr = state.palettes[key] || [];
    return arr[0] || null;
  }

  function renderColors(){
    elColors.innerHTML = '';
    const key = paletteKeyForTech();
    const items = state.palettes[key] || [];

    if (!items.length){
      elColors.textContent = 'Цвета не найдены.';
      return;
    }

    items.forEach(c=>{
      let title = cleanText(c.name || c.id);
      if ((state.tech && state.tech.id) === 'colormix') {
        // Do not append "2 цвета / 3 цвета" labels (requested): keep only original names.
      }
      const imgSrc = absUrl(c.file);
      elColors.appendChild(makeCard({
        imgSrc,
        title,
        active: state.color && state.color.id === c.id,
        onClick: ()=>{
          state.color = c;
          renderColors();
          renderPicked();
          safeCompute();
        }
      }));
    });
  }

  function getPricePaverItemByForm(form){
    const items = (state.price && state.price.pavers && state.price && state.price.pavers.items) || [];
    if (!form || !items.length) return null;

    const mappedId = FORM_ID_MAP[form.id];
    if (mappedId){
      const byMapped = items.find(x => x.id === mappedId);
      if (byMapped) return byMapped;
    }
    const byId = items.find(x => x.id === form.id);
    if (byId) return byId;

    const fn = normName(form.name || '');
    const byName = items.find(x => normName(x.name || '') === fn);
    if (byName) return byName;

    return null;
  }

  function thicknessOptionsForForm(form){
    if(!form) return [];

    if(isCurbForm(form)){
      var ids = CURB_FORM_MAP[form.id] || [];
      var items = (state.price && state.price.curbstone && state.price.curbstone.items) ? state.price.curbstone.items : [];
      var out = [];
      for (var i=0;i<ids.length;i++){
        var id = ids[i];
        var it = null;
        for (var j=0;j<items.length;j++){
          if (String(items[j].id) === String(id)) { it = items[j]; break; }
        }
        var dims = parseDimsFromName((it && it.name) || id);
        out.push({ key: id, label: (dims ? fmtDims(dims) : ((it && it.name) || id)) });
      }
      return out;
    }

    var it2 = getPricePaverItemByForm(form);
    if (!it2) return [];
    var th = it2.thickness || [];
    return th.map(function(t){ return t.mm; });
  }

  function thicknessObjFor(form, thicknessMm){
    if(!form) return null;

    if (isCurbForm(form)){
      var items = (state.price && state.price.curbstone && state.price.curbstone.items) ? state.price.curbstone.items : [];
      var it = null;
      for (var i=0;i<items.length;i++){
        if (String(items[i].id) === String(thicknessMm)) { it = items[i]; break; }
      }
      if(!it) return null;

      var wPerPallet = toNum(it && it.packaging && it.packaging.pallet_weight_kg);
      var lmPerPallet = CURB_LM_PER_PALLET[String(it.id)] || toNum(it && it.packaging && it.packaging.pcs_per_pallet) || 0;
      var pcsPerPallet = lmPerPallet;
return {
        _curb: true,
        id: it.id,
        name: it.name,
        prices: it.prices,
        packaging: {
          m2_per_pallet: pcsPerPallet, // for curbstone: 1 шт = 1 пог. м
          pcs_per_pallet: pcsPerPallet,
          pallet_weight_kg: wPerPallet
        }
      };
    }

    var it2 = getPricePaverItemByForm(form);
    if (!it2) return null;

    var th = it2.thickness || [];
    for (var j=0;j<th.length;j++){
      if (String(th[j].mm) === String(thicknessMm)) return th[j];
    }
    return null;
  }

  function pickMonoColumnByColorName(colorName){
    const groups = (state.price && state.price.mono_color_groups);
    const n = normName(colorName);

    const inList = (arr) => (arr || []).some(x => normName(x) === n);

    if (groups){
      if (inList(groups.grey_name)) return 'grey';
      if (inList(groups.color2_names)) return 'mono_color2';
      if (inList(groups.color1_names)) return 'mono_color1';
    }
    return 'mono_color1';
  }

  function columnForPricing(){
    const id = (state.tech && state.tech.id);
    if (id === 'stonemix')  return 'stonemix';
    if (id === 'mono')      return pickMonoColumnByColorName((state.color && state.color.name) || '');
    if (id === 'colormix_fakt') return 'colormix_fakt';
    if (id === 'colormix'){
      const mc = Number((state.color && state.color.mix_colors) || 0);
      if (mc) return mc === 3 ? 'colormix_3' : 'colormix_2';
      const cname = normName((state.color && state.color.name) || '');
      return COLORMIX_3.has(cname) ? 'colormix_3' : 'colormix_2';
    }
    return null;
  }

  function renderThickness(){
    elThTabs.innerHTML = '';
    const opts = thicknessOptionsForForm(state.form);

    // Требование: показываем блок толщины всегда, даже если вариант один
    if (elThWrap) elThWrap.dataset.hidden = (opts.length ? '0' : '1');

    if (!opts.length){
      elThTabs.textContent = 'Нет данных по толщине.';
      state.thickness = null;
      return;
    }

    // Если толщина одна — показываем кнопку, делаем активной и disabled
    if (opts.length === 1){
      state.thickness = (typeof opts[0]==='object' ? opts[0].key : opts[0]);

      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'paverConf2026__tab is-active';
      b.textContent = (typeof opts[0]==='object' ? opts[0].label : (opts[0] + ' мм'));
      b.disabled = true;
      elThTabs.appendChild(b);

      renderPicked();
      safeCompute();
      return;
    }

    if (!state.thickness) state.thickness = (typeof opts[0]==='object' ? opts[0].key : opts[0]);

    opts.forEach(function(mm){
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'paverConf2026__tab' + (String(state.thickness) === String((typeof mm==='object'? mm.key : mm)) ? ' is-active' : '');
      b.textContent = (typeof mm==='object' ? mm.label : (mm + ' мм'));
      b.addEventListener('click', function(){
        state.thickness = (typeof mm==='object' ? mm.key : mm);
        renderThickness();
        renderPicked();
        safeCompute();
      });
      elThTabs.appendChild(b);
    });
  }

  function setCalcDashes(){
    elUnit.textContent = '—';
    elTotal.textContent = '—';
    elThLabel.textContent = '—';
    elM2Pal.textContent = '—';
    elWPal.textContent = '—';
    elPallets.textContent = '—';
    elShipM2.textContent = '—';
    elOverM2.textContent = '—';
    elShipW.textContent = '—';
    if (elPalCostOne) elPalCostOne.textContent = '—';
    if (elPalCostTotal) elPalCostTotal.textContent = '—';
    if (elGrandTotal) elGrandTotal.textContent = '—';
  }

  function safeCompute(){
    try{
      _computeInternal();
      try{ if (typeof cartRender === 'function') cartRender(); }catch(e){}
    }catch(e){
      console.error('[Configurator] compute failed:', e);
      try{ setCalcDashes(); }catch(_){}
    }
  }

  
  // Backward-compatible alias (some code paths still call compute())
  function compute(){
    safeCompute();
  }


  // ===== Cart (multi-position order) =====
  var CART_STORAGE_KEY = 'tilda_paver_cart_v1';
  var cart = { positions: [] };
  window.__pcCart = cart;
  // Cart storage: sessionStorage by default (so позиции не "прилипают" между визитами).
  // If you need persistence between sessions, set CART_PERSIST = true.
  var CART_PERSIST = false;
  function cartStore(){ return CART_PERSIST ? localStorage : sessionStorage; }

  function cartLoad(){
    try{
      var raw = cartStore().getItem(CART_STORAGE_KEY);
      if (!raw) return;
      var obj = JSON.parse(raw);
      if (obj && Array.isArray(obj.positions)) cart.positions = obj.positions;
    }catch(e){}
  }
  function cartSave(){
    try{ cartStore().setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }catch(e){}
  }

  function cartFmtQty(pos){
    if (!pos) return '';
    var u = (pos.qty_unit === 'lm') ? 'пог. м' : 'м²';
    return fmtNum(toNum(pos.qty_value), 2) + ' ' + u;
  }
  function cartFmtMoney(val){
    if (val === 'по запросу') return 'по запросу';
    if (typeof val === 'number' && isFinite(val)) return fmtRub2(val);
    return '—';
  }

  // Recalculate position totals when user edits qty (m²) inside cart.
  // Uses stored unit_price/per_pallet_qty/pallet_weight_kg, does not touch global state or UI selection.
  function cartApplyQtyEdit(pos, newQty){
    if (!pos) return false;
    var qty = toNum(newQty);
    if (!(qty > 0)) return false;

    // Allow editing for m² and пог. м (curbstone). Keep other units unchanged
    if (pos.qty_unit && (pos.qty_unit !== 'm2' && pos.qty_unit !== 'lm')) return false;

    pos.qty_value = qty;

    var per = (typeof pos.per_pallet_qty === 'number' && isFinite(pos.per_pallet_qty) && pos.per_pallet_qty > 0)
      ? pos.per_pallet_qty
      : null;

    if (per){
      pos.pallets = Math.max(1, Math.ceil(qty / per));
      pos.ship_qty = pos.pallets * per;
      pos.over_qty = pos.ship_qty - qty;
    }

    // money
    var unit = pos.unit_price;
    if (unit === 'по запросу'){
      pos.goods_total = 'по запросу';
      pos.grand_total = 'по запросу';
    } else if (typeof unit === 'number' && isFinite(unit) && per){
      pos.goods_total = pos.ship_qty * unit;
      if (!(typeof pos.pallet_empty_price === 'number' && isFinite(pos.pallet_empty_price))) pos.pallet_empty_price = EMPTY_PALLET_PRICE;
      pos.pallet_empty_total = (typeof pos.pallets === 'number' ? pos.pallets : 0) * pos.pallet_empty_price;
      pos.grand_total = pos.goods_total + pos.pallet_empty_total;
    }

    // weight
    if (typeof pos.pallet_weight_kg === 'number' && isFinite(pos.pallet_weight_kg) && typeof pos.pallets === 'number'){
      pos.ship_weight_kg = pos.pallets * pos.pallet_weight_kg;
      pos.weight_kg = pos.ship_weight_kg;
    }

    return true;
  }

  function cartMakeTextLine(pos, idx){
    var t = (pos.tech_name || '—');
    var f = (pos.form_name || '—');
    var c = (pos.color_name || '—');
    var th = pos.thickness_label ? (' · ' + pos.thickness_label) : '';
    return (idx+1) + ') ' + f + ' · ' + t + ' · ' + c + th + ' · ' + cartFmtQty(pos) + ' → ' + cartFmtMoney(pos.grand_total);
  }
function cartMakeManagerText(pos, idx){
  var n = (idx + 1);
  var unitLabel = (pos.qty_unit === 'lm') ? 'пог. м' : 'м²';
  var qtyIn = (typeof pos.qty_value === 'number') ? (fmtNum(pos.qty_value, 2) + ' ' + unitLabel) : ('— ' + unitLabel);

  var sizeLabel = '';
  if (pos.type === 'curb'){
    sizeLabel = pos.curb_label || pos.curb_size || '';
  } else {
    sizeLabel = pos.thickness_label || (pos.thickness_value ? (String(pos.thickness_value) + ' мм') : '');
  }

  function valOrDash(v){
    if (v === null || v === undefined) return '—';
    return String(v);
  }
  function fmtMoney(v, digits2){
    if (v === 'по запросу') return 'по запросу';
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    return digits2 ? fmtRub2(v) : fmtRub(v);
  }
  function fmtQty(v){
    if (v === 'по запросу') return 'по запросу';
    if (typeof v !== 'number' || !isFinite(v)) return '— ' + unitLabel;
    return fmtNum(v, 2) + ' ' + unitLabel;
  }
  function fmtKg(v){
    if (v === 'по запросу') return 'по запросу';
    if (typeof v !== 'number' || !isFinite(v)) return '— кг';
    return fmtNum(v, 0) + ' кг';
  }

  var lines = [];
  lines.push('Позиция ' + n + ': ' + (pos.form_name || '—'));
  if (sizeLabel) lines[lines.length-1] += ' · ' + sizeLabel;
  lines.push((pos.tech_name || '—') + ' · ' + (pos.color_name || '—'));
  lines.push('Количество (ввод): ' + qtyIn);

  // Full calc
  lines.push('Цена за 1 ' + unitLabel + ': ' + fmtMoney(pos.unit_price, true));
  lines.push('В 1 поддоне: ' + fmtQty(pos.per_pallet_qty));
  lines.push('Поддонов: ' + (pos.pallets === 'по запросу' ? 'по запросу' : (typeof pos.pallets === 'number' ? String(pos.pallets) : '—')));
  lines.push('Отгрузка (кратно поддону): ' + fmtQty(pos.ship_qty));
  lines.push('Запас: ' + fmtQty(pos.over_qty));
  lines.push('Вес 1 поддона: ' + fmtKg(pos.pallet_weight_kg));
  lines.push('Вес общий: ' + fmtKg(pos.weight_kg || pos.ship_weight_kg));
  lines.push('Стоимость 1 поддона: ' + fmtMoney(pos.pallet_empty_price, true));
  lines.push('Стоимость поддонов: ' + fmtMoney(pos.pallet_empty_total, true));
  lines.push('Стоимость материала: ' + fmtMoney(pos.goods_total, true));
  lines.push('Итого по позиции: ' + fmtMoney(pos.grand_total, true));

  return lines.join('\n');
}


  // Snapshot current selection + computed result (for adding into cart)
  function cartSnapshotCurrent(){
    if (!state.form || !state.tech || !state.color || !state.thickness) return null;
    if (!lastCalcResult) return null;

    var isCurb = !!(state.form && isCurbForm(state.form));
    var thicknessLabel = '';
    if (isCurb){
      var thObj = thicknessObjFor(state.form, state.thickness);
      thicknessLabel = (thObj && thObj.name) ? thObj.name : String(state.thickness || '');
    } else {
      thicknessLabel = String(state.thickness) + ' мм';
    }

    return {
      id: 'pos_' + Date.now() + '_' + Math.floor(Math.random()*100000),
      type: isCurb ? 'curb' : 'tile',
      form_id: state.form.id,
      form_name: state.form.name || state.form.id,
      tech_id: state.tech.id,
      tech_name: state.tech.name,
      color_id: state.color.id,
      color_name: state.color.name || state.color.id,
      thickness_value: state.thickness,
      thickness_label: thicknessLabel,

      qty_value: lastCalcResult.qty_value,
      qty_unit: lastCalcResult.qty_unit,

      unit_price: lastCalcResult.unit_price,
      total_price: lastCalcResult.total_price,
      goods_total: lastCalcResult.goods_total,
      pallet_empty_price: lastCalcResult.pallet_empty_price,
      pallet_empty_total: lastCalcResult.pallet_empty_total,
      grand_total: lastCalcResult.grand_total,

      pallets: lastCalcResult.pallets,
      per_pallet_qty: lastCalcResult.per_pallet_qty,
      ship_qty: lastCalcResult.ship_qty,
      over_qty: lastCalcResult.over_qty,
      pallet_weight_kg: lastCalcResult.pallet_weight_kg,
      ship_weight_kg: lastCalcResult.ship_weight_kg,
      weight_kg: lastCalcResult.weight_kg,
      empty_pallets_cost: lastCalcResult.empty_pallets_cost
    };
  }

  // Preview (live) position: shown always (block is visible), but content appears only when selection is valid.
  function previewGetCurrent(){
    if (!state.form || !state.tech || !state.color || !state.thickness) return null;
    if (!lastCalcResult) return null;

    var isCurb = !!(state.form && isCurbForm(state.form));
    var thicknessLabel = '';
    if (isCurb){
      var thObj = thicknessObjFor(state.form, state.thickness);
      thicknessLabel = (thObj && thObj.name) ? thObj.name : String(state.thickness || '');
    } else {
      thicknessLabel = String(state.thickness) + ' мм';
    }

    return {
      id: 'preview',
      is_preview: true,
      type: isCurb ? 'curb' : 'tile',
      form_id: state.form.id,
      form_name: state.form.name || state.form.id,
      tech_id: state.tech.id,
      tech_name: state.tech.name,
      color_id: state.color.id,
      color_name: state.color.name || state.color.id,
      thickness_value: state.thickness,
      thickness_label: thicknessLabel,

      qty_value: lastCalcResult.qty_value,
      qty_unit: lastCalcResult.qty_unit,

      unit_price: lastCalcResult.unit_price,
      total_price: lastCalcResult.total_price,
      goods_total: lastCalcResult.goods_total,
      pallet_empty_price: lastCalcResult.pallet_empty_price,
      pallet_empty_total: lastCalcResult.pallet_empty_total,
      grand_total: lastCalcResult.grand_total,

      pallets: lastCalcResult.pallets,
      per_pallet_qty: lastCalcResult.per_pallet_qty,
      ship_qty: lastCalcResult.ship_qty,
      over_qty: lastCalcResult.over_qty,
      pallet_weight_kg: lastCalcResult.pallet_weight_kg,
      ship_weight_kg: lastCalcResult.ship_weight_kg,
      weight_kg: lastCalcResult.weight_kg,
      empty_pallets_cost: lastCalcResult.empty_pallets_cost
    };
  }

  function cartRecalcTotals(){
    var sum = 0;
    var hasRequest = false;
    for (var i=0;i<cart.positions.length;i++){
      var gt = cart.positions[i] ? cart.positions[i].grand_total : null;
      if (gt === 'по запросу') { hasRequest = true; continue; }
      if (typeof gt === 'number' && isFinite(gt)) sum += gt;
    }
    return { sum: sum, hasRequest: hasRequest };
  }

  function cartUpdateHiddenFields(){
    var form = document.querySelector('form#paverLeadForm') || document.querySelector('form');
    if (!form) return;

    function setVal(name, val){
      var inp = form.querySelector('[name="' + name + '"]');
      if (!inp) return;
      inp.value = (val === null || val === undefined) ? '' : String(val);
    }


var blocks = [];
for (var i=0;i<cart.positions.length;i++){
  blocks.push(cartMakeManagerText(cart.positions[i], i));
}

var totals = cartRecalcTotals();
var grandText = '';
if (cart.positions.length){
  grandText = totals.hasRequest ? ('ИТОГО ПО КОРЗИНЕ: ' + fmtRub(totals.sum) + ' + позиции по запросу') : ('ИТОГО ПО КОРЗИНЕ: ' + fmtRub(totals.sum));
  grandText += '\nПозиции: ' + String(cart.positions.length);
}

var sep = '\n\n────────\n\n';
var managerText = blocks.length ? (blocks.join(sep) + (grandText ? ('\n\n' + grandText) : '')) : '';

setVal('order_positions_text', managerText);

    setVal('order_positions_json', JSON.stringify({ positions: cart.positions, totals: totals }));
    setVal('order_cart_grand_total', (cart.positions.length ? (totals.hasRequest ? (fmtRub(totals.sum) + ' + запрос') : fmtRub(totals.sum)) : ''));

    // Backward compatibility fields (if exist)
    setVal('order_cart_positions_text', managerText);
setVal('order_cart_positions_json', JSON.stringify({ positions: cart.positions, totals: totals }));
  }
  // Expose for Tilda form bridge
  window.cartUpdateHiddenFields = cartUpdateHiddenFields;


  // Renders one position card (used for preview and for cart).
  function renderPositionCard(p, idx, opts){
    opts = opts || {};
    var item = document.createElement('div');
    item.className = 'pcCartItem' + (opts.isPreview ? ' pcCartItem--current' : '');

    // Top row: left meta + right sum
    var top = document.createElement('div');
    top.className = 'pcCartItem__top';

    var left = document.createElement('div');
    left.className = 'pcCartItem__left';

    if (opts.isPreview){
      var badge = document.createElement('div');
      badge.className = 'pcCartItem__badge';
      badge.textContent = 'Цена вместе с тарой';
      left.appendChild(badge);
    }

    var title = document.createElement('div');
    title.className = 'pcCartItem__title';
    title.textContent = opts.isPreview ? (p.form_name || '—') : ('Позиция ' + (idx+1) + ': ' + (p.form_name || '—'));

    var sub = document.createElement('div');
    sub.className = 'pcCartItem__sub';
    sub.textContent = (p.tech_name || '—') + ' · ' + (p.color_name || '—') + (p.thickness_label ? (' · ' + p.thickness_label) : '') + ' · ' + cartFmtQty(p);

    left.appendChild(title);
    left.appendChild(sub);

    var sum = document.createElement('div');
    sum.className = 'pcCartItem__sum';
    sum.textContent = cartFmtMoney(p.grand_total);

    top.appendChild(left);
    top.appendChild(sum);

    // Actions row
    var actions = document.createElement('div');
    actions.className = 'pcCartItem__actions';

    // Qty editor inside cart (m² + пог. м). Preview keeps qty from main input.
    if (!opts.isPreview && p && (p.qty_unit === 'm2' || p.qty_unit === 'lm')){
      var qtyWrap = document.createElement('div');
      qtyWrap.className = 'pcCartItem__qty';

      var qtyLab = document.createElement('span');
      qtyLab.className = 'pcCartItem__qtyLabel';
      qtyLab.textContent = (p.qty_unit === 'lm' ? 'пог. м:' : 'м²:');
      qtyWrap.appendChild(qtyLab);

      var qtyInp = document.createElement('input');
      qtyInp.type = 'number';
      qtyInp.inputMode = 'decimal';
      qtyInp.min = '0.01';
      qtyInp.step = '0.01';
      qtyInp.value = String((typeof p.qty_value === 'number' && isFinite(p.qty_value)) ? p.qty_value : '');
      qtyInp.className = 'pcCartItem__qtyInput';
      qtyWrap.appendChild(qtyInp);

      // Apply on change/blur; re-render cart with updated totals.
      function applyQty(){
        var ok = cartApplyQtyEdit(p, qtyInp.value);
        if (ok){
          cartSave();
          cartRender();
        }else{
          // reset
          qtyInp.value = String((typeof p.qty_value === 'number' && isFinite(p.qty_value)) ? p.qty_value : '');
        }
      }
      qtyInp.addEventListener('change', applyQty);
      qtyInp.addEventListener('blur', applyQty);
      qtyInp.addEventListener('keydown', function(ev){ if (ev.key === 'Enter'){ ev.preventDefault(); qtyInp.blur(); } });

      actions.appendChild(qtyWrap);
    }

    var btnInfo = document.createElement('button');
    btnInfo.type = 'button';
    btnInfo.className = 'pcCartItem__btn pcCartItem__btn--info';
    btnInfo.textContent = 'Доп. информация';
    actions.appendChild(btnInfo);

    var info = document.createElement('div');
    info.className = 'pcCartInfo';
    info.style.display = (opts && opts.isPreview) ? '' : 'none';
    if (opts && opts.isPreview) { btnInfo.textContent = 'Скрыть'; }

    function makeInfoRow(label, value){
      if (value === null || value === undefined) return null;
      var s = String(value);
      if (s === '' || s === 'NaN') return null;
      var row = document.createElement('div');
      row.className = 'pcCartInfo__row';
      var a = document.createElement('span');
      a.className = 'pcCartInfo__k';
      a.textContent = label;
      var b = document.createElement('b');
      b.className = 'pcCartInfo__v';
      b.textContent = s;
      row.appendChild(a);
      row.appendChild(b);
      return row;
    }

    var u = (p.qty_unit === 'lm') ? 'пог. м' : 'м²';

    var r1 = makeInfoRow('Цена за 1 ' + u, cartFmtMoney(p.unit_price)); if (r1) info.appendChild(r1);
    var r2 = makeInfoRow('В 1 поддоне', (p.per_pallet_qty !== null && p.per_pallet_qty !== undefined) ? (fmtNum(toNum(p.per_pallet_qty), 2) + ' ' + u) : '—'); if (r2) info.appendChild(r2);
    var r3 = makeInfoRow('Поддонов', (p.pallets !== null && p.pallets !== undefined) ? String(p.pallets) : '—'); if (r3) info.appendChild(r3);
    var r4 = makeInfoRow('Отгрузка (кратно поддону)', (p.ship_qty !== null && p.ship_qty !== undefined) ? (fmtNum(toNum(p.ship_qty), 2) + ' ' + u) : '—'); if (r4) info.appendChild(r4);
    var r5 = makeInfoRow('Запас', (p.over_qty !== null && p.over_qty !== undefined) ? (fmtNum(toNum(p.over_qty), 2) + ' ' + u) : '—'); if (r5) info.appendChild(r5);
    var r6 = makeInfoRow('Вес 1 поддона', (p.pallet_weight_kg !== null && p.pallet_weight_kg !== undefined) ? (fmtNum(toNum(p.pallet_weight_kg), 1) + ' кг') : '—'); if (r6) info.appendChild(r6);
    var r7 = makeInfoRow('Вес общий', (p.ship_weight_kg !== null && p.ship_weight_kg !== undefined) ? (fmtNum(toNum(p.ship_weight_kg), 1) + ' кг') : '—'); if (r7) info.appendChild(r7);
    var r8 = makeInfoRow('Стоимость 1 поддона', cartFmtMoney(p.pallet_empty_price)); if (r8) info.appendChild(r8);
    var r9 = makeInfoRow('Стоимость поддонов', cartFmtMoney(p.pallet_empty_total)); if (r9) info.appendChild(r9);
    var r10 = makeInfoRow('Стоимость материала', cartFmtMoney(p.goods_total)); if (r10) info.appendChild(r10);
    var r11 = makeInfoRow('Итого по позиции', cartFmtMoney(p.grand_total)); if (r11) info.appendChild(r11);

    btnInfo.onclick = function(ev){
      if (ev && ev.preventDefault) ev.preventDefault();
      if (ev && ev.stopPropagation) ev.stopPropagation();
      var shown = (info.style.display !== 'none');
      info.style.display = shown ? 'none' : '';
      btnInfo.textContent = shown ? 'Доп. информация' : 'Скрыть';
    };

    if (opts.canDelete){
      var btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'pcCartItem__btn pcCartItem__btn--danger';
      btnDel.textContent = 'Удалить';
      btnDel.onclick = function(){
        if (typeof idx === 'number' && idx >= 0 && idx < cart.positions.length){
          cart.positions.splice(idx, 1);
          cartSave();
          cartRender();
        }
      };
      actions.appendChild(btnDel);
    }

    item.appendChild(top);
    item.appendChild(actions);
    item.appendChild(info);
    return item;
  }

  function cartRender(){
    // Preview
    if (elPreviewBody){
      elPreviewBody.innerHTML = '';
      var cur = previewGetCurrent();
      if (!cur){
        var empty = document.createElement('div');
        empty.className = 'pcPreview__empty';
        empty.textContent = 'Выберите параметры слева, чтобы увидеть расчёт.';
        elPreviewBody.appendChild(empty);
        if (elCartAddBtn){ elCartAddBtn.disabled = true; }
      } else {
        elPreviewBody.appendChild(renderPositionCard(cur, 0, {isPreview:true, canDelete:false}));
        if (elCartAddBtn){ elCartAddBtn.disabled = false; }
      }
    }

    // Cart list + totals (ONLY added positions)
    if (!elCartList || !elCartGrand) return;

    elCartList.innerHTML = '';
    if (!cart.positions.length){
      if (elCartEmpty) elCartEmpty.style.display = '';
      if (elCartFooter) elCartFooter.style.display = 'none';
      elCartGrand.textContent = '—';
      if (elCartTitle) elCartTitle.textContent = 'Корзина заказа';
      cartUpdateHiddenFields();
      return;
    }
    if (elCartEmpty) elCartEmpty.style.display = 'none';
    if (elCartFooter) elCartFooter.style.display = '';
    if (elCartTitle) elCartTitle.textContent = 'Корзина заказа (' + cart.positions.length + ')';

    for (var i=0;i<cart.positions.length;i++){
      var p = cart.positions[i];
      elCartList.appendChild(renderPositionCard(p, i, {isPreview:false, canDelete:true}));
    }

    var totals = cartRecalcTotals();
    elCartGrand.textContent = totals.hasRequest ? (fmtRub(totals.sum) + ' + запрос') : fmtRub(totals.sum);

    cartUpdateHiddenFields();
  }

  function cartInit(){
    // Guard against multiple init() calls (Tilda can evaluate scripts more than once).
    if (window.__pcCartInitDone){
      cartRender();
      return;
    }
    window.__pcCartInitDone = true;

    cartLoad();
    cartRender();

    if (elCartAddBtn){
      elCartAddBtn.onclick = function(ev){
        // Only add on real user click (prevents accidental programmatic triggers)
        if (!ev || ev.isTrusted === false){ return; }
        if (ev){ ev.preventDefault(); ev.stopPropagation(); }
        var snap = cartSnapshotCurrent();
        if (!snap){
          alert('Для добавления позиции выберите форму, технологию, цвет и толщину/размер, затем укажите количество.');
          return;
        }
        // Add exactly ONE position per click
        cart.positions.push(snap);
        cartSave();
        cartRender();
      };
    }
  }




function _computeInternal(){
    var elUnitPriceLabel = root.querySelector('[data-role="unitPriceLabel"]');
    var elQtyLabel = root.querySelector('[data-role="qtyLabel"]');
    var elSizeLabel = root.querySelector('[data-role="sizeLabel"]');
    var elPalletUnitLabel = root.querySelector('[data-role="palletUnitLabel"]');
    var elShipUnitLabel = root.querySelector('[data-role="shipUnitLabel"]');
    var elOverUnitLabel = root.querySelector('[data-role="overUnitLabel"]');
    var elM2PalletRow = root.querySelector('[data-role="m2PalletRow"]');

    var elCurbLmRow = root.querySelector('[data-role="curbLmRow"]');
    var elCurbLmPerPallet = root.querySelector('[data-role="curbLmPerPallet"]');

    if (!state.form || !state.tech || !state.thickness){
      setCalcDashes();
      return;
    }

    const thObj = thicknessObjFor(state.form, state.thickness);
    const isCurb = isCurbForm(state.form);
    // --- UI: show correct pallet unit rows
    function __pcFindRow(node){
      var n = node;
      while(n && n !== root){
        if(n.classList && n.classList.contains('pcCalc__row')) return n;
        n = n.parentNode;
      }
      return null;
    }
    var __rowM2 = __pcFindRow(root.querySelector('[data-role="m2Pallet"]'));
    var __rowLm = __pcFindRow(root.querySelector('[data-role="curbLmPerPallet"]'));
    if(__rowM2) __rowM2.style.display = isCurb ? 'none' : '';
    if(__rowLm) __rowLm.style.display = isCurb ? '' : 'none';


    if (elUnitPriceLabel) elUnitPriceLabel.textContent = isCurb ? 'Цена за 1 пог. м' : 'Цена за 1 м²';
    if (elQtyLabel) elQtyLabel.textContent = isCurb ? 'Длина, пог. м' : 'Площадь, м²';
    if (elSizeLabel) elSizeLabel.textContent = isCurb ? 'Размер' : 'Толщина';
    if (elPalletUnitLabel) elPalletUnitLabel.textContent = isCurb ? 'пог. м в поддоне' : 'м² в поддоне';
    if (elShipUnitLabel) elShipUnitLabel.textContent = isCurb ? 'Отгрузка, пог. м' : 'Отгрузка, м²';
    if (elOverUnitLabel) elOverUnitLabel.textContent = isCurb ? 'Перерасход, пог. м' : 'Перерасход, м²';

    const prices = thObj ? thObj.prices : null;
    const col = isCurb ? 'grey' : columnForPricing();
    if (!prices || !col){
      setCalcDashes();
      return;
    }

    const v = prices[col];

    const pack = (thObj && thObj.packaging) || null;
    var m2PerPallet = toNum((pack && pack.m2_per_pallet));
    if (isCurb){
      var lmpp = curbLmPerPallet(state.form && state.form.id, state.thickness);
      if (lmpp > 0) m2PerPallet = lmpp;
    }
    const wPerPallet  = toNum((pack && pack.pallet_weight_kg));

    elThLabel.textContent = state.thickness ? (isCurbForm(state.form) ? "" : (state.thickness + ' мм')) : '—';
    elM2Pal.textContent   = m2PerPallet ? (fmtNum(m2PerPallet, 2) + (isCurb ? ' пог. м' : ' м²')) : '—';
    if (elCurbLmRow) elCurbLmRow.hidden = !isCurb;
    if (elM2PalletRow) elM2PalletRow.hidden = !!isCurb;
    if (isCurb && elCurbLmPerPallet) elCurbLmPerPallet.textContent = m2PerPallet ? (fmtNum(m2PerPallet, 0) + ' пог. м') : '—';

    elWPal.textContent    = wPerPallet ? (Math.round(wPerPallet) + ' кг') : '—';

    const area = Math.max(0, toNum(elQty.value || 0));
    const areaOrig = area; // for curbstone: пог. м (может быть дробным)
    const areaPcs = (isCurb && area > 0) ? Math.max(1, Math.ceil(area)) : area; // 1 шт = 1 пог. м


    let unit = null;
    if (typeof v === 'string'){
      const s = normName(v);
      if (s.includes('по запросу')){
        elUnit.textContent = 'по запросу';
        elTotal.textContent = 'по запросу';

        
        if (elPalCostOne) elPalCostOne.textContent = fmtRub2(EMPTY_PALLET_PRICE);
        if (elPalCostTotal) elPalCostTotal.textContent = '—';
        if (elGrandTotal) elGrandTotal.textContent = 'по запросу';
if (m2PerPallet){
          const pallets = Math.max(1, Math.ceil(areaPcs / m2PerPallet));
          const shipM2 = pallets * m2PerPallet;
          const overM2 = shipM2 - (isCurb ? areaOrig : area);
          elPallets.textContent = String(pallets);
          elShipM2.textContent = fmtNum(shipM2, 2) + (isCurb ? ' пог. м' : ' м²');
          elOverM2.textContent = fmtNum(overM2, 2) + (isCurb ? ' пог. м' : ' м²');
          elShipW.textContent = wPerPallet ? (Math.round(pallets * wPerPallet) + ' кг') : '—';
        } else {
          elPallets.textContent = '—';
          elShipM2.textContent = '—';
          elOverM2.textContent = '—';
          elShipW.textContent = '—';
        }

        // lastCalcResult (for cart)
        lastCalcResult = {
          qty_value: areaOrig,
          qty_unit: isCurb ? 'lm' : 'm2',
          unit_price: 'по запросу',
          total_price: 'по запросу',
          goods_total: 'по запросу',
          pallet_empty_price: EMPTY_PALLET_PRICE,
          pallets: m2PerPallet ? Math.max(1, Math.ceil(areaPcs / m2PerPallet)) : null,
          per_pallet_qty: m2PerPallet || null,
          ship_qty: m2PerPallet ? (Math.max(1, Math.ceil(areaPcs / m2PerPallet)) * m2PerPallet) : null,
          over_qty: m2PerPallet ? ((Math.max(1, Math.ceil(areaPcs / m2PerPallet)) * m2PerPallet) - (isCurb ? areaOrig : area)) : null,
          pallet_weight_kg: wPerPallet || null,
          ship_weight_kg: (m2PerPallet && wPerPallet) ? (Math.max(1, Math.ceil(areaPcs / m2PerPallet)) * wPerPallet) : null,
          pallet_empty_total: m2PerPallet ? (Math.max(1, Math.ceil(areaPcs / m2PerPallet)) * EMPTY_PALLET_PRICE) : null,
          grand_total: 'по запросу'
        };
        return;
      }

      if (s === '-' || s === '—' || s === ''){
        setCalcDashes();
        return;
      }

      const num = toNum(v);
      if (!isFinite(num)){
        elUnit.textContent = v;
        elTotal.textContent = '—';
        return;
      }
      unit = num;
    } else {
      const num = toNum(v);
      if (!isFinite(num)){
        setCalcDashes();
        return;
      }
      unit = num;
    }

    elUnit.textContent = fmtRub2(unit) + ' / м²';

    if (m2PerPallet){
      const pallets = Math.max(1, Math.ceil(areaPcs / m2PerPallet));
      const shipM2  = pallets * m2PerPallet;
      const overM2  = shipM2 - area;

      elPallets.textContent = String(pallets);
      elShipM2.textContent  = fmtNum(shipM2, 2) + (isCurb ? ' пог. м' : ' м²');
      elOverM2.textContent  = fmtNum(overM2, 2) + (isCurb ? ' пог. м' : ' м²');
      elShipW.textContent   = wPerPallet ? (Math.round(pallets * wPerPallet) + ' кг') : '—';

      const tileTotal = unit * shipM2;
      elTotal.textContent = fmtRub(tileTotal);
      const palCostOne = EMPTY_PALLET_PRICE;
      const palCostTotal = pallets * palCostOne;
      const grand = tileTotal + palCostTotal;
      if (elPalCostOne) elPalCostOne.textContent = fmtRub2(palCostOne);
      if (elPalCostTotal) elPalCostTotal.textContent = fmtRub2(palCostTotal);
      // lastCalcResult (for cart)
      lastCalcResult = {
        qty_value: areaOrig,
        qty_unit: isCurb ? 'lm' : 'm2',
        unit_price: unit,
        total_price: tileTotal,
        goods_total: tileTotal,
        pallet_empty_price: palCostOne,
        pallet_empty_total: palCostTotal,
        grand_total: grand,
        pallets: pallets,
        per_pallet_qty: m2PerPallet || null,
        ship_qty: shipM2,
        over_qty: overM2,
        pallet_weight_kg: wPerPallet || null,
        ship_weight_kg: wPerPallet ? (pallets * wPerPallet) : null,
        weight_kg: wPerPallet ? (pallets * wPerPallet) : null
      };
      if (elGrandTotal) elGrandTotal.textContent = fmtRub2(grand);
return;
    }

    elPallets.textContent = '—';
    elShipM2.textContent = '—';
    elOverM2.textContent = '—';
    elShipW.textContent = '—';
    const tileTotal = unit * area;
    elTotal.textContent = fmtRub(tileTotal);
    if (elPalCostOne) elPalCostOne.textContent = fmtRub2(EMPTY_PALLET_PRICE);
    if (elPalCostTotal) elPalCostTotal.textContent = '—';
    // lastCalcResult (for cart)
    lastCalcResult = {
      qty_value: areaOrig,
      qty_unit: isCurb ? 'lm' : 'm2',
      unit_price: unit,
      total_price: tileTotal,
      goods_total: tileTotal,
      pallet_empty_price: EMPTY_PALLET_PRICE,
      pallet_empty_total: null,
      grand_total: tileTotal,
      pallets: null,
      per_pallet_qty: null,
      ship_qty: area,
      over_qty: 0,
      pallet_weight_kg: null,
      ship_weight_kg: null,
      weight_kg: null
    };
    if (elGrandTotal) elGrandTotal.textContent = fmtRub2(tileTotal);
}

  try{
    status('Загрузка данных…');

    let forms = null, price = null;

    // Try CDN first
    // Load from INLINE_DATA only (stable)
    forms = INLINE_DATA.forms;
    price = INLINE_DATA.price;
// If CDN returned a price without packaging (cached/old), override with inline (packaging-aware) version
    if (!hasPackagingInPrice(price) && hasPackagingInPrice(INLINE_DATA.price)){
      console.warn('CDN price_catalog.json has no packaging; overriding with inline price (contains packaging).');
      price = INLINE_DATA.price;
    }

    state.forms = Array.isArray(forms) ? forms : INLINE_DATA.forms;
    state.price = price || INLINE_DATA.price;

    state.form = state.forms[0] || null;

    await ensurePaletteLoaded();
    state.color = firstColorForTech();

    renderForms();
    renderTechTabs();
    renderColors();
    renderThickness();
    renderPicked();
    safeCompute();
    syncChoicePreviews();

    if (elFormPreviewBtn){
      elFormPreviewBtn.addEventListener('click', function(){
        if (elFormPreviewBtn.disabled) return;
        openFormLightbox('form');
      });
    }
    if (elColorPreviewBtn){
      elColorPreviewBtn.addEventListener('click', function(){
        if (elColorPreviewBtn.disabled) return;
        openFormLightbox('color');
      });
    }
    if (elMbarFormPreviewBtn){
      elMbarFormPreviewBtn.addEventListener('click', function(){
        if (elMbarFormPreviewBtn.disabled) return;
        openFormLightbox('form');
      });
    }
    if (elMbarColorPreviewBtn){
      elMbarColorPreviewBtn.addEventListener('click', function(){
        if (elMbarColorPreviewBtn.disabled) return;
        openFormLightbox('color');
      });
    }
    if (elFormLightboxPrev){
      elFormLightboxPrev.addEventListener('click', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        if (!activeLightboxKind) return;
        stepPreviewGallery(activeLightboxKind, -1);
      });
    }
    if (elFormLightboxNext){
      elFormLightboxNext.addEventListener('click', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        if (!activeLightboxKind) return;
        stepPreviewGallery(activeLightboxKind, 1);
      });
    }
    if (elFormLightboxClose){
      elFormLightboxClose.addEventListener('click', function(ev){
        ev.preventDefault();
        closeFormLightbox();
      });
    }
    if (elFormLightbox){
      elFormLightbox.addEventListener('click', function(ev){
        if (ev.target === elFormLightbox) closeFormLightbox();
      });
    }
    document.addEventListener('keydown', function(ev){
      if (ev.key === 'Escape') closeFormLightbox();
      if (!activeLightboxKind) return;
      if (ev.key === 'ArrowLeft') stepPreviewGallery(activeLightboxKind, -1);
      if (ev.key === 'ArrowRight') stepPreviewGallery(activeLightboxKind, 1);
    });
    if (elFormPreviewImg){
      elFormPreviewImg.addEventListener('error', function(){
        setEmptyFormPreview();
      });
    }
    if (elColorPreviewImg){
      elColorPreviewImg.addEventListener('error', function(){
        setEmptyColorPreview();
      });
    }

    cartInit();

    status('Ок. Данные загружены.');
  } catch (e){
    console.error(e);
    status('Ошибка загрузки данных. Проверьте Console (F12). Если price_catalog.json не грузится с CDN — используется встроенный прайс; убедитесь, что изображения доступны по data-cdn.');
  }

  elQty.addEventListener('input', compute);

  // ===== Mobile sticky bar (UX helper) =====
  function initMobileBar(){
    var bar = document.querySelector('[data-role="mbar"]');
    if(!bar) return;

    var rootEl = document.getElementById('paverConf2026');
    var elHint = bar.querySelector('[data-role="mbarHint"]');
    var elName = bar.querySelector('[data-role="mbarName"]');
    var elSub  = bar.querySelector('[data-role="mbarSub"]');
    var elCount= bar.querySelector('[data-role="mbarCount"]');
    var elCartSum = bar.querySelector('[data-role="mbarCartSum"]');
    var elBtn  = bar.querySelector('[data-role="mbarMainBtn"]');

    // anchors
    var aForms = rootEl ? rootEl.querySelector('.paverConf2026__grid--forms') : null;
    var aTech  = rootEl ? rootEl.querySelector('[data-role="techTabs"]') : null;
    var aColors= rootEl ? rootEl.querySelector('.paverConf2026__grid--colors') : null;
    var aCalc  = rootEl ? (rootEl.querySelector('[data-role="thicknessWrap"]') || rootEl.querySelector('[data-role="thicknessTabs"]')) : null;
    var aQty   = rootEl ? rootEl.querySelector('[data-role="qty"]') : null;
    var aLead  = rootEl ? (rootEl.querySelector('#paverLeadForm') || rootEl.querySelector('[data-local-form="1"]')) : null;

    function stepContainer(el){
      try{ return el ? (el.closest('.paverConf2026__step') || el) : null; }
      catch(e){ return el || null; }
    }

    var isMobile = function(){ return window.matchMedia && window.matchMedia('(max-width: 980px)').matches; };

    // stage machine:
    // 1 tech -> 2 color -> 3 scroll calc -> 4 focus qty -> 5 prompt add-to-cart -> 6 post-add (lead)
    var stage = 1;

    function cartCount(){
      try{
        if(window.__pcCart && window.__pcCart.positions) return window.__pcCart.positions.length||0;
      }catch(e){}
      return 0;
    }

    function hasFormSelected(){
      var ok = !!(state && state.form && state.form.id);
      if(!ok && rootEl){
        try{ ok = !!rootEl.querySelector('.paverConf2026__grid--forms .paverConf2026__card.is-active'); }catch(e){}
      }
      return ok;
    }

    function currentState(){
      var isCurb = (typeof isCurbForm === 'function') ? isCurbForm() : false;
      return {isCurb:isCurb, hasForm: hasFormSelected()};
    }

    function ensureStage(){
      // if cart has items and user just added -> stage 6 (lead)
      if(cartCount() > 0 && stage < 6 && stage !== 5){
        // do not auto-jump; stage 6 is set by add-to-cart hook
      }
      // no form => stage starts at tech anyway (default form exists), but keep safe:
      if(!hasFormSelected()) stage = 1;
      if(stage < 1) stage = 1;
      if(stage > 6) stage = 6;
    }

    function fmtRubRounded(v){
      try{
        var n = Math.round(parseFloat(v) || 0);
        var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return s + ' ₽';
      }catch(e){ return String(v); }
    }

    function selectedLine(){
      var parts = [];
      try{ if(state && state.form && state.form.name) parts.push(state.form.name); }catch(e){}
      try{ if(state && state.tech && state.tech.name) parts.push(state.tech.name); }catch(e){}
      try{ if(state && state.color && state.color.name) parts.push(state.color.name); }catch(e){}
      return parts.length ? parts.join(' · ') : '—';
    }

    function unitPriceText(st){
      var unit = (lastCalcResult && typeof lastCalcResult.unit_price !== 'undefined') ? lastCalcResult.unit_price : null;
      var unitLabel = st.isCurb ? 'Цена за 1 пог. м' : 'Цена за 1 м²';
      return unitLabel + ': ' + (unit===null ? '—' : fmtRubRounded(unit));
    }

    function cartTotalText(){
      // prefer rendered cart total if exists
      try{
        var el = rootEl ? rootEl.querySelector('[data-role="cartGrand"]') : null;
        if(el && el.textContent) return el.textContent.trim();
      }catch(e){}
      // fallback from cart model if present
      try{
        if(window.__pcCart && typeof window.__pcCart.grand_total !== 'undefined') return fmtRubRounded(window.__pcCart.grand_total);
      }catch(e){}
      return '—';
    }

    function hintText(){
      if(stage === 1) return 'Выберите технологию';
      if(stage === 2) return 'Выберите цвет';
      if(stage === 3) return 'Рассчитать стоимость';
      if(stage === 4) return 'Введите м²';
      if(stage === 5) return 'Добавьте позицию в корзину';
      return 'Оставьте заявку';
    }

    function btnText(){
      if(stage === 3) return 'Рассчитать';
      if(stage === 4) return 'Введите м²';
      if(stage === 5) return 'Добавьте в корзину';
      if(stage === 6) return 'Оставьте заявку';
      return 'Далее';
    }

    function pickTarget(){
      if(stage === 1) return stepContainer(aTech);
      if(stage === 2) return stepContainer(aColors);
      if(stage === 3 || stage === 4) return stepContainer(aCalc) || stepContainer(aQty);
      if(stage === 5){
        // highlight add button in preview
        return stepContainer(rootEl ? rootEl.querySelector('[data-role="previewBlock"]') : null) || stepContainer(aCalc);
      }
      return stepContainer(aLead) || stepContainer(rootEl ? rootEl.querySelector('.pcCalc__formTitle') : null);
    }

    function scrollToTarget(){
      var t = pickTarget();
      if(!t) return;
      requestAnimationFrame(function(){
        try{
          var top = t.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({top: Math.max(0, top - 96), behavior: 'smooth'});
        }catch(e){
          if(t.scrollIntoView) t.scrollIntoView({behavior:'smooth', block:'start'});
        }
      });
    }

    function pulse(el){
      if(!el) return;
      try{
        el.classList.remove('pcPulse');
        // force reflow
        void el.offsetWidth;
        el.classList.add('pcPulse');
        clearTimeout(el._pulseT);
        el._pulseT = setTimeout(function(){ el.classList.remove('pcPulse'); }, 1200);
      }catch(e){}
    }

    
    function showToast(msg){
      try{
        var el = document.querySelector('[data-role="pcToast"]');
        if(!el) return;
        el.textContent = msg || 'Готово';
        el.classList.add('is-show');
        el.setAttribute('aria-hidden','false');
        clearTimeout(el._t);
        el._t = setTimeout(function(){
          el.classList.remove('is-show');
          el.setAttribute('aria-hidden','true');
        }, 1500);
      }catch(e){}
    }

function update(){
      if(!isMobile()){
        bar.classList.remove('is-visible');
        if(rootEl) rootEl.classList.remove('has-mbar');
        bar.setAttribute('aria-hidden','true');
        return;
      }
      if(!bar._inView){
        bar.classList.remove('is-visible');
        if(rootEl) rootEl.classList.remove('has-mbar');
        bar.setAttribute('aria-hidden','true');
        return;
      }

      // refresh anchors in case Tilda re-rendered
      if(rootEl){
        aTech  = rootEl.querySelector('[data-role="techTabs"]') || aTech;
        aColors= rootEl.querySelector('.paverConf2026__grid--colors') || aColors;
        aCalc  = (rootEl.querySelector('[data-role="thicknessWrap"]') || rootEl.querySelector('[data-role="thicknessTabs"]')) || aCalc;
        aQty   = rootEl.querySelector('[data-role="qty"]') || aQty;
        aLead  = (rootEl.querySelector('#paverLeadForm') || rootEl.querySelector('[data-local-form="1"]')) || aLead;
      }

      ensureStage();

      bar.classList.add('is-visible');
      if(rootEl) rootEl.classList.add('has-mbar');
      bar.setAttribute('aria-hidden','false');

      var st = currentState();

      if(elHint) elHint.textContent = hintText();
      if(elName) elName.textContent = selectedLine();
      if(elSub) elSub.textContent = unitPriceText(st);

      var c = cartCount();
      if(elCount){
        if(c > 0){
          elCount.style.display = 'flex';
          elCount.textContent = String(c);
        }else{
          elCount.style.display = 'none';
        }
      }

      if(elCartSum){
        if(stage === 6 && c > 0){
          elCartSum.style.display = '';
          elCartSum.textContent = 'Итог корзины: ' + cartTotalText();
        }else{
          elCartSum.style.display = 'none';
        }
      }

      if(elBtn) elBtn.textContent = btnText();
    }

    // Button click behavior
    if(elBtn && !elBtn._bound){
      elBtn._bound = true;
      elBtn.addEventListener('click', function(){
        update();

        if(stage === 1){
          scrollToTarget();
          stage = 2;
          setTimeout(update, 140);
          return;
        }
        if(stage === 2){
          scrollToTarget();
          stage = 3;
          setTimeout(update, 140);
          return;
        }
        if(stage === 3){
          // scroll to calc, then ask to enter qty
          scrollToTarget();
          stage = 4;
          setTimeout(update, 180);
          return;
        }
        if(stage === 4){
          // highlight qty input and focus
          scrollToTarget();
          setTimeout(function(){
            var qty = aQty || (rootEl ? rootEl.querySelector('[data-role="qty"]') : null);
            if(qty){
              pulse(qty);
              try{ qty.focus({preventScroll:true}); }catch(e){ try{ qty.focus(); }catch(e2){} }
            }
          }, 220);
          return;
        }
        if(stage === 5){
          // highlight add-to-cart button (in preview)
          scrollToTarget();
          setTimeout(function(){
            var addBtn = rootEl ? rootEl.querySelector('[data-role="cartAddBtn"]') : null;
            if(addBtn){
              pulse(addBtn);
            }
          }, 220);
          return;
        }
        if(stage === 6){
          // lead form
          scrollToTarget();
          return;
        }
      });
    }

    // User interactions driving stage progression
    if(rootEl && !rootEl._mbarBound){
      rootEl._mbarBound = true;
      rootEl.addEventListener('click', function(ev){
        var t = ev.target;

        // tech clicked -> advance to color stage if we're still at tech stage
        try{
          if(stage <= 1 && aTech && (t === aTech || (aTech.contains && aTech.contains(t)))){
            stage = 2;
          }
        }catch(e){}

        // color clicked -> advance to calc stage
        try{
          if(stage <= 2 && aColors && (t === aColors || (aColors.contains && aColors.contains(t)))){
            if(t.closest && t.closest('.paverConf2026__card')){
              stage = 3;
            }
          }
        }catch(e){}

        update();
      }, true);

      // qty input -> when value entered, switch to stage 5 (add to cart)
      rootEl.addEventListener('input', function(ev){
        var tgt = ev.target;
        try{
          if(tgt && (tgt === aQty || (tgt.getAttribute && tgt.getAttribute('data-role') === 'qty'))){
            var v = parseFloat(tgt.value || '0') || 0;
            if(v > 0){
              if(stage < 5) stage = 5;
            }else{
              if(stage >= 5 && stage < 6) stage = 4;
            }
            update();
          }
        }catch(e){}
      }, true);
    }

    // When user actually adds to cart -> stage 6 and show cart sum
    if(!bar._cartHooked){
      bar._cartHooked = true;
      document.addEventListener('click', function(ev){
        var t = ev.target;
        try{
          if(t && t.closest && t.closest('[data-role="cartAddBtn"]')){
            setTimeout(function(){
              stage = 6;
              showToast('Добавлено в корзину');
              update();
            }, 120);
          }
        }catch(e){}
      }, true);
    }

    // IntersectionObserver for visibility
    bar._inView = true;
    try{
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ bar._inView = !!en.isIntersecting; });
        update();
      }, {root:null, threshold: 0.01});
      io.observe(rootEl || document.body);
    }catch(e){
      bar._inView = true;
      update();
    }

    var schedule = null;
    var tick = function(){
      if(schedule) return;
      schedule = setTimeout(function(){
        schedule = null;
        update();
      }, 120);
    };

    document.addEventListener('input', tick, true);
    window.addEventListener('resize', tick);
    window.addEventListener('orientationchange', tick);
    window.addEventListener('scroll', tick, {passive:true});

    tick();
  }

  initMobileBar();

})();

  // ===== BF311N bridge (Tilda form submit) =====
  // Цель: отправлять заявку через стандартную форму Tilda (BF311N), без перезагрузки, с данными корзины.
  // Важно: НЕ используем native form.submit(); даём Tilda Forms обработать submit штатно.
  function findTildaFormForSubmit(){
    // Hard bind to the BF311N form by its unique hidden fields (added in the BF311N block).
    // This avoids conflicts when the page has multiple Tilda forms.
    var marker = document.querySelector('input[name="order_positions_text"], input[name="order_cart_grand_total"], input[name="order_positions_count"], input[name="order_source"]');
    if(marker && marker.closest){
      var f0 = marker.closest('form');
      if(f0 && f0.id !== 'paverLeadForm') return f0;
    }

    // Fallback: pick the first Tilda form with a submit button (in case marker fields are absent).
    var forms = document.querySelectorAll('.t-form form, form.t-form, .t-form');
    // `.t-form` can be either the form itself or a wrapper; normalize:
    for(var i=0;i<forms.length;i++){
      var el = forms[i];
      var f = (el.tagName === 'FORM') ? el : el.querySelector('form');
      if(!f) continue;
      // must have a submit button (Tilda)
      var btn = f.querySelector('button[type="submit"], input[type="submit"]');
      if(!btn) continue;
      // skip our local pseudo-form
      if(f.id === 'paverLeadForm') continue;
      return f;
    }
    return null;
  }

  function setOrCreateHidden(form, name, value){
    var inp = form.querySelector('input[name="'+name+'"]');
    if(!inp){
      inp = document.createElement('input');
      inp.type = 'hidden';
      inp.name = name;
      form.appendChild(inp);
    }
    inp.value = (value==null) ? '' : String(value);
  }

  function getField(root, name){
    if(!root) return null;
    return root.querySelector('input[name="'+name+'"], textarea[name="'+name+'"], select[name="'+name+'"]');
  }

  function setFieldValue(form, nameCandidates, value){
    if(!form) return false;
    for(var i=0;i<nameCandidates.length;i++){
      var n = nameCandidates[i];
      var el = getField(form, n);
      if(!el) continue;
      el.value = (value==null) ? '' : String(value);
      // Let tilda/masks/validators react
      try { el.dispatchEvent(new Event('input', {bubbles:true})); } catch(e) {}
      try { el.dispatchEvent(new Event('change', {bubbles:true})); } catch(e) {}
      return true;
    }
    return false;
  }

  function copyValueIfExists(srcRoot, srcName, dstForm, dstCandidates){
    var src = getField(srcRoot, srcName);
    if(!src) return;
    setFieldValue(dstForm, dstCandidates, src.value);
  }

  function trySubmitViaTildaForm(){
    var btn = document.getElementById('pcSubmitToTildaBtn');
    if(!btn) return;

    // Avoid multiple bindings if Tilda re-runs scripts
    if(btn.getAttribute('data-bound') === '1') return;
    btn.setAttribute('data-bound','1');

    btn.onclick = function(ev){
      ev.preventDefault();
      ev.stopPropagation();

      // Validate required lead fields
      if(!validateLeadFields()) return;

      // Require at least one cart item (only added positions)
      var cartRef = window.__pcCart;
      if(!cartRef || !cartRef.positions || cartRef.positions.length === 0){
        // show cart empty message (already in UI)
        var empty = document.querySelector('[data-role="cartEmpty"]');
        if(empty) empty.style.display = '';
        // small shake highlight
        var cartBox = document.querySelector('.pcCart');
        if(cartBox){
          cartBox.classList.add('pcShake');
          setTimeout(function(){ cartBox.classList.remove('pcShake'); }, 450);
        }
        return;
      }

      // Update local hidden fields (source of truth for payload)
      try { if(window.cartUpdateHiddenFields) window.cartUpdateHiddenFields(); } catch(e) {}

      var localForm = document.getElementById('paverLeadForm');
      // Require consent checkbox in our calculator form
      if(localForm){
        var cLocal = localForm.querySelector('input[type="checkbox"][name="personal_data_consent"]');
        if(cLocal && !cLocal.checked){
          alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
          try{ cLocal.focus(); }catch(e){}
          return;
        }
      }

      var tildaForm = findTildaFormForSubmit();
      if(!tildaForm){
        alert('Не найдена форма Tilda для отправки. Добавьте на страницу блок BF311N и опубликуйте страницу.');
        return;
      }

      
      // Sync consent checkbox into BF311N (must have variable name: personal_data_consent)
      var cTilda = tildaForm.querySelector('input[type="checkbox"][name="personal_data_consent"]');
      if(cTilda){
        cTilda.checked = true;
        try{ cTilda.dispatchEvent(new Event('change', {bubbles:true})); }catch(e){}
        try{ cTilda.dispatchEvent(new Event('input', {bubbles:true})); }catch(e){}
      }
// Copy visible contacts (если пользователь ввёл их в нашем блоке)
      if(localForm){
        copyValueIfExists(localForm,'name', tildaForm,['name','firstname']);
        copyValueIfExists(localForm,'phone', tildaForm,['phone','tel']);
        copyValueIfExists(localForm,'email', tildaForm,['email']);
        copyValueIfExists(localForm,'comment', tildaForm,['comment','message']);
      }

      // Copy cart payload into BF hidden fields (создаём при необходимости)
// ВАЖНО: значения берём из уже синхронизированных hidden-полей (обычно они лежат прямо в BF311N),
// а НЕ из localForm (там может не быть этих полей).
var getSyncedVal = function(n){
  var a = tildaForm ? tildaForm.querySelector('input[name="'+n+'"]') : null;
  if(a && typeof a.value === 'string') return a.value;
  var b = document.querySelector('input[name="'+n+'"]');
  if(b && typeof b.value === 'string') return b.value;
  return '';
};
setOrCreateHidden(tildaForm, 'order_positions_text', getSyncedVal('order_positions_text'));
setOrCreateHidden(tildaForm, 'order_cart_grand_total', getSyncedVal('order_cart_grand_total'));

      // Optional fields (if exist in local)
      setOrCreateHidden(tildaForm, 'order_positions_count', cartRef.positions.length);
      setOrCreateHidden(tildaForm, 'order_source', 'tilda_calc_cart_v1');

      // Trigger submit via the real submit control (Tilda handler)
      var submitBtn = tildaForm.querySelector('button[type="submit"], input[type="submit"]');
      if(submitBtn){
        submitBtn.click();
      } else {
        // fallback: dispatch submit event
        var se = new Event('submit', {bubbles:true, cancelable:true});
        tildaForm.dispatchEvent(se);
      }
    };
  }

  // Premium micro animation for attention
  (function(){
    var css = document.createElement('style');
    css.textContent = '.pcShake{animation:pcShake .45s;}@keyframes pcShake{0%{transform:translateX(0);}25%{transform:translateX(-4px);}50%{transform:translateX(4px);}75%{transform:translateX(-2px);}100%{transform:translateX(0);}}';
    document.head.appendChild(css);
  
  // Local phone mask (+7) for our calculator form (does not affect Tilda BF inputs)
  function pcApplyRuPhoneMask(input){
    if(!input) return;
    var digits = function(v){ return (v||'').replace(/\D/g,''); };
    var format = function(d){
      // Expect: 7XXXXXXXXXX or XXXXXXXXXX (without leading 7/8)
      if(d.length === 0) return '';
      if(d[0] === '8') d = '7' + d.slice(1);
      if(d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var p = d.slice(1); // 10 digits after country
      var a = p.slice(0,3), b = p.slice(3,6), c = p.slice(6,8), e = p.slice(8,10);
      var out = '+7';
      if(a.length) out += ' (' + a + (a.length===3?')':'');
      if(b.length) out += (a.length===3? ' ':' ') + b;
      if(c.length) out += '-' + c;
      if(e.length) out += '-' + e;
      return out;
    };
    var onInput = function(){
      var d = digits(input.value);
      // Allow empty
      if(!d){ input.value = ''; return; }
      input.value = format(d);
    };
    input.addEventListener('input', onInput);
    input.addEventListener('blur', onInput);
    input.addEventListener('focus', function(){
      if(!input.value) input.value = '+7 (';
    });
  }

  // Init mask once DOM is ready
  try {
    var lf = document.getElementById('paverLeadForm');
    if(lf){
      pcApplyRuPhoneMask(lf.querySelector('input[name="phone"]'));
    }
  } catch(e) {}

})();

  // Bind after initial render
  trySubmitViaTildaForm();



// Patch42: delegated submit bridge to ensure click always works (Tilda may re-run scripts / replace nodes)
(function(){
  if(window.__pcSubmitBridgeBound) return;
  window.__pcSubmitBridgeBound = 1;

  function q(root, sel){ return root ? root.querySelector(sel) : null; }
  function qAll(root, sel){ return root ? root.querySelectorAll(sel) : []; }

  function findBFForm(){
    // Prefer a Tilda form that already has our hidden fields
    var f = null;
    var inp = document.querySelector('input[name="order_positions_text"]');
    if(inp) f = inp.closest('form');
    if(f) return f;
    // fallback: first tilda form
    return document.querySelector('form.t-form') || document.querySelector('.t-form');
  }

  function setVal(form, name, val){
    if(!form) return;
    var el = form.querySelector('input[name="'+name+'"], textarea[name="'+name+'"]');
    if(!el){
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.appendChild(el);
    }
    el.value = (val==null)?'':String(val);
    try{ el.dispatchEvent(new Event('input',{bubbles:true})); }catch(e){}
    try{ el.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
  }

  function getLocalVal(name){
    var lf = document.getElementById('paverLeadForm');
    var el = lf ? lf.querySelector('[name="'+name+'"]') : null;
    return el ? el.value : '';
  }

  function showLeadError(msg){
    var box = document.querySelector('[data-role="leadError"]');
    if(box){
      box.textContent = msg || '';
      box.style.display = msg ? '' : 'none';
    }
  }

  function validateLeadFields(){
    var lf = document.getElementById('paverLeadForm');
    if(!lf) return true;

    var nameEl = lf.querySelector('[name="name"]');
    var phoneEl = lf.querySelector('[name="phone"]');

    var nameVal = nameEl ? (nameEl.value || '').trim() : '';
    var phoneVal = phoneEl ? (phoneEl.value || '').trim() : '';
    var digits = phoneVal.replace(/\D/g,'');
    // Expect 11 digits starting with 7 (Russia)
    var phoneOk = (digits.length === 11 && digits.charAt(0) === '7');

    if(nameVal.length < 2){
      showLeadError('Пожалуйста, укажите имя.');
      if(nameEl) nameEl.focus();
      return false;
    }
    if(!phoneOk){
      showLeadError('Пожалуйста, укажите корректный номер телефона в формате +7.');
      if(phoneEl) phoneEl.focus();
      return false;
    }

    showLeadError('');
    return true;
  }

  document.addEventListener('click', function(ev){
    var t = ev.target;
    if(!t) return;
    if(t.id !== 'pcSubmitToTildaBtn') return;

    ev.preventDefault();
    ev.stopPropagation();

    if(!validateLeadFields()) return;

    var cartRef = window.__pcCart;
    if(!cartRef || !cartRef.positions || cartRef.positions.length === 0){
      var empty = document.querySelector('[data-role="cartEmpty"]');
      if(empty) empty.style.display = '';
      var cartBox = document.querySelector('.pcCart');
      if(cartBox){
        cartBox.classList.add('pcShake');
        setTimeout(function(){ cartBox.classList.remove('pcShake'); }, 450);
      }
      return;
    }

    // consent in local form
    var lf = document.getElementById('paverLeadForm');
    var cLocal = lf ? lf.querySelector('input[type="checkbox"][name="personal_data_consent"]') : null;
    if(cLocal && !cLocal.checked){
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
      try{ cLocal.focus(); }catch(e){}
      return;
    }

    // sync our hidden fields
    try{ if(window.cartUpdateHiddenFields) window.cartUpdateHiddenFields(); }catch(e){}

    var bf = findBFForm();
    if(!bf){
      alert('Не найдена форма Tilda (BF311N) для отправки.');
      return;
    }

    // sync consent into BF
    var cBf = bf.querySelector('input[type="checkbox"][name="personal_data_consent"]');
    if(cBf){ cBf.checked = true; }

    // copy contacts
    setVal(bf, 'name', getLocalVal('name'));
    setVal(bf, 'phone', getLocalVal('phone'));
    setVal(bf, 'email', getLocalVal('email'));
    setVal(bf, 'comment', getLocalVal('comment'));

    // copy cart payload (text + totals)
    var getSynced = function(n){
      var a = bf.querySelector('input[name="'+n+'"]');
      if(a && typeof a.value === 'string') return a.value;
      var b = document.querySelector('input[name="'+n+'"]');
      if(b && typeof b.value === 'string') return b.value;
      return '';
    };
    setVal(bf, 'order_positions_text', getSynced('order_positions_text'));
    setVal(bf, 'order_cart_grand_total', getSynced('order_cart_grand_total'));
    setVal(bf, 'order_positions_count', cartRef.positions.length);
    setVal(bf, 'order_source', 'tilda_calc_cart_v1');

    // submit via BF's submit control so tildaforms works
    var submitBtn = bf.querySelector('button[type="submit"], input[type="submit"]');
    if(submitBtn) submitBtn.click();
    else bf.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  }, true);
})();