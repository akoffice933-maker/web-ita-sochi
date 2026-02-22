<?php
/**
 * Обработчик форм для сайта ITA Сочи
 * Отправляет данные на email и сохраняет в лог
 */

header('Content-Type: application/json; charset=utf-8');

$to = "info@ita-sochi.ru";
$subject_prefix = "Заявка с сайта ITA Сочи";
$log_file = __DIR__ . "/logs/requests.log";

if (!file_exists(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    return preg_match('/^[+\d\s\(\)\-]{10,20}$/', $phone);
}

function log_request($data, $log_file) {
    $log_entry = date('Y-m-d H:i:s') . " | " . ($_SERVER['REMOTE_ADDR'] ?? '') . " | " . json_encode($data, JSON_UNESCAPED_UNICODE) . PHP_EOL;
    @file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);
}

function send_email($data, $to, $subject_prefix) {
    $name = $data['name'] ?? 'Не указано';
    $phone = $data['phone'] ?? 'Не указан';
    $email = $data['email'] ?? 'Не указан';
    $message = $data['message'] ?? 'Без сообщения';
    $service = $data['service'] ?? 'Не выбрана';
    $subject = $subject_prefix . " от " . $name;
    $headers = "MIME-Version: 1.0" . PHP_EOL;
    $headers .= "Content-type: text/html; charset=utf-8" . PHP_EOL;
    $headers .= "From: ITA Сочи <noreply@ita-sochi.ru>" . PHP_EOL;
    $body = "<html><head><meta charset='utf-8'></head><body>";
    $body .= "<h2>Новая заявка с сайта ITA Сочи</h2>";
    $body .= "<p><strong>Имя:</strong> " . htmlspecialchars($name) . "</p>";
    $body .= "<p><strong>Телефон:</strong> " . htmlspecialchars($phone) . "</p>";
    $body .= "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    $body .= "<p><strong>Услуга:</strong> " . htmlspecialchars($service) . "</p>";
    $body .= "<p><strong>Сообщение:</strong><br>" . nl2br(htmlspecialchars($message)) . "</p>";
    $body .= "<p><small>Отправлено: " . date('Y-m-d H:i:s') . ", IP: " . ($_SERVER['REMOTE_ADDR'] ?? '') . "</small></p>";
    $body .= "</body></html>";
    return @mail($to, $subject, $body, $headers);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $form_data = [
        'name' => clean_input($_POST['name'] ?? ''),
        'phone' => clean_input($_POST['phone'] ?? ''),
        'email' => clean_input($_POST['email'] ?? ''),
        'service' => clean_input($_POST['service'] ?? ''),
        'message' => clean_input($_POST['message'] ?? ''),
        'privacy' => !empty($_POST['privacy'])
    ];
    $errors = [];
    if (empty($form_data['name'])) $errors[] = "Имя обязательно";
    if (empty($form_data['phone']) && empty($form_data['email'])) $errors[] = "Заполните телефон или email";
    if (!empty($form_data['phone']) && !validate_phone($form_data['phone'])) $errors[] = "Неверный формат телефона";
    if (!empty($form_data['email']) && !validate_email($form_data['email'])) $errors[] = "Неверный формат email";
    if (!$form_data['privacy']) $errors[] = "Необходимо согласие на обработку персональных данных";

    log_request($form_data, $log_file);

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'errors' => $errors], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $mail_sent = send_email($form_data, $to, $subject_prefix);
    if ($mail_sent) {
        echo json_encode(['success' => true, 'message' => 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'errors' => ['Ошибка при отправке. Попробуйте позже или позвоните нам.']], JSON_UNESCAPED_UNICODE);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Метод не разрешен']], JSON_UNESCAPED_UNICODE);
}
