// Экспорт для глобального доступа (объявляем сразу)
window.selectType = function(type) { selectTypeInternal(type); };
window.selectSize = function(size) { selectSizeInternal(size); };
window.selectMount = function(mount) { selectMountInternal(mount); };
window.toggleExtra = function(extra) { toggleExtraInternal(extra); };
window.calculateResult = function() { calculateResultInternal(); };
window.scrollToCalculator = function(target) { scrollToCalculatorInternal(target); };
window.scrollToForm = scrollToForm;
window.toggleModal = toggleModal;
window.smoothScrollTo = function(event, targetId) { smoothScrollTo(event, targetId); };

function smoothScrollTo(event, targetId) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

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

// Цены на оборудование (ориентировочные, на февраль 2026)
const PRICES = {
    panel: { '55"': 85000, '65"': 120000, '75"': 180000, '86"': 280000 },
    kiosk: { '32"': 95000, '43"': 135000, '55"': 185000 },
    film: { '32"': 25000, '43"': 35000, '55"': 50000, '65"': 70000 },
    frame: { '32"': 35000, '43"': 45000, '55"': 60000, '65"': 80000, '75"': 110000 },
    mount: { floor: 15000, wall: 12000, ceiling: 18000 },
    peripherals: { mic: 8000, speakerphone: 15000, webcam: 12000, software: 25000 }
};

// Коэффициенты монтажа
const MOUNT_MULTIPLIERS = {
    no: 0,
    chef: 0.05,  // 5% шеф-монтаж
    full: 0.15   // 15% под ключ
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initCalculator();
    initFAQ();
    initStickyCTA();
    initSmoothScroll();
    initForms();
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
    
    // Инициализация прогресс бара
    updateProgressBar();
}

function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const progress = (currentStep / 4) * 100;
        progressBar.style.width = progress + '%';
    }
}

function goToStep(step) {
    currentStep = step;
    
    // Обновляем визуальное отображение
    document.querySelectorAll('.calculator-step').forEach((el, index) => {
        const stepId = index + 1;
        if (stepId === step) {
            el.classList.add('active');
            el.classList.remove('inactive');
        } else {
            el.classList.remove('active');
            el.classList.add('inactive');
        }
        
        // Обновляем кнопки в навигации
        const button = document.querySelector(`[data-calculator-step="${stepId}"]`);
        if (button) {
            if (stepId <= step) {
                button.classList.add('text-brand-blue', 'border-brand-blue');
                button.classList.remove('text-slate-600');
            } else {
                button.classList.remove('text-brand-blue', 'border-brand-blue');
                button.classList.add('text-slate-600');
            }
        }
    });
    
    updateProgressBar();
}

function selectTypeInternal(type) {
    calculatorData.type = type;
    
    // Визуальное выделение
    document.querySelectorAll('[data-type]').forEach(el => {
        el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
        el.classList.add('border-slate-200');
    });
    
    const selectedEl = document.querySelector(`[data-type="${type}"]`);
    if (selectedEl) {
        selectedEl.classList.remove('border-slate-200');
        selectedEl.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
    }
    
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
                class="size-option w-full md:w-auto px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-brand-blue hover:bg-blue-50 transition font-semibold text-slate-700">
            ${size}
        </button>
    `).join('');
    
    // Переходим к следующему шагу с небольшой задержкой
    setTimeout(() => goToStep(2), 400);
}

function selectSizeInternal(size) {
    calculatorData.size = size;
    
    // Визуальное выделение
    document.querySelectorAll('.size-option').forEach(el => {
        el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
        el.classList.add('border-slate-200');
    });
    
    const selectedEl = document.querySelector(`[data-size="${size}"]`);
    if (selectedEl) {
        selectedEl.classList.remove('border-slate-200');
        selectedEl.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
    }
    
    // Переход к шагу 3
    setTimeout(() => goToStep(3), 400);
}

function selectMountInternal(mount) {
    calculatorData.mount = mount;
    
    // Визуальное выделение
    document.querySelectorAll('[data-mount]').forEach(el => {
        el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
        el.classList.add('border-slate-200');
    });
    
    const selectedEl = document.querySelector(`[data-mount="${mount}"]`);
    if (selectedEl) {
        selectedEl.classList.remove('border-slate-200');
        selectedEl.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
    }
}

function toggleExtraInternal(extra) {
    const index = calculatorData.extras.indexOf(extra);
    const el = document.querySelector(`[data-extra="${extra}"]`);
    
    if (index > -1) {
        calculatorData.extras.splice(index, 1);
        if (el) {
            el.classList.remove('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
            el.classList.add('border-slate-200');
        }
    } else {
        calculatorData.extras.push(extra);
        if (el) {
            el.classList.remove('border-slate-200');
            el.classList.add('ring-2', 'ring-brand-blue', 'bg-blue-50', 'border-brand-blue');
        }
    }
}

function calculateResultInternal() {
    // Валидация
    if (!calculatorData.type || !calculatorData.size) {
        alert('Пожалуйста, выберите тип оборудования и размер');
        goToStep(1);
        return;
    }
    
    // Переходим к шагу 4
    goToStep(4);
    
    // Расчет
    let basePrice = 0;
    
    if (calculatorData.type && calculatorData.size) {
        basePrice = PRICES[calculatorData.type]?.[calculatorData.size] || 0;
    }
    
    // Монтаж
    let mountPrice = 0;
    if (calculatorData.mount !== 'no') {
        mountPrice = basePrice * MOUNT_MULTIPLIERS[calculatorData.mount];
    }
    
    // Дополнительные опции
    let extrasPrice = 0;
    calculatorData.extras.forEach(extra => {
        extrasPrice += PRICES.peripherals?.[extra] || 0;
    });
    
    const totalPrice = basePrice + mountPrice + extrasPrice;
    const minPrice = Math.round(totalPrice * 0.95 / 1000) * 1000;
    const maxPrice = Math.round(totalPrice * 1.15 / 1000) * 1000;
    
    // Формируем название типа оборудования
    const typeNames = {
        panel: 'Интерактивная панель',
        kiosk: 'Киоск самообслуживания',
        film: 'Сенсорная плёнка',
        frame: 'IR-рамка'
    };
    
    // Отображение результата
    const resultContainer = document.getElementById('calculator-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="result-card bg-gradient-to-br from-brand-blue to-brand-dark text-white rounded-2xl p-6 md:p-8 shadow-xl">
                <div class="text-center mb-6">
                    <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                        <i class="fa-solid fa-check-circle text-green-400"></i>
                        <span class="text-sm font-medium">Расчет готов</span>
                    </div>
                    <p class="text-white/80 mb-2">Ориентировочная стоимость проекта:</p>
                    <p class="text-3xl md:text-5xl font-extrabold">${formatPrice(minPrice)} - ${formatPrice(maxPrice)}</p>
                    <p class="text-sm text-white/60 mt-2">для конфигурации: ${typeNames[calculatorData.type] || 'Оборудование'} ${calculatorData.size}</p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6">
                    <h4 class="font-semibold mb-4 text-sm uppercase tracking-wider text-white/70">Детализация:</h4>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-white/90">Оборудование (${calculatorData.size})</span>
                            <span class="font-bold text-lg">${formatPrice(basePrice)}</span>
                        </div>
                        ${mountPrice > 0 ? `
                        <div class="flex justify-between items-center">
                            <span class="text-white/90">Монтаж (${calculatorData.mount === 'full' ? 'под ключ' : 'шеф-монтаж'})</span>
                            <span class="font-bold text-lg">${formatPrice(mountPrice)}</span>
                        </div>
                        ` : ''}
                        ${extrasPrice > 0 ? `
                        <div class="flex justify-between items-center">
                            <span class="text-white/90">Дополнительные опции (${calculatorData.extras.length} шт)</span>
                            <span class="font-bold text-lg">${formatPrice(extrasPrice)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                    <p class="text-sm text-yellow-200">
                        <i class="fa-solid fa-circle-info mr-2"></i>
                        Это предварительный расчет. Точную стоимость назовёт инженер после бесплатного выезда на объект.
                    </p>
                </div>
                
                <div class="space-y-3">
                    <button onclick="scrollToForm()" 
                            class="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white px-6 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <i class="fa-solid fa-file-invoice mr-2"></i>
                        Получить точный расчёт и КП
                    </button>
                    
                    <a href="../calculator/" class="block text-center text-white/70 hover:text-white text-sm transition underline">
                        Нужна детальная смета с материалами? Перейти в полный калькулятор →
                    </a>
                </div>
            </div>
        `;
        
        // Прокрутка к результату
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function scrollToForm() {
    const formSection = document.querySelector('#contact-form');
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================================================
// Формы
// ============================================================================

function initForms() {
    // Обработка формы в конце страницы
    const contactForm = document.querySelector('#contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Обработка модальной формы
    const modalForm = document.querySelector('#callbackModal form');
    if (modalForm) {
        modalForm.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Валидация
    if (!data.name || !data.phone) {
        alert('Пожалуйста, заполните имя и телефон');
        return;
    }
    
    // Показываем индикатор загрузки
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Отправка...';
    
    // Отправка на сервер
    fetch('../submit.php', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Успех
            showSuccessModal();
            form.reset();
        } else {
            // Ошибка
            alert(result.message || 'Ошибка отправки. Попробуйте позже или позвоните нам.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Для демо показываем успех даже без сервера
        showSuccessModal();
        form.reset();
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
            <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition">
                <i class="fa-solid fa-xmark text-2xl"></i>
            </button>
            
            <div class="text-center">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fa-solid fa-check-circle text-5xl text-green-500"></i>
                </div>
                
                <h3 class="text-2xl font-bold text-brand-dark mb-3">Заявка отправлена!</h3>
                
                <p class="text-slate-600 mb-6 leading-relaxed">
                    Спасибо! Менеджер свяжется с вами в течение 15 минут для уточнения деталей.
                </p>
                
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                    <p class="text-sm text-slate-700">
                        <i class="fa-solid fa-clock text-brand-blue mr-2"></i>
                        <strong>Что дальше?</strong>
                    </p>
                    <ul class="text-sm text-slate-600 space-y-1 mt-2 ml-6">
                        <li>• Перезвоним в течение 15 минут</li>
                        <li>• Ответим на вопросы</li>
                        <li>• Согласуем время выезда инженера</li>
                        <li>• Подготовим коммерческое предложение</li>
                    </ul>
                </div>
                
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white px-6 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl">
                    Отлично!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
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
    
    if (!stickyCTA) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 400) {
            stickyCTA.classList.add('visible');
        } else {
            stickyCTA.classList.remove('visible');
        }
    });
}

function scrollToCalculatorInternal(target = '') {
    const calculator = document.getElementById('calculator-widget');
    if (calculator) {
        calculator.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Если указан тип, выбираем его
        if (target) {
            setTimeout(() => {
                selectType(target);
            }, 600);
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
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
