/*
# Create products catalog (public, read-only)

1. New Tables
- `products`: devices shown on the comparison section (laptops, desktops, tablets).
  - `id`, `category`, `brand`, `name`, `price_uah`, `cpu`, `ram_gb`, `storage_gb`,
    `display_inches`, `weight_kg`, `battery_hours`, `marketplace_url`, `is_published`, `created_at`.
2. Seed
- Five placeholder rows so the comparison works out of the box. Replace them with real offers.
3. Security
- Row level security is enabled.
- The public site (anon key) may only read published rows. No client-side writes are allowed.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('laptop', 'desktop', 'tablet')),
  brand text NOT NULL,
  name text NOT NULL,
  price_uah integer NOT NULL CHECK (price_uah >= 0),
  cpu text,
  ram_gb integer CHECK (ram_gb >= 0),
  storage_gb integer CHECK (storage_gb >= 0),
  display_inches numeric(3,1),
  weight_kg numeric(4,2),
  battery_hours numeric(4,1),
  marketplace_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON products TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_published_products" ON products;
CREATE POLICY "anon_select_published_products" ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_published);

INSERT INTO products (category, brand, name, price_uah, cpu, ram_gb, storage_gb, display_inches, weight_kg, battery_hours)
SELECT * FROM (VALUES
  ('laptop', 'Приклад', 'Ноутбук 15.6" базовий', 18999, 'Intel Core i3', 8, 256, 15.6, 1.80, 7.0),
  ('laptop', 'Приклад', 'Ноутбук 14" для навчання', 27999, 'Intel Core i5', 16, 512, 14.0, 1.45, 10.5),
  ('laptop', 'Приклад', 'Ноутбук 16" для творчості', 42999, 'AMD Ryzen 7', 16, 1024, 16.0, 1.90, 9.0),
  ('desktop', 'Приклад', 'Системний блок офісний', 22999, 'Intel Core i5', 16, 512, NULL, NULL, NULL),
  ('tablet', 'Приклад', 'Планшет 11"', 13999, 'MediaTek Dimensity', 8, 128, 11.0, 0.52, 10.0)
) AS seed(category, brand, name, price_uah, cpu, ram_gb, storage_gb, display_inches, weight_kg, battery_hours)
WHERE NOT EXISTS (SELECT 1 FROM products);
