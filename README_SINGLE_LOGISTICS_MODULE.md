# Clean Single Logistics Module

Чистовая сборка калькулятора с отдельным единым модулем логистики.

## Состав

- `paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js` — стабильный основной калькулятор без встроенной логистики.
- `paver-logistics-module.js` — единственный модуль расчёта логистики.
- `price_catalog.json`, `forms.json`, `palettes_*.json`, `technologies.json`, изображения — рабочие данные калькулятора.

## Удалено

- `paver-logistics-addon-final.js`
- `paver-logistics-above-cart-v2.js`
- `logistics_rules.json`
- старые audit/report/debug-файлы
- backend/admin артефакты
- временные файлы и системный мусор

## Важно

Правила транспорта встроены в `paver-logistics-module.js`. Модуль не зависит от `logistics_rules.json`, поэтому CDN/JSON-кэш не может сломать расчёт логистики.

## Tilda snippet

```html
<div id="paverConf2026"></div>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-clean-base-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260611-single-logistics-module-1"></script>
```

## Проверка в консоли

```js
window.__paverConfiguratorEmbedVersion
window.PaverLogisticsSingle.diagnose()
```

Ожидаемая версия логистики:

```text
paver-logistics-single-module-20260611-1
```
