# Logistics fix report 2026-06-11

Исправления:

1. Bumped EMBED_VERSION: logistics20260611_1.
   Причина: старое значение discount20260604_4 могло срабатывать в duplicate guard и блокировать выполнение нового логистического модуля.

2. Обновлена версия logistics_rules.json до 2026-06-11-logistics-fix-1.

3. Добавлен явный перенос hidden fields логистики в BF/Tilda submit bridge:
   - order_logistics_text
   - order_logistics_json
   - order_logistics_vehicle
   - order_logistics_trips

4. Обновлены Tilda snippets на ?v=20260611-logistics-fix-1.

Публикация:
- загрузить файлы в GitHub main;
- purge JS и logistics_rules.json;
- заменить Tilda script URL на новую версию.
