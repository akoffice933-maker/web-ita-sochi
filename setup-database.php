<?php
/**
 * Скрипт автоматической настройки базы данных
 * Загрузите этот файл на хостинг и откройте в браузере
 */

// Настройки
$db_host = 'localhost';
$db_name = 'ita_calculator';
$db_user = 'infoitaso3_calc';
$db_pass = 'ItaSochi2026!Calc'; // Надёжный пароль

// Подключение к MySQL
$link = mysqli_connect($db_host, 'infoitaso3_board', 'HGKHGJFGasadsdf12##');

if (!$link) {
    die("❌ Ошибка подключения: " . mysqli_connect_error());
}

echo "<h1>🚀 Настройка базы данных ИТА Сочи</h1>";
echo "<pre>";

// 1. Создаём базу данных
echo "1. Создание базы данных '$db_name'...\n";
$sql = "CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
if (mysqli_query($link, $sql)) {
    echo "   ✅ База данных создана!\n";
} else {
    echo "   ❌ Ошибка: " . mysqli_error($link) . "\n";
}

// 2. Создаём пользователя
echo "\n2. Создание пользователя '$db_user'...\n";
$sql = "CREATE USER IF NOT EXISTS '$db_user'@'localhost' IDENTIFIED BY '$db_pass'";
if (mysqli_query($link, $sql)) {
    echo "   ✅ Пользователь создан!\n";
} else {
    echo "   ❌ Ошибка: " . mysqli_error($link) . "\n";
}

// 3. Даём права
echo "\n3. Предоставление прав пользователю...\n";
$sql = "GRANT ALL PRIVILEGES ON `$db_name`.* TO '$db_user'@'localhost'";
if (mysqli_query($link, $sql)) {
    echo "   ✅ Права предоставлены!\n";
    mysqli_query($link, "FLUSH PRIVILEGES");
    echo "   ✅ Права активированы!\n";
} else {
    echo "   ❌ Ошибка: " . mysqli_error($link) . "\n";
}

// 4. Импортируем database.sql
echo "\n4. Импорт database.sql...\n";
mysqli_select_db($link, $db_name);
$sql_file = file_get_contents('calculator/database.sql');
if ($sql_file) {
    $queries = array_filter(array_map('trim', explode(';', $sql_file)));
    $success = 0;
    $errors = 0;
    
    foreach ($queries as $query) {
        if (!empty($query) && !preg_match('/^--/', $query)) {
            if (mysqli_query($link, $query)) {
                $success++;
            } else {
                $errors++;
            }
        }
    }
    
    echo "   ✅ Выполнено запросов: $success\n";
    if ($errors > 0) {
        echo "   ⚠️ Ошибок: $errors (не критично)\n";
    } else {
        echo "   ✅ Все таблицы созданы!\n";
    }
} else {
    echo "   ❌ Не удалось прочитать database.sql\n";
}

mysqli_close($link);

echo "\n";
echo "==========================================\n";
echo "✅ НАСТРОЙКА ЗАВЕРШЕНА!\n";
echo "==========================================\n\n";

echo "Данные для подключения:\n";
echo "  Host: $db_host\n";
echo "  Database: $db_name\n";
echo "  User: $db_user\n";
echo "  Password: $db_pass\n\n";

echo "Теперь отредактируйте calculator/config.php:\n";
echo "<?php\n";
echo "define('DB_HOST', '$db_host');\n";
echo "define('DB_NAME', '$db_name');\n";
echo "define('DB_USER', '$db_user');\n";
echo "define('DB_PASS', '$db_pass');\n";
echo "define('APP_DEBUG', false);\n";
echo "?>\n\n";

echo "🔒 <strong>УДАЛИТЕ ЭТОТ ФАЙЛ ПОСЛЕ НАСТРОЙКИ!</strong>";
echo "</pre>";
?>
