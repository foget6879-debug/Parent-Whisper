/*
# Add components and ready-made kits to the product catalog

1. Modified Tables
- `products`
  - New column `description` (text, optional): short plain-language summary shown on cards and in comparisons.
  - `category` now also accepts: `gpu` (graphics cards), `cpu` (processors), `ram` (memory), `ssd` (storage), `kit` (ready-made upgrade bundles).

2. Seed
- Example entries for each new category so the filters are not empty. Placeholder prices, to be replaced with real offers.
- Seeding skips any row whose category and name already exist, so re-running is safe.

3. Security
- No change to access rules. The public site can still only read published rows.

# Notes
1. Existing laptop, desktop and tablet rows are not modified.
2. The category rule is replaced in place; no data is removed.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('laptop', 'desktop', 'tablet', 'kit', 'gpu', 'cpu', 'ram', 'ssd'));

INSERT INTO products (category, brand, name, price_uah, description, cpu, ram_gb, storage_gb)
SELECT seed.category, seed.brand, seed.name, seed.price_uah, seed.description, seed.cpu, seed.ram_gb, seed.storage_gb
FROM (VALUES
  ('gpu', 'Приклад', 'Відеокарта 8 ГБ', 12999, 'Для сучасних ігор і відтворення відео у високій якості', NULL, NULL::integer, NULL::integer),
  ('gpu', 'Приклад', 'Відеокарта 12 ГБ', 19999, 'Для ігор у високій якості та монтажу відео', NULL, NULL::integer, NULL::integer),
  ('cpu', 'Приклад', 'Процесор 6 ядер', 7999, 'Швидкий для навчання, офісу та браузера', 'Intel Core i5', NULL::integer, NULL::integer),
  ('cpu', 'Приклад', 'Процесор 8 ядер', 11999, 'Для творчості, монтажу та великих таблиць', 'AMD Ryzen 7', NULL::integer, NULL::integer),
  ('ram', 'Приклад', 'Пам’ять 16 ГБ (2×8)', 2199, 'Достатньо для навчання, фільмів і кількох програм одночасно', NULL, 16, NULL::integer),
  ('ram', 'Приклад', 'Пам’ять 32 ГБ (2×16)', 3999, 'Для ігор, монтажу та великої кількості вкладок', NULL, 32, NULL::integer),
  ('ssd', 'Приклад', 'SSD 1 ТБ NVMe', 2499, 'Швидкий накопичувач на місце для багатьох років фото й файлів', NULL, NULL::integer, 1000),
  ('ssd', 'Приклад', 'SSD 500 ГБ SATA', 1199, 'Бюджетне прискорення старого ноутбука або комп’ютера', NULL, NULL::integer, 500),
  ('kit', 'Приклад', 'Комплект «Швидкий старт»', 3699, 'SSD 1 ТБ NVMe з перенесенням усіх даних і налаштуванням', NULL, NULL::integer, 1000),
  ('kit', 'Приклад', 'Комплект «Для ігор»', 22999, 'Відеокарта 12 ГБ, процесор 8 ядер і 32 ГБ пам’яті', 'AMD Ryzen 7', 32, 1000)
) AS seed(category, brand, name, price_uah, description, cpu, ram_gb, storage_gb)
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.category = seed.category AND p.name = seed.name
);
