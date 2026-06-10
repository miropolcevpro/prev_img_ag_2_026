# STEP9 — публикация без Vercel через GitHub Actions

## Что изменено

Backend на Vercel удалён из схемы. Админка на Tilda работает как безопасный frontend:

1. загружает XLS/XLSX;
2. валидирует соответствие позиций;
3. показывает ошибки/предупреждения;
4. даёт скачать подготовленные JSON;
5. публикация выполняется вручную через GitHub Actions `Run workflow`.

GitHub token не хранится в Tilda и не попадает в браузер.

## Файлы, которые добавлены

```text
.github/workflows/publish-prices.yml
.github/workflows/rollback-prices.yml
.github/scripts/publish-prices-from-upload.js
.github/scripts/rollback-prices-from-backup.js
_admin_upload/README.md
```

## Подключение админки в Tilda

Вставить на закрытую страницу Tilda:

```html
<div id="paverPriceAdmin"></div>
<script>
window.PAVER_PRICE_ADMIN_CONFIG = {
  mountId: 'paverPriceAdmin',
  repoBase: 'https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/',
  githubOwner: 'miropolcevpro',
  githubRepo: 'prev_img_ag_2_026',
  publishEnabled: false
};
</script>
<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/admin/price-admin.js?v=20260610-admin-github-actions-1"></script>
```

## Процесс обновления цен

1. Открыть закрытую страницу Tilda с админкой.
2. Загрузить актуальный XLS/XLSX прайс.
3. Проверить отчёт валидации.
4. Если статус не `failed`, скачать файлы:
   - `price_catalog.generated.json`
   - `admin_settings.generated.json`
   - `logistics_rules.generated.json`
   - `price_validation_report.json`
5. Открыть GitHub → папка `_admin_upload`.
6. Загрузить туда 4 файла. Имена файлов должны остаться ровно такими же.
7. Открыть GitHub → Actions → `Publish prices from admin upload`.
8. Нажать `Run workflow`.
9. Дождаться зелёного статуса workflow.
10. Проверить основную страницу калькулятора.

## Что делает workflow публикации

- проверяет наличие 4 файлов в `_admin_upload`;
- блокирует публикацию, если `price_validation_report.json` содержит `status: failed` или ошибки;
- создаёт backup текущих файлов;
- обновляет:
  - `price_catalog.json`
  - `admin_settings.json`
  - `config/logistics_rules.json`
  - `reports/price_validation_report.json`
  - `reports/publish_history.json`
- делает commit в `main`;
- очищает jsDelivr cache.

## Rollback

1. Открыть GitHub → Actions → `Rollback prices from backup`.
2. Нажать `Run workflow`.
3. Ввести `backup_id`, например имя папки из `backups/`.
4. Запустить workflow.

Перед rollback система создаёт safety backup текущего состояния.

## Важно

- Не хранить GitHub token в Tilda.
- Не публиковать прайс, если есть ошибки валидации.
- После публикации при необходимости менять cache-busting версию в основной Tilda-ссылке: `?v=...`.
