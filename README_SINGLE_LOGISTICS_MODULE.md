# Clean Single Logistics Module

Connect only two scripts in Tilda: the stable calculator and the standalone logistics module.

```html
<div id="paverConf2026"></div>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-clean-base-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260611-single-logistics-final-polish-1"></script>
```

Purge after upload:

```text
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js
```

Console check:

```js
window.PaverLogisticsSingle.diagnose()
```

Expected version:

```text
paver-logistics-single-module-final-polish-20260611-1
```
