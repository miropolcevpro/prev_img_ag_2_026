# Аудит clean-сборки логистики

Дата: 2026-06-11

## Цель

Собрать чистую стабильную версию калькулятора, где логистика работает отдельным модулем и не смешивается со слоями основного конфигуратора.

## Что сделано

- Взята стабильная версия основного калькулятора.
- Удалены предыдущие логистические интеграции из основного JS за счёт отката к стабильному main JS без логистики.
- Логистика вынесена в отдельный файл `paver-logistics-module.js`.
- Удалены дубли JS-файлов, отчёты старых релизов, временные backend/admin-папки, `__MACOSX`, `__pycache__`, `.DS_Store`, `._*`.
- Добавлен валидный `logistics_rules.json`.
- Добавлен один snippet для Tilda: `tilda-snippet.html`.

## Проверки

```text
main JS syntax: ok
logistics module syntax: ok
price_catalog.json: valid
logistics_rules.json: valid
junk files: 0
legacy logistics inside main JS: not found
```

## Архитектура

```text
Основной калькулятор:
  paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js

Отдельный модуль логистики:
  paver-logistics-module.js

Правила транспорта:
  logistics_rules.json
```

## Изоляция логистики

Логистика:

- не меняет цены;
- не меняет скидки;
- не меняет расчёт поддонов;
- не меняет основной submit;
- читает уже рассчитанные `pallets` и `ship_weight_kg` из корзины или DOM;
- записывает только отдельные hidden fields `order_logistics_*`.

## Диагностика

На опубликованной странице:

```js
window.__paverConfiguratorEmbedVersion
window.PaverLogisticsClean.diagnose()
```

Ожидаемо:

```text
stable_clean_base_20260611_1
paver-logistics-clean-20260611-1
```
