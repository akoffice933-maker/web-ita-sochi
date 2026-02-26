<?php
/**
 * Класс для подключения к базе данных и выполнения запросов
 * Использует PDO с подготовленными выражениями для защиты от SQL-инъекций
 */

class Database {
    private static $instance = null;
    private $pdo;
    
    /**
     * Приватный конструктор для паттерна Singleton
     */
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false,
            ];
            
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            if (APP_DEBUG) {
                throw new Exception("Ошибка подключения к базе данных");
            }
            throw new Exception("Внутренняя ошибка сервера");
        }
    }
    
    /**
     * Получить единственный экземпляр класса
     */
    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Получить PDO соединение
     */
    public function getConnection(): PDO {
        return $this->pdo;
    }
    
    /**
     * Выполнить SELECT запрос
     * @param string $sql SQL запрос
     * @param array $params Параметры для подготовленного выражения
     * @return array Результаты запроса
     */
    public function query(string $sql, array $params = []): array {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Query error: " . $e->getMessage() . " | SQL: " . $sql);
            if (APP_DEBUG) {
                throw new Exception("Ошибка выполнения запроса: " . $e->getMessage());
            }
            throw new Exception("Ошибка получения данных");
        }
    }
    
    /**
     * Выполнить SELECT запрос и получить одну строку
     * @param string $sql SQL запрос
     * @param array $params Параметры
     * @return array|null Одна строка или null
     */
    public function queryOne(string $sql, array $params = []): ?array {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            error_log("Query error: " . $e->getMessage());
            throw new Exception("Ошибка получения данных");
        }
    }
    
    /**
     * Выполнить INSERT, UPDATE, DELETE запрос
     * @param string $sql SQL запрос
     * @param array $params Параметры
     * @return int Количество затронутых строк или последний insert ID
     */
    public function execute(string $sql, array $params = []): int {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            // Для INSERT возвращаем последний ID
            if (stripos($sql, 'INSERT') === 0) {
                return (int) $this->pdo->lastInsertId();
            }
            
            return (int) $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Execute error: " . $e->getMessage() . " | SQL: " . $sql);
            if (APP_DEBUG) {
                throw new Exception("Ошибка выполнения запроса: " . $e->getMessage());
            }
            throw new Exception("Ошибка изменения данных");
        }
    }
    
    /**
     * Начать транзакцию
     */
    public function beginTransaction(): bool {
        return $this->pdo->beginTransaction();
    }
    
    /**
     * Зафиксировать транзакцию
     */
    public function commit(): bool {
        return $this->pdo->commit();
    }
    
    /**
     * Откатить транзакцию
     */
    public function rollback(): bool {
        return $this->pdo->rollBack();
    }
    
    /**
     * Запретить клонирование
     */
    private function __clone() {}
    
    /**
     * Запретить десериализацию
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
