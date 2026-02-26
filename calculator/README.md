# Калькулятор строительных смет для ИТА Сочи

Веб-приложение для автоматического расчета стоимости услуг компании «ИТА Сочи».

## 📋 Описание

Модуль «Калькулятор смет» предоставляет возможность посетителям сайта самостоятельно получать предварительную стоимость услуг:
- СКС (структурированные кабельные сети)
- Видеонаблюдение
- СКУД (системы контроля доступа)
- IT-аутсорсинг
- Электромонтажные работы

## 🚀 Быстрый старт

### Требования
- PHP 8.1 или выше
- MySQL 8.0 или выше (или MariaDB 10.6+)
- Веб-сервер (Apache/Nginx)

### Установка

1. **Скопируйте файлы модуля**
   ```bash
   # Модуль уже находится в папке calculator/
   ```

2. **Настройте базу данных**
   
   a. Создайте базу данных:
   ```sql
   CREATE DATABASE ita_calculator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   
   b. Импортируйте структуру и данные:
   ```bash
   mysql -u username -p ita_calculator < calculator/database.sql
   ```

3. **Настройте конфигурацию**
   
   a. Скопируйте файл конфигурации:
   ```bash
   cp calculator/config.example.php calculator/config.php
   ```
   
   b. Отредактируйте `calculator/config.php` и укажите ваши данные:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'ita_calculator');
   define('DB_USER', 'ваше_имя_пользователя');
   define('DB_PASS', 'ваш_пароль');
   ```

4. **Настройте веб-сервер**
   
   **Для Apache:**
   - Убедитесь, что mod_rewrite включен
   - Настройте виртуальный хост для поддомена `calc.ita-sochi.ru`
   
   **Пример виртуального хоста:**
   ```apache
   <VirtualHost *:80>
       ServerName calc.ita-sochi.ru
       DocumentRoot /path/to/web-ita-sochi/calculator
       
       <Directory /path/to/web-ita-sochi/calculator>
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```
   
   **Для Nginx:**
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
   }
   ```

5. **Проверьте установку**
   
   Откройте в браузере: `http://calc.ita-sochi.ru`

## 📁 Структура проекта

```
calculator/
├── api/
│   └── index.php              # REST API endpoints
├── css/
│   └── calculator.css         # Стили калькулятора
├── js/
│   └── calculator.js          # JavaScript логика
├── includes/
│   ├── Database.php           # Класс для работы с БД
│   └── CalculatorModel.php    # Модель для расчетов
├── config.example.php         # Пример конфигурации
├── config.php                 # Активная конфигурация (создается вручную)
├── database.sql               # SQL скрипт (структура + данные)
└── index.html                 # Главная страница калькулятора
```

## 🔌 API Endpoints

### GET /api/categories
Получить список всех категорий

**Ответ:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "СКС",
            "slug": "sks",
            "icon_class": "fa-solid fa-server"
        }
    ]
}
```

### GET /api/templates
Получить список всех шаблонов

### GET /api/templates/{id}
Получить детали шаблона по ID

### GET /api/templates/slug/{slug}
Получить детали шаблона по slug

### GET /api/category/{slug}/templates
Получить шаблоны категории

### POST /api/calculate
Рассчитать смету

**Запрос:**
```json
{
    "template_id": 1,
    "base_value": 15,
    "coefficients": {
        "urgency": "normal",
        "territory": "sochi"
    },
    "include_electrical": false,
    "additional_works": [
        {"slug": "grooving-concrete", "quantity": 10}
    ]
}
```

**Ответ:**
```json
{
    "success": true,
    "data": {
        "template": {...},
        "base_value": 15,
        "materials": [...],
        "works": [...],
        "total_materials": 50000,
        "total_works": 35000,
        "total_amount": 85000
    }
}
```

## 📊 Типовые шаблоны (MVP)

Включено 6 основных шаблонов:

1. **СКС для офиса** (до 20 рабочих мест)
2. **Видеонаблюдение** (4-8 камер)
3. **СКУД** (1-2 точки входа)
4. **IT-аутсорсинг** (базовый)
5. **Электромонтаж 1-комнатной квартиры** (до 40 м²)
6. **Электромонтаж офиса** (50 м²)

## 🔧 Система коэффициентов

### Общие коэффициенты
- **Срочность**: обычная (x1.0), срочно (x1.2), экстренно (x1.5)
- **Территория**: Сочи (x1.0), пригород (+3000₽), удаленные районы (+6000₽)

### Для электромонтажа
- **Тип стен**: гипсокартон (x1.0), кирпич (x1.25), бетон (x1.5)
- **Высота работ**: до 3м (x1.0), 3-5м (x1.3), выше 5м (x1.8)
- **Тип проводки**: открытая (x0.8), скрытая (x1.0), в стяжку (x1.1)

### Объемная скидка
- Превышение 50-99%: скидка 5% на материалы
- Превышение 100%+: скидка 10% на материалы

## 🔗 Интеграция с основным сайтом

### Добавление ссылки в меню

Откройте `index.html` в корне сайта и добавьте пункт меню:

```html
<a href="http://calc.ita-sochi.ru" class="px-4 py-2 text-slate-600 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition">
    Калькулятор смет
</a>
```

### Добавление кнопок на страницы услуг

На страницах услуг добавьте кнопки:

```html
<!-- Для СКС -->
<a href="http://calc.ita-sochi.ru/#template/1" 
   class="btn-cta bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition">
    <i class="fa-solid fa-calculator mr-2"></i>
    Рассчитать стоимость
</a>

<!-- Для видеонаблюдения -->
<a href="http://calc.ita-sochi.ru/#template/2" 
   class="btn-cta bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition">
    <i class="fa-solid fa-calculator mr-2"></i>
    Рассчитать стоимость
</a>

<!-- Для электромонтажа -->
<a href="http://calc.ita-sochi.ru/#template/5" 
   class="btn-cta bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition">
    <i class="fa-solid fa-calculator mr-2"></i>
    Рассчитать стоимость
</a>
```

## 🛠️ Обновление цен

Цены на материалы и работы хранятся в базе данных. Для обновления:

```sql
-- Обновить цену материала
UPDATE materials SET current_price = 30 WHERE slug = 'cable-utp-cat5e';

-- Обновить цену работы
UPDATE works SET current_price = 50 WHERE slug = 'cable-laying-utp';

-- Обновить все цены в категории
UPDATE materials SET current_price = current_price * 1.1 WHERE category = 'sks';
```

## 📝 Логирование

Все расчеты логируются в таблицу `calculation_logs`. Для просмотра:

```sql
SELECT cl.*, t.name as template_name 
FROM calculation_logs cl
JOIN templates t ON cl.template_id = t.id
ORDER BY cl.created_at DESC
LIMIT 100;
```

## 🐛 Отладка

Включите режим отладки в `config.php`:

```php
define('APP_DEBUG', true);
```

В режиме отладки отображаются подробные сообщения об ошибках.

## 📦 Экспорт (TODO)

Функции экспорта в PDF и Excel будут реализованы в следующей версии.

Для включения экспорта установите зависимости:

```bash
composer require dompdf/dompdf
composer require phpoffice/phpspreadsheet
```

## 📞 Поддержка

По вопросам установки и настройки обращайтесь:
- Email: info@ita-sochi.ru
- Телефон: +7 (988) 234-00-95

## 📄 Лицензия

© 2011–2026 ИТА Сочи. Все права защищены.

---

**Версия:** 1.0  
**Дата:** 26 февраля 2026 г.
