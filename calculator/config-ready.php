<?php
/**
 * Конфигурационный файл калькулятора
 * ИТА Сочи
 */

// База данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'ita_calculator');
define('DB_USER', 'infoitaso3_calc');
define('DB_PASS', 'ItaSochi2026!Calc');
define('DB_CHARSET', 'utf8mb4');

// Настройки приложения
define('APP_NAME', 'Калькулятор смет - ИТА Сочи');
define('APP_URL', 'http://school-board.online/calculator');
define('APP_DEBUG', false);

// Времяzone
date_default_timezone_set('Europe/Moscow');

// Кодировка
mb_internal_encoding('UTF-8');
header('Content-Type: text/html; charset=utf-8');

// Ошибки (в продакшене отключено)
if (APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Сессионные настройки
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);

// Логотип и контакты
define('COMPANY_NAME', 'ИТА Сочи');
define('COMPANY_PHONE', '+7 (988) 234-00-95');
define('COMPANY_EMAIL', 'info@ita-sochi.ru');
define('COMPANY_ADDRESS', 'г. Сочи, ул. Севастопольская, 25, офис 304');
define('COMPANY_LOGO_URL', 'images/logo.jpg');

// Настройки экспорта
define('PDF_GENERATOR', 'dompdf');
define('EXCEL_GENERATOR', 'phpspreadsheet');

// Лимиты
define('MAX_CALCULATION_ITEMS', 1000);
define('CACHE_TTL', 3600);
