#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate that future logistics fields exist without changing current calculator logic."""
import argparse, json, math, sys
from pathlib import Path

def numeric(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(float(v))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--catalog', default='price_catalog.json')
    ap.add_argument('--settings', default='admin_settings.json')
    ap.add_argument('--rules', default='config/logistics_rules.json')
    args = ap.parse_args()

    catalog = json.load(open(args.catalog, encoding='utf-8'))
    settings = json.load(open(args.settings, encoding='utf-8'))
    rules = json.load(open(args.rules, encoding='utf-8'))

    errors = []
    warnings = []
    pavers = 0
    curbs = 0

    if settings.get('logistics', {}).get('enabled') is not False:
        warnings.append('admin_settings.logistics.enabled is not false; ensure logistics module is connected before enabling.')
    if rules.get('meta', {}).get('status') != 'prepared_not_active':
        warnings.append('logistics_rules.meta.status is not prepared_not_active.')

    for item in catalog.get('pavers', {}).get('items', []):
        for th in item.get('thickness', []):
            pavers += 1
            lg = th.get('logistics')
            sku = f"paver::{item.get('id')}::{th.get('mm')}"
            if not isinstance(lg, dict):
                errors.append(f'{sku}: missing logistics object')
                continue
            for key in ['unit_for_logistics','units_per_pallet','pallet_weight_kg','weight_per_unit_kg','load_group']:
                if key not in lg:
                    errors.append(f'{sku}: missing logistics.{key}')
            if lg.get('unit_for_logistics') != 'm2':
                errors.append(f'{sku}: expected logistics.unit_for_logistics=m2')

    for item in catalog.get('curbstone', {}).get('items', []):
        curbs += 1
        lg = item.get('logistics')
        sku = f"curbstone::{item.get('id')}"
        if not isinstance(lg, dict):
            errors.append(f'{sku}: missing logistics object')
            continue
        for key in ['unit_for_logistics','units_per_pallet','pallet_weight_kg','weight_per_unit_kg','load_group']:
            if key not in lg:
                errors.append(f'{sku}: missing logistics.{key}')
        if lg.get('unit_for_logistics') != 'meter':
            errors.append(f'{sku}: expected logistics.unit_for_logistics=meter')

    report = {
        'ok': not errors,
        'paver_variants_checked': pavers,
        'curbstone_items_checked': curbs,
        'errors': errors,
        'warnings': warnings
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if errors else 0

if __name__ == '__main__':
    sys.exit(main())
