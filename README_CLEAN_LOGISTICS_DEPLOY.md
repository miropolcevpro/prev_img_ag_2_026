# Clean Logistics Accordion Module

Стабильная чистая сборка калькулятора с отдельным модулем логистики.

## Что изменено

- Основной калькулятор не изменяет логику цен, скидок, поддонов и Tilda-submit.
- Логистика вынесена в отдельный файл `paver-logistics-module.js`.
- Блок `Логистика` свернут по умолчанию.
- При нажатии на заголовок `Логистика` раскрывается расчёт транспорта.
- Варианты транспорта скрыты внутри раскрытого блока и открываются отдельной кнопкой `Выбрать другой транспорт`.

## Tilda snippet

```html
<div id="paverConf2026"></div>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-clean-base-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260611-clean-logistics-accordion-1"></script>
```

## Purge

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

Ожидаемая версия логистики:

```text
paver-logistics-accordion-20260611-1
```
