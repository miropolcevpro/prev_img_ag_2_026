# Price Update Tool (prev_img_ag_2_026)

This tool updates `price_catalog.json` **in-place** from the supplier XLSX (Актив Групп).
It preserves your current JSON structure (ids, nesting) and only updates numeric fields.

## Requirements
- Python 3.9+
- `openpyxl` installed (`pip install openpyxl`)

## Usage
```bash
python3 update_price_catalog.py \
  --xlsx "Прайс Лист Стройторг новый 2026 г (1).xlsx" \
  --price-catalog "./price_catalog.json" \
  --report "./price_update_report.json"
```

If mapping succeeds, it overwrites `price_catalog.json` and writes a report JSON.

## Safety
If some rows from XLSX cannot be mapped to existing items (by NAME), tool exits with code 3 and does **not** write output.
Check `price_update_report.json` fields:
- `pavers_missing`
- `curb_missing`
- `added_thickness` (if XLSX contains a thickness not present in current JSON)

## How mapping works
- Pavers: extracts form name from quotes in column A, e.g. `"Новый город"`, and matches it to `price_catalog.pavers.items[].name`.
- Curbstone: matches full name in column A to `price_catalog.curbstone.items[].name`.

## Notes
- The tool keeps string values like `"по запросу"` or `"-"` as-is.
- It updates packaging fields as they appear in XLSX.
