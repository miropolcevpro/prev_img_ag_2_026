# Stable layout polish audit

Base: `Калькулятор_конфигуратор_SINGLE_LOGISTICS_LAYOUTFIX_2026-06-11` uploaded by user.

## Scope
Only `paver-logistics-module.js` and `tilda-snippet.html` were changed.

## Changes
- Version bumped to `paver-logistics-stable-layout-polish-20260611-1`.
- Kept stable mount logic from the supplied Layoutfix build.
- Kept one-file logistics architecture: `paver-logistics-module.js`.
- Added CSS-only layout hardening for the collapsed logistics header.
- Replaced cramped trip display with a dedicated two-line block:
  - `Количество рейсов`
  - `<N> рейс(ов)`
- Ensured badge text is `Рекомендация по транспорту`; no `Авто` label remains.
- Centered the chevron with CSS grid and a CSS pseudo-element arrow.

## Not changed
- Product pricing.
- Discounts.
- Pallet math.
- Cart calculations.
- Tilda submit payload except existing logistics hidden fields.
- Main configurator JS logic.

## Validation
- `node --check paver-logistics-module.js`: passed.
- `price_catalog.json`: valid JSON.
- ZIP does not contain legacy logistics addon files.
