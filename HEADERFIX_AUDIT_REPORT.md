# HEADERFIX audit

Fixed collapsed logistics header layout.

- Logistics remains isolated in `paver-logistics-module.js`.
- Main calculator JS is not changed.
- Header uses 2-column grid: content + centered chevron.
- Badge is inside content row, not a separate grid column, so it cannot collide with the title.
- At narrow widths, recommendation text and badge stack vertically.

Validation:

- `node --check paver-logistics-module.js`: ok
- `logistics_rules.json`: valid JSON
- `price_catalog.json`: valid JSON
- junk files removed
