# Реализация логистического расчёта

Дата: 2026-06-10  
Версия embed: `logistics20260610_1`

## Что добавлено

1. Файл `logistics_rules.json` с матрицей транспорта:
   - бортовой длинномер до 21 / 22 / 25 т;
   - манипулятор до 5 / 11 / 15 / 20 т;
   - вместимость поддонов плитки и бордюра;
   - грузоподъёмность.

2. Изолированный frontend-модуль логистики в конце файла:
   - `paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js`.

3. UI-блок в корзине:
   - рекомендованный транспорт;
   - количество рейсов;
   - суммарные поддоны;
   - поддоны плитки / бордюра;
   - общий вес;
   - загрузка по поддонам;
   - загрузка по весу;
   - ручной выбор транспорта;
   - таблица альтернативных вариантов.

4. Hidden fields для Tilda/менеджера:
   - `order_logistics_text`
   - `order_logistics_json`
   - `order_logistics_vehicle`
   - `order_logistics_trips`

## Формула расчёта

Для каждой корзины считается:

```text
tile_pallets = сумма поддонов плитки
curb_pallets = сумма поддонов бордюра
total_weight_kg = сумма веса позиций
```

Для каждого транспорта:

```text
normalized_pallet_load = tile_pallets / tile_pallet_capacity + curb_pallets / curb_pallet_capacity
trips_by_pallets = ceil(normalized_pallet_load)
trips_by_weight = ceil(total_weight_kg / payload_kg)
required_trips = max(trips_by_pallets, trips_by_weight)
```

Такая формула безопасна для смешанных заказов, где одновременно есть плитка и бордюр.

## Авто-рекомендация

Система выбирает:

1. транспорт с минимальным количеством рейсов;
2. если рейсов одинаково — сначала манипулятор;
3. если категория одинаковая — меньшая грузоподъёмность.

Менеджер/клиент может вручную выбрать другой транспорт в выпадающем списке.

## Что не изменялось

- товарные цены;
- расчёт скидок;
- расчёт кратности поддонам;
- стоимость поддонов;
- итоговая сумма корзины;
- основная логика отправки Tilda;
- структуры существующих hidden fields.

Логистика не добавляет стоимость доставки в итог. Текст: “Стоимость доставки не включена и согласуется менеджером”.

## Проверки

- `node --check` для основного JS: OK
- `logistics_rules.json`: valid JSON
- архив собран без `__MACOSX`, `__pycache__`, `.DS_Store`

## Подключение

После загрузки файлов в GitHub очистить CDN:

```text
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/logistics_rules.json
```

Snippet для Tilda:

```html
<div id="paverConf2026"></div>
<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260610-logistics-1"></script>
```
