# 📤 ЗАГРУЗКА ВСЕГО САЙТА НА ХОСТИНГ

## Полный список файлов для загрузки:

```
📁 web ita-sochi/
├── 📁 calculator/              ← Калькулятор (готов к загрузке)
│   ├── api/
│   ├── css/
│   ├── images/
│   ├── includes/
│   ├── js/
│   ├── .htaccess
│   ├── composer.json
│   ├── config.example.php
│   ├── config.php (создать!)
│   ├── database.sql
│   ├── index.html
│   ├── HOSTING_INSTRUCTIONS.md
│   ├── INSTALL.md
│   ├── README.md
│   └── CHANGELOG.md
│
├── 📁 css/                     ← Стили основного сайта
│   └── style.css
│
├── 📁 images/                  ← Изображения
│   ├── apple-touch-icon.svg
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── logo.jpg
│   └── ...
│
├── 📁 js/                      ← JavaScript
│   └── (файлы JS)
│
├── 📁 pages/                   ← Страницы
│   ├── about.html
│   ├── access-control.html
│   ├── blog.html
│   ├── catalog.html
│   ├── contacts.html
│   ├── interaktiv.html        ← Новая страница!
│   ├── it-outsourcing.html
│   ├── products.html
│   ├── projects.html
│   ├── uslugi.html
│   └── video-surveillance.html
│
├── 📁 videos/                  ← Видео
│   └── (видео файлы)
│
├── 📁 logs/                    ← Логи
│   └── requests.log
│
├── .htaccess                   ← Настройки Apache
├── .gitignore
├── favicon.svg
├── index.html                  ← Главная страница
├── privacy-policy.html
├── README.md
├── robots.txt
├── sitemap.xml
├── submit.php                  ← Обработчик форм
└── web ita-sochi.txt
```

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### Шаг 1: Подготовка

1. **Скачайте WinSCP**: https://winscp.net/
2. **Установите и запустите**

### Шаг 2: Подключение к хостингу

**Введите данные:**

| Параметр | Значение |
|----------|----------|
| **Имя хоста** | `school-board.online` |
| **Протокол** | `FTP` |
| **Порт** | `21` |
| **Имя пользователя** | `infoitaso3_board` |
| **Пароль** | `[ВАШ ПАРОЛЬ]` |

**Нажмите "Войти"**

### Шаг 3: Загрузка файлов

#### Вариант A: Загрузка ВСЕГО сайта

1. **В левом окне** (локальные файлы) перейдите в:
   ```
   d:\web ita-sochi\
   ```

2. **В правом окне** (сервер) перейдите в:
   ```
   /public_html/
   ```
   или
   ```
   /www/
   ```

3. **Выделите ВСЕ файлы** в левом окне (Ctrl+A)

4. **Перетащите** в правое окно

5. **Подтвердите замену файлов** если спросит

6. **Дождитесь окончания** (может занять 5-10 минут)

#### Вариант B: Загрузка по папкам

**Сначала загрузите основное:**

1. **Файлы из корня:**
   - `index.html`
   - `.htaccess`
   - `favicon.svg`
   - `robots.txt`
   - `sitemap.xml`
   - `submit.php`
   - `privacy-policy.html`

2. **Папки:**
   - `css/`
   - `js/`
   - `images/`
   - `videos/`
   - `logs/`

3. **Папка pages/:**
   - `about.html`
   - `access-control.html`
   - `blog.html`
   - `catalog.html`
   - `contacts.html`
   - `interaktiv.html` ⭐ НОВАЯ!
   - `it-outsourcing.html`
   - `products.html`
   - `projects.html`
   - `uslugi.html`
   - `video-surveillance.html`

4. **Папка calculator/:**
   - Всё содержимое папки

### Шаг 4: Настройка базы данных

1. **Зайдите в панель управления хостингом**

2. **Найдите "Базы данных MySQL"**

3. **Создайте базу данных:**
   - Имя: `ita_calculator`
   - Кодировка: `utf8mb4_unicode_ci`

4. **Создайте пользователя:**
   - Имя: `infoitaso3_calc`
   - Пароль: `[придумайте пароль]`

5. **Дайте права** на базу `ita_calculator`:
   - ✅ ALL PRIVILEGES

6. **Откройте phpMyAdmin**

7. **Выберите базу `ita_calculator`**

8. **Импорт → Выберите файл:**
   ```
   calculator/database.sql
   ```

9. **Нажмите "Вперед"**

### Шаг 5: Создание config.php

1. **Скопируйте** `config.example.php` → `config.php`

2. **Откройте `config.php`** и измените:

```php
<?php
// База данных
define('DB_HOST', 'localhost');
define('DB_NAME', 'ita_calculator');
define('DB_USER', 'infoitaso3_calc');
define('DB_PASS', 'ВАШ_ПАРОЛЬ_ОТ_БД');
define('DB_CHARSET', 'utf8mb4');

// Настройки
define('APP_NAME', 'Калькулятор смет - ИТА Сочи');
define('APP_URL', 'https://school-board.online/calculator');
define('APP_DEBUG', false);  // false для продакшена!

// Контакты
define('COMPANY_NAME', 'ИТА Сочи');
define('COMPANY_PHONE', '+7 (988) 234-00-95');
define('COMPANY_EMAIL', 'info@ita-sochi.ru');
define('COMPANY_ADDRESS', 'г. Сочи, ул. Севастопольская, 25, офис 304');
```

3. **Сохраните** и загрузите на хостинг

### Шаг 6: Проверка

**Откройте в браузере:**

| Страница | URL |
|----------|-----|
| **Главная** | https://school-board.online/ |
| **Калькулятор** | https://school-board.online/calculator/ |
| **Интерактивные решения** | https://school-board.online/pages/interaktiv.html |
| **Услуги** | https://school-board.online/pages/uslugi.html |

**Проверьте:**

- [ ] Главная загружается
- [ ] Меню работает
- [ ] Калькулятор открывается
- [ ] Категории видны
- [ ] Расчет работает
- [ ] Результат показывается
- [ ] Страница "Интерактивные решения" работает

### Шаг 7: Безопасность

**После загрузки:**

1. **Удалите config.php из GitHub:**
   ```bash
   git rm --cached calculator/config.php
   echo "calculator/config.php" >> .gitignore
   git commit -m "Remove config.php"
   git push
   ```

2. **Установите права на файлы:**
   - Файлы: `644`
   - Папки: `755`
   - config.php: `600`

3. **Смените пароли:**
   - FTP
   - БД
   - Панель хостинга

---

## 🆘 Решение проблем

### Страница не загружается (404):

- Проверьте путь к файлам
- Проверьте `.htaccess`
- Попробуйте `https://school-board.online/index.html`

### Ошибка БД:

- Проверьте логин/пароль в `config.php`
- Убедитесь, что база создана
- Проверьте имя пользователя

### Калькулятор не работает:

- Проверьте `calculator/.htaccess`
- Включите `APP_DEBUG = true`
- Проверьте консоль (F12)

### Изображения не грузятся:

- Проверьте пути к файлам
- Проверьте права на папку `images/`

---

## ✅ ЧЕК-ЛИСТ

- [ ] WinSCP установлен
- [ ] Подключение к хостингу работает
- [ ] Все файлы загружены
- [ ] База данных создана
- [ ] Пользователь БД создан
- [ ] database.sql импортирован
- [ ] config.php создан и настроен
- [ ] Главная страница открывается
- [ ] Калькулятор работает
- [ ] Интерактивные решения работают
- [ ] Меню навигации работает
- [ ] Формы отправляются
- [ ] Пароли изменены
- [ ] config.php удалён из Git

---

**Готово!** 🎉

Сайт доступен по адресу:
```
https://school-board.online/
```

Калькулятор:
```
https://school-board.online/calculator/
```

Интерактивные решения:
```
https://school-board.online/pages/interaktiv.html
```
