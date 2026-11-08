/*
  # Fix understated catalog prices (SSD, DDR4/RAM, affected kits)

  1. Modified Tables
  - `products`: corrects `price_uah` for RAM, SSD, and bundle items whose prices
    were set too low in `20261107080952_update_catalog_real_products.sql`.

  2. Approach
  - Updates rows matched by current (category, name) so it works on databases
    where the previous "real products" migration has already been applied.
  - Only `price_uah` is changed; no schema/access changes.

  3. Notes
  - Values are approximate UAH market estimates at the time of this migration.
    Verify and adjust to current store prices (links in `marketplace_url`) before
    relying on them.
  - Kit prices reflect the bundled parts/service as a rough estimate; confirm the
    actual bundle composition and service cost.
*/

UPDATE products
SET price_uah = 2699
WHERE category = 'ram'
  AND name = 'Kingston FURY 16 ГБ (2×8) DDR4 3200';

UPDATE products
SET price_uah = 5999
WHERE category = 'ram'
  AND name = 'Corsair Vengeance 32 ГБ (2×16) DDR4 3600';

UPDATE products
SET price_uah = 2199
WHERE category = 'ssd'
  AND name = 'Samsung 980 500 ГБ SATA SSD';

UPDATE products
SET price_uah = 4999
WHERE category = 'ssd'
  AND name = 'Samsung 980 PRO 1 ТБ NVMe SSD';

UPDATE products
SET price_uah = 6499
WHERE category = 'kit'
  AND name = 'Комплект «Швидкий старт»: SSD 1 ТБ + перенесення даних';

UPDATE products
SET price_uah = 44999
WHERE category = 'kit'
  AND name = 'Комплект «Для ігор»: RTX 4070 + Ryzen 7 + 32 ГБ';
