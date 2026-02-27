/**
 * JavaScript для страницы "Интерактивные решения"
 * Калькулятор-виджет и интерактивность
 */

// Текущий шаг калькулятора
let currentStep = 1;
let calculatorData = {
    type: '',
    size: '',
    mount: 'no',
    extras: []
};

// Цены (ориентировочные)
const PRICES = {
    panel: { '55"': 85000, '65"': 120000, '75"': 180000, '86"': 280000 },
    kiosk: { '32"': 95000, '43"': 135000, '55"': 185000 },
    film: { '32"': 25000, '43"': 35000, '55"': 50000, '65"': 70000 },
    frame: { '32"': 35000, '43"': 45000, '55"': 60000, '65"': 80000, '75"': 110000 },
    mount: { floor: 15000, wall: 12000, ceiling: 18000 },
    peripherals: { mic: 8000, speakerphone: 15000, webcam: 12000, software: 25000 }
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initCalculator();
    initFAQ();
    initStickyCTA();
    initSmoothScroll();
});

// ============================================================================
// Калькулятор-виджет
// ============================================================================

function initCalculator() {
    // Обработчики для шагов
    document.querySelectorAll('[data-calculator-step]').forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.dataset.calculatorStep);
            goToStep(stepNum);
        });
    });
}

function goToStep(step) {
    currentStep = step;
    
    // Обновляем визуальное отображение
    document.querySelectorAll('.calculator-step').forEach((el, index) => {
        if (index + 1 === step) {
            el.classList.add('active');
            el.classList.remove('inactive');
        } else {
            el.classList.remove('active');
            el.classList.add('inactive');
        }
    });
    
    // Обновляем прогресс бар
    const progress = (step / 4) * 100;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
}

function selectType(type) {
    calculatorData.type = type;
    
    // Визуальное выделение
    document.querySelectorAll('[data-type]').forEach(el => {
        el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50');
    });
    document.querySelector(`[data-type="${type}"]`)?.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50');
    
    // Показываем размеры для выбранного типа
    showSizesForType(type);
}

function showSizesForType(type) {
    const sizesContainer = document.getElementById('sizes-container');
    if (!sizesContainer) return;
    
    let sizes = [];
    if (type === 'panel') sizes = ['55"', '65"', '75"', '86"'];
    else if (type === 'kiosk') sizes = ['32"', '43"', '55"'];
    else if (type === 'film') sizes = ['32"', '43"', '55"', '65"'];
    else if (type === 'frame') sizes = ['32"', '43"', '55"', '65"', '75"'];
    
    sizesContainer.innerHTML = sizes.map(size => `
        <button onclick="selectSize('${size}')" 
                data-size="${size}"
                class="size-option w-full md:w-auto px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50 transition font-semibold">
            ${size}
        </button>
    `).join('');
    
    // Переходим к следующему шагу
    setTimeout(() => goToStep(2), 300);
}

function selectSize(size) {
    calculatorData.size = size;
    
    // Визуальное выделение
    document.querySelectorAll('.size-option').forEach(el => {
        el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50');
    });
    document.querySelector(`[data-size="${size}"]`)?.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50');
    
    // Переход к шагу 3
    setTimeout(() => goToStep(3), 300);
}

function selectMount(mount) {
    calculatorData.mount = mount;
    
    // Визуальное выделение
    document.querySelectorAll('[data-mount]').forEach(el => {
        el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50');
    });
    document.querySelector(`[data-mount="${mount}"]`)?.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50');
}

function toggleExtra(extra) {
    const index = calculatorData.extras.indexOf(extra);
    if (index > -1) {
        calculatorData.extras.splice(index, 1);
        document.querySelector(`[data-extra="${extra}"]`)?.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50');
    } else {
        calculatorData.extras.push(extra);
        document.querySelector(`[data-extra="${extra}"]`)?.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50');
    }
}

function calculateResult() {
    // Переходим к шагу 4
    goToStep(4);
    
    // Расчет
    let basePrice = 0;
    
    if (calculatorData.type && calculatorData.size) {
        basePrice = PRICES[calculatorData.type]?.[calculatorData.size] || 0;
    }
    
    // Монтаж
    let mountPrice = 0;
    if (calculatorData.mount === 'full') {
        mountPrice = basePrice * 0.15; // 15% от стоимости оборудования
    } else if (calculatorData.mount === 'chef') {
        mountPrice = basePrice * 0.05; // 5% шеф-монтаж
    }
    
    // Дополнительные опции
    let extrasPrice = 0;
    calculatorData.extras.forEach(extra => {
        extrasPrice += PRICES.peripherals?.[extra] || 0;
    });
    
    const totalPrice = basePrice + mountPrice + extrasPrice;
    const minPrice = Math.round(totalPrice * 0.9 / 1000) * 1000;
    const maxPrice = Math.round(totalPrice * 1.1 / 1000) * 1000;
    
    // Отображение результата
    const resultContainer = document.getElementById('calculator-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="result-card text-white rounded-2xl p-6 md:p-8">
                <div class="text-center mb-6">
                    <p class="text-white/80 mb-2">Ориентировочная стоимость:</p>
                    <p class="text-4xl md:text-5xl font-extrabold">${formatPrice(minPrice)} - ${formatPrice(maxPrice)}</p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                        <span>Оборудование (${calculatorData.size})</span>
                        <span class="font-bold">${formatPrice(basePrice)}</span>
                    </div>
                    ${mountPrice > 0 ? `
                    <div class="flex justify-between items-center mb-2">
                        <span>Монтаж</span>
                        <span class="font-bold">${formatPrice(mountPrice)}</span>
                    </div>
                    ` : ''}
                    ${extrasPrice > 0 ? `
                    <div class="flex justify-between items-center">
                        <span>Дополнительно</span>
                        <span class="font-bold">${formatPrice(extrasPrice)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="text-center space-y-3">
                    <p class="text-sm text-white/80">
                        <i class="fa-solid fa-circle-info mr-1"></i>
                        Это предварительный расчет. Точную стоимость назовёт инженер после выезда.
                    </p>
                    
                    <button onclick="toggleModal('callbackModal')" 
                            class="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white px-6 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl">
                        <i class="fa-solid fa-phone mr-2"></i>
                        Получить точный расчёт и КП
                    </button>
                    
                    <a href="../calculator/" class="inline-block text-white/80 hover:text-white text-sm underline">
                        Нужна детальная смета? Перейти в полный калькулятор →
                    </a>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// FAQ
// ============================================================================

function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const item = this.closest('.faq-item');
            const isActive = item.classList.contains('active');
            
            // Закрываем все остальные
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
            });
            
            // Если не был активен, открываем
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ============================================================================
// Sticky CTA
// ============================================================================

function initStickyCTA() {
    const stickyCTA = document.getElementById('sticky-cta');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            stickyCTA?.classList.add('visible');
        } else {
            stickyCTA?.classList.remove('visible');
        }
    });
}

function scrollToCalculator(target = '') {
    const calculator = document.getElementById('calculator-widget');
    if (calculator) {
        calculator.scrollIntoView({ behavior: 'smooth' });
        
        // Если указан тип, выбираем его
        if (target) {
            setTimeout(() => {
                selectType(target);
            }, 500);
        }
    }
}

// ============================================================================
// Smooth Scroll
// ============================================================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// ============================================================================
// Utilities
// ============================================================================

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.toggle('hidden');
    }
}

function submitForm(event) {
    event.preventDefault();
    // Здесь будет логика отправки формы
    alert('Спасибо! Ваша заявка принята. Менеджер свяжется с вами в течение 15 минут.');
    toggleModal('callbackModal');
}
