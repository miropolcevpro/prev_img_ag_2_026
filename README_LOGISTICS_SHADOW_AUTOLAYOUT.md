# Paver logistics module — shadow autolayout build

Stable base: `stable_clean_base_20260611_1`.

Logistics is isolated in one file:

```text
paver-logistics-module.js
```

No external logistics JSON is required. Transport rules are embedded in the module.

## Tilda snippet

```html
<div id="paverConf2026"></div>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-configurator-embed-safe-template-adaptive-final-curbs-unified-v4.js?v=20260611-clean-base-1"></script>

<script src="https://cdn.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js?v=20260611-shadow-autolayout-1"></script>
```

## Purge

```text
https://purge.jsdelivr.net/gh/miropolcevpro/prev_img_ag_2_026@main/paver-logistics-module.js
```

## Console diagnostics

```js
window.PaverLogisticsSingle.diagnose()
```

Expected:

```text
version: "paver-logistics-single-shadow-autolayout-20260611-1"
insideCart: false
aboveCart: true
```
