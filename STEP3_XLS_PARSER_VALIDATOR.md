# STEP 3 — XLS parser + price validator

Добавлены локальные инструменты для безопасного обновления `price_catalog.json` из XLS-прайса.

## Файлы

- `tools/price_parser_validator.py` — парсер XLS и валидатор.
- `config/price_mapping.json` — карта соответствия SKU калькулятора строкам XLS.
- `requirements.txt` — зависимость `openpyxl`.

## Команда проверки

```bash
pip install -r requirements.txt
python tools/price_parser_validator.py   --xls ./Prays_List_Stroytorg_novy_09_06_2026_g.xlsx   --catalog ./price_catalog.json   --mapping ./config/price_mapping.json   --out ./price_catalog.generated.json   --report ./reports/price_validation_report.json
```

## Логика

Скрипт не публикует изменения и не меняет JS. Он только:

1. читает XLS;
2. сопоставляет строки с SKU по `config/price_mapping.json`;
3. генерирует новый `price_catalog.generated.json`;
4. формирует отчёт `reports/price_validation_report.json`;
5. возвращает exit code `1`, если есть блокирующие ошибки.

## Блокирующие ошибки

- обязательная позиция не найдена в XLS;
- позиция сопоставилась с несколькими строками;
- цена пустая;
- цена равна 0;
- SKU есть в mapping, но отсутствует в каталоге.

## Предупреждения

- изменение цены больше 30%;
- изменение цены больше 50%;
- в XLS есть товарные строки, не сопоставленные с калькулятором.

Публикацию в GitHub делаем следующим этапом, после того как валидатор стабильно проходит на реальных прайсах.
