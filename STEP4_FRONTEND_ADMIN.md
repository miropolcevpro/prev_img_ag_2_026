# STEP4 — Frontend админки обновления цен

Добавлен автономный frontend-виджет для закрытой страницы Tilda.

## Файлы

- `admin/price-admin.js` — frontend админки.
- `admin/price-admin.css` — стили.
- `tilda-admin-snippet.html` — код для вставки в отдельную страницу Tilda.

## Что умеет STEP4

1. Загружает базовые файлы из репозитория/CDN:
   - `price_catalog.json`
   - `admin_settings.json`
   - `config/price_mapping.json`
2. Принимает `.xls/.xlsx` через браузер.
3. Парсит XLS на клиенте через SheetJS CDN.
4. Сопоставляет позиции по `price_mapping.json`.
5. Валидирует:
   - отсутствующие обязательные SKU;
   - пустые/нечисловые цены;
   - нулевые или отрицательные цены;
   - дубли совпадений;
   - сильные изменения цены от 30%;
   - критически сильные изменения от 50%.
6. Показывает отчёт:
   - изменения;
   - ошибки;
   - предупреждения;
   - не найденные позиции;
   - лишние строки XLS.
7. Позволяет локально изменить `admin_settings.json`, включая стоимость поддона.
8. Позволяет скачать:
   - `price_catalog.generated.json`
   - `price_validation_report.json`
   - `admin_settings.json`

## Важно

На этом шаге публикация в GitHub ещё не выполняется. Это будет STEP5 — backend и GitHub publish.

STEP4 не меняет основной калькулятор и не вмешивается в расчёты. Он только добавляет frontend админки для проверки и подготовки данных.

## Код для Tilda

```html
<div id="paverPriceAdmin"></div>
<script>
window.PAVER_PRICE_ADMIN_CONFIG = {
  mountId: 'paverPriceAdmin',
  repoBase: 'https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/'
};
</script>
<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/admin/price-admin.js?v=20260610-admin-1"></script>
```

## Purge после загрузки в GitHub

```text
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/admin/price-admin.js
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/admin/price-admin.css
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/config/price_mapping.json
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/admin_settings.json
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/price_catalog.json
```
