# Clean logistics build — 2026-06-11

Архив собран от стабильной версии калькулятора. Логистика вынесена в отдельный модуль `paver-logistics-module.js`.

## Что важно

- Основной калькулятор не содержит логистических вставок.
- Логистика не меняет цены, скидки, поддоны и товарную калькуляцию.
- Модуль читает уже рассчитанные поддоны и вес из DOM/корзины.
- `logistics_rules.json` валиден и используется как внешний override.
- Если `logistics_rules.json` не загрузится, модуль продолжит работать на встроенных правилах.

## Подключение Tilda

```html
<div id="paverConf2026"></div>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-clean-base-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260611-clean-logistics-1"></script>
```

## Purge jsDelivr

```text
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/logistics_rules.json
```

## Проверка в консоли

```js
window.__paverConfiguratorEmbedVersion
window.PaverLogisticsClean.diagnose()
```

Ожидаемые версии:

```text
stable_clean_base_20260611_1
paver-logistics-clean-20260611-1
```
