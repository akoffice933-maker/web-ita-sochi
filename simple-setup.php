<?php
/**
 * Простой скрипт настройки БД
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Настройка БД ИТА Сочи</h1>";
echo "<pre>";

// Подключение
$link = @mysqli_connect('localhost', 'infoitaso3_board', 'HGKHGJFGasadsdf12##');

if (!$link) {
    echo "❌ Ошибка подключения к MySQL\n";
    echo "Проверьте логин/пароль в панели хостинга\n";
    exit;
}

echo "✅ Подключение успешно\n\n";

// Создаём базу
echo "1. Создание базы ita_calculator...\n";
if (mysqli_query($link, "CREATE DATABASE IF NOT EXISTS `ita_calculator` DEFAULT CHARACTER SET utf8mb4")) {
    echo "   ✅ Готово\n\n";
} else {
    echo "   ❌ " . mysqli_error($link) . "\n\n";
}

// Создаём пользователя
echo "2. Создание пользователя infoitaso3_calc...\n";
if (mysqli_query($link, "CREATE USER IF NOT EXISTS 'infoitaso3_calc'@'localhost' IDENTIFIED BY 'ItaSochi2026!Calc'")) {
    echo "   ✅ Готово\n\n";
} else {
    echo "   ❌ " . mysqli_error($link) . "\n\n";
}

// Даём права
echo "3. Предоставление прав...\n";
if (mysqli_query($link, "GRANT ALL PRIVILEGES ON `ita_calculator`.* TO 'infoitaso3_calc'@'localhost'")) {
    mysqli_query($link, "FLUSH PRIVILEGES");
    echo "   ✅ Готово\n\n";
} else {
    echo "   ❌ " . mysqli_error($link) . "\n\n";
}

echo "=================================\n";
echo "✅ БАЗА ДАННЫХ ГОТОВА!\n";
echo "=================================\n\n";

echo "Теперь импортируйте database.sql через phpMyAdmin:\n";
echo "1. Откройте phpMyAdmin в панели хостинга\n";
echo "2. Выберите базу 'ita_calculator'\n";
echo "3. Вкладка 'Импорт'\n";
echo "4. Выберите файл calculator/database.sql\n";
echo "5. Нажмите 'Вперед'\n\n";

echo "Затем создайте calculator/config.php с данными:\n";
echo "<?php\n";
echo "define('DB_HOST', 'localhost');\n";
echo "define('DB_NAME', 'ita_calculator');\n";
echo "define('DB_USER', 'infoitaso3_calc');\n";
echo "define('DB_PASS', 'ItaSochi2026!Calc');\n";
echo "define('APP_DEBUG', false);\n";
echo "?>\n";

mysqli_close($link);
echo "</pre>";
?>
