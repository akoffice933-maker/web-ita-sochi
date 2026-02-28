-- База данных для калькулятора
-- Импортируйте этот файл через phpMyAdmin

CREATE DATABASE IF NOT EXISTS `ita_calculator` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ita_calculator`;

-- Таблица категорий
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `icon_class` VARCHAR(100),
    `description` TEXT,
    `sort_order` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица шаблонов
CREATE TABLE IF NOT EXISTS `templates` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT,
    `base_param_code` VARCHAR(50) NOT NULL,
    `base_param_name` VARCHAR(100) NOT NULL,
    `base_param_unit` VARCHAR(20),
    `base_value_min` DECIMAL(10,2) DEFAULT 1,
    `base_value_max` DECIMAL(10,2) DEFAULT 100,
    `base_value_default` DECIMAL(10,2) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица материалов
CREATE TABLE IF NOT EXISTS `materials` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `current_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблица работ
CREATE TABLE IF NOT EXISTS `works` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `unit` VARCHAR(20) NOT NULL,
    `current_price` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
