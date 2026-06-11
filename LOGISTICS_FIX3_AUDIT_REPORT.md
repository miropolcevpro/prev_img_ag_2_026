# LOGISTICS FIX3 AUDIT REPORT

## Исправления
- Исправлен `logistics_rules.json`: валидный JSON без переноса строки внутри поля `note`.
- Обновлён `EMBED_VERSION` до `logistics20260611_fix3`.
- Логистические правила встроены в JS как fallback, поэтому модуль работает даже если внешний `logistics_rules.json` временно не загрузился.
- Добавлен dispatch события `paver:cart-updated` после `cartRender()`.
- Логистика пересчитывается по событию, MutationObserver и fallback polling.
- Добавлена диагностика `window.PaverLogistics.diagnose()`.

## Не изменялось
- цены товаров;
- скидки;
- стоимость поддонов;
- формулы расчёта товара;
- основной Tilda submit payload, кроме добавления отдельных `order_logistics_*` hidden fields.
