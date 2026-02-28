/**
 * JavaScript для калькулятора строительных смет
 * ИТА Сочи - Полная версия с исправленными ошибками
 */

// Глобальные переменные
let currentCategory = null;
let currentTemplate = null;
let currentCalculation = null;
let categoriesData = [];
let additionalWorksData = [];
let templatesData = [];

// ТЕСТОВЫЕ ДАННЫЕ (для работы без сервера)
const USE_TEST_DATA = true;

// API Base URL
const API_BASE = 'api/index.php';

// ============================================================================
// Инициализация
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    if (USE_TEST_DATA) {
        categoriesData = TEST_DATA.categories;
        templatesData = TEST_DATA.templates;
        renderCategories(TEST_DATA.categories);
    } else {
        loadCategories();
    }
    setupSliderSync();
});

// ============================================================================
// Загрузка категорий
// ============================================================================
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const result = await response.json();
        
        if (result.success) {
            categoriesData = result.data;
            renderCategories(result.data);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ============================================================================
// Отображение категорий
// ============================================================================
function renderCategories(categories) {
    const container = document.getElementById('categories-container');
    
    if (!categories || categories.length === 0) {
        container.innerHTML = '<div class="text-center py-12"><p class="text-slate-500">Категории не найдены</p></div>';
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
            renderTemplates(result.data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================================================
// Отображение шаблонов
// ============================================================================
function renderTemplates(templates) {
    const container = document.getElementById('templates-container');
    const section = document.getElementById('templates-section');
    const categoryTitle = document.getElementById('category-title');
    
    if (!templates || templates.length === 0) {
        container.innerHTML = '<div class="text-center py-12"><p class="text-slate-500">Шаблоны не найдены</p></div>';
        return;
    }
    
    categoryTitle.textContent = templates[0].category_name;
    section.classList.remove('hidden');
    document.getElementById('categories-container').classList.add('hidden');
    
    container.innerHTML = templates.map(template => `
        <div class="template-card bg-white rounded-2xl shadow-lg border border-slate-200 p-6 cursor-pointer fade-in"
             onclick="showCalculator(${template.id})"
             style="animation-delay: ${templates.indexOf(template) * 0.1}s">
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-dark rounded-xl flex items-center justify-center shadow-lg">
                    <i class="fa-solid ${template.icon_class || 'fa-calculator'} text-white text-lg"></i>
                </div>
                ${template.has_electrical_addon ? '<span class="badge badge-orange"><i class="fa-solid fa-bolt mr-1"></i> +Электрика</span>' : ''}
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
    `).join('');
}

// ============================================================================
// Навигация
// ============================================================================
function showCategories() {
    document.getElementById('templates-section').classList.add('hidden');
    document.getElementById('categories-container').classList.remove('hidden');
    document.getElementById('calculator-section').classList.add('hidden');
}

function showTemplates() {
    document.getElementById('calculator-section').classList.add('hidden');
    document.getElementById('templates-section').classList.remove('hidden');
}

// ============================================================================
// Показать калькулятор
// ============================================================================
async function showCalculator(templateId) {
    if (USE_TEST_DATA) {
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
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// ============================================================================
// Настройка калькулятора
// ============================================================================
function setupCalculator(template) {
    const section = document.getElementById('calculator-section');
    const baseParamSlider = document.getElementById('base-param-slider');
    const baseParamInput = document.getElementById('base-param-input');
    const baseParamUnit = document.getElementById('base-param-unit');
    
    document.getElementById('calculator-title').textContent = template.name;
    document.getElementById('calculator-description').textContent = template.description || '';
    document.getElementById('base-param-label').textContent = template.base_param_name;
    baseParamUnit.textContent = template.base_param_unit;
    
    baseParamSlider.min = template.base_value_min || 1;
    baseParamSlider.max = template.base_value_max || 100;
    baseParamSlider.value = template.base_value_default || 10;
    baseParamSlider.step = template.base_value_step || 1;
    
    baseParamInput.min = template.base_value_min || 1;
    baseParamInput.max = 1000;
    baseParamInput.value = template.base_value_default || 10;
    baseParamInput.step = template.base_value_step || 1;
    
    updateSliderGradient(baseParamSlider);
    renderCoefficients(template.coefficients);
    
    const electricalAddon = document.getElementById('electrical-addon');
    if (template.has_electrical_addon) {
        electricalAddon.classList.remove('hidden');
    } else {
        electricalAddon.classList.add('hidden');
    }
    
    document.getElementById('results-container').classList.add('hidden');
    section.classList.remove('hidden');
    document.getElementById('templates-section').classList.add('hidden');
}

// ============================================================================
// Коэффициенты
// ============================================================================
function renderCoefficients(coefficients) {
    const container = document.getElementById('coefficients-container');
    
    if (!coefficients || Object.keys(coefficients).length === 0) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    
    const coefficientsArray = Object.values(coefficients);
    
    container.innerHTML = coefficientsArray.map(coef => {
        const optionsHtml = coef.options.map(opt => `
            <label class="coefficient-option flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50 transition ${opt.is_default ? 'selected bg-blue-50 border-brand-blue' : ''}">
                <input type="radio" 
                       name="coef_${coef.code}" 
                       value="${opt.value}" 
                       ${opt.is_default ? 'checked' : ''}
                       onchange="updateCoefficientSelection(this)">
                <span class="text-sm text-slate-700">${opt.label}</span>
                ${opt.multiplier !== 1 ? `<span class="text-xs text-slate-400 ml-auto">(x${opt.multiplier})</span>` : ''}
                ${opt.fixed_amount > 0 ? `<span class="text-xs text-slate-400 ml-auto">(+${formatNumber(opt.fixed_amount)} ₽)</span>` : ''}
            </label>
        `).join('');
        
        return `
            <div class="slide-in">
                <label class="block text-sm font-semibold text-slate-700 mb-3">${coef.name}</label>
                <div class="space-y-2">${optionsHtml}</div>
            </div>
        `;
    }).join('');
}

function updateCoefficientSelection(element) {
    const container = element.closest('.space-y-2');
    container.querySelectorAll('.coefficient-option').forEach(opt => {
        opt.classList.remove('selected', 'bg-blue-50', 'border-brand-blue');
    });
    element.closest('.coefficient-option').classList.add('selected', 'bg-blue-50', 'border-brand-blue');
}

// ============================================================================
// Слайдер
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

function updateSliderGradient(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const value = parseFloat(slider.value) || 0;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #0066cc 0%, #0066cc ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
}

// ============================================================================
// РАСЧЕТ СМЕТЫ
// ============================================================================
async function calculateEstimate() {
    if (!currentTemplate) return;
    
    const slider = document.getElementById('base-param-slider');
    const baseValue = parseFloat(slider.value);
    
    const coefficients = {};
    document.querySelectorAll('[id^="coef_"]').forEach(input => {
        if (input.checked) {
            coefficients[input.name.replace('coef_', '')] = input.value;
        }
    });
    
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    
    setTimeout(() => {
        const result = calculateLocal(currentTemplate, baseValue, coefficients);
        currentCalculation = result;
        renderResults(result);
        document.getElementById('loading-indicator').classList.add('hidden');
    }, 300);
}

function calculateLocal(template, baseValue, coefficients) {
    let materials = [];
    let works = [];
    let totalMaterials = 0;
    let totalWorks = 0;
    
    let workMultiplier = 1.0;
    let fixedAmount = 0;
    
    const templateCoef = template.coefficients || {};
    
    for (const [code, value] of Object.entries(coefficients)) {
        if (templateCoef[code]) {
            const coef = templateCoef[code];
            const option = coef.options.find(o => o.value === value);
            if (option) {
                if (coef.applies_to === 'works' || coef.applies_to === 'all') {
                    workMultiplier *= option.multiplier;
                    if (option.fixed_amount > 0) {
                        fixedAmount += option.fixed_amount;
                    }
                }
            }
        }
    }
    
    if (template.materials) {
        for (const mat of template.materials) {
            let quantity = mat.quantity_per_unit;
            if (!mat.is_fixed) quantity *= baseValue;
            
            const sum = quantity * mat.price;
            materials.push({
                name: mat.name,
                unit: mat.unit,
                quantity: Math.round(quantity * 100) / 100,
                price: mat.price,
                sum: Math.round(sum * 100) / 100
            });
            totalMaterials += sum;
        }
    }
    
    if (template.works) {
        for (const work of template.works) {
            let quantity = work.quantity_per_unit;
            if (!work.is_fixed) quantity *= baseValue;
            
            const sum = quantity * work.price * workMultiplier;
            works.push({
                name: work.name,
                unit: work.unit,
                quantity: Math.round(quantity * 100) / 100,
                price: Math.round(work.price * workMultiplier * 100) / 100,
                sum: Math.round(sum * 100) / 100
            });
            totalWorks += sum;
        }
    }
    
    return {
        template: template,
        base_value: baseValue,
        materials: materials,
        works: works,
        total_materials: Math.round(totalMaterials * 100) / 100,
        total_works: Math.round(totalWorks * 100) / 100,
        fixed_amount: fixedAmount,
        total_amount: Math.round((totalMaterials + totalWorks + fixedAmount) * 100) / 100,
        calculated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
}

// ============================================================================
// Результаты
// ============================================================================
function renderResults(result) {
    document.getElementById('total-amount').textContent = formatNumber(result.total_amount) + ' ₽';
    
    document.getElementById('total-breakdown').innerHTML = `
        <span class="text-brand-blue"><i class="fa-solid fa-box mr-1"></i>Материалы: ${formatNumber(result.total_materials)} ₽</span> · 
        <span class="text-brand-orange"><i class="fa-solid fa-tools mr-1"></i>Работы: ${formatNumber(result.total_works)} ₽</span>
    `;
    
    document.getElementById('materials-table-body').innerHTML = result.materials.map(mat => `
        <tr>
            <td class="py-3 px-4">${mat.name}</td>
            <td class="text-center">${formatNumber(mat.quantity)}</td>
            <td class="text-center">${mat.unit}</td>
            <td class="text-right">${formatNumber(mat.price)}</td>
            <td class="text-right font-medium">${formatNumber(mat.sum)}</td>
        </tr>
    `).join('');
    
    document.getElementById('works-table-body').innerHTML = result.works.map(work => `
        <tr>
            <td class="py-3 px-4">${work.name}</td>
            <td class="text-center">${formatNumber(work.quantity)}</td>
            <td class="text-center">${work.unit}</td>
            <td class="text-right">${formatNumber(work.price)}</td>
            <td class="text-right font-medium">${formatNumber(work.sum)}</td>
        </tr>
    `).join('');
    
    document.getElementById('results-container').classList.remove('hidden');
    document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// Экспорт
// ============================================================================
function exportPDF() {
    if (!currentCalculation) {
        alert('Сначала выполните расчет');
        return;
    }
    alert('Экспорт PDF доступен в полной версии на сервере');
}

function exportExcel() {
    if (!currentCalculation) {
        alert('Сначала выполните расчет');
        return;
    }
    alert('Экспорт Excel доступен в полной версии на сервере');
}

function printEstimate() {
    window.print();
}

// ============================================================================
// Утилиты
// ============================================================================
function formatNumber(num) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}

function showError(message) {
    alert(message);
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.toggle('hidden');
}

// Экспорт функций
window.calculateEstimate = calculateEstimate;
window.exportPDF = exportPDF;
window.exportExcel = exportExcel;
window.printEstimate = printEstimate;
window.showCategories = showCategories;
window.showTemplates = showTemplates;
window.showCalculator = showCalculator;
window.toggleModal = toggleModal;
