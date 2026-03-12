Файлы для production-подключения в Tilda.

1. Загрузите paver-configurator.css и paver-configurator.js на ваш сервер/CDN.
2. Превью-каталоги из backend архива должны лежать по тем же путям:
   /forms2
   /stonemix_preview
   /colormix_preview
   /mono_preview
   /curb_preview
3. В HTML-блок Tilda вставьте содержимое файла:
   - tilda-snippet-local-path.html
   или
   - tilda-snippet-example-cdn.html (после замены URL на ваш)

Важно:
- Логика расчёта, корзины и bridge отправки формы сохранена из последней рабочей версии.
- data-cdn в корневом контейнере оставлен как в текущем фронтенде; если формы/цвета грузятся с другого CDN, замените его в snippet.
