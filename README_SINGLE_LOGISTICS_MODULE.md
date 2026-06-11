# Single Logistics Module — layout fix

Сборка содержит один отдельный модуль логистики:

- `paver-logistics-module.js`

Основной калькулятор не содержит логистической логики. Модуль логистики подключается вторым script-тегом и монтируется строго над блоком корзины, не внутри корзины.

## Подключение Tilda

```html
<div id="paverConf2026"></div>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-clean-base-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260611-single-logistics-layoutfix-1"></script>
```

## Проверка

```js
window.PaverLogisticsSingle.diagnose()
```

Ожидаемая версия:

```text
paver-logistics-single-module-layoutfix-20260611-1
```
