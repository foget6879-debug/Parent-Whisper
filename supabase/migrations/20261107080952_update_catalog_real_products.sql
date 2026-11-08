/*
# Update catalog with real product names, brands, prices and marketplace links

1. Modified Tables
- `products`: replace placeholder names ("Приклад") and empty marketplace_url with
  concrete models, real brands, accurate prices, and search links to a major Ukrainian
  marketplace so the "Where to buy" button works for every item.

2. Approach
- Update existing rows matched by (category, name). No rows are deleted, no columns
  are added or dropped — only brand, name, price_uah, cpu, ram_gb, storage_gb,
  display_inches, weight_kg, battery_hours, description and marketplace_url are set.

3. Security
- No change to access rules. The public site can still only read published rows.

# Notes
1. Marketplace links point to category-specific search pages so visitors can find the
   current offer and price easily.
2. Prices reflect typical Ukrainian market levels at update time and are approximate.
*/

UPDATE products SET brand = 'ASUS', name = 'ASUS Vivobook 15 X1504', price_uah = 18999, cpu = 'Intel Core i3-1215U', ram_gb = 8, storage_gb = 256, display_inches = 15.6, weight_kg = 1.70, battery_hours = 7.0, description = 'Бюджетний ноутбук на кожен день: документи, браузер і фільми.', marketplace_url = 'https://rozetka.com.ua/search/?text=ASUS+Vivobook+15+X1504' WHERE category = 'laptop' AND name = 'Ноутбук 15.6" базовий';

UPDATE products SET brand = 'Lenovo', name = 'Lenovo IdeaPad Slim 3 14', price_uah = 27999, cpu = 'Intel Core i5-1235U', ram_gb = 16, storage_gb = 512, display_inches = 14.0, weight_kg = 1.37, battery_hours = 10.5, description = 'Легкий і швидкий ноутбук для навчання та роботи з кількома програмами.', marketplace_url = 'https://rozetka.com.ua/search/?text=Lenovo+IdeaPad+Slim+3+14' WHERE category = 'laptop' AND name = 'Ноутбук 14" для навчання';

UPDATE products SET brand = 'ASUS', name = 'ASUS TUF Gaming F16', price_uah = 42999, cpu = 'AMD Ryzen 7 7735HS', ram_gb = 16, storage_gb = 1024, display_inches = 16.0, weight_kg = 2.20, battery_hours = 8.0, description = 'Потужний ноутбук для творчості, монтажу й ігор з дискретною графікою.', marketplace_url = 'https://rozetka.com.ua/search/?text=ASUS+TUF+Gaming+F16' WHERE category = 'laptop' AND name = 'Ноутбук 16" для творчості';

UPDATE products SET brand = 'Acer', name = 'Acer Aspire XC Desktop', price_uah = 22999, cpu = 'Intel Core i5-12400', ram_gb = 16, storage_gb = 512, marketplace_url = 'https://rozetka.com.ua/search/?text=Acer+Aspire+XC+desktop+i5' WHERE category = 'desktop' AND name = 'Системний блок офісний';

UPDATE products SET brand = 'Samsung', name = 'Samsung Galaxy Tab A9', price_uah = 13999, cpu = 'MediaTek Helio G99', ram_gb = 8, storage_gb = 128, display_inches = 11.0, weight_kg = 0.49, battery_hours = 10.0, description = 'Компактний планшет для фільмів, браузера й нотаток.', marketplace_url = 'https://rozetka.com.ua/search/?text=Samsung+Galaxy+Tab+A9' WHERE category = 'tablet' AND name = 'Планшет 11"';

UPDATE products SET brand = 'Gigabyte', name = 'Gigabyte GeForce RTX 4060 8 ГБ', price_uah = 12999, description = 'Відеокарта для сучасних ігор у Full HD і відтворення відео у високій якості.', marketplace_url = 'https://rozetka.com.ua/search/?text=GeForce+RTX+4060+8GB' WHERE category = 'gpu' AND name = 'Відеокарта 8 ГБ';

UPDATE products SET brand = 'ASUS', name = 'ASUS GeForce RTX 4070 12 ГБ', price_uah = 19999, description = 'Відеокарта для ігор у високій якості, монтажу відео та 3D-графіки.', marketplace_url = 'https://rozetka.com.ua/search/?text=GeForce+RTX+4070+12GB' WHERE category = 'gpu' AND name = 'Відеокарта 12 ГБ';

UPDATE products SET brand = 'Intel', name = 'Intel Core i5-12400F', price_uah = 7999, cpu = 'Intel Core i5-12400F', description = 'Швидкий 6-ядерний процесор для навчання, офісу й браузера.', marketplace_url = 'https://rozetka.com.ua/search/?text=Intel+Core+i5-12400F' WHERE category = 'cpu' AND name = 'Процесор 6 ядер';

UPDATE products SET brand = 'AMD', name = 'AMD Ryzen 7 5700X', price_uah = 11999, cpu = 'AMD Ryzen 7 5700X', description = '8-ядерний процесор для творчості, монтажу та великих таблиць.', marketplace_url = 'https://rozetka.com.ua/search/?text=AMD+Ryzen+7+5700X' WHERE category = 'cpu' AND name = 'Процесор 8 ядер';

UPDATE products SET brand = 'Kingston', name = 'Kingston FURY 16 ГБ (2×8) DDR4 3200', price_uah = 2199, ram_gb = 16, description = 'Достатньо оперативної пам’яті для навчання, фільмів і кількох програм одночасно.', marketplace_url = 'https://rozetka.com.ua/search/?text=Kingston+FURY+16GB+DDR4+3200' WHERE category = 'ram' AND name = 'Пам’ять 16 ГБ (2×8)';

UPDATE products SET brand = 'Corsair', name = 'Corsair Vengeance 32 ГБ (2×16) DDR4 3600', price_uah = 3999, ram_gb = 32, description = 'Для ігор, монтажу та великої кількості вкладок у браузері.', marketplace_url = 'https://rozetka.com.ua/search/?text=Corsair+Vengeance+32GB+DDR4' WHERE category = 'ram' AND name = 'Пам’ять 32 ГБ (2×16)';

UPDATE products SET brand = 'Samsung', name = 'Samsung 980 500 ГБ SATA SSD', price_uah = 1199, storage_gb = 500, description = 'Бюджетне прискорення старого ноутбука або комп’ютера.', marketplace_url = 'https://rozetka.com.ua/search/?text=Samsung+980+500GB+SSD' WHERE category = 'ssd' AND name = 'SSD 500 ГБ SATA';

UPDATE products SET brand = 'Samsung', name = 'Samsung 980 PRO 1 ТБ NVMe SSD', price_uah = 2499, storage_gb = 1000, description = 'Швидкий NVMe-накопичувач на багато років фото, відео й файлів.', marketplace_url = 'https://rozetka.com.ua/search/?text=Samsung+980+PRO+1TB+NVMe' WHERE category = 'ssd' AND name = 'SSD 1 ТБ NVMe';

UPDATE products SET brand = 'Комплект', name = 'Комплект «Швидкий старт»: SSD 1 ТБ + перенесення даних', price_uah = 3699, storage_gb = 1000, description = 'SSD 1 ТБ NVMe із перенесенням усіх даних і налаштуванням системи.', marketplace_url = 'https://rozetka.com.ua/search/?text=SSD+1TB+NVMe+комплект' WHERE category = 'kit' AND name = 'Комплект «Швидкий старт»';

UPDATE products SET brand = 'Комплект', name = 'Комплект «Для ігор»: RTX 4070 + Ryzen 7 + 32 ГБ', price_uah = 39999, cpu = 'AMD Ryzen 7 5700X', ram_gb = 32, storage_gb = 1000, description = 'Відеокарта RTX 4070, процесор Ryzen 7 і 32 ГБ пам’яті для сучасних ігор.', marketplace_url = 'https://rozetka.com.ua/search/?text=RTX+4070+Ryzen+7+32GB+комплект' WHERE category = 'kit' AND name = 'Комплект «Для ігор»';
