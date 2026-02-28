-- Добавить категорию "Интерактивные решения" в калькулятор
-- Выполните этот SQL через phpMyAdmin

USE `ita_calculator`;

-- 1. Добавить категорию
INSERT INTO `categories` (`name`, `slug`, `icon_class`, `description`, `sort_order`, `is_active`) VALUES
('Интерактивные решения', 'interaktiv', 'fa-solid fa-tv', 'Интерактивные панели, киоски, сенсорные экраны', 6, TRUE);

-- 2. Добавить шаблоны
SET @interaktiv_id = LAST_INSERT_ID();

-- Шаблон 1: Интерактивная панель для школы
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`, `is_active`) VALUES
(@interaktiv_id, 'Интерактивная панель для класса', 'interaktiv-school-panel', 'Интерактивная панель для учебного класса', 'panels', 'Количество панелей', 'шт', 1, 20, 1, 1, FALSE, 1, TRUE);

-- Шаблон 2: Киоск самообслуживания
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`, `is_active`) VALUES
(@interaktiv_id, 'Киоск самообслуживания', 'interaktiv-kiosk', 'Напольный киоск для навигации', 'kiosks', 'Количество киосков', 'шт', 1, 10, 1, 1, FALSE, 2, TRUE);

-- Шаблон 3: Сенсорная панель для офиса
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`, `is_active`) VALUES
(@interaktiv_id, 'Сенсорная панель для переговорной', 'interaktiv-office-panel', 'Интерактивная панель для офиса', 'panels', 'Количество панелей', 'шт', 1, 10, 1, 1, FALSE, 3, TRUE);

-- 3. Добавить материалы для интерактивных решений
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`, `is_active`) VALUES
('Интерактивная панель 65"', 'interactive-panel-65', 'шт', 85000, 'interaktiv', TRUE),
('Интерактивная панель 75"', 'interactive-panel-75', 'шт', 120000, 'interaktiv', TRUE),
('Интерактивная панель 86"', 'interactive-panel-86', 'шт', 180000, 'interaktiv', TRUE),
('Киоск самообслуживания 32"', 'kiosk-32', 'шт', 95000, 'interaktiv', TRUE),
('Киоск самообслуживания 43"', 'kiosk-43', 'шт', 135000, 'interaktiv', TRUE),
('Киоск самообслуживания 55"', 'kiosk-55', 'шт', 185000, 'interaktiv', TRUE),
('Сенсорная плёнка 32"', 'touch-film-32', 'шт', 25000, 'interaktiv', TRUE),
('Сенсорная плёнка 43"', 'touch-film-43', 'шт', 35000, 'interaktiv', TRUE),
('Сенсорная плёнка 55"', 'touch-film-55', 'шт', 50000, 'interaktiv', TRUE),
('IR-рамка 32"', 'ir-frame-32', 'шт', 35000, 'interaktiv', TRUE),
('IR-рамка 43"', 'ir-frame-43', 'шт', 45000, 'interaktiv', TRUE),
('IR-рамка 55"', 'ir-frame-55', 'шт', 60000, 'interaktiv', TRUE),
('Напольная стойка', 'floor-stand', 'шт', 15000, 'interaktiv', TRUE),
('Настенное крепление', 'wall-mount', 'шт', 12000, 'interaktiv', TRUE),
('Беспроводной микрофон', 'wireless-mic', 'шт', 8000, 'interaktiv', TRUE),
('Спикерфон', 'speakerphone', 'шт', 15000, 'interaktiv', TRUE),
('Веб-камера 4K', 'webcam-4k', 'шт', 12000, 'interaktiv', TRUE),
('ПО для презентаций', 'presentation-software', 'шт', 25000, 'interaktiv', TRUE);

-- 4. Добавить работы для интерактивных решений
INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`, `is_active`) VALUES
('Монтаж интерактивной панели', 'install-panel', 'шт', 5000, 'interaktiv', TRUE),
('Монтаж киоска', 'install-kiosk', 'шт', 7000, 'interaktiv', TRUE),
('Настройка ПО', 'setup-software', 'шт', 3000, 'interaktiv', TRUE),
('Обучение персонала', 'training', 'час', 2000, 'interaktiv', TRUE),
('Прокладка кабеля HDMI', 'hdmi-cable', 'м', 150, 'interaktiv', TRUE),
('Подключение к сети', 'network-setup', 'шт', 1000, 'interaktiv', TRUE);

-- 5. Добавить элементы шаблонов (материалы и работы)
SET @template_panel = (SELECT id FROM `templates` WHERE slug = 'interaktiv-school-panel');
SET @template_kiosk = (SELECT id FROM `templates` WHERE slug = 'interaktiv-kiosk');
SET @template_office = (SELECT id FROM `templates` WHERE slug = 'interaktiv-office-panel');

-- Для шаблона "Интерактивная панель для класса"
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(@template_panel, 'material', (SELECT id FROM `materials` WHERE slug = 'interactive-panel-75'), 1, FALSE, 1),
(@template_panel, 'material', (SELECT id FROM `materials` WHERE slug = 'wall-mount'), 1, TRUE, 2),
(@template_panel, 'material', (SELECT id FROM `materials` WHERE slug = 'hdmi-cable'), 10, FALSE, 3),
(@template_panel, 'work', (SELECT id FROM `works` WHERE slug = 'install-panel'), 1, FALSE, 10),
(@template_panel, 'work', (SELECT id FROM `works` WHERE slug = 'network-setup'), 1, TRUE, 11),
(@template_panel, 'work', (SELECT id FROM `works` WHERE slug = 'setup-software'), 1, TRUE, 12);

-- Для шаблона "Киоск самообслуживания"
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(@template_kiosk, 'material', (SELECT id FROM `materials` WHERE slug = 'kiosk-43'), 1, FALSE, 1),
(@template_kiosk, 'material', (SELECT id FROM `materials` WHERE slug = 'presentation-software'), 1, TRUE, 2),
(@template_kiosk, 'work', (SELECT id FROM `works` WHERE slug = 'install-kiosk'), 1, FALSE, 10),
(@template_kiosk, 'work', (SELECT id FROM `works` WHERE slug = 'setup-software'), 1, TRUE, 11),
(@template_kiosk, 'work', (SELECT id FROM `works` WHERE slug = 'training'), 2, FALSE, 12);

-- Для шаблона "Сенсорная панель для офиса"
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'interactive-panel-65'), 1, FALSE, 1),
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'wireless-mic'), 1, TRUE, 2),
(@template_office, 'material', (SELECT id FROM `materials` WHERE slug = 'speakerphone'), 1, TRUE, 3),
(@template_office, 'work', (SELECT id FROM `works` WHERE slug = 'install-panel'), 1, FALSE, 10),
(@template_office, 'work', (SELECT id FROM `works` WHERE slug = 'setup-software'), 1, TRUE, 11);

-- 6. Добавить коэффициенты для интерактивных решений
INSERT INTO `coefficients` (`code`, `name`, `type`, `input_type`, `applies_to`, `is_percentage`, `sort_order`, `is_active`) VALUES
('interaktiv_install', 'Тип монтажа', 'interaktiv', 'select', 'works', TRUE, 10, TRUE);

SET @coef_install = LAST_INSERT_ID();

INSERT INTO `coefficient_values` (`coefficient_id`, `value`, `label`, `multiplier`, `fixed_amount`, `is_default`, `sort_order`) VALUES
(@coef_install, 'standard', 'Стандартный монтаж', 1.0, 0, TRUE, 1),
(@coef_install, 'complex', 'Сложный монтаж (высота/доступ)', 1.3, 0, FALSE, 2),
(@coef_install, 'express', 'Срочный монтаж (1-2 дня)', 1.5, 0, FALSE, 3);

-- Привязать коэффициент к шаблонам
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(@template_panel, @coef_install, FALSE),
(@template_kiosk, @coef_install, FALSE),
(@template_office, @coef_install, FALSE);

-- Готово!
SELECT '✅ Категория "Интерактивные решения" добавлена!' AS result;
