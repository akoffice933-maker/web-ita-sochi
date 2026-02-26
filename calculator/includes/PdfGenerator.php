<?php
/**
 * Генератор PDF для смет
 * Использует Dompdf для создания PDF документов
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/CalculatorModel.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class PdfGenerator {
    private $db;
    private $dompdf;
    
    public function __construct() {
        $this->db = Database::getInstance();
        
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('defaultPaperSize', 'A4');
        $options->set('defaultPaperOrientation', 'portrait');
        
        $this->dompdf = new Dompdf($options);
    }
    
    /**
     * Сгенерировать PDF из данных расчета
     */
    public function generate(array $calculationData): string {
        $html = $this->buildHtml($calculationData);
        
        $this->dompdf->loadHtml($html);
        $this->dompdf->render();
        
        return $this->dompdf->output();
    }
    
    /**
     * Построить HTML для PDF
     */
    private function buildHtml(array $data): string {
        $template = $data['template'];
        $materials = $data['materials'];
        $works = $data['works'];
        
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @page {
                    margin: 20mm;
                }
                body {
                    font-family: DejaVu Sans, sans-serif;
                    font-size: 11pt;
                    line-height: 1.4;
                    color: #333;
                }
                .header {
                    border-bottom: 2px solid #0066cc;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .logo-section {
                    display: table;
                    width: 100%;
                }
                .logo-section > div {
                    display: table-cell;
                    vertical-align: middle;
                }
                .logo-text {
                    font-size: 24pt;
                    font-weight: bold;
                    color: #003087;
                }
                .logo-subtext {
                    font-size: 10pt;
                    color: #666;
                }
                .company-info {
                    text-align: right;
                    font-size: 9pt;
                    color: #666;
                }
                .title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: #003087;
                    margin: 20px 0 10px 0;
                }
                .info-block {
                    background-color: #f0f7ff;
                    border: 1px solid #0066cc;
                    border-radius: 5px;
                    padding: 12px;
                    margin-bottom: 15px;
                }
                .info-row {
                    margin: 5px 0;
                }
                .info-label {
                    font-weight: bold;
                    color: #003087;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 9pt;
                }
                th {
                    background-color: #0066cc;
                    color: white;
                    padding: 8px 5px;
                    text-align: left;
                    font-weight: bold;
                }
                td {
                    padding: 6px 5px;
                    border-bottom: 1px solid #ddd;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .text-right {
                    text-align: right;
                }
                .text-center {
                    text-align: center;
                }
                .total-block {
                    background: linear-gradient(135deg, #0066cc 0%, #003087 100%);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                    text-align: center;
                }
                .total-amount {
                    font-size: 28pt;
                    font-weight: bold;
                }
                .total-breakdown {
                    font-size: 10pt;
                    opacity: 0.9;
                    margin-top: 8px;
                }
                .section-title {
                    font-size: 12pt;
                    font-weight: bold;
                    color: #003087;
                    margin: 20px 0 10px 0;
                    border-bottom: 1px solid #0066cc;
                    padding-bottom: 5px;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 1px solid #ddd;
                    font-size: 8pt;
                    color: #666;
                    text-align: center;
                }
                .disclaimer {
                    background-color: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 5px;
                    padding: 10px;
                    margin-top: 15px;
                    font-size: 9pt;
                    color: #856404;
                }
                .badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background-color: #0066cc;
                    color: white;
                    border-radius: 3px;
                    font-size: 8pt;
                }
                .electrical-item {
                    background-color: #fff8e6 !important;
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="header">
                <div class="logo-section">
                    <div>
                        <div class="logo-text">ИТА Сочи</div>
                        <div class="logo-subtext">Системный интегратор</div>
                    </div>
                    <div class="company-info">
                        ' . COMPANY_ADDRESS . '<br>
                        Тел.: ' . COMPANY_PHONE . '<br>
                        Email: ' . COMPANY_EMAIL . '
                    </div>
                </div>
            </div>
            
            <!-- Title -->
            <div class="title">Смета № ' . date('Ymd-His') . '</div>
            <div style="color: #666; margin-bottom: 15px;">Дата составления: ' . date('d.m.Y H:i') . '</div>
            
            <!-- Info Block -->
            <div class="info-block">
                <div class="info-row">
                    <span class="info-label">Шаблон:</span> ' . htmlspecialchars($template['name']) . '
                </div>
                <div class="info-row">
                    <span class="info-label">Категория:</span> ' . htmlspecialchars($template['category_name']) . '
                </div>
                <div class="info-row">
                    <span class="info-label">Параметр:</span> ' . 
                    round($data['base_value'], 2) . ' ' . htmlspecialchars($template['base_param_unit']) . ' 
                    (' . htmlspecialchars($template['base_param_name']) . ')
                </div>';
        
        // Коэффициенты
        if (!empty($data['coefficients'])) {
            $html .= '<div class="info-row"><span class="info-label">Коэффициенты:</span> ';
            $coefList = [];
            foreach ($data['coefficients_info'] ?? [] as $code => $coef) {
                if (isset($data['coefficients'][$code])) {
                    $selectedOption = null;
                    foreach ($coef['options'] as $opt) {
                        if ($opt['value'] === $data['coefficients'][$code]) {
                            $selectedOption = $opt['label'];
                            break;
                        }
                    }
                    if ($selectedOption) {
                        $coefList[] = $coef['name'] . ': ' . $selectedOption;
                    }
                }
            }
            $html .= implode(', ', $coefList);
            $html .= '</div>';
        }
        
        if ($data['material_discount'] > 0) {
            $html .= '<div class="info-row"><span class="info-label">Скидка на материалы:</span> ' . $data['material_discount'] . '%</div>';
        }
        
        $html .= '
            </div>
            
            <!-- Materials Table -->
            <div class="section-title">
                <i class="fa-solid fa-box"></i> Материалы
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 45%;">Наименование</th>
                        <th class="text-center" style="width: 12%;">Кол-во</th>
                        <th class="text-center" style="width: 13%;">Ед. изм.</th>
                        <th class="text-right" style="width: 13%;">Цена (₽)</th>
                        <th class="text-right" style="width: 17%;">Сумма (₽)</th>
                    </tr>
                </thead>
                <tbody>';
        
        if (empty($materials)) {
            $html .= '<tr><td colspan="5" class="text-center">Нет материалов</td></tr>';
        } else {
            foreach ($materials as $mat) {
                $electricalClass = $mat['is_electrical'] ? ' class="electrical-item"' : '';
                $html .= '
                    <tr' . $electricalClass . '>
                        <td>' . htmlspecialchars($mat['name']) . '</td>
                        <td class="text-center">' . number_format($mat['quantity'], 2, '.', ' ') . '</td>
                        <td class="text-center">' . htmlspecialchars($mat['unit']) . '</td>
                        <td class="text-right">' . number_format($mat['price'], 2, '.', ' ') . '</td>
                        <td class="text-right"><strong>' . number_format($mat['sum'], 2, '.', ' ') . '</strong></td>
                    </tr>';
            }
        }
        
        $html .= '
                </tbody>
            </table>
            
            <!-- Works Table -->
            <div class="section-title">
                <i class="fa-solid fa-tools"></i> Работы
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 45%;">Наименование</th>
                        <th class="text-center" style="width: 12%;">Кол-во</th>
                        <th class="text-center" style="width: 13%;">Ед. изм.</th>
                        <th class="text-right" style="width: 13%;">Цена (₽)</th>
                        <th class="text-right" style="width: 17%;">Сумма (₽)</th>
                    </tr>
                </thead>
                <tbody>';
        
        if (empty($works)) {
            $html .= '<tr><td colspan="5" class="text-center">Нет работ</td></tr>';
        } else {
            foreach ($works as $work) {
                $electricalClass = $work['is_electrical'] ? ' class="electrical-item"' : '';
                $html .= '
                    <tr' . $electricalClass . '>
                        <td>' . htmlspecialchars($work['name']) . '</td>
                        <td class="text-center">' . number_format($work['quantity'], 2, '.', ' ') . '</td>
                        <td class="text-center">' . htmlspecialchars($work['unit']) . '</td>
                        <td class="text-right">' . number_format($work['price'], 2, '.', ' ') . '</td>
                        <td class="text-right"><strong>' . number_format($work['sum'], 2, '.', ' ') . '</strong></td>
                    </tr>';
            }
        }
        
        $html .= '
                </tbody>
            </table>
            
            <!-- Total -->
            <div class="total-block">
                <div>ИТОГОВАЯ СТОИМОСТЬ:</div>
                <div class="total-amount">' . number_format($data['total_amount'], 2, '.', ' ') . ' ₽</div>
                <div class="total-breakdown">
                    Материалы: ' . number_format($data['total_materials'], 2, '.', ' ') . ' ₽ | 
                    Работы: ' . number_format($data['total_works'], 2, '.', ' ') . ' ₽' .
                    ($data['fixed_amount'] > 0 ? ' | Наценка: ' . number_format($data['fixed_amount'], 2, '.', ' ') . ' ₽' : '') . '
                </div>
            </div>
            
            <!-- Disclaimer -->
            <div class="disclaimer">
                <strong>Обратите внимание:</strong> Данная смета является предварительной и не является публичной офертой. 
                Цены указаны ориентировочно и могут быть изменены. Для получения точного расчета свяжитесь с нашими специалистами.
                Срок действия сметы: 14 календарных дней.
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div>© 2011–' . date('Y') . ' ИТА Сочи. Все права защищены.</div>
                <div>Смета сгенерирована автоматически ' . date('d.m.Y в H:i') . '</div>
            </div>
        </body>
        </html>';
        
        return $html;
    }
}
