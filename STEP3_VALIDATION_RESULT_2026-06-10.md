# STEP 3 validation result — XLS parser + validator

Проверено на файле:

`Prays_List_Stroytorg_novy_09_06_2026_g.xlsx`

Результат:

- Статус: `passed`
- Mapping items: `19`
- XLS product rows: `24`
- Changed price values: `7`
- Unchanged price values: `126`
- Blocking errors: `0`
- Warnings: `3`

Предупреждения не блокируют публикацию:

1. `Газонная решетка 80 мм` — в XLS две строки; выбрана строка, где текущая серая цена совпадает с каталогом.
2. `Променад II 40 мм` — в XLS две строки с одинаковыми ценами; выбрана первая.
3. В XLS есть строки, которые не используются текущим калькулятором: рельефная версия, Брусчатка 60 мм, альтернативная Газонная решетка, блоки.

На этом этапе скрипт не публикует данные в GitHub и не меняет JS. Он безопасно генерирует кандидат `reports/price_catalog.generated.json` и отчет `reports/price_validation_report.json`.
