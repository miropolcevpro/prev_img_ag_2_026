# Автообновление price_catalog.json из XLSX производителя

Этот пакет добавляет в репозиторий:
- конвертер `price_update_tool/update_price_catalog.py`
- GitHub Actions workflow `.github/workflows/update-price.yml`
- папку `source/` для исходного XLSX производителя (по умолчанию `source/price_supplier.xlsx`)

## Быстрый старт (1 раз)

1) Скопируйте содержимое этого архива в корень репозитория `prev_img_ag_2_026`.
2) Убедитесь, что в корне репо уже есть `price_catalog.json` (ваш текущий).
3) Закоммитьте и запушьте изменения.

После первого пуша workflow станет доступен в GitHub → вкладка Actions.

## Обновление прайса "в одну кнопку"

### Вариант A (рекомендуется): заменить файл и запушить
1) Замените файл `source/price_supplier.xlsx` новым прайсом производителя.
2) Commit + Push в main.
3) GitHub Actions запустится автоматически, соберёт новый `price_catalog.json` и создаст Pull Request.

### Вариант B: ручной запуск workflow
1) GitHub → Actions → **Update price_catalog.json from supplier XLSX**
2) **Run workflow**
3) (Опционально) укажите другой путь к XLSX в репозитории (параметр `xlsx_path`)
4) Workflow соберёт JSON и создаст PR.

## Что делает конвертер
Скрипт:
- читает текущий `price_catalog.json`
- извлекает цены/упаковку/вес из XLSX (лист `плитка+борт`)
- сопоставляет строки по названию позиции (name) и толщине/размеру
- обновляет значения, сохраняя структуру JSON
- выполняет проверки целостности; при ошибках workflow падает и PR не создаётся
- пишет отчёт `price_update_report.json`

## Где смотреть отчёт
- В PR будет файл `price_update_report.json` (если вы добавите его в коммит), а также workflow прикрепляет его как artifact `price_update_report`.

## Требования
- Python 3.11+ (локально)
- Библиотека `openpyxl` (workflow устанавливает автоматически)

## Локальный запуск (для проверки)
```bash
python3 -m pip install openpyxl
python3 price_update_tool/update_price_catalog.py \
  --xlsx "source/price_supplier.xlsx" \
  --price-catalog "./price_catalog.json" \
  --report "./price_update_report.json"
```

## Важные правила стабильности
- Не редактируйте `price_catalog.json` руками: только через конвертер.
- Если производитель поменял названия строк — конвертер остановится и выдаст список несоответствий в `price_update_report.json`.
- После мерджа PR в main не забудьте обновить версию ассетов (`ASSET_VER`/cache-busting) там, где вы это используете.
