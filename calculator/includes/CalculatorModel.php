<?php
/**
 * Модель для работы с шаблонами и расчетом смет
 */

class CalculatorModel {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Получить все активные категории
     */
    public function getCategories(): array {
        $sql = "SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order, name";
        return $this->db->query($sql);
    }
    
    /**
     * Получить категорию по slug
     */
    public function getCategoryBySlug(string $slug): ?array {
        $sql = "SELECT * FROM categories WHERE slug = ? AND is_active = TRUE";
        return $this->db->queryOne($sql, [$slug]);
    }
    
    /**
     * Получить все активные шаблоны с категориями
     */
    public function getTemplates(): array {
        $sql = "
            SELECT t.*, c.name as category_name, c.slug as category_slug, c.icon_class
            FROM templates t
            JOIN categories c ON t.category_id = c.id
            WHERE t.is_active = TRUE
            ORDER BY c.sort_order, t.sort_order, t.name
        ";
        return $this->db->query($sql);
    }
    
    /**
     * Получить шаблоны по категории
     */
    public function getTemplatesByCategory(string $categorySlug): array {
        $sql = "
            SELECT t.*, c.name as category_name, c.slug as category_slug, c.icon_class
            FROM templates t
            JOIN categories c ON t.category_id = c.id
            WHERE c.slug = ? AND t.is_active = TRUE
            ORDER BY t.sort_order, t.name
        ";
        return $this->db->query($sql, [$categorySlug]);
    }
    
    /**
     * Получить шаблон по ID с подробной информацией
     */
    public function getTemplateById(int $id): ?array {
        $sql = "
            SELECT t.*, c.name as category_name, c.slug as category_slug, c.icon_class
            FROM templates t
            JOIN categories c ON t.category_id = c.id
            WHERE t.id = ? AND t.is_active = TRUE
        ";
        return $this->db->queryOne($sql, [$id]);
    }
    
    /**
     * Получить шаблон по slug
     */
    public function getTemplateBySlug(string $slug): ?array {
        $sql = "
            SELECT t.*, c.name as category_name, c.slug as category_slug, c.icon_class
            FROM templates t
            JOIN categories c ON t.category_id = c.id
            WHERE t.slug = ? AND t.is_active = TRUE
        ";
        return $this->db->queryOne($sql, [$slug]);
    }
    
    /**
     * Получить элементы шаблона (материалы и работы)
     */
    public function getTemplateItems(int $templateId): array {
        $sql = "
            SELECT 
                ti.*,
                ti.item_type,
                m.name as material_name, m.unit as material_unit, m.current_price as material_price, m.slug as material_slug,
                w.name as work_name, w.unit as work_unit, w.current_price as work_price, w.slug as work_slug
            FROM template_items ti
            LEFT JOIN materials m ON ti.item_id = m.id AND ti.item_type = 'material'
            LEFT JOIN works w ON ti.item_id = w.id AND ti.item_type = 'work'
            WHERE ti.template_id = ?
            ORDER BY ti.sort_order
        ";
        return $this->db->query($sql, [$templateId]);
    }
    
    /**
     * Получить коэффициенты для шаблона
     */
    public function getTemplateCoefficients(int $templateId): array {
        $sql = "
            SELECT c.*, cv.value, cv.label, cv.multiplier, cv.fixed_amount, cv.is_default
            FROM coefficients c
            JOIN template_coefficients tc ON c.id = tc.coefficient_id
            JOIN coefficient_values cv ON c.id = cv.coefficient_id
            WHERE tc.template_id = ? AND c.is_active = TRUE
            ORDER BY c.sort_order, cv.sort_order
        ";
        return $this->db->query($sql, [$templateId]);
    }
    
    /**
     * Получить все значения коэффициентов, сгруппированные по коэффициентам
     */
    public function getCoefficientsWithOptions(int $templateId): array {
        $coefficients = $this->getTemplateCoefficients($templateId);
        
        $result = [];
        foreach ($coefficients as $coef) {
            $code = $coef['code'];
            
            if (!isset($result[$code])) {
                $result[$code] = [
                    'code' => $code,
                    'name' => $coef['name'],
                    'type' => $coef['type'],
                    'input_type' => $coef['input_type'],
                    'applies_to' => $coef['applies_to'],
                    'is_percentage' => (bool) $coef['is_percentage'],
                    'is_fixed_amount' => (bool) $coef['is_fixed_amount'],
                    'options' => []
                ];
            }
            
            $result[$code]['options'][] = [
                'value' => $coef['value'],
                'label' => $coef['label'],
                'multiplier' => (float) $coef['multiplier'],
                'fixed_amount' => (float) $coef['fixed_amount'],
                'is_default' => (bool) $coef['is_default']
            ];
        }
        
        return $result;
    }
    
    /**
     * Рассчитать смету
     * @param int $templateId ID шаблона
     * @param float $baseValue Базовое значение (количество мест, площадь, и т.д.)
     * @param array $coefficients Массив выбранных коэффициентов [code => value]
     * @param bool $includeElectrical Добавить электромонтаж
     * @return array Результат расчета
     */
    public function calculate(
        int $templateId,
        float $baseValue,
        array $coefficients = [],
        bool $includeElectrical = false
    ): array {
        $template = $this->getTemplateById($templateId);
        if (!$template) {
            throw new Exception("Шаблон не найден");
        }
        
        $items = $this->getTemplateItems($templateId);
        $templateCoefficients = $this->getCoefficientsWithOptions($templateId);
        
        $materials = [];
        $works = [];
        $totalMaterials = 0;
        $totalWorks = 0;
        
        // Применяем коэффициенты
        $workMultiplier = 1.0;
        $materialMultiplier = 1.0;
        $fixedAmount = 0;
        
        foreach ($coefficients as $code => $value) {
            if (isset($templateCoefficients[$code])) {
                foreach ($templateCoefficients[$code]['options'] as $option) {
                    if ($option['value'] === $value) {
                        if ($templateCoefficients[$code]['applies_to'] === 'works' || 
                            $templateCoefficients[$code]['applies_to'] === 'all') {
                            $workMultiplier *= (float) $option['multiplier'];
                            if ($templateCoefficients[$code]['is_fixed_amount']) {
                                $fixedAmount += (float) $option['fixed_amount'];
                            }
                        }
                        if ($templateCoefficients[$code]['applies_to'] === 'materials' || 
                            $templateCoefficients[$code]['applies_to'] === 'all') {
                            $materialMultiplier *= (float) $option['multiplier'];
                        }
                        break;
                    }
                }
            }
        }
        
        // Объемная скидка на материалы
        $baseValueDefault = (float) $template['base_value_default'];
        $materialDiscount = 0;
        if ($baseValue > $baseValueDefault * 1.5) {
            if ($baseValue >= $baseValueDefault * 2) {
                $materialDiscount = 0.10; // 10% скидка при превышении 100%
            } else {
                $materialDiscount = 0.05; // 5% скидка при превышении 50-99%
            }
        }
        
        // Обрабатываем элементы шаблона
        foreach ($items as $item) {
            $isElectrical = (bool) $item['is_electrical'];
            
            // Пропускаем электромонтаж, если не включен
            if ($isElectrical && !$includeElectrical) {
                continue;
            }
            
            $quantity = (float) $item['quantity_per_unit'];
            
            // Если не фиксированное значение, умножаем на базовый параметр
            if (!$item['is_fixed']) {
                $quantity *= $baseValue;
            }
            
            if ($item['item_type'] === 'material' && $item['material_price']) {
                $price = (float) $item['material_price'];
                $sum = $quantity * $price;
                
                // Применяем скидку на материалы
                if (!$item['is_fixed']) {
                    $sum *= (1 - $materialDiscount);
                }
                
                $materials[] = [
                    'name' => $item['material_name'],
                    'unit' => $item['material_unit'],
                    'quantity' => round($quantity, 2),
                    'price' => $price,
                    'sum' => round($sum, 2),
                    'is_electrical' => $isElectrical
                ];
                $totalMaterials += $sum;
                
            } elseif ($item['item_type'] === 'work' && $item['work_price']) {
                $price = (float) $item['work_price'];
                $sum = $quantity * $price * $workMultiplier;
                
                $works[] = [
                    'name' => $item['work_name'],
                    'unit' => $item['work_unit'],
                    'quantity' => round($quantity, 2),
                    'price' => round($price * $workMultiplier, 2),
                    'sum' => round($sum, 2),
                    'is_electrical' => $isElectrical
                ];
                $totalWorks += $sum;
            }
        }
        
        // Добавляем фиксированную надбавку (территория)
        $fixedAmountTotal = $fixedAmount;
        
        // Итоговая сумма
        $totalAmount = $totalMaterials + $totalWorks + $fixedAmountTotal;
        
        // Применяем скидку на материалы к итогу
        $materialsDiscountAmount = 0;
        if ($materialDiscount > 0 && $totalMaterials > 0) {
            // already applied to individual items
        }
        
        return [
            'template' => $template,
            'base_value' => $baseValue,
            'base_param_name' => $template['base_param_name'],
            'base_param_unit' => $template['base_param_unit'],
            'coefficients' => $coefficients,
            'coefficients_info' => $templateCoefficients,
            'materials' => $materials,
            'works' => $works,
            'total_materials' => round($totalMaterials, 2),
            'total_works' => round($totalWorks, 2),
            'fixed_amount' => round($fixedAmountTotal, 2),
            'material_discount' => $materialDiscount * 100,
            'work_multiplier' => round($workMultiplier, 4),
            'total_amount' => round($totalAmount, 2),
            'calculated_at' => date('Y-m-d H:i:s')
        ];
    }
    
    /**
     * Сохранить расчет в лог
     */
    public function logCalculation(array $calculationResult): int {
        $sql = "
            INSERT INTO calculation_logs 
            (template_id, base_value, coefficients_json, total_materials, total_works, total_amount, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";
        
        return $this->db->execute($sql, [
            $calculationResult['template']['id'],
            $calculationResult['base_value'],
            json_encode($calculationResult['coefficients'], JSON_UNESCAPED_UNICODE),
            $calculationResult['total_materials'],
            $calculationResult['total_works'],
            $calculationResult['total_amount'],
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }
    
    /**
     * Получить дополнительные работы (модульные добавки)
     */
    public function getAdditionalWorks(): array {
        $sql = "
            SELECT 
                ti.*,
                w.name as work_name, w.unit as work_unit, w.current_price as work_price, w.slug as work_slug
            FROM template_items ti
            JOIN works w ON ti.item_id = w.id
            WHERE ti.template_id = (
                SELECT id FROM templates WHERE slug = 'electro-additional'
            )
            ORDER BY ti.sort_order
        ";
        return $this->db->query($sql);
    }
}
