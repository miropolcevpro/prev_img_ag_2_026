# Логистический модуль временно отключён

Модуль `paver-logistics-module.js` сохранён в проекте и не удалён.

## Текущее состояние

В `tilda-snippet.html` перед подключением модуля установлен флаг:

```js
window.PAVER_LOGISTICS_CONFIG = {
  enabled: false,
  mountRootId: 'paverConf2026'
};
```

При `enabled: false` модуль:

- не создаёт интерфейс;
- не запускает MutationObserver и polling;
- удаляет возможные старые логистические контейнеры;
- не вмешивается в цены, корзину, скидки и расчёт калькулятора;
- остаётся доступным для последующего включения.

## Как включить обратно

Изменить только одно значение:

```js
window.PAVER_LOGISTICS_CONFIG = {
  enabled: true,
  mountRootId: 'paverConf2026'
};
```

После изменения обновить параметр версии у `paver-logistics-module.js` и выполнить purge jsDelivr.
