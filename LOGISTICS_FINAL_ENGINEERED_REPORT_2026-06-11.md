# LOGISTICS FINAL ENGINEERED 2026-06-11

## Что исправлено

- Архив собран от стабильной версии продукта.
- Основной JS имеет новую версию `logistics20260611_final_engineered_1`.
- Логистический блок появляется сразу как активный блок даже до расчёта, чтобы визуально подтверждать загрузку новой версии.
- Расчёт логистики работает по текущему расчёту позиции, даже если корзина пустая.
- Если позиции добавлены в корзину, расчёт переключается на корзину.
- `logistics_rules.json` валиден и не содержит переносов внутри строк JSON.
- Правила транспорта встроены в JS как fallback; внешний `logistics_rules.json` используется только как override.
- Логистика не меняет цены, скидки, поддоны, общие суммы и существующую Tilda-интеграцию.

## Диагностика в консоли

```js
window.__paverConfiguratorEmbedVersion
window.PaverLogistics.diagnose()
```

Ожидаемая версия:

```text
logistics20260611_final_engineered_1
```

## Подключение Tilda

```html
<div id="paverConf2026"></div>
<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-logistics-final-engineered-1"></script>
```

## Purge jsDelivr

```text
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/logistics_rules.json
```
