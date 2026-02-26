# 🚀 Калькулятор смет - Руководство по запуску

## ✅ Что было реализовано

### 1. База данных
- ✅ Создана структура БД с 8 таблицами
- ✅ Наполнено 6 MVP-шаблонов:
  - СКС для офиса (до 20 рабочих мест)
  - Видеонаблюдение (4-8 камер)
  - СКУД (1-2 точки входа)
  - IT-аутсорсинг (базовый)
  - Электромонтаж 1-комнатной квартиры (до 40 м²)
  - Электромонтаж офиса (50 м²)
- ✅ Добавлены коэффициенты (срочность, территория, тип стен, высота, тип проводки)
- ✅ Реализована система объемных скидок

### 2. Backend (PHP API)
- ✅ REST API endpoints:
  - `GET /api/categories` - список категорий
  - `GET /api/templates` - список шаблонов
  - `GET /api/templates/{id}` - детали шаблона
  - `GET /api/category/{slug}/templates` - шаблоны категории
  - `POST /api/calculate` - расчет сметы
  - `POST /api/generate-pdf` - генерация PDF
  - `POST /api/generate-excel` - генерация Excel
  - `GET /api/additional-works` - дополнительные работы
- ✅ Класс Database (PDO с подготовленными выражениями)
- ✅ Модель CalculatorModel для расчетов
- ✅ Генератор PDF (Dompdf)
- ✅ Генератор Excel (PhpSpreadsheet)
- ✅ Логирование всех расчетов

### 3. Frontend
- ✅ Главная страница с категориями услуг и SVG изображениями
- ✅ Страница выбора шаблонов
- ✅ Интерфейс калькулятора с:
  - Ползунком для ввода параметров
  - Выбором коэффициентов
  - Опцией добавления электромонтажа
  - Дополнительными работами
- ✅ Отображение результатов (материалы, работы, итоговая сумма)
- ✅ Экспорт в PDF и Excel
- ✅ Адаптивный дизайн (десктоп, планшет, мобильный)
- ✅ Улучшенные анимации и эффекты
- ✅ Интеграция с основным сайтом (ссылки в меню)

### 4. Документация
- ✅ README.md с полной документацией
- ✅ INSTALL.md с инструкцией по запуску
- ✅ SQL скрипт с комментариями
- ✅ Конфигурационный файл (example)

---

## 📋 Пошаговая инструкция по запуску

### Шаг 1: Настройка базы данных

1. Откройте phpMyAdmin или MySQL консоль

2. Создайте базу данных:
```sql
CREATE DATABASE `ita_calculator` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Импортируйте файл `calculator/database.sql`:
```bash
mysql -u ваше_имя -p ita_calculator < calculator/database.sql
```

Или через phpMyAdmin:
- Выберите базу данных `ita_calculator`
- Перейдите на вкладку "Импорт"
- Выберите файл `calculator/database.sql`
- Нажмите "Вперед"

### Шаг 2: Установка зависимостей (Composer)

Для работы экспорта в PDF и Excel необходимо установить зависимости:

```bash
cd calculator/
composer install
```

Или вручную:
```bash
composer require dompdf/dompdf
composer require phpoffice/phpspreadsheet
```

**Если Composer не установлен:**
- Скачайте с https://getcomposer.org/download/
- Установите и запустите `composer install` в папке calculator

### Шаг 3: Настройка конфигурации

1. Перейдите в папку `calculator/`

2. Скопируйте файл конфигурации:
```bash
cp config.example.php config.php
```

3. Откройте `config.php` и отредактируйте параметры БД:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ita_calculator');
define('DB_USER', 'ваше_имя_пользователя');  // например, root
define('DB_PASS', 'ваш_пароль');             // например, ''
```

4. При необходимости измените другие настройки:
```php
define('APP_DEBUG', true);  // false для продакшена
define('APP_URL', 'http://calc.ita-sochi.ru');
```

### Шаг 3: Настройка веб-сервера

#### Для Apache:

1. Убедитесь, что включен mod_rewrite:
```bash
a2enmod rewrite
service apache2 restart
```

2. Настройте виртуальный хост (пример для Windows XAMPP/OpenServer):

**XAMPP (httpd-vhosts.conf):**
```apache
<VirtualHost *:80>
    ServerName calc.ita-sochi.ru
    DocumentRoot "C:/path/to/web-ita-sochi/calculator"
    
    <Directory "C:/path/to/web-ita-sochi/calculator">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**OpenServer (domain.ini):**
```ini
[calc.ita-sochi.ru]
IP_ADDRESS      = 127.0.0.1
DOMAIN          = calc.ita-sochi.ru
ALIAS           = 
DIR             = {#SITE_DIR#}/web-ita-sochi/calculator
WWW_DIR         = {#SITE_DIR#}/web-ita-sochi/calculator
LOG_DIR         = {#LOG_DIR#}
ERROR_LOG_DIR   = {#LOG_DIR#}
PHP_LOG_DIR     = {#LOG_DIR#}
PHP_VERSION     = PHP-8.1
```

3. Файл `.htaccess` уже создан и настроен

#### Для Nginx:

```nginx
server {
    listen 80;
    server_name calc.ita-sochi.ru;
    root /path/to/web-ita-sochi/calculator;
    index index.html index.php;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
    
    location /api/ {
        try_files $uri $uri/ /api/index.php?$query_string;
    }
}
```

### Шаг 4: Проверка установки

1. Откройте браузер

2. Перейдите по адресу:
   - Локально: `http://calc.ita-sochi.ru` или `http://localhost/calculator/`
   - На сервере: `http://calc.ita-sochi.ru`

3. Вы должны увидеть страницу с категориями услуг:
   - СКС
   - Видеонаблюдение
   - СКУД
   - IT-аутсорсинг
   - Электромонтаж

4. Протестируйте расчет:
   - Выберите категорию "Электромонтаж"
   - Выберите шаблон "Электрика под ключ (1-комнатная, до 40 м²)"
   - Измените площадь (например, 50 м²)
   - Выберите коэффициенты (тип стен, высота)
   - Нажмите "Рассчитать смету"
   - Проверьте результаты

### Шаг 5: Интеграция с основным сайтом

Ссылки на калькулятор уже добавлены в главное меню сайта:
- В десктопной версии (пункт "Калькулятор")
- В мобильной версии (пункт "Калькулятор смет")

Для доступа к калькулятору:
- С главного сайта: `http://ita-sochi.ru/calculator/`
- Напрямую: `http://calc.ita-sochi.ru/`

---

## 🔧 Управление ценами

### Обновление цен на материалы

```sql
-- Обновить цену конкретного материала
UPDATE materials SET current_price = 30 WHERE slug = 'cable-utp-cat5e';

-- Обновить все цены в категории (например, +10%)
UPDATE materials SET current_price = current_price * 1.1 WHERE category = 'sks';

-- Посмотреть текущие цены
SELECT name, unit, current_price FROM materials WHERE category = 'electro' ORDER BY name;
```

### Обновление цен на работы

```sql
-- Обновить цену работы
UPDATE works SET current_price = 50 WHERE slug = 'cable-laying-utp';

-- Обновить все цены в категории
UPDATE works SET current_price = current_price * 1.1 WHERE category = 'electro';
```

### Добавление нового шаблона

1. Добавьте шаблон в таблицу `templates`:
```sql
INSERT INTO templates (category_id, name, slug, description, base_param_code, base_param_name, base_param_unit, base_value_min, base_value_max, base_value_default, base_value_step)
VALUES (1, 'Новый шаблон СКС', 'new-sks-template', 'Описание', 'seats', 'Количество мест', 'мест', 1, 50, 10, 1);
```

2. Добавьте элементы шаблона:
```sql
-- Материалы
INSERT INTO template_items (template_id, item_type, item_id, quantity_per_unit, is_fixed)
VALUES (LAST_INSERT_ID(), 'material', 1, 15.0000, FALSE);

-- Работы
INSERT INTO template_items (template_id, item_type, item_id, quantity_per_unit, is_fixed)
VALUES (LAST_INSERT_ID(), 'work', 1, 15.0000, FALSE);
```

3. Добавьте коэффициенты:
```sql
INSERT INTO template_coefficients (template_id, coefficient_id, is_required)
VALUES (LAST_INSERT_ID(), 1, FALSE);
```

---

## 🐛 Отладка

### Включите режим отладки

В файле `config.php`:
```php
define('APP_DEBUG', true);
```

### Проверка логов

1. Логи расчетов в БД:
```sql
SELECT cl.*, t.name as template_name 
FROM calculation_logs cl
JOIN templates t ON cl.template_id = t.id
ORDER BY cl.created_at DESC
LIMIT 50;
```

2. Логи ошибок PHP (проверьте php.ini):
```
error_log = /path/to/logs/php-error.log
```

3. Логи веб-сервера:
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`

### Тестирование API

Используйте curl или Postman:

```bash
# Получить список категорий
curl http://calc.ita-sochi.ru/api/categories

# Получить шаблоны
curl http://calc.ita-sochi.ru/api/templates

# Получить шаблон по ID
curl http://calc.ita-sochi.ru/api/templates/1

# Рассчитать смету
curl -X POST http://calc.ita-sochi.ru/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": 5,
    "base_value": 50,
    "coefficients": {
      "urgency": "normal",
      "territory": "sochi",
      "wall_type": "concrete"
    },
    "include_electrical": false
  }'
```

---

## 📞 Поддержка

По вопросам:
- Email: info@ita-sochi.ru
- Телефон: +7 (988) 234-00-95

---

## 📄 Файлы проекта

```
calculator/
├── .htaccess                 # Настройки Apache
├── README.md                 # Полная документация
├── INSTALL.md                # Этот файл
├── config.example.php        # Пример конфигурации
├── config.php                # Активная конфигурация (создать)
├── database.sql              # База данных (структура + данные)
├── index.html                # Главная страница
├── api/
│   └── index.php             # REST API
├── css/
│   └── calculator.css        # Стили
├── js/
│   └── calculator.js         # JavaScript логика
└── includes/
    ├── Database.php          # Класс БД
    └── CalculatorModel.php   # Модель расчетов
```

---

**Версия:** 1.0  
**Дата:** 26 февраля 2026 г.  
**Статус:** ✅ Готово к использованию
