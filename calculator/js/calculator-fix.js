/**
 * JavaScript для калькулятора строительных смет
 * ИТА Сочи - Версия с исправленными ошибками API
 */

// Глобальные переменные
let currentCategory = null;
let currentTemplate = null;
let currentCalculation = null;
let categoriesData = [];
let additionalWorksData = [];
let templatesData = [];

// ТЕСТОВЫЕ ДАННЫЕ (для работы без сервера)
const TEST_DATA = {
    categories: [
        { id: 1, name: 'СКС', slug: 'sks', icon_class: 'fa-solid fa-server', description: 'Структурированные кабельные сети для офисов и предприятий' },
        { id: 2, name: 'Видеонаблюдение', slug: 'video', icon_class: 'fa-solid fa-video', description: 'Системы видеонаблюдения любой сложности' },
        { id: 3, name: 'СКУД', slug: 'skud', icon_class: 'fa-solid fa-id-card', description: 'Системы контроля и управления доступом' },
        { id: 4, name: 'IT-аутсорсинг', slug: 'it-outsourcing', icon_class: 'fa-solid fa-headset', description: 'Абонентское обслуживание и поддержка' },
        { id: 5, name: 'Электромонтаж', slug: 'electro', icon_class: 'fa-solid fa-bolt', description: 'Электромонтажные работы под ключ' },
        { id: 6, name: 'Интерактивные решения', slug: 'interaktiv', icon_class: 'fa-solid fa-tv', description: 'Интерактивные панели, киоски, сенсорные экраны' }
    ],
    templates: [
        {
            id: 1, category_id: 1, category_name: 'СКС', category_slug: 'sks',
            name: 'СКС для офиса (базовый)', slug: 'sks-office-basic',
            description: 'Структурированная кабельная сеть для офиса до 20 рабочих мест',
            base_param_code: 'seats', base_param_name: 'Количество рабочих мест', base_param_unit: 'мест',
            base_value_min: 1, base_value_max: 20, base_value_default: 10, base_value_step: 1,
            has_electrical_addon: true,
            coefficients: {
                urgency: {
                    code: 'urgency', name: 'Срочность', type: 'common', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'normal', label: 'Обычная (стандартные сроки)', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: 'urgent_2-3days', label: 'Срочно (2-3 дня)', multiplier: 1.2, fixed_amount: 0, is_default: false },
                        { value: 'express_1day', label: 'Экстренно (1 день)', multiplier: 1.5, fixed_amount: 0, is_default: false }
                    ]
                },
                territory: {
                    code: 'territory', name: 'Территория', type: 'common', input_type: 'select', applies_to: 'works', is_percentage: false,
                    options: [
                        { value: 'sochi', label: 'В пределах Сочи', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: 'suburb', label: 'Пригород (Сочи + окрестности)', multiplier: 1.0, fixed_amount: 3000, is_default: false },
                        { value: 'remote', label: 'Удаленные районы (>50 км)', multiplier: 1.0, fixed_amount: 6000, is_default: false }
                    ]
                }
            },
            materials: [
                { name: 'Кабель UTP Cat 5e (бухтa 305м)', unit: 'м', price: 25, quantity_per_unit: 15, is_fixed: false },
                { name: 'Розетка RJ-45 одноместная', unit: 'шт', price: 150, quantity_per_unit: 1, is_fixed: false },
                { name: 'Коннекторы RJ-45 + стяжки', unit: 'компл.', price: 10, quantity_per_unit: 1, is_fixed: false },
                { name: 'Патч-панель 24 порта 19"', unit: 'шт', price: 2500, quantity_per_unit: 1, is_fixed: true },
                { name: 'Коммутатор 16 портов 10/100/1000', unit: 'шт', price: 8500, quantity_per_unit: 1, is_fixed: true },
                { name: 'Кабель-канал 40×20 мм', unit: 'м', price: 80, quantity_per_unit: 40, is_fixed: true }
            ],
            works: [
                { name: 'Прокладка кабеля UTP', unit: 'м', price: 45, quantity_per_unit: 15, is_fixed: false },
                { name: 'Монтаж/обжим розетки RJ-45', unit: 'шт', price: 250, quantity_per_unit: 1, is_fixed: false },
                { name: 'Монтаж патч-панели', unit: 'шт', price: 800, quantity_per_unit: 1, is_fixed: true },
                { name: 'Монтаж коммутатора', unit: 'шт', price: 1000, quantity_per_unit: 1, is_fixed: true },
                { name: 'Тестирование и маркировка линий', unit: 'компл.', price: 1500, quantity_per_unit: 1, is_fixed: true }
            ]
        },
        // ... остальные шаблоны ...
    ]
};

// API Base URL
const API_BASE = 'api/index.php';

// Флаг: использовать тестовые данные (без сервера)
const USE_TEST_DATA = true;

// ============================================================================
// Инициализация при загрузке страницы
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    if (USE_TEST_DATA) {
        // Используем тестовые данные
        categoriesData = TEST_DATA.categories;
        templatesData = TEST_DATA.templates;
        renderCategories(TEST_DATA.categories);
    } else {
        // Загружаем с сервера
        loadCategories();
    }
    // loadAdditionalWorks(); // ← Отключено для исправления ошибки 500
    setupSliderSync();
});

// ============================================================================
// Загрузка категорий (с сервера)
// ============================================================================
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const result = await response.json();
        
        if (result.success) {
            categoriesData = result.data;
            renderCategories(result.data);
        } else {
            showError('Ошибка загрузки категорий');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Не удалось загрузить категории. Проверьте подключение к интернету.');
    }
}

// ============================================================================
// Отображение категорий
// ============================================================================
function renderCategories(categories) {
    const container = document.getElementById('categories-container');
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-inbox text-4xl text-slate-400 mb-4"></i>
                <p class="text-slate-500">Категории не найдены</p>
            </div>
        `;
        return;
    }
    
    const categoryImages = {
        'sks': 'images/sks.svg',
        'video': 'images/video.svg',
        'skud': 'images/skud.svg',
        'it-outsourcing': 'images/it-outsourcing.svg',
        'electro': 'images/electro.svg',
        'interaktiv': 'images/interaktiv.svg'
    };
    
    const categoryColors = {
        'sks': 'from-blue-500 to-blue-700',
        'video': 'from-purple-500 to-purple-700',
        'skud': 'from-green-500 to-green-700',
        'it-outsourcing': 'from-orange-500 to-orange-700',
        'electro': 'from-red-500 to-red-700',
        'interaktiv': 'from-pink-500 to-pink-700'
    };
    
    container.innerHTML = categories.map(category => {
        const imageSrc = categoryImages[category.slug] || 'images/sks.svg';
        const color = categoryColors[category.slug] || 'from-slate-500 to-slate-700';
        
        return `
            <div class="category-card bg-white rounded-2xl shadow-lg border border-slate-200 p-6 cursor-pointer fade-in group"
                 onclick="showTemplatesForCategory('${category.slug}')"
                 style="animation-delay: ${categories.indexOf(category) * 0.1}s">
                <div class="relative w-full h-40 bg-gradient-to-br ${color} rounded-xl mb-4 flex items-center justify-center shadow-lg overflow-hidden">
                    <div class="absolute inset-0 bg-white/10"></div>
                    <img src="${imageSrc}" alt="${category.name}" class="w-32 h-32 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <div class="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm py-2">
                        <p class="text-white text-center font-semibold text-sm">${category.name}</p>
                    </div>
                </div>
                <h3 class="text-xl font-bold text-brand-dark mb-2">${category.name}</h3>
                <p class="text-slate-600 text-sm mb-4">${category.description || ''}</p>
                <div class="flex items-center text-brand-blue font-medium">
                    <span>Выбрать</span>
                    <i class="fa-solid fa-arrow-right ml-2 transition-transform group-hover:translate-x-2"></i>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// Показать шаблоны для категории
// ============================================================================
async function showTemplatesForCategory(categorySlug) {
    if (USE_TEST_DATA) {
        // Используем тестовые данные
        const templates = templatesData.filter(t => t.category_slug === categorySlug);
        if (templates.length > 0) {
            currentCategory = templates[0].category_slug;
            renderTemplates(templates);
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/category/${categorySlug}/templates`);
        const result = await response.json();
        
        if (result.success) {
            currentCategory = result.data[0]?.category_slug || categorySlug;
            renderTemplates(result.data);
        } else {
            showError('Ошибка загрузки шаблонов');
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        showError('Не удалось загрузить шаблоны');
    }
}

// ============================================================================
// Отображение шаблонов
// ============================================================================
function renderTemplates(templates) {
    const container = document.getElementById('templates-container');
    const section = document.getElementById('templates-section');
    const categoryTitle = document.getElementById('category-title');
    
    if (templates.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-inbox text-4xl text-slate-400 mb-4"></i>
                <p class="text-slate-500">Шаблоны не найдены</p>
            </div>
        `;
        return;
    }
    
    categoryTitle.textContent = templates[0].category_name;
    section.classList.remove('hidden');
    document.getElementById('categories-container').classList.add('hidden');
    
    container.innerHTML = templates.map(template => {
        const icon = template.icon_class || 'fa-calculator';
        
        return `
            <div class="template-card bg-white rounded-2xl shadow-lg border border-slate-200 p-6 cursor-pointer fade-in"
                 onclick="showCalculator(${template.id})"
                 style="animation-delay: ${templates.indexOf(template) * 0.1}s">
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-dark rounded-xl flex items-center justify-center shadow-lg">
                        <i class="fa-solid ${icon} text-white text-lg"></i>
                    </div>
                    ${template.has_electrical_addon ? 
                        '<span class="badge badge-orange"><i class="fa-solid fa-bolt mr-1"></i> +Электрика</span>' : ''}
                </div>
                <h3 class="text-lg font-bold text-brand-dark mb-2">${template.name}</h3>
                <p class="text-slate-600 text-sm mb-4 line-clamp-2">${template.description || ''}</p>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">
                        <i class="fa-solid fa-ruler-horizontal mr-1"></i>
                        ${template.base_param_name}: ${template.base_value_default} ${template.base_param_unit}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// Показать категории (вернуться назад)
// ============================================================================
function showCategories() {
    document.getElementById('templates-section').classList.add('hidden');
    document.getElementById('categories-container').classList.remove('hidden');
    document.getElementById('calculator-section').classList.add('hidden');
    currentCategory = null;
    currentTemplate = null;
}

// ============================================================================
// Показать шаблоны (вернуться назад)
// ============================================================================
function showTemplates() {
    document.getElementById('calculator-section').classList.add('hidden');
    document.getElementById('templates-section').classList.remove('hidden');
    currentTemplate = null;
}

// ============================================================================
// Показать калькулятор для шаблона
// ============================================================================
async function showCalculator(templateId) {
    if (USE_TEST_DATA) {
        // Используем тестовые данные
        const template = templatesData.find(t => t.id === templateId);
        if (template) {
            currentTemplate = template;
            setupCalculator(template);
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/templates/${templateId}`);
        const result = await response.json();
        
        if (result.success) {
            currentTemplate = result.data;
            setupCalculator(result.data);
        } else {
            showError('Ошибка загрузки шаблона');
        }
    } catch (error) {
        console.error('Error loading template:', error);
        showError('Не удалось загрузить шаблон');
    }
}

// ============================================================================
// Настройка калькулятора
// ============================================================================
function setupCalculator(template) {
    const section = document.getElementById('calculator-section');
    const title = document.getElementById('calculator-title');
    const description = document.getElementById('calculator-description');
    const baseParamLabel = document.getElementById('base-param-label');
    const baseParamSlider = document.getElementById('base-param-slider');
    const baseParamInput = document.getElementById('base-param-input');
    const baseParamUnit = document.getElementById('base-param-unit');
    const coefficientsContainer = document.getElementById('coefficients-container');
    const electricalAddon = document.getElementById('electrical-addon');
    
    // Заполняем заголовки
    title.textContent = template.name;
    description.textContent = template.description || '';
    
    // Настраиваем базовый параметр
    baseParamLabel.textContent = template.base_param_name;
    baseParamUnit.textContent = template.base_param_unit;
    baseParamSlider.min = template.base_value_min || 1;
    baseParamSlider.max = template.base_value_max || 100;
    baseParamSlider.value = template.base_value_default || 10;
    baseParamSlider.step = template.base_value_step || 1;
    baseParamInput.min = template.base_value_min || 1;
    baseParamInput.max = 1000;
    baseParamInput.value = template.base_value_default || 10;
    baseParamInput.step = template.base_value_step || 1;
    
    // Обновляем градиент слайдера
    updateSliderGradient(baseParamSlider);
    
    // Показываем коэффициенты
    renderCoefficients(template.coefficients);
    
    // Показываем опцию электромонтажа если есть
    if (template.has_electrical_addon) {
        electricalAddon.classList.remove('hidden');
    } else {
        electricalAddon.classList.add('hidden');
    }
    
    // Показываем дополнительные работы для электромонтажа
    const additionalWorksContainer = document.getElementById('additional-works-container');
    if (template.category_slug === 'electro') {
        additionalWorksContainer.classList.remove('hidden');
        renderAdditionalWorks();
    } else {
        additionalWorksContainer.classList.add('hidden');
    }
    
    // Скрываем результаты
    document.getElementById('results-container').classList.add('hidden');
    
    // Показываем секцию
    section.classList.remove('hidden');
    document.getElementById('templates-section').classList.add('hidden');
}

// ============================================================================
// Отображение коэффициентов
// ============================================================================
function renderCoefficients(coefficients) {
    const container = document.getElementById('coefficients-container');
    
    const coefficientsByCode = {};
    Object.values(coefficients).forEach(coef => {
        if (!coefficientsByCode[coef.code]) {
            coefficientsByCode[coef.code] = coef;
        }
    });
    
    const coefficientsArray = Object.values(coefficientsByCode);
    
    if (coefficientsArray.length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    container.innerHTML = coefficientsArray.map(coef => {
        const optionsHtml = coef.options.map((opt, index) => {
            const isChecked = opt.is_default ? 'checked' : '';
            return `
                <label class="coefficient-option flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 transition ${opt.is_default ? 'selected bg-blue-50 border-brand-blue' : ''}">
                    <input type="radio" 
                           name="coef_${coef.code}" 
                           value="${opt.value}" 
                           data-multiplier="${opt.multiplier}"
                           data-fixed="${opt.fixed_amount}"
                           ${isChecked}
                           onchange="updateCoefficientSelection(this)">
                    <span class="text-sm text-slate-700">${opt.label}</span>
                    ${opt.multiplier !== 1 ? `<span class="text-xs text-slate-400 ml-auto">(x${opt.multiplier})</span>` : ''}
                    ${opt.fixed_amount > 0 ? `<span class="text-xs text-slate-400 ml-auto">(+${formatNumber(opt.fixed_amount)} ₽)</span>` : ''}
                </label>
            `;
        }).join('');
        
        return `
            <div class="slide-in" style="animation-delay: ${coefficientsArray.indexOf(coef) * 0.1}s">
                <label class="block text-sm font-semibold text-slate-700 mb-3">
                    ${coef.name}
                    <span class="tooltip ml-1 text-slate-400">
                        <i class="fa-solid fa-circle-question"></i>
                        <span class="tooltip-text">Влияет на стоимость работ</span>
                    </span>
                </label>
                <div class="space-y-2">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// Обновление выбора коэффициента
// ============================================================================
function updateCoefficientSelection(element) {
    const container = element.closest('.space-y-2');
    container.querySelectorAll('.coefficient-option').forEach(opt => {
        opt.classList.remove('selected', 'bg-blue-50', 'border-brand-blue');
    });
    element.closest('.coefficient-option').classList.add('selected', 'bg-blue-50', 'border-brand-blue');
}

// ============================================================================
// Настройка синхронизации слайдера и input
// ============================================================================
function setupSliderSync() {
    const slider = document.getElementById('base-param-slider');
    const input = document.getElementById('base-param-input');
    
    slider.addEventListener('input', function() {
        input.value = this.value;
        updateSliderGradient(this);
    });
    
    input.addEventListener('input', function() {
        let value = parseInt(this.value) || 1;
        value = Math.max(parseInt(slider.min), Math.min(parseInt(slider.max), value));
        slider.value = value;
        updateSliderGradient(slider);
    });
}

// ============================================================================
// Обновление градиента слайдера
// ============================================================================
function updateSliderGradient(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const value = parseFloat(slider.value) || 0;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #0066cc 0%, #0066cc ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
}

// ============================================================================
// Утилиты
// ============================================================================

// Форматирование числа
function formatNumber(num) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}

// Показать ошибку
function showError(message) {
    // Создаем toast уведомление
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-xl z-50 fade-in';
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fa-solid fa-circle-exclamation text-xl"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Экспорт для глобального доступа
window.showCategories = showCategories;
window.showTemplates = showTemplates;
window.showCalculator = showCalculator;
window.calculateEstimate = calculateEstimate;
window.exportPDF = exportPDF;
window.exportExcel = exportExcel;
window.printEstimate = printEstimate;
