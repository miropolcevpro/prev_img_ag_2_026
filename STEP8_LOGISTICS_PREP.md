# STEP8 — подготовка полей под логистику

## Цель

Заложить структуру для будущего автоматического расчёта логистики без изменения текущей логики калькулятора, скидок, поддонов и интеграции с Tilda.

## Принцип безопасности

На этом шаге логистика **не участвует в расчёте итоговой цены**.

Рабочий флаг:

```json
"logistics": {
  "enabled": false,
  "mode": "prepared_only"
}
```

Пока отдельный logistics-модуль не подключён, калькулятор использует прежнюю схему расчёта.

## Что добавлено

### 1. `config/logistics_rules.json`

Файл будущих правил логистики:

- типы машин;
- базовая стоимость доставки;
- цена за км;
- зоны;
- ручные поля для будущей админки.

Все правила выключены по умолчанию.

### 2. Логистические поля в `price_catalog.json`

Для тротуарной плитки в каждую толщину добавлено:

```json
"logistics": {
  "unit_for_logistics": "m2",
  "units_per_pallet": 8.64,
  "pallet_weight_kg": 1610,
  "weight_per_unit_kg": 186.3426,
  "volume_per_unit_m3": null,
  "load_group": "paver_tile",
  "enabled_for_future_logistics": true
}
```

Для бордюров:

```json
"logistics": {
  "unit_for_logistics": "meter",
  "units_per_pallet": 18,
  "pcs_per_pallet": 18,
  "pallet_weight_kg": 1250,
  "weight_per_unit_kg": 69.4444,
  "volume_per_unit_m3": null,
  "load_group": "curbstone",
  "enabled_for_future_logistics": true
}
```

### 3. `admin_settings.json`

Расширен блок:

```json
"logistics": {
  "enabled": false,
  "mode": "prepared_only",
  "currency": "RUB",
  "manual_adjustments_enabled": true,
  "rules_file": "config/logistics_rules.json"
}
```

### 4. Парсер XLS

`tools/price_parser_validator.py` теперь после обновления упаковки автоматически пересчитывает логистические поля:

- `units_per_pallet`;
- `pallet_weight_kg`;
- `weight_per_unit_kg`.

Цены и упаковка обновляются как раньше. Логистические поля не ломают старый формат.

### 5. Frontend админки

В админку добавлено:

- загрузка `config/logistics_rules.json`;
- отображение статуса логистики;
- редактирование `logistics_rules.json`;
- checkbox будущего включения логистики;
- скачивание `logistics_rules.json`;
- отправка `logisticsRules` в backend при публикации.

### 6. Backend publish / rollback / purge

Backend теперь поддерживает:

- публикацию `config/logistics_rules.json`;
- backup `backups/logistics_rules_*.json`;
- rollback `logistics_rules.json` вместе с ценами и настройками;
- purge `config/logistics_rules.json` через jsDelivr.

## Проверки

Выполнено:

```text
python3 tools/check_logistics_fields.py
python3 tools/price_parser_validator.py --xls ...
npm run check
```

Результат:

```text
logistics fields: ok
price parser: passed
node syntax: passed
```

## Что не менялось

- расчёт цены товара;
- расчёт скидок;
- стоимость поддонов в текущей формуле;
- payload Tilda;
- основной embed JS калькулятора;
- логика корзины.

## Следующий этап

Следующий логичный шаг — сделать отдельный модуль расчёта логистики:

```text
cart items → вес / паллеты / объём → тип машины → зона / расстояние → стоимость доставки
```

Подключать его нужно отдельным флагом `admin_settings.logistics.enabled=true` только после smoke-test.
