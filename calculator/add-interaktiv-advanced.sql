-- Добавить расширенные функции для интерактивных панелей
-- Выполните в phpMyAdmin

USE `ita_calculator`;

-- 1. Обновить категорию "Интерактивные решения"
UPDATE `categories` SET 
    `description` = 'Интерактивные панели, киоски, сенсорные экраны для образования и бизнеса',
    `icon_class` = 'fa-solid fa-tv'
WHERE `slug` = 'interaktiv';

-- 2. Добавить новые шаблоны для интерактивных решений

-- Шаблон 1: Интерактивная панель для школы (расширенный)
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`, `is_active`) VALUES
((SELECT id FROM `categories` WHERE slug = 'interaktiv'), 
'Интерактивная панель для школы (расширенный)', 
'interaktiv-school-advanced', 
'Интерактивная панель для учебного класса с полным комплектом оборудования', 
'panels', 'Количество панелей', 'шт', 1, 50, 1, 1, TRUE, 1, TRUE);

-- Шаблон 2: Интерактивная панель для офиса
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`, `is_active`) VALUES
((SELECT id FROM `categories` WHERE slug = 'interaktiv'), 
'Интерактивная панель для переговорной', 
'interaktiv-office-panel', 
'Интерактивная панель для офиса и переговорной комнаты', 
'panels', 'Количество панелей', 'шт', 1, 20, 1, 1, FALSE, 2, TRUE);

-- Шаблон 3: Киоск самообслуживания
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`, `is_active`) VALUES
((SELECT id FROM `categories` WHERE slug = 'interaktiv'), 
'Киоск самообслуживания', 
'interaktiv-kiosk', 
'Напольный киоск для навигации и информации', 
'kiosks', 'Количество киосков', 'шт', 1, 20, 1, 1, FALSE, 3, TRUE);

-- 3. Добавить новые материалы
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`, `description`, `is_active`) VALUES

-- Интерактивные панели
('Интерактивная панель 65" 4K', 'interactive-panel-65-4k', 'шт', 85000, 'interaktiv', 'Панель 65 дюймов 4K Ultra HD', TRUE),
('Интерактивная панель 75" 4K', 'interactive-panel-75-4k', 'шт', 120000, 'interaktiv', 'Панель 75 дюймов 4K Ultra HD', TRUE),
('Интерактивная панель 86" 4K', 'interactive-panel-86-4k', 'шт', 180000, 'interaktiv', 'Панель 86 дюймов 4K Ultra HD', TRUE),
('Интерактивная панель 98" 4K', 'interactive-panel-98-4k', 'шт', 350000, 'interaktiv', 'Панель 98 дюймов 4K Ultra HD', TRUE),

-- Крепления
('Настенное крепление стандартное', 'wall-mount-standard', 'шт', 8000, 'interaktiv', 'Крепление для панелей до 75"', TRUE),
('Настенное крепление усиленное', 'wall-mount-heavy', 'шт', 15000, 'interaktiv', 'Крепление для панелей 86-98"', TRUE),
('Напольная стойка мобильная', 'floor-stand-mobile', 'шт', 25000, 'interaktiv', 'Мобильная стойка на колёсах', TRUE),
('Потолочное крепление', 'ceiling-mount', 'шт', 20000, 'interaktiv', 'Крепление на потолок', TRUE),

-- Кабели и подключение
('Кабель HDMI 2.0 (3м)', 'hdmi-cable-3m', 'шт', 800, 'interaktiv', 'HDMI кабель 3 метра', TRUE),
('Кабель HDMI 2.0 (5м)', 'hdmi-cable-5m', 'шт', 1200, 'interaktiv', 'HDMI кабель 5 метров', TRUE),
('Кабель HDMI 2.0 (10м)', 'hdmi-cable-10m', 'шт', 2000, 'interaktiv', 'HDMI кабель 10 метров', TRUE),
('Кабель USB Type-C', 'usb-c-cable', 'шт', 1500, 'interaktiv', 'USB-C кабель для подключения', TRUE),
('Адаптер беспроводной', 'wireless-adapter', 'шт', 5000, 'interaktiv', 'Беспроводной адаптер для презентаций', TRUE),

-- Периферия
('Беспроводной микрофон', 'wireless-microphone', 'шт', 8000, 'interaktiv', 'Микрофон для презентаций', TRUE),
('Спикерфон конференц-связи', 'speakerphone-conference', 'шт', 15000, 'interaktiv', 'Спикерфон для видеоконференций', TRUE),
('Веб-камера 4K', 'webcam-4k', 'шт', 12000, 'interaktiv', '4K веб-камера для конференций', TRUE),
('Пульт ДУ универсальный', 'remote-control', 'шт', 3000, 'interaktiv', 'Универсальный пульт', TRUE),

-- Программное обеспечение
('ПО для презентаций (лицензия)', 'presentation-software', 'шт', 25000, 'interaktiv', 'Лицензия на ПО для презентаций', TRUE),
('ПО для видеоконференций', 'videoconf-software', 'шт', 35000, 'interaktiv', 'Лицензия на ПО для ВКС', TRUE),
('ПО для образования', 'education-software', 'шт', 30000, 'interaktiv', 'Образовательное ПО', TRUE),

-- Киоски
('Киоск самообслуживания 32"', 'kiosk-32', 'шт', 95000, 'interaktiv', 'Напольный киоск 32"', TRUE),
('Киоск самообслуживания 43"', 'kiosk-43', 'шт', 135000, 'interaktiv', 'Напольный киоск 43"', TRUE),
('Киоск самообслуживания 55"', 'kiosk-55', 'шт', 185000, 'interaktiv', 'Напольный киоск 55"', TRUE),

-- Сенсорные плёнки и рамки
('Сенсорная плёнка 32"', 'touch-film-32', 'шт', 25000, 'interaktiv', 'Сенсорная плёнка 32"', TRUE),
('Сенсорная плёнка 43"', 'touch-film-43', 'шт', 35000, 'interaktiv', 'Сенсорная плёнка 43"', TRUE),
('Сенсорная плёнка 55"', 'touch-film-55', 'шт', 50000, 'interaktiv', 'Сенсорная плёнка 55"', TRUE),
('IR-рамка 32"', 'ir-frame-32', 'шт', 35000, 'interaktiv', 'Инфракрасная рамка 32"', TRUE),
('IR-рамка 43"', 'ir-frame-43', 'шт', 45000, 'interaktiv', 'Инфракрасная рамка 43"', TRUE),
('IR-рамка 55"', 'ir-frame-55', 'шт', 60000, 'interaktiv', 'Инфракрасная рамка 55"', TRUE);

-- 4. Добавить новые работы
INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`, `description`, `is_active`) VALUES

-- Монтаж
('Монтаж панели на стену', 'install-panel-wall', 'шт', 5000, 'interaktiv', 'Монтаж на стену', TRUE),
('Монтаж панели на потолок', 'install-panel-ceiling', 'шт', 8000, 'interaktiv', 'Монтаж на потолок', TRUE),
('Установка на мобильную стойку', 'install-mobile-stand', 'шт', 3000, 'interaktiv', 'Установка на стойку', TRUE),
('Монтаж киоска', 'install-kiosk', 'шт', 7000, 'interaktiv', 'Монтаж киоска самообслуживания', TRUE),

-- Настройка
('Настройка оборудования', 'setup-equipment', 'шт', 3000, 'interaktiv', 'Базовая настройка', TRUE),
('Настройка ПО', 'setup-software', 'шт', 5000, 'interaktiv', 'Установка и настройка ПО', TRUE),
('Калибровка сенсорной панели', 'calibrate-panel', 'шт', 2000, 'interaktiv', 'Калибровка сенсора', TRUE),

-- Обучение
('Обучение персонала (1 час)', 'training-1hour', 'час', 2000, 'interaktiv', 'Обучение работе с оборудованием', TRUE),
('Обучение персонала (полный курс)', 'training-full', 'курс', 10000, 'interaktiv', 'Полный курс обучения', TRUE),

-- Прокладка кабелей
('Прокладка HDMI кабеля', 'lay-hdmi-cable', 'м', 150, 'interaktiv', 'Прокладка кабеля HDMI', TRUE),
('Прокладка кабеля в кабель-канале', 'lay-cable-channel', 'м', 200, 'interaktiv', 'Прокладка в кабель-канале', TRUE),
('Монтаж розетки 220В', 'install-power-socket', 'шт', 500, 'interaktiv', 'Установка розетки', TRUE),

-- Дополнительные работы
('Демонтаж старого оборудования', 'remove-old-equipment', 'шт', 2000, 'interaktiv', 'Демонтаж', TRUE),
('Подъём на высоту (за этаж)', 'height-lift', 'этаж', 500, 'interaktiv', 'Подъём оборудования', TRUE),
('Срочный монтаж (1-2 дня)', 'express-install', 'услуга', 5000, 'interaktiv', 'Срочный монтаж', TRUE);

-- 5. Добавить коэффициенты для интерактивных решений
INSERT INTO `coefficients` (`code`, `name`, `type`, `input_type`, `applies_to`, `is_percentage`, `is_fixed_amount`, `sort_order`, `is_active`) VALUES
('install_type', 'Тип монтажа', 'interaktiv', 'select', 'works', TRUE, FALSE, 1, TRUE),
('room_type', 'Тип помещения', 'interaktiv', 'select', 'works', TRUE, FALSE, 2, TRUE),
('warranty', 'Расширенная гарантия', 'interaktiv', 'select', 'materials', TRUE, FALSE, 3, TRUE);

SET @coef_install = LAST_INSERT_ID();
SET @coef_room = @coef_install + 1;
SET @coef_warranty = @coef_install + 2;

INSERT INTO `coefficient_values` (`coefficient_id`, `value`, `label`, `multiplier`, `fixed_amount`, `is_default`, `sort_order`) VALUES
-- Тип монтажа
(@coef_install, 'standard', 'Стандартный монтаж', 1.0, 0, TRUE, 1),
(@coef_install, 'complex', 'Сложный монтаж (высота/доступ)', 1.3, 0, FALSE, 2),
(@coef_install, 'express', 'Срочный монтаж (1-2 дня)', 1.5, 0, FALSE, 3),

-- Тип помещения
(@coef_room, 'office', 'Офис/Переговорная', 1.0, 0, TRUE, 1),
(@coef_room, 'school', 'Школа/ВУЗ', 1.1, 0, FALSE, 2),
(@coef_room, 'public', 'ТЦ/Аэропорт (публичное место)', 1.2, 0, FALSE, 3),

-- Гарантия
(@coef_warranty, 'standard', 'Стандартная (1 год)', 1.0, 0, TRUE, 1),
(@coef_warranty, 'extended2', 'Расширенная 2 года', 1.05, 0, FALSE, 2),
(@coef_warranty, 'extended3', 'Расширенная 3 года', 1.1, 0, FALSE, 3),
(@coef_warranty, 'extended5', 'Расширенная 5 лет', 1.15, 0, FALSE, 4);

-- 6. Привязать коэффициенты к шаблонам
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) 
SELECT id, @coef_install, FALSE FROM `templates` WHERE category_id = (SELECT id FROM `categories` WHERE slug = 'interaktiv');

INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) 
SELECT id, @coef_room, FALSE FROM `templates` WHERE category_id = (SELECT id FROM `categories` WHERE slug = 'interaktiv');

INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) 
SELECT id, @coef_warranty, FALSE FROM `templates` WHERE category_id = (SELECT id FROM `categories` WHERE slug = 'interaktiv');

-- 7. Добавить элементы для шаблонов
SET @template_school = (SELECT id FROM `templates` WHERE slug = 'interaktiv-school-advanced');
SET @template_office = (SELECT id FROM `templates` WHERE slug = 'interaktiv-office-panel');
SET @template_kiosk = (SELECT id FROM `templates` WHERE slug = 'interaktiv-kiosk');

-- Для школы
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(@template_school, 'material', (SELECT id FROM `materials` WHERE slug = 'interactive-panel-75-4k'), 1, FALSE, 1),
(@template_school, 'material', (SELECT id FROM `materials` WHERE slug = 'wall-mount-heavy'), 1, TRUE, 2),
(@template_school, 'material', (SELECT id FROM `materials` WHERE slug = 'hdmi-cable-5m'), 2, FALSE, 3),
(@template_school, 'material', (SELECT id FROM `materials` WHERE slug = 'wireless-adapter'), 1, TRUE, 4),
(@template_school, 'material', (SELECT id FROM `materials` WHERE slug = 'education-software'), 1, TRUE, 5),
(@template_school, 'work', (SELECT id FROM `works` WHERE slug = 'install-panel-wall'), 1, FALSE, 10),
(@template_school, 'work', (SELECT id FROM `works` WHERE slug = 'setup-software'), 1, TRUE, 11),
(@template_school, 'work', (SELECT id FROM `works` WHERE slug = 'training-full'), 1, TRUE, 12);

-- Для офиса
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'interactive-panel-65-4k'), 1, FALSE, 1),
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'wall-mount-standard'), 1, TRUE, 2),
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'speakerphone-conference'), 1, TRUE, 3),
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'webcam-4k'), 1, TRUE, 4),
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'presentation-software'), 1, TRUE, 5),
(@template_office, 'work', (SELECT id FROM `works` WHERE slug = 'install-panel-wall'), 1, FALSE, 10),
(@template_office, 'work', (SELECT id FROM `works` WHERE slug = 'setup-software'), 1, TRUE, 11),
(@template_office, 'work', (SELECT id FROM `works` WHERE slug = 'training-1hour'), 2, FALSE, 12);

-- Для киоска
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(@template_kiosk, 'material', (SELECT id FROM `materials` WHERE slug = 'kiosk-43'), 1, FALSE, 1),
(@template_kiosk, 'material', (SELECT id FROM `materials` WHERE slug = 'presentation-software'), 1, TRUE, 2),
(@template_kiosk, 'work', (SELECT id FROM `works` WHERE slug = 'install-kiosk'), 1, FALSE, 10),
(@template_kiosk, 'work', (SELECT id FROM `works` WHERE slug = 'setup-software'), 1, TRUE, 11),
(@template_kiosk, 'work', (SELECT id FROM `works` WHERE slug = 'training-1hour'), 2, FALSE, 12);

-- Готово!
SELECT '✅ Интерактивные решения добавлены в калькулятор!' AS result;
SELECT 'Теперь в калькуляторе доступны:' AS info;
SELECT '  - Интерактивная панель для школы (расширенный)' AS template1;
SELECT '  - Интерактивная панель для переговорной' AS template2;
SELECT '  - Киоск самообслуживания' AS template3;
SELECT '  - 30+ материалов' AS materials;
SELECT '  - 15+ видов работ' AS works;
SELECT '  - 3 коэффициента (монтаж, помещение, гарантия)' AS coefficients;
