<?php
/**
 * REST API для калькулятора смет
 * Endpoints:
 *   GET  /api/templates          - Список всех шаблонов
 *   GET  /api/templates/{id}     - Детали шаблона
 *   GET  /api/categories         - Список категорий
 *   POST /api/calculate          - Расчет сметы
 *   POST /api/generate-pdf       - Генерация PDF
 *   POST /api/generate-excel     - Генерация Excel
 *   POST /api/log                - Логирование расчета
 */

// Подключаем конфигурацию и классы
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/CalculatorModel.php';

// Автозагрузчик Composer для PDF/Excel
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require_once __DIR__ . '/../vendor/autoload.php';
}

// Заголовки для API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Получаем метод запроса
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Определяем endpoint
$parts = explode('/', trim($requestUri, '/'));
$baseEndpoint = $parts[array_search('api', $parts) + 1] ?? '';

try {
    $model = new CalculatorModel();
    
    // GET /api/categories
    if ($baseEndpoint === 'categories' && $method === 'GET') {
        $categories = $model->getCategories();
        echo json_encode([
            'success' => true,
            'data' => $categories
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // GET /api/templates
    if ($baseEndpoint === 'templates' && $method === 'GET' && count($parts) === array_search('api', $parts) + 2) {
        $templates = $model->getTemplates();
        echo json_encode([
            'success' => true,
            'data' => $templates
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // GET /api/templates/{id} или /api/templates/slug/{slug}
    if ($baseEndpoint === 'templates' && $method === 'GET' && count($parts) >= array_search('api', $parts) + 3) {
        $template = null;
        
        // Проверяем, это ID или slug
        $identifier = $parts[array_search('api', $parts) + 3];
        
        if (is_numeric($identifier)) {
            $template = $model->getTemplateById((int) $identifier);
        } else {
            // Проверяем, есть ли 'slug' в пути
            if ($identifier === 'slug' && isset($parts[array_search('api', $parts) + 4])) {
                $slug = $parts[array_search('api', $parts) + 4];
                $template = $model->getTemplateBySlug($slug);
            } else {
                $template = $model->getTemplateBySlug($identifier);
            }
        }
        
        if ($template) {
            // Получаем коэффициенты для шаблона
            $coefficients = $model->getCoefficientsWithOptions($template['id']);
            $template['coefficients'] = $coefficients;
            
            echo json_encode([
                'success' => true,
                'data' => $template
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Шаблон не найден'
            ], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
    
    // GET /api/category/{slug}/templates
    if ($baseEndpoint === 'category' && $method === 'GET' && count($parts) >= array_search('api', $parts) + 3) {
        $categorySlug = $parts[array_search('api', $parts) + 3];
        $templates = $model->getTemplatesByCategory($categorySlug);
        
        echo json_encode([
            'success' => true,
            'data' => $templates
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // POST /api/calculate
    if ($baseEndpoint === 'calculate' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Неверный формат данных'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Валидация входных данных
        if (empty($input['template_id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Не указан template_id'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        if (!isset($input['base_value']) || $input['base_value'] <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Неверное значение base_value'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        $templateId = (int) $input['template_id'];
        $baseValue = (float) $input['base_value'];
        $coefficients = $input['coefficients'] ?? [];
        $includeElectrical = !empty($input['include_electrical']);
        $additionalWorks = $input['additional_works'] ?? [];
        
        // Расчет сметы
        $result = $model->calculate($templateId, $baseValue, $coefficients, $includeElectrical);
        
        // Добавляем дополнительные работы если есть
        if (!empty($additionalWorks)) {
            $additionalWorksList = $model->getAdditionalWorks();
            $worksMapping = [];
            
            foreach ($additionalWorksList as $work) {
                $worksMapping[$work['work_slug']] = $work;
            }
            
            foreach ($additionalWorks as $additionalWork) {
                if (isset($worksMapping[$additionalWork['slug']]) && $additionalWork['quantity'] > 0) {
                    $workData = $worksMapping[$additionalWork['slug']];
                    $quantity = (float) $additionalWork['quantity'];
                    $price = (float) $workData['work_price'];
                    $sum = $quantity * $price * $result['work_multiplier'];
                    
                    $result['works'][] = [
                        'name' => $workData['work_name'],
                        'unit' => $workData['work_unit'],
                        'quantity' => round($quantity, 2),
                        'price' => round($price * $result['work_multiplier'], 2),
                        'sum' => round($sum, 2),
                        'is_additional' => true
                    ];
                    $result['total_works'] += $sum;
                    $result['total_amount'] += $sum;
                }
            }
            
            // Пересчитываем итоги
            $result['total_works'] = round($result['total_works'], 2);
            $result['total_amount'] = round($result['total_amount'], 2);
        }
        
        // Логирование расчета
        try {
            $model->logCalculation($result);
        } catch (Exception $e) {
            // Игнорируем ошибки логирования
        }
        
        echo json_encode([
            'success' => true,
            'data' => $result
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // POST /api/generate-pdf
    if ($baseEndpoint === 'generate-pdf' && $method === 'POST') {
        // Проверяем наличие Dompdf
        if (!class_exists('Dompdf\Dompdf')) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Библиотека Dompdf не установлена. Выполните: composer require dompdf/dompdf'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        require_once __DIR__ . '/../includes/PdfGenerator.php';

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || empty($input['calculation_data'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Неверный формат данных'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            $generator = new PdfGenerator();
            $pdfContent = $generator->generate($input['calculation_data']);

            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="smeta_ITA_' . date('Ymd_His') . '.pdf"');
            header('Content-Length: ' . strlen($pdfContent));
            header('Cache-Control: private, max-age=0, must-revalidate');
            echo $pdfContent;
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => APP_DEBUG ? $e->getMessage() : 'Ошибка генерации PDF'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // POST /api/generate-excel
    if ($baseEndpoint === 'generate-excel' && $method === 'POST') {
        // Проверяем наличие PhpSpreadsheet
        if (!class_exists('PhpOffice\PhpSpreadsheet\Spreadsheet')) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Библиотека PhpSpreadsheet не установлена. Выполните: composer require phpoffice/phpspreadsheet'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        require_once __DIR__ . '/../includes/ExcelGenerator.php';

        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || empty($input['calculation_data'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Неверный формат данных'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            $generator = new ExcelGenerator();
            $excelContent = $generator->generate($input['calculation_data']);

            header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            header('Content-Disposition: attachment; filename="smeta_ITA_' . date('Ymd_His') . '.xlsx"');
            header('Content-Length: ' . strlen($excelContent));
            header('Cache-Control: private, max-age=0, must-revalidate');
            echo $excelContent;
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => APP_DEBUG ? $e->getMessage() : 'Ошибка генерации Excel'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // POST /api/additional-works
    if ($baseEndpoint === 'additional-works' && $method === 'GET') {
        $works = $model->getAdditionalWorks();
        
        echo json_encode([
            'success' => true,
            'data' => $works
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Endpoint не найден
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint не найден'
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => APP_DEBUG ? $e->getMessage() : 'Внутренняя ошибка сервера'
    ], JSON_UNESCAPED_UNICODE);
}
