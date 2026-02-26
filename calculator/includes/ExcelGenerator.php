<?php
/**
 * Генератор Excel для смет
 * Использует PhpSpreadsheet для создания XLSX документов
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/CalculatorModel.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class ExcelGenerator {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Сгенерировать Excel из данных расчета
     */
    public function generate(array $calculationData): string {
        $spreadsheet = new Spreadsheet();
        
        // Удаляем лист по умолчанию и создаем нужные
        $spreadsheet->removeSheetByIndex(0);
        
        // Лист 1: Смета
        $this->createEstimateSheet($spreadsheet, $calculationData);
        
        // Лист 2: Исходные данные
        $this->createDataSourceSheet($spreadsheet, $calculationData);
        
        // Активный лист - Смета
        $spreadsheet->setActiveSheetIndex(0);
        
        // Сохраняем в строку
        $writer = new Xlsx($spreadsheet);
        
        // Временный файл
        $tempFile = tempnam(sys_get_temp_dir(), 'smeta_') . '.xlsx';
        $writer->save($tempFile);
        $content = file_get_contents($tempFile);
        unlink($tempFile);
        
        return $content;
    }
    
    /**
     * Создать лист со сметой
     */
    private function createEstimateSheet(Spreadsheet $spreadsheet, array $data): void {
        $sheet = $spreadsheet->createSheet(0);
        $sheet->setTitle('Смета');
        
        $template = $data['template'];
        $currentRow = 1;
        
        // Стили
        $headerFontStyle = new Font([
            'bold' => true,
            'color' => ['rgb' => 'FFFFFF'],
            'size' => 11
        ]);
        
        $headerFillStyle = new Fill(
            Fill::FILL_SOLID,
            ['startColor' => ['rgb' => '0066CC']]
        );
        
        $titleFontStyle = new Font([
            'bold' => true,
            'color' => ['rgb' => '003087'],
            'size' => 16
        ]);
        
        $totalFontStyle = new Font([
            'bold' => true,
            'size' => 14
        ]);
        
        $borderStyle = [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'CCCCCC']
            ]
        ];
        
        // Заголовок компании
        $sheet->mergeCells('A1:E1');
        $sheet->setCellValue('A1', 'ИТА Сочи - Системный интегратор');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        $sheet->mergeCells('A2:E2');
        $sheet->setCellValue('A2', COMPANY_ADDRESS . ' | Тел.: ' . COMPANY_PHONE . ' | Email: ' . COMPANY_EMAIL);
        $sheet->getStyle('A2')->getFont()->setSize(9);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        $currentRow = 4;
        
        // Название сметы
        $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 'Смета № ' . date('Ymd-His'));
        $sheet->getStyle('A' . $currentRow)->applyFromArray(['font' => $titleFontStyle]);
        
        $currentRow += 2;
        
        // Информация о шаблоне
        $sheet->setCellValue('A' . $currentRow, 'Шаблон:');
        $sheet->setCellValue('B' . $currentRow, $template['name']);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Категория:');
        $sheet->setCellValue('B' . $currentRow, $template['category_name']);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Параметр:');
        $sheet->setCellValue('B' . $currentRow, 
            round($data['base_value'], 2) . ' ' . $template['base_param_unit'] . 
            ' (' . $template['base_param_name'] . ')'
        );
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $currentRow++;
        
        // Коэффициенты
        if (!empty($data['coefficients'])) {
            $coefText = [];
            foreach ($data['coefficients_info'] ?? [] as $code => $coef) {
                if (isset($data['coefficients'][$code])) {
                    foreach ($coef['options'] as $opt) {
                        if ($opt['value'] === $data['coefficients'][$code]) {
                            $coefText[] = $coef['name'] . ': ' . $opt['label'];
                            break;
                        }
                    }
                }
            }
            if (!empty($coefText)) {
                $sheet->setCellValue('A' . $currentRow, 'Коэффициенты:');
                $sheet->setCellValue('B' . $currentRow, implode(', ', $coefText));
                $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
                $currentRow++;
            }
        }
        
        $currentRow += 1;
        
        // Материалы
        $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 'МАТЕРИАЛЫ');
        $sheet->getStyle('A' . $currentRow)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '003087'], 'size' => 12],
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '0066CC']]]
        ]);
        $currentRow++;
        
        // Заголовки таблицы материалов
        $headers = ['Наименование', 'Кол-во', 'Ед. изм.', 'Цена (₽)', 'Сумма (₽)'];
        $colLetters = ['A', 'B', 'C', 'D', 'E'];
        
        foreach ($headers as $i => $header) {
            $sheet->setCellValue($colLetters[$i] . $currentRow, $header);
        }
        
        $sheet->getStyle('A' . $currentRow . ':E' . $currentRow)->applyFromArray([
            'font' => $headerFontStyle,
            'fill' => $headerFillStyle,
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        $currentRow++;
        
        // Данные материалов
        if (empty($data['materials'])) {
            $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
            $sheet->setCellValue('A' . $currentRow, 'Нет материалов');
            $sheet->getStyle('A' . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $currentRow++;
        } else {
            foreach ($data['materials'] as $mat) {
                $sheet->setCellValue('A' . $currentRow, $mat['name']);
                $sheet->setCellValue('B' . $currentRow, round($mat['quantity'], 2));
                $sheet->setCellValue('C' . $currentRow, $mat['unit']);
                $sheet->setCellValue('D' . $currentRow, round($mat['price'], 2));
                $sheet->setCellValue('E' . $currentRow, round($mat['sum'], 2));
                
                if ($mat['is_electrical']) {
                    $sheet->getStyle('A' . $currentRow . ':E' . $currentRow)->applyFromArray([
                        'fill' => new Fill(Fill::FILL_SOLID, ['startColor' => ['rgb' => 'FFF8E6']])
                    ]);
                }
                
                $currentRow++;
            }
        }
        
        $currentRow += 1;
        
        // Работы
        $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 'РАБОТЫ');
        $sheet->getStyle('A' . $currentRow)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '003087'], 'size' => 12],
            'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '0066CC']]]
        ]);
        $currentRow++;
        
        // Заголовки таблицы работ
        foreach ($headers as $i => $header) {
            $sheet->setCellValue($colLetters[$i] . $currentRow, $header);
        }
        
        $sheet->getStyle('A' . $currentRow . ':E' . $currentRow)->applyFromArray([
            'font' => $headerFontStyle,
            'fill' => $headerFillStyle,
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);
        $currentRow++;
        
        // Данные работ
        if (empty($data['works'])) {
            $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
            $sheet->setCellValue('A' . $currentRow, 'Нет работ');
            $sheet->getStyle('A' . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $currentRow++;
        } else {
            foreach ($data['works'] as $work) {
                $sheet->setCellValue('A' . $currentRow, $work['name']);
                $sheet->setCellValue('B' . $currentRow, round($work['quantity'], 2));
                $sheet->setCellValue('C' . $currentRow, $work['unit']);
                $sheet->setCellValue('D' . $currentRow, round($work['price'], 2));
                $sheet->setCellValue('E' . $currentRow, round($work['sum'], 2));
                
                if ($work['is_electrical']) {
                    $sheet->getStyle('A' . $currentRow . ':E' . $currentRow)->applyFromArray([
                        'fill' => new Fill(Fill::FILL_SOLID, ['startColor' => ['rgb' => 'FFF8E6']])
                    ]);
                }
                
                $currentRow++;
            }
        }
        
        $currentRow += 2;
        
        // Итого
        $sheet->mergeCells('A' . $currentRow . ':D' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 'ИТОГОВАЯ СТОИМОСТЬ:');
        $sheet->getStyle('A' . $currentRow . ':D' . $currentRow)->applyFromArray([
            'font' => $totalFontStyle,
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
        ]);
        
        $sheet->setCellValue('E' . $currentRow, round($data['total_amount'], 2));
        $sheet->getStyle('E' . $currentRow)->applyFromArray([
            'font' => $totalFontStyle,
            'fill' => new Fill(Fill::FILL_SOLID, ['startColor' => ['rgb' => '0066CC']]),
            'font' => ['color' => ['rgb' => 'FFFFFF'], 'bold' => true, 'size' => 14]
        ]);
        $currentRow++;
        
        // Детализация
        $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 
            'Материалы: ' . number_format($data['total_materials'], 2, '.', ' ') . ' ₽ | ' .
            'Работы: ' . number_format($data['total_works'], 2, '.', ' ') . ' ₽' .
            ($data['fixed_amount'] > 0 ? ' | Наценка: ' . number_format($data['fixed_amount'], 2, '.', ' ') . ' ₽' : '')
        );
        $sheet->getStyle('A' . $currentRow)->getFont()->setSize(10);
        $sheet->getStyle('A' . $currentRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $currentRow++;
        
        // Дисклеймер
        $currentRow += 2;
        $sheet->mergeCells('A' . $currentRow . ':E' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 
            '* Данная смета является предварительной и не является публичной офертой. ' .
            'Цены указаны ориентировочно и могут быть изменены. Срок действия сметы: 14 календарных дней.'
        );
        $sheet->getStyle('A' . $currentRow)->applyFromArray([
            'font' => ['size' => 9, 'color' => ['rgb' => '666666'], 'italic' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'wrap' => true]
        ]);
        
        // Авто-ширина колонок
        $sheet->getColumnDimension('A')->setWidth(40);
        $sheet->getColumnDimension('B')->setWidth(12);
        $sheet->getColumnDimension('C')->setWidth(10);
        $sheet->getColumnDimension('D')->setWidth(12);
        $sheet->getColumnDimension('E')->setWidth(14);
    }
    
    /**
     * Создать лист с исходными данными
     */
    private function createDataSourceSheet(Spreadsheet $spreadsheet, array $data): void {
        $sheet = $spreadsheet->createSheet(1);
        $sheet->setTitle('Исходные данные');
        
        $template = $data['template'];
        $currentRow = 1;
        
        // Заголовок
        $sheet->mergeCells('A1:B1');
        $sheet->setCellValue('A1', 'ИСХОДНЫЕ ДАННЫЕ РАСЧЕТА');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        $currentRow = 3;
        
        $sheet->setCellValue('A' . $currentRow, 'Параметр расчета:');
        $sheet->setCellValue('B' . $currentRow, $template['base_param_name']);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Значение:');
        $sheet->setCellValue('B' . $currentRow, $data['base_value'] . ' ' . $template['base_param_unit']);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Дата расчета:');
        $sheet->setCellValue('B' . $currentRow, $data['calculated_at']);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
        $currentRow++;
        
        if ($data['material_discount'] > 0) {
            $sheet->setCellValue('A' . $currentRow, 'Скидка на материалы:');
            $sheet->setCellValue('B' . $currentRow, $data['material_discount'] . '%');
            $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
            $currentRow++;
        }
        
        $currentRow += 1;
        
        // Коэффициенты
        $sheet->mergeCells('A' . $currentRow . ':B' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 'ПРИМЕНЕННЫЕ КОЭФФИЦИЕНТЫ');
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(12);
        $currentRow++;
        
        foreach ($data['coefficients_info'] ?? [] as $code => $coef) {
            if (isset($data['coefficients'][$code])) {
                foreach ($coef['options'] as $opt) {
                    if ($opt['value'] === $data['coefficients'][$code]) {
                        $sheet->setCellValue('A' . $currentRow, $coef['name'] . ':');
                        $sheet->setCellValue('B' . $currentRow, 
                            $opt['label'] . 
                            ($opt['multiplier'] != 1 ? ' (x' . $opt['multiplier'] . ')' : '') .
                            ($opt['fixed_amount'] > 0 ? ' (+' . $opt['fixed_amount'] . ' ₽)' : '')
                        );
                        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true);
                        $currentRow++;
                        break;
                    }
                }
            }
        }
        
        $currentRow += 2;
        
        // Информация о шаблоне
        $sheet->mergeCells('A' . $currentRow . ':B' . $currentRow);
        $sheet->setCellValue('A' . $currentRow, 'ИНФОРМАЦИЯ О ШАБЛОНЕ');
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(12);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'ID шаблона:');
        $sheet->setCellValue('B' . $currentRow, $template['id']);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Название:');
        $sheet->setCellValue('B' . $currentRow, $template['name']);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Описание:');
        $sheet->setCellValue('B' . $currentRow, $template['description'] ?? '');
        $sheet->getStyle('B' . $currentRow)->getAlignment()->setWrapText(true);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Категория:');
        $sheet->setCellValue('B' . $currentRow, $template['category_name']);
        $currentRow++;
        
        // Авто-ширина колонок
        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('B')->setWidth(45);
    }
}
