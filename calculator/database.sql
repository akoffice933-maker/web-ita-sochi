-- ============================================================================
-- База данных для калькулятора строительных смет
-- Компания: ИТА Сочи
-- Версия: 1.0
-- Дата: 26 февраля 2026 г.
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================================================
-- Создание базы данных
-- ============================================================================
CREATE DATABASE IF NOT EXISTS `ita_calculator` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ita_calculator`;

-- ============================================================================
-- Таблица категорий услуг
-- ============================================================================
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `icon_class` VARCHAR(100) DEFAULT 'fa-solid fa-circle',
    `description` TEXT,
    `sort_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица шаблонов
-- ============================================================================
CREATE TABLE `templates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `base_param_code` VARCHAR(50) NOT NULL,
    `base_param_name` VARCHAR(100) NOT NULL,
    `base_param_unit` VARCHAR(20) DEFAULT '',
    `base_value_min` DECIMAL(10,2) DEFAULT 1,
    `base_value_max` DECIMAL(10,2) DEFAULT 100,
    `base_value_default` DECIMAL(10,2) NOT NULL,
    `base_value_step` DECIMAL(10,2) DEFAULT 1,
    `has_electrical_addon` BOOLEAN DEFAULT FALSE,
    `electrical_template_id` INT DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_category` (`category_id`),
    INDEX `idx_slug` (`slug`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица материалов
-- ============================================================================
CREATE TABLE `materials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `unit` VARCHAR(20) NOT NULL,
    `current_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `category` VARCHAR(100) DEFAULT 'general',
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица работ
-- ============================================================================
CREATE TABLE `works` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `unit` VARCHAR(20) NOT NULL,
    `current_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `category` VARCHAR(100) DEFAULT 'general',
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_slug` (`slug`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица элементов шаблона (материалы и работы)
-- ============================================================================
CREATE TABLE `template_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `template_id` INT NOT NULL,
    `item_type` ENUM('material', 'work') NOT NULL,
    `item_id` INT NOT NULL,
    `quantity_per_unit` DECIMAL(10,4) NOT NULL DEFAULT 0,
    `is_fixed` BOOLEAN DEFAULT FALSE,
    `is_electrical` BOOLEAN DEFAULT FALSE,
    `sort_order` INT DEFAULT 0,
    `notes` VARCHAR(255),
    FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE CASCADE,
    INDEX `idx_template` (`template_id`),
    INDEX `idx_type` (`item_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица коэффициентов
-- ============================================================================
CREATE TABLE `coefficients` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `type` ENUM('common', 'electrical', 'video', 'skud', 'sks') NOT NULL DEFAULT 'common',
    `input_type` ENUM('select', 'radio', 'checkbox') NOT NULL DEFAULT 'select',
    `applies_to` ENUM('all', 'materials', 'works', 'fixed') NOT NULL DEFAULT 'works',
    `is_percentage` BOOLEAN DEFAULT TRUE,
    `is_fixed_amount` BOOLEAN DEFAULT FALSE,
    `sort_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_code` (`code`),
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица значений коэффициентов
-- ============================================================================
CREATE TABLE `coefficient_values` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `coefficient_id` INT NOT NULL,
    `value` VARCHAR(50) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `multiplier` DECIMAL(5,4) DEFAULT 1.0000,
    `fixed_amount` DECIMAL(10,2) DEFAULT 0,
    `is_default` BOOLEAN DEFAULT FALSE,
    `sort_order` INT DEFAULT 0,
    FOREIGN KEY (`coefficient_id`) REFERENCES `coefficients`(`id`) ON DELETE CASCADE,
    INDEX `idx_coefficient` (`coefficient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Связь шаблонов и коэффициентов
-- ============================================================================
CREATE TABLE `template_coefficients` (
    `template_id` INT NOT NULL,
    `coefficient_id` INT NOT NULL,
    `is_required` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`template_id`, `coefficient_id`),
    FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`coefficient_id`) REFERENCES `coefficients`(`id`) ON DELETE CASCADE,
    INDEX `idx_template` (`template_id`),
    INDEX `idx_coefficient` (`coefficient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Таблица логов расчетов (для аналитики)
-- ============================================================================
CREATE TABLE `calculation_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `template_id` INT NOT NULL,
    `base_value` DECIMAL(10,2) NOT NULL,
    `coefficients_json` JSON,
    `total_materials` DECIMAL(12,2) NOT NULL,
    `total_works` DECIMAL(12,2) NOT NULL,
    `total_amount` DECIMAL(12,2) NOT NULL,
    `ip_address` VARCHAR(45),
    `user_agent` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON DELETE SET NULL,
    INDEX `idx_created` (`created_at`),
    INDEX `idx_template` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- НАПОЛНЕНИЕ ДАННЫМИ
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Категории
-- ----------------------------------------------------------------------------
INSERT INTO `categories` (`name`, `slug`, `icon_class`, `description`, `sort_order`) VALUES
('СКС', 'sks', 'fa-solid fa-server', 'Структурированные кабельные сети для офисов и предприятий', 1),
('Видеонаблюдение', 'video', 'fa-solid fa-video', 'Системы видеонаблюдения любой сложности', 2),
('СКУД', 'skud', 'fa-solid fa-id-card', 'Системы контроля и управления доступом', 3),
('IT-аутсорсинг', 'it-outsourcing', 'fa-solid fa-headset', 'Абонентное обслуживание и поддержка', 4),
('Электромонтаж', 'electro', 'fa-solid fa-bolt', 'Электромонтажные работы под ключ', 5);

-- ----------------------------------------------------------------------------
-- Коэффициенты (общие)
-- ----------------------------------------------------------------------------
INSERT INTO `coefficients` (`code`, `name`, `type`, `input_type`, `applies_to`, `is_percentage`, `sort_order`) VALUES
('urgency', 'Срочность', 'common', 'select', 'works', TRUE, 1),
('territory', 'Территория', 'common', 'select', 'works', FALSE, 2);

INSERT INTO `coefficient_values` (`coefficient_id`, `value`, `label`, `multiplier`, `fixed_amount`, `is_default`) VALUES
-- Срочность (коэффициент id=1)
(1, 'normal', 'Обычная (стандартные сроки)', 1.0000, 0, TRUE),
(1, 'urgent_2-3days', 'Срочно (2-3 дня)', 1.2000, 0, FALSE),
(1, 'express_1day', 'Экстренно (1 день)', 1.5000, 0, FALSE),
-- Территория (коэффициент id=2) - фиксированная надбавка
(2, 'sochi', 'В пределах Сочи', 1.0000, 0, TRUE),
(2, 'suburb', 'Пригород (Сочи + окрестности)', 1.0000, 3000, FALSE),
(2, 'remote', 'Удаленные районы (>50 км)', 1.0000, 6000, FALSE);

-- ----------------------------------------------------------------------------
-- Коэффициенты для электромонтажа
-- ----------------------------------------------------------------------------
INSERT INTO `coefficients` (`code`, `name`, `type`, `input_type`, `applies_to`, `is_percentage`, `sort_order`) VALUES
('wall_type', 'Тип стен', 'electrical', 'select', 'works', TRUE, 3),
('height', 'Высота работ', 'electrical', 'select', 'works', TRUE, 4),
('wiring_type', 'Тип проводки', 'electrical', 'select', 'works', TRUE, 5);

INSERT INTO `coefficient_values` (`coefficient_id`, `value`, `label`, `multiplier`, `is_default`) VALUES
-- Тип стен (коэффициент id=3)
(3, 'drywall', 'Гипсокартон', 1.0000, FALSE),
(3, 'brick', 'Кирпич', 1.2500, FALSE),
(3, 'concrete', 'Бетон/монолит', 1.5000, TRUE),
-- Высота работ (коэффициент id=4)
(4, 'to_3m', 'До 3 м', 1.0000, TRUE),
(4, '3-5m', '3-5 м', 1.3000, FALSE),
(4, 'above_5m', 'Выше 5 м', 1.8000, FALSE),
-- Тип проводки (коэффициент id=5)
(5, 'open', 'Открытая проводка', 0.8000, FALSE),
(5, 'concealed', 'Скрытая в штробе', 1.0000, TRUE),
(5, 'in_screed', 'В стяжку пола', 1.1000, FALSE);

-- ----------------------------------------------------------------------------
-- Материалы для СКС
-- ----------------------------------------------------------------------------
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Кабель UTP Cat 5e (бухтa 305м)', 'cable-utp-cat5e', 'м', 25, 'sks'),
('Розетка RJ-45 одноместная', 'rj45-socket-1port', 'шт', 150, 'sks'),
('Патч-панель 24 порта 19"', 'patch-panel-24port', 'шт', 2500, 'sks'),
('Коммутатор 16 портов 10/100/1000', 'switch-16port-gigabit', 'шт', 8500, 'sks'),
('Кабель-канал 40×20 мм', 'cable-channel-40x20', 'м', 80, 'sks'),
('Коннекторы RJ-45 + стяжки', 'rj45-connectors-kit', 'компл.', 10, 'sks'),
('Патч-корд 3м Cat 5e', 'patchcord-3m-cat5e', 'шт', 200, 'sks');

-- ----------------------------------------------------------------------------
-- Работы для СКС
-- ----------------------------------------------------------------------------
INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Прокладка кабеля UTP', 'cable-laying-utp', 'м', 45, 'sks'),
('Монтаж/обжим розетки RJ-45', 'rj45-socket-install', 'шт', 250, 'sks'),
('Монтаж патч-панели', 'patch-panel-install', 'шт', 800, 'sks'),
('Монтаж коммутатора', 'switch-install', 'шт', 1000, 'sks'),
('Тестирование и маркировка линий', 'line-testing-labeling', 'компл.', 1500, 'sks');

-- ----------------------------------------------------------------------------
-- Материалы для видеонаблюдения
-- ----------------------------------------------------------------------------
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('IP-камера 4 Мп Hikvision/Dahua', 'ip-camera-4mp', 'шт', 4500, 'video'),
('PoE-коммутатор 8 портов', 'poe-switch-8port', 'шт', 5500, 'video'),
('NVR 4-канальный + HDD 2TB', 'nvr-4ch-hdd2tb', 'компл.', 12000, 'video'),
('Крепежи, разъемы, БП', 'mounting-kit-video', 'компл.', 800, 'video'),
('Кабель UTP Cat 5e для видеонаблюдения', 'cable-utp-video', 'м', 25, 'video');

-- ----------------------------------------------------------------------------
-- Работы для видеонаблюдения
-- ----------------------------------------------------------------------------
INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Монтаж IP-камеры', 'camera-install', 'шт', 2500, 'video'),
('Прокладка кабеля для видеонаблюдения', 'cable-laying-video', 'м', 45, 'video'),
('Монтаж PoE-коммутатора и NVR', 'nvr-switch-install', 'шт', 1500, 'video'),
('Пусконаладка и настройка', 'commissioning-video', 'компл.', 3000, 'video');

-- ----------------------------------------------------------------------------
-- Материалы для СКУД
-- ----------------------------------------------------------------------------
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Контроллер СКУД', 'skud-controller', 'шт', 3500, 'skud'),
('Считыватель карт', 'skud-reader', 'шт', 1500, 'skud'),
('Электромагнитный замок', 'em-lock', 'шт', 2500, 'skud'),
('Кнопка выхода', 'exit-button', 'шт', 400, 'skud'),
('Блок питания 12В', 'power-supply-12v', 'шт', 800, 'skud'),
('Кабель, расходники для СКУД', 'cable-kit-skud', 'компл.', 500, 'skud'),
('Карты доступа (10 шт)', 'access-cards-10pcs', 'компл.', 500, 'skud');

-- ----------------------------------------------------------------------------
-- Работы для СКУД
-- ----------------------------------------------------------------------------
INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Монтаж оборудования СКУД', 'skud-install', 'компл.', 4000, 'skud'),
('Настройка ПО и выдача ключей', 'skud-config', 'компл.', 2000, 'skud');

-- ----------------------------------------------------------------------------
-- Материалы и работы для IT-аутсорсинга
-- ----------------------------------------------------------------------------
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Абонентское обслуживание (удаленно)', 'it-remote-support', 'раб.мест/мес', 500, 'it');

INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Разовый выезд инженера (почасовая)', 'it-engineer-visit', 'час', 1500, 'it');

-- ----------------------------------------------------------------------------
-- Материалы для электромонтажа
-- ----------------------------------------------------------------------------
INSERT INTO `materials` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Кабель силовой ВВГнг-LS 3×2.5', 'cable-vvg-3x2.5', 'м', 85, 'electro'),
('Кабель силовой ВВГнг-LS 3×1.5', 'cable-vvg-3x1.5', 'м', 55, 'electro'),
('Автомат 1P 16A', 'breaker-1p-16a', 'шт', 350, 'electro'),
('Автомат 1P 10A', 'breaker-1p-10a', 'шт', 350, 'electro'),
('Автомат 2P 25A', 'breaker-2p-25a', 'шт', 800, 'electro'),
('УЗО 2P 25A 30mA', 'rcd-2p-25a-30ma', 'шт', 1200, 'electro'),
('Розетка 220В', 'socket-220v', 'шт', 400, 'electro'),
('Выключатель одноклавишный', 'switch-1gang', 'шт', 300, 'electro'),
('Выключатель двухклавишный', 'switch-2gang', 'шт', 400, 'electro'),
('Подрозетник', 'backbox', 'шт', 50, 'electro'),
('Распредкоробка', 'junction-box', 'шт', 100, 'electro'),
('Щит квартирный', 'distribution-board', 'шт', 2500, 'electro'),
('Щит офисный', 'distribution-board-office', 'шт', 4500, 'electro'),
('Светильник точечный LED', 'led-spotlight', 'шт', 600, 'electro'),
('Светильник офисный LED 600×600', 'led-panel-600x600', 'шт', 1500, 'electro'),
('Кабель-канал 40×25 мм', 'cable-channel-40x25', 'м', 90, 'electro'),
('Кабель-канал 60×40 мм', 'cable-channel-60x40', 'м', 150, 'electro'),
('Гофра ПВХ 20мм', 'corrugated-tube-20mm', 'м', 35, 'electro'),
('Клеммная колодка', 'terminal-block', 'шт', 50, 'electro'),
('Шина нулевая/заземления', 'ground-bus', 'шт', 400, 'electro');

-- ----------------------------------------------------------------------------
-- Работы для электромонтажа
-- ----------------------------------------------------------------------------
INSERT INTO `works` (`name`, `slug`, `unit`, `current_price`, `category`) VALUES
('Штробление в бетоне', 'grooving-concrete', 'пог.м', 450, 'electro'),
('Штробление в кирпиче', 'grooving-brick', 'пог.м', 300, 'electro'),
('Штробление в гипсокартоне', 'grooving-drywall', 'пог.м', 150, 'electro'),
('Установка подрозетника в бетоне', 'backbox-install-concrete', 'шт', 350, 'electro'),
('Установка подрозетника в кирпиче', 'backbox-install-brick', 'шт', 250, 'electro'),
('Установка подрозетника в гипсокартоне', 'backbox-install-drywall', 'шт', 150, 'electro'),
('Прокладка кабеля силового', 'cable-laying-power', 'м', 80, 'electro'),
('Монтаж кабель-канала', 'cable-channel-install', 'м', 120, 'electro'),
('Монтаж автомата 1P', 'breaker-1p-install', 'шт', 300, 'electro'),
('Монтаж автомата 2P', 'breaker-2p-install', 'шт', 500, 'electro'),
('Монтаж УЗО', 'rcd-install', 'шт', 600, 'electro'),
('Установка розетки/выключателя', 'socket-switch-install', 'шт', 250, 'electro'),
('Монтаж распредкоробки', 'junction-box-install', 'шт', 400, 'electro'),
('Сборка щита (до 12 модулей)', 'db-assembly-12mod', 'шт', 3500, 'electro'),
('Сборка щита (13-24 модуля)', 'db-assembly-24mod', 'шт', 5500, 'electro'),
('Установка точечного светильника', 'spotlight-install', 'шт', 400, 'electro'),
('Установка светильника 600×600', 'led-panel-install', 'шт', 800, 'electro'),
('Электролабораторные измерения', 'electrical-testing', 'компл.', 5000, 'electro');

-- ============================================================================
-- ШАБЛОНЫ
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Шаблон 1: СКС для офиса (до 20 рабочих мест)
-- ----------------------------------------------------------------------------
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`) VALUES
(1, 'СКС для офиса (базовый)', 'sks-office-basic', 'Структурированная кабельная сеть для офиса до 20 рабочих мест', 'seats', 'Количество рабочих мест', 'мест', 1, 20, 10, 1, TRUE, 1);

-- Материалы для СКС (на 1 рабочее место)
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
-- Шаблон id=1
(1, 'material', 1, 15.0000, FALSE, 1),  -- Кабель UTP Cat 5e - 15м на место
(1, 'material', 2, 1.0000, FALSE, 2),   -- Розетка RJ-45 - 1шт на место
(1, 'material', 6, 1.0000, FALSE, 3),   -- Коннекторы RJ-45 + стяжки - 1компл на место
-- Общие материалы (фиксированные)
(1, 'material', 3, 1.0000, TRUE, 10),   -- Патч-панель 24 порта - 1шт
(1, 'material', 4, 1.0000, TRUE, 11),   -- Коммутатор 16 портов - 1шт
(1, 'material', 5, 4.0000, TRUE, 12);   -- Кабель-канал 40×20 мм - 40м (на 10 мест)

-- Работы для СКС
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(1, 'work', 1, 15.0000, FALSE, 1),     -- Прокладка кабеля UTP - 15м на место
(1, 'work', 2, 1.0000, FALSE, 2),      -- Монтаж/обжим розетки RJ-45 - 1шт на место
(1, 'work', 3, 1.0000, TRUE, 10),      -- Монтаж патч-панели - 1шт
(1, 'work', 4, 1.0000, TRUE, 11),      -- Монтаж коммутатора - 1шт
(1, 'work', 5, 1.0000, TRUE, 12);      -- Тестирование и маркировка линий - компл

-- Коэффициенты для СКС
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(1, 1, FALSE),  -- Срочность
(1, 2, FALSE);  -- Территория

-- ----------------------------------------------------------------------------
-- Шаблон 2: Видеонаблюдение (4-8 камер)
-- ----------------------------------------------------------------------------
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`) VALUES
(2, 'Видеонаблюдение (базовый, 4 камеры)', 'video-basic-4cam', 'Система видеонаблюдения на 4-8 IP-камер', 'cameras', 'Количество камер', 'камер', 4, 8, 4, 1, TRUE, 1);

-- Материалы для видеонаблюдения
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
-- Шаблон id=2
(2, 'material', 8, 1.0000, FALSE, 1),   -- IP-камера 4 Мп - 1шт на камеру
(2, 'material', 12, 35.0000, FALSE, 2), -- Кабель UTP - 35м на камеру
-- Общие материалы (фиксированные)
(2, 'material', 9, 1.0000, TRUE, 10),   -- PoE-коммутатор 8 портов - 1шт
(2, 'material', 10, 1.0000, TRUE, 11),  -- NVR 4-канальный + HDD 2TB - 1компл
(2, 'material', 11, 1.0000, TRUE, 12);  -- Крепежи, разъемы, БП - 1компл

-- Работы для видеонаблюдения
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(2, 'work', 6, 1.0000, FALSE, 1),      -- Монтаж IP-камеры - 1шт на камеру
(2, 'work', 7, 35.0000, FALSE, 2),     -- Прокладка кабеля - 35м на камеру
(2, 'work', 8, 2.0000, TRUE, 10),      -- Монтаж PoE-коммутатора и NVR - 2шт
(2, 'work', 9, 1.0000, TRUE, 11);      -- Пусконаладка и настройка - компл

-- Коэффициенты для видеонаблюдения
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(2, 1, FALSE),  -- Срочность
(2, 2, FALSE),  -- Территория
(2, 3, FALSE);  -- Тип стен

-- ----------------------------------------------------------------------------
-- Шаблон 3: СКУД (1-2 точки входа)
-- ----------------------------------------------------------------------------
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`) VALUES
(3, 'СКУД на 1 точку (базовый)', 'skud-1door-basic', 'Система контроля доступа на 1 дверь', 'doors', 'Количество дверей', 'дверей', 1, 4, 1, 1, TRUE, 1);

-- Материалы для СКУД (на 1 дверь)
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
-- Шаблон id=3
(3, 'material', 13, 1.0000, FALSE, 1),  -- Контроллер СКУД - 1шт на дверь
(3, 'material', 14, 1.0000, FALSE, 2),  -- Считыватель карт - 1шт на дверь
(3, 'material', 15, 1.0000, FALSE, 3),  -- Электромагнитный замок - 1шт на дверь
(3, 'material', 16, 1.0000, FALSE, 4),  -- Кнопка выхода - 1шт на дверь
(3, 'material', 17, 1.0000, FALSE, 5),  -- Блок питания 12В - 1шт на дверь
(3, 'material', 18, 1.0000, FALSE, 6),  -- Кабель, расходники - 1компл на дверь
(3, 'material', 19, 1.0000, TRUE, 10);  -- Карты доступа (10 шт) - 1компл

-- Работы для СКУД
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(3, 'work', 10, 1.0000, FALSE, 1),     -- Монтаж оборудования СКУД - 1компл на дверь
(3, 'work', 11, 1.0000, FALSE, 2);     -- Настройка ПО и выдача ключей - 1компл на дверь

-- Коэффициенты для СКУД
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(3, 1, FALSE),  -- Срочность
(3, 2, FALSE);  -- Территория

-- ----------------------------------------------------------------------------
-- Шаблон 4: IT-аутсорсинг (базовый)
-- ----------------------------------------------------------------------------
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`) VALUES
(4, 'IT-аутсорсинг "Базовый"', 'it-basic', 'Абонентское обслуживание рабочих мест', 'seats', 'Количество рабочих мест', 'мест', 1, 50, 10, 1, FALSE, 1);

-- Материалы/услуги для IT
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(4, 'material', 20, 1.0000, FALSE, 1); -- Абонентское обслуживание (удаленно) - 1раб.мест/мес

-- Работы для IT (добавляются отдельно)
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`, `notes`) VALUES
(4, 'work', 12, 0.0000, FALSE, 10, 'Добавляется по необходимости'); -- Разовый выезд инженера (почасовая)

-- Коэффициенты для IT
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(4, 1, FALSE);  -- Срочность

-- ----------------------------------------------------------------------------
-- Шаблон 5: Электромонтаж 1-комнатной квартиры (до 40 м²)
-- ----------------------------------------------------------------------------
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `sort_order`) VALUES
(5, 'Электрика под ключ (1-комнатная, до 40 м²)', 'electro-flat-1room-40m2', 'Комплексный электромонтаж в 1-комнатной квартире', 'area', 'Площадь помещения', 'м²', 20, 60, 40, 5, 2);

-- Материалы для электромонтажа квартиры (на 40 м²)
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
-- Шаблон id=5
(5, 'material', 21, 2.5000, FALSE, 1),  -- Кабель ВВГнг-LS 3×2.5 - 2.5м на м²
(5, 'material', 22, 1.5000, FALSE, 2),  -- Кабель ВВГнг-LS 3×1.5 - 1.5м на м²
(5, 'material', 23, 0.2000, FALSE, 3),  -- Автомат 1P 16A - 0.2шт на м² (8шт на 40м²)
(5, 'material', 24, 0.1500, FALSE, 4),  -- Автомат 1P 10A - 0.15шт на м² (6шт)
(5, 'material', 25, 0.0250, FALSE, 5),  -- Автомат 2P 25A - 0.025шт на м² (1шт)
(5, 'material', 26, 0.0500, FALSE, 6),  -- УЗО 2P 25A 30mA - 0.05шт на м² (2шт)
(5, 'material', 27, 0.2500, FALSE, 7),  -- Розетка 220В - 0.25шт на м² (10шт)
(5, 'material', 28, 0.1000, FALSE, 8),  -- Выключатель одноклавишный - 0.1шт на м² (4шт)
(5, 'material', 29, 0.0500, FALSE, 9),  -- Выключатель двухклавишный - 0.05шт на м² (2шт)
(5, 'material', 30, 0.3500, FALSE, 10), -- Подрозетник - 0.35шт на м² (14шт)
(5, 'material', 31, 0.1000, FALSE, 11), -- Распредкоробка - 0.1шт на м² (4шт)
(5, 'material', 32, 1.0000, TRUE, 20),  -- Щит квартирный - 1шт
(5, 'material', 34, 0.2500, FALSE, 12), -- Светильник точечный LED - 0.25шт на м² (10шт)
(5, 'material', 35, 0.0500, FALSE, 13), -- Светильник офисный LED 600×600 - 0.05шт на м² (2шт)
(5, 'material', 36, 1.0000, FALSE, 14), -- Кабель-канал 40×25 мм - 1м на м² (40м)
(5, 'material', 38, 0.5000, FALSE, 15); -- Гофра ПВХ 20мм - 0.5м на м² (20м)

-- Работы для электромонтажа квартиры
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(5, 'work', 13, 0.5000, FALSE, 1),     -- Штробление в бетоне - 0.5м на м²
(5, 'work', 16, 0.3500, FALSE, 2),     -- Установка подрозетника в бетоне - 0.35шт на м²
(5, 'work', 19, 1.0000, FALSE, 3),     -- Прокладка кабеля силового - 1м на м² (сумма кабелей)
(5, 'work', 20, 1.0000, FALSE, 4),     -- Монтаж кабель-канала - 1м на м²
(5, 'work', 21, 0.2000, FALSE, 5),     -- Монтаж автомата 1P - 0.2шт на м²
(5, 'work', 22, 0.0250, FALSE, 6),     -- Монтаж автомата 2P - 0.025шт на м²
(5, 'work', 23, 0.0500, FALSE, 7),     -- Монтаж УЗО - 0.05шт на м²
(5, 'work', 24, 0.4000, FALSE, 8),     -- Установка розетки/выключателя - 0.4шт на м²
(5, 'work', 25, 0.1000, FALSE, 9),     -- Монтаж распредкоробки - 0.1шт на м²
(5, 'work', 26, 1.0000, TRUE, 20),     -- Сборка щита (до 12 модулей) - 1шт
(5, 'work', 27, 0.2500, FALSE, 10),    -- Установка точечного светильника - 0.25шт на м²
(5, 'work', 28, 0.0500, FALSE, 11),    -- Установка светильника 600×600 - 0.05шт на м²
(5, 'work', 29, 1.0000, TRUE, 21);     -- Электролабораторные измерения - 1компл

-- Коэффициенты для электромонтажа
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(5, 1, FALSE),  -- Срочность
(5, 2, FALSE),  -- Территория
(5, 3, TRUE),   -- Тип стен
(5, 4, FALSE),  -- Высота работ
(5, 5, TRUE);   -- Тип проводки

-- ----------------------------------------------------------------------------
-- Шаблон 6: Электромонтаж офиса (50 м²)
-- ----------------------------------------------------------------------------
INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `has_electrical_addon`, `sort_order`) VALUES
(5, 'Офисный электромонтаж (50 м²)', 'electro-office-50m2', 'Комплексный электромонтаж в офисе', 'area', 'Площадь помещения', 'м²', 30, 200, 50, 10, FALSE, 3);

-- Материалы для электромонтажа офиса (на 50 м²)
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
-- Шаблон id=6
(6, 'material', 21, 2.0000, FALSE, 1),  -- Кабель ВВГнг-LS 3×2.5 - 2м на м²
(6, 'material', 22, 1.5000, FALSE, 2),  -- Кабель ВВГнг-LS 3×1.5 - 1.5м на м²
(6, 'material', 23, 0.2400, FALSE, 3),  -- Автомат 1P 16A - 0.24шт на м² (12шт)
(6, 'material', 24, 0.1200, FALSE, 4),  -- Автомат 1P 10A - 0.12шт на м² (6шт)
(6, 'material', 25, 0.0200, FALSE, 5),  -- Автомат 2P 25A - 0.02шт на м² (1шт)
(6, 'material', 26, 0.0400, FALSE, 6),  -- УЗО 2P 25A 30mA - 0.04шт на м² (2шт)
(6, 'material', 27, 0.3000, FALSE, 7),  -- Розетка 220В - 0.3шт на м² (15шт)
(6, 'material', 28, 0.0800, FALSE, 8),  -- Выключатель одноклавишный - 0.08шт на м² (4шт)
(6, 'material', 29, 0.0400, FALSE, 9),  -- Выключатель двухклавишный - 0.04шт на м² (2шт)
(6, 'material', 30, 0.3800, FALSE, 10), -- Подрозетник - 0.38шт на м² (19шт)
(6, 'material', 31, 0.0800, FALSE, 11), -- Распредкоробка - 0.08шт на м² (4шт)
(6, 'material', 33, 1.0000, TRUE, 20),  -- Щит офисный - 1шт
(6, 'material', 35, 0.1200, FALSE, 12), -- Светильник офисный LED 600×600 - 0.12шт на м² (6шт)
(6, 'material', 36, 1.2000, FALSE, 13), -- Кабель-канал 40×25 мм - 1.2м на м² (60м)
(6, 'material', 37, 0.5000, FALSE, 14), -- Кабель-канал 60×40 мм - 0.5м на м² (25м)
(6, 'material', 38, 0.3000, FALSE, 15); -- Гофра ПВХ 20мм - 0.3м на м² (15м)

-- Работы для электромонтажа офиса
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`) VALUES
(6, 'work', 13, 0.4000, FALSE, 1),     -- Штробление в бетоне - 0.4м на м²
(6, 'work', 16, 0.3800, FALSE, 2),     -- Установка подрозетника в бетоне - 0.38шт на м²
(6, 'work', 19, 1.0000, FALSE, 3),     -- Прокладка кабеля силового - 1м на м²
(6, 'work', 20, 1.2000, FALSE, 4),     -- Монтаж кабель-канала - 1.2м на м²
(6, 'work', 21, 0.2400, FALSE, 5),     -- Монтаж автомата 1P - 0.24шт на м²
(6, 'work', 22, 0.0200, FALSE, 6),     -- Монтаж автомата 2P - 0.02шт на м²
(6, 'work', 23, 0.0400, FALSE, 7),     -- Монтаж УЗО - 0.04шт на м²
(6, 'work', 24, 0.4200, FALSE, 8),     -- Установка розетки/выключателя - 0.42шт на м²
(6, 'work', 25, 0.0800, FALSE, 9),     -- Монтаж распредкоробки - 0.08шт на м²
(6, 'work', 27, 1.0000, TRUE, 20),     -- Сборка щита (13-24 модуля) - 1шт
(6, 'work', 28, 0.1200, FALSE, 10),    -- Установка светильника 600×600 - 0.12шт на м²
(6, 'work', 29, 1.0000, TRUE, 21);     -- Электролабораторные измерения - 1компл

-- Коэффициенты для офиса
INSERT INTO `template_coefficients` (`template_id`, `coefficient_id`, `is_required`) VALUES
(6, 1, FALSE),  -- Срочность
(6, 2, FALSE),  -- Территория
(6, 3, TRUE),   -- Тип стен
(6, 4, FALSE),  -- Высота работ
(6, 5, TRUE);   -- Тип проводки

-- ============================================================================
-- Дополнительные работы (модульные добавки)
-- Создадим отдельный "шаблон" для дополнительных работ
-- ============================================================================

INSERT INTO `templates` (`category_id`, `name`, `slug`, `description`, `base_param_code`, `base_param_name`, `base_param_unit`, `base_value_min`, `base_value_max`, `base_value_default`, `base_value_step`, `is_active`, `sort_order`) VALUES
(5, 'Дополнительные электромонтажные работы', 'electro-additional', 'Отдельные виды работ, которые можно добавить к любой смете', 'quantity', 'Количество', 'шт', 1, 100, 1, 1, TRUE, 100);

-- Дополнительные работы (как отдельные items с quantity=1, пользователь выбирает количество)
-- Эти работы будут выбираться отдельно в интерфейсе
INSERT INTO `template_items` (`template_id`, `item_type`, `item_id`, `quantity_per_unit`, `is_fixed`, `sort_order`, `notes`) VALUES
(7, 'work', 13, 1.0000, FALSE, 1, 'Штробление в бетоне (за 1 пог.м)'),
(7, 'work', 14, 1.0000, FALSE, 2, 'Штробление в кирпиче (за 1 пог.м)'),
(7, 'work', 16, 1.0000, FALSE, 3, 'Установка подрозетника в бетоне (за 1 шт)'),
(7, 'work', 24, 1.0000, FALSE, 4, 'Установка розетки/выключателя (за 1 шт)'),
(7, 'work', 19, 1.0000, FALSE, 5, 'Прокладка кабеля силового (за 1 м)'),
(7, 'work', 20, 1.0000, FALSE, 6, 'Монтаж кабель-канала (за 1 м)'),
(7, 'work', 21, 1.0000, FALSE, 7, 'Монтаж автомата 1P (за 1 шт)'),
(7, 'work', 26, 1.0000, FALSE, 8, 'Сборка щита (до 12 модулей)'),
(7, 'work', 27, 1.0000, FALSE, 9, 'Установка точечного светильника (за 1 шт)'),
(7, 'work', 29, 1.0000, FALSE, 10, 'Электролабораторные измерения (компл)');

COMMIT;

-- ============================================================================
-- Конец SQL скрипта
-- ============================================================================
