<?php
// Удаление setup-скрипта после использования
unlink('setup-database.php');
unlink('delete-setup.php');
echo "✅ Файлы удалены! Теперь безопасно.";
?>
