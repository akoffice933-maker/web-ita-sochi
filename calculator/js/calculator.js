/**
 * JavaScript для калькулятора строительных смет
 * Компания: ИТА Сочи
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
        { id: 5, name: 'Электромонтаж', slug: 'electro', icon_class: 'fa-solid fa-bolt', description: 'Электромонтажные работы под ключ' }
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
        {
            id: 2, category_id: 2, category_name: 'Видеонаблюдение', category_slug: 'video',
            name: 'Видеонаблюдение (базовый, 4 камеры)', slug: 'video-basic-4cam',
            description: 'Система видеонаблюдения на 4-8 IP-камер',
            base_param_code: 'cameras', base_param_name: 'Количество камер', base_param_unit: 'камер',
            base_value_min: 4, base_value_max: 8, base_value_default: 4, base_value_step: 1,
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
                },
                wall_type: {
                    code: 'wall_type', name: 'Тип стен', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'drywall', label: 'Гипсокартон', multiplier: 1.0, fixed_amount: 0, is_default: false },
                        { value: 'brick', label: 'Кирпич', multiplier: 1.25, fixed_amount: 0, is_default: false },
                        { value: 'concrete', label: 'Бетон/монолит', multiplier: 1.5, fixed_amount: 0, is_default: true }
                    ]
                }
            },
            materials: [
                { name: 'IP-камера 4 Мп Hikvision/Dahua', unit: 'шт', price: 4500, quantity_per_unit: 1, is_fixed: false },
                { name: 'Кабель UTP Cat 5e для видеонаблюдения', unit: 'м', price: 25, quantity_per_unit: 35, is_fixed: false },
                { name: 'PoE-коммутатор 8 портов', unit: 'шт', price: 5500, quantity_per_unit: 1, is_fixed: true },
                { name: 'NVR 4-канальный + HDD 2TB', unit: 'компл.', price: 12000, quantity_per_unit: 1, is_fixed: true },
                { name: 'Крепежи, разъемы, БП', unit: 'компл.', price: 800, quantity_per_unit: 1, is_fixed: true }
            ],
            works: [
                { name: 'Монтаж IP-камеры', unit: 'шт', price: 2500, quantity_per_unit: 1, is_fixed: false },
                { name: 'Прокладка кабеля для видеонаблюдения', unit: 'м', price: 45, quantity_per_unit: 35, is_fixed: false },
                { name: 'Монтаж PoE-коммутатора и NVR', unit: 'шт', price: 1500, quantity_per_unit: 2, is_fixed: true },
                { name: 'Пусконаладка и настройка', unit: 'компл.', price: 3000, quantity_per_unit: 1, is_fixed: true }
            ]
        },
        {
            id: 3, category_id: 3, category_name: 'СКУД', category_slug: 'skud',
            name: 'СКУД на 1 точку (базовый)', slug: 'skud-1door-basic',
            description: 'Система контроля доступа на 1 дверь',
            base_param_code: 'doors', base_param_name: 'Количество дверей', base_param_unit: 'дверей',
            base_value_min: 1, base_value_max: 4, base_value_default: 1, base_value_step: 1,
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
                { name: 'Контроллер СКУД', unit: 'шт', price: 3500, quantity_per_unit: 1, is_fixed: false },
                { name: 'Считыватель карт', unit: 'шт', price: 1500, quantity_per_unit: 1, is_fixed: false },
                { name: 'Электромагнитный замок', unit: 'шт', price: 2500, quantity_per_unit: 1, is_fixed: false },
                { name: 'Кнопка выхода', unit: 'шт', price: 400, quantity_per_unit: 1, is_fixed: false },
                { name: 'Блок питания 12В', unit: 'шт', price: 800, quantity_per_unit: 1, is_fixed: false },
                { name: 'Кабель, расходники для СКУД', unit: 'компл.', price: 500, quantity_per_unit: 1, is_fixed: false },
                { name: 'Карты доступа (10 шт)', unit: 'компл.', price: 500, quantity_per_unit: 1, is_fixed: true }
            ],
            works: [
                { name: 'Монтаж оборудования СКУД', unit: 'компл.', price: 4000, quantity_per_unit: 1, is_fixed: false },
                { name: 'Настройка ПО и выдача ключей', unit: 'компл.', price: 2000, quantity_per_unit: 1, is_fixed: false }
            ]
        },
        {
            id: 4, category_id: 4, category_name: 'IT-аутсорсинг', category_slug: 'it-outsourcing',
            name: 'IT-аутсорсинг "Базовый"', slug: 'it-basic',
            description: 'Абонентское обслуживание рабочих мест',
            base_param_code: 'seats', base_param_name: 'Количество рабочих мест', base_param_unit: 'мест',
            base_value_min: 1, base_value_max: 50, base_value_default: 10, base_value_step: 1,
            has_electrical_addon: false,
            coefficients: {
                urgency: {
                    code: 'urgency', name: 'Срочность', type: 'common', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'normal', label: 'Обычная (стандартные сроки)', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: 'urgent_2-3days', label: 'Срочно (2-3 дня)', multiplier: 1.2, fixed_amount: 0, is_default: false },
                        { value: 'express_1day', label: 'Экстренно (1 день)', multiplier: 1.5, fixed_amount: 0, is_default: false }
                    ]
                }
            },
            materials: [
                { name: 'Абонентское обслуживание (удаленно)', unit: 'раб.мест/мес', price: 500, quantity_per_unit: 1, is_fixed: false }
            ],
            works: []
        },
        {
            id: 5, category_id: 5, category_name: 'Электромонтаж', category_slug: 'electro',
            name: 'Электрика под ключ (1-комнатная, до 40 м²)', slug: 'electro-flat-1room-40m2',
            description: 'Комплексный электромонтаж в 1-комнатной квартире',
            base_param_code: 'area', base_param_name: 'Площадь помещения', base_param_unit: 'м²',
            base_value_min: 20, base_value_max: 60, base_value_default: 40, base_value_step: 5,
            has_electrical_addon: false,
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
                },
                wall_type: {
                    code: 'wall_type', name: 'Тип стен', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'drywall', label: 'Гипсокартон', multiplier: 1.0, fixed_amount: 0, is_default: false },
                        { value: 'brick', label: 'Кирпич', multiplier: 1.25, fixed_amount: 0, is_default: false },
                        { value: 'concrete', label: 'Бетон/монолит', multiplier: 1.5, fixed_amount: 0, is_default: true }
                    ]
                },
                height: {
                    code: 'height', name: 'Высота работ', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'to_3m', label: 'До 3 м', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: '3-5m', label: '3-5 м', multiplier: 1.3, fixed_amount: 0, is_default: false },
                        { value: 'above_5m', label: 'Выше 5 м', multiplier: 1.8, fixed_amount: 0, is_default: false }
                    ]
                },
                wiring_type: {
                    code: 'wiring_type', name: 'Тип проводки', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'open', label: 'Открытая проводка', multiplier: 0.8, fixed_amount: 0, is_default: false },
                        { value: 'concealed', label: 'Скрытая в штробе', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: 'in_screed', label: 'В стяжку пола', multiplier: 1.1, fixed_amount: 0, is_default: false }
                    ]
                }
            },
            materials: [
                { name: 'Кабель силовой ВВГнг-LS 3×2.5', unit: 'м', price: 85, quantity_per_unit: 2.5, is_fixed: false },
                { name: 'Кабель силовой ВВГнг-LS 3×1.5', unit: 'м', price: 55, quantity_per_unit: 1.5, is_fixed: false },
                { name: 'Автомат 1P 16A', unit: 'шт', price: 350, quantity_per_unit: 0.2, is_fixed: false },
                { name: 'Автомат 1P 10A', unit: 'шт', price: 350, quantity_per_unit: 0.15, is_fixed: false },
                { name: 'Автомат 2P 25A', unit: 'шт', price: 800, quantity_per_unit: 0.025, is_fixed: false },
                { name: 'УЗО 2P 25A 30mA', unit: 'шт', price: 1200, quantity_per_unit: 0.05, is_fixed: false },
                { name: 'Розетка 220В', unit: 'шт', price: 400, quantity_per_unit: 0.25, is_fixed: false },
                { name: 'Выключатель одноклавишный', unit: 'шт', price: 300, quantity_per_unit: 0.1, is_fixed: false },
                { name: 'Выключатель двухклавишный', unit: 'шт', price: 400, quantity_per_unit: 0.05, is_fixed: false },
                { name: 'Подрозетник', unit: 'шт', price: 50, quantity_per_unit: 0.35, is_fixed: false },
                { name: 'Распредкоробка', unit: 'шт', price: 100, quantity_per_unit: 0.1, is_fixed: false },
                { name: 'Щит квартирный', unit: 'шт', price: 2500, quantity_per_unit: 1, is_fixed: true },
                { name: 'Светильник точечный LED', unit: 'шт', price: 600, quantity_per_unit: 0.25, is_fixed: false },
                { name: 'Кабель-канал 40×25 мм', unit: 'м', price: 90, quantity_per_unit: 1, is_fixed: false }
            ],
            works: [
                { name: 'Штробление в бетоне', unit: 'пог.м', price: 450, quantity_per_unit: 0.5, is_fixed: false },
                { name: 'Установка подрозетника в бетоне', unit: 'шт', price: 350, quantity_per_unit: 0.35, is_fixed: false },
                { name: 'Прокладка кабеля силового', unit: 'м', price: 80, quantity_per_unit: 1, is_fixed: false },
                { name: 'Монтаж кабель-канала', unit: 'м', price: 120, quantity_per_unit: 1, is_fixed: false },
                { name: 'Монтаж автомата 1P', unit: 'шт', price: 300, quantity_per_unit: 0.2, is_fixed: false },
                { name: 'Монтаж УЗО', unit: 'шт', price: 600, quantity_per_unit: 0.05, is_fixed: false },
                { name: 'Установка розетки/выключателя', unit: 'шт', price: 250, quantity_per_unit: 0.4, is_fixed: false },
                { name: 'Сборка щита (до 12 модулей)', unit: 'шт', price: 3500, quantity_per_unit: 1, is_fixed: true },
                { name: 'Установка точечного светильника', unit: 'шт', price: 400, quantity_per_unit: 0.25, is_fixed: false },
                { name: 'Электролабораторные измерения', unit: 'компл.', price: 5000, quantity_per_unit: 1, is_fixed: true }
            ]
        },
        {
            id: 6, category_id: 5, category_name: 'Электромонтаж', category_slug: 'electro',
            name: 'Офисный электромонтаж (50 м²)', slug: 'electro-office-50m2',
            description: 'Комплексный электромонтаж в офисе',
            base_param_code: 'area', base_param_name: 'Площадь помещения', base_param_unit: 'м²',
            base_value_min: 30, base_value_max: 200, base_value_default: 50, base_value_step: 10,
            has_electrical_addon: false,
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
                },
                wall_type: {
                    code: 'wall_type', name: 'Тип стен', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'drywall', label: 'Гипсокартон', multiplier: 1.0, fixed_amount: 0, is_default: false },
                        { value: 'brick', label: 'Кирпич', multiplier: 1.25, fixed_amount: 0, is_default: false },
                        { value: 'concrete', label: 'Бетон/монолит', multiplier: 1.5, fixed_amount: 0, is_default: true }
                    ]
                },
                height: {
                    code: 'height', name: 'Высота работ', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'to_3m', label: 'До 3 м', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: '3-5m', label: '3-5 м', multiplier: 1.3, fixed_amount: 0, is_default: false },
                        { value: 'above_5m', label: 'Выше 5 м', multiplier: 1.8, fixed_amount: 0, is_default: false }
                    ]
                },
                wiring_type: {
                    code: 'wiring_type', name: 'Тип проводки', type: 'electrical', input_type: 'select', applies_to: 'works', is_percentage: true,
                    options: [
                        { value: 'open', label: 'Открытая проводка', multiplier: 0.8, fixed_amount: 0, is_default: false },
                        { value: 'concealed', label: 'Скрытая в штробе', multiplier: 1.0, fixed_amount: 0, is_default: true },
                        { value: 'in_screed', label: 'В стяжку пола', multiplier: 1.1, fixed_amount: 0, is_default: false }
                    ]
                }
            },
            materials: [
                { name: 'Кабель силовой ВВГнг-LS 3×2.5', unit: 'м', price: 85, quantity_per_unit: 2, is_fixed: false },
                { name: 'Кабель силовой ВВГнг-LS 3×1.5', unit: 'м', price: 55, quantity_per_unit: 1.5, is_fixed: false },
                { name: 'Автомат 1P 16A', unit: 'шт', price: 350, quantity_per_unit: 0.24, is_fixed: false },
                { name: 'Автомат 1P 10A', unit: 'шт', price: 350, quantity_per_unit: 0.12, is_fixed: false },
                { name: 'Автомат 2P 25A', unit: 'шт', price: 800, quantity_per_unit: 0.02, is_fixed: false },
                { name: 'УЗО 2P 25A 30mA', unit: 'шт', price: 1200, quantity_per_unit: 0.04, is_fixed: false },
                { name: 'Розетка 220В', unit: 'шт', price: 400, quantity_per_unit: 0.3, is_fixed: false },
                { name: 'Выключатель одноклавишный', unit: 'шт', price: 300, quantity_per_unit: 0.08, is_fixed: false },
                { name: 'Подрозетник', unit: 'шт', price: 50, quantity_per_unit: 0.38, is_fixed: false },
                { name: 'Щит офисный', unit: 'шт', price: 4500, quantity_per_unit: 1, is_fixed: true },
                { name: 'Светильник офисный LED 600×600', unit: 'шт', price: 1500, quantity_per_unit: 0.12, is_fixed: false },
                { name: 'Кабель-канал 40×25 мм', unit: 'м', price: 90, quantity_per_unit: 1.2, is_fixed: false }
            ],
            works: [
                { name: 'Штробление в бетоне', unit: 'пог.м', price: 450, quantity_per_unit: 0.4, is_fixed: false },
                { name: 'Установка подрозетника в бетоне', unit: 'шт', price: 350, quantity_per_unit: 0.38, is_fixed: false },
                { name: 'Прокладка кабеля силового', unit: 'м', price: 80, quantity_per_unit: 1, is_fixed: false },
                { name: 'Монтаж кабель-канала', unit: 'м', price: 120, quantity_per_unit: 1.2, is_fixed: false },
                { name: 'Монтаж автомата 1P', unit: 'шт', price: 300, quantity_per_unit: 0.24, is_fixed: false },
                { name: 'Монтаж УЗО', unit: 'шт', price: 600, quantity_per_unit: 0.04, is_fixed: false },
                { name: 'Установка розетки/выключателя', unit: 'шт', price: 250, quantity_per_unit: 0.42, is_fixed: false },
                { name: 'Сборка щита (13-24 модуля)', unit: 'шт', price: 5500, quantity_per_unit: 1, is_fixed: true },
                { name: 'Установка светильника 600×600', unit: 'шт', price: 800, quantity_per_unit: 0.12, is_fixed: false },
                { name: 'Электролабораторные измерения', unit: 'компл.', price: 5000, quantity_per_unit: 1, is_fixed: true }
            ]
        }
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
    loadAdditionalWorks();
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
        'electro': 'images/electro.svg'
    };
    
    const categoryColors = {
        'sks': 'from-blue-500 to-blue-700',
        'video': 'from-purple-500 to-purple-700',
        'skud': 'from-green-500 to-green-700',
        'it-outsourcing': 'from-orange-500 to-orange-700',
        'electro': 'from-red-500 to-red-700'
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
// Загрузка дополнительных работ
// ============================================================================
async function loadAdditionalWorks() {
    try {
        const response = await fetch(`${API_BASE}/additional-works`);
        const result = await response.json();
        
        if (result.success) {
            additionalWorksData = result.data;
        }
    } catch (error) {
        console.error('Error loading additional works:', error);
    }
}

// ============================================================================
// Отображение дополнительных работ
// ============================================================================
function renderAdditionalWorks() {
    const container = document.getElementById('additional-works-list');
    
    if (additionalWorksData.length === 0) {
        container.innerHTML = '<p class="text-slate-500 text-sm">Нет доступных дополнительных работ</p>';
        return;
    }
    
    container.innerHTML = additionalWorksData.map(work => `
        <div class="additional-work-item flex items-center justify-between p-3 rounded-lg border border-slate-200">
            <div class="flex-1">
                <p class="text-sm font-medium text-slate-700">${work.work_name}</p>
                <p class="text-xs text-slate-500">${formatNumber(work.work_price)} ₽ за ${work.work_unit}</p>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" 
                       min="0" 
                       max="100" 
                       value="0" 
                       step="1"
                       data-slug="${work.work_slug}"
                       class="additional-work-quantity w-20 px-2 py-1 border border-slate-300 rounded text-center text-sm focus:ring-2 focus:ring-brand-blue focus:border-brand-blue">
                <span class="text-xs text-slate-500">${work.work_unit}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// Расчет сметы
// ============================================================================
async function calculateEstimate() {
    if (!currentTemplate) return;
    
    if (USE_TEST_DATA) {
        // Расчет с тестовыми данными
        calculateEstimateLocal();
        return;
    }
    
    const slider = document.getElementById('base-param-slider');
    const baseValue = parseFloat(slider.value);
    
    // Собираем коэффициенты
    const coefficients = {};
    document.querySelectorAll('[id^="coef_"]').forEach(input => {
        if (input.checked) {
            coefficients[input.name.replace('coef_', '')] = input.value;
        }
    });
    
    // Проверяем электромонтаж
    const includeElectrical = document.getElementById('include-electrical')?.checked || false;
    
    // Собираем дополнительные работы
    const additionalWorks = [];
    document.querySelectorAll('.additional-work-quantity').forEach(input => {
        const quantity = parseFloat(input.value) || 0;
        if (quantity > 0) {
            additionalWorks.push({
                slug: input.dataset.slug,
                quantity: quantity
            });
        }
    });
    
    // Показываем индикатор загрузки
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/calculate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                template_id: currentTemplate.id,
                base_value: baseValue,
                coefficients: coefficients,
                include_electrical: includeElectrical,
                additional_works: additionalWorks
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentCalculation = result.data;
            renderResults(result.data);
        } else {
            showError(result.error || 'Ошибка расчета');
        }
    } catch (error) {
        console.error('Error calculating:', error);
        showError('Не удалось выполнить расчет. Попробуйте позже.');
    } finally {
        document.getElementById('loading-indicator').classList.add('hidden');
    }
}

// ============================================================================
// Локальный расчет сметы (для тестовых данных)
// ============================================================================
function calculateEstimateLocal() {
    if (!currentTemplate) return;
    
    const slider = document.getElementById('base-param-slider');
    const baseValue = parseFloat(slider.value);
    
    // Собираем коэффициенты
    const coefficients = {};
    const coefficientElements = document.querySelectorAll('[id^="coef_"]');
    coefficientElements.forEach(input => {
        if (input.checked) {
            const coefCode = input.name.replace('coef_', '');
            coefficients[coefCode] = input.value;
        }
    });
    
    // Проверяем электромонтаж
    const includeElectrical = document.getElementById('include-electrical')?.checked || false;
    
    // Показываем индикатор загрузки
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('results-container').classList.add('hidden');
    
    // Имитация задержки
    setTimeout(() => {
        const result = calculateWithTestData(currentTemplate, baseValue, coefficients, includeElectrical);
        currentCalculation = result;
        renderResults(result);
        document.getElementById('loading-indicator').classList.add('hidden');
    }, 300);
}

// ============================================================================
// Функция расчета с тестовыми данными
// ============================================================================
function calculateWithTestData(template, baseValue, coefficients, includeElectrical) {
    let materials = [];
    let works = [];
    let totalMaterials = 0;
    let totalWorks = 0;
    
    // Применяем коэффициенты
    let workMultiplier = 1.0;
    let materialMultiplier = 1.0;
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
                if (coef.applies_to === 'materials' || coef.applies_to === 'all') {
                    materialMultiplier *= option.multiplier;
                }
            }
        }
    }
    
    // Объемная скидка
    const baseValueDefault = template.base_value_default || 10;
    let materialDiscount = 0;
    if (baseValue > baseValueDefault * 1.5) {
        materialDiscount = baseValue >= baseValueDefault * 2 ? 0.10 : 0.05;
    }
    
    // Обрабатываем материалы
    if (template.materials) {
        for (const mat of template.materials) {
            let quantity = mat.quantity_per_unit;
            if (!mat.is_fixed) {
                quantity *= baseValue;
            }
            
            let sum = quantity * mat.price;
            if (!mat.is_fixed && materialDiscount > 0) {
                sum *= (1 - materialDiscount);
            }
            
            materials.push({
                name: mat.name,
                unit: mat.unit,
                quantity: Math.round(quantity * 100) / 100,
                price: mat.price,
                sum: Math.round(sum * 100) / 100,
                is_electrical: false
            });
            totalMaterials += sum;
        }
    }
    
    // Обрабатываем работы
    if (template.works) {
        for (const work of template.works) {
            let quantity = work.quantity_per_unit;
            if (!work.is_fixed) {
                quantity *= baseValue;
            }
            
            const sum = quantity * work.price * workMultiplier;
            
            works.push({
                name: work.name,
                unit: work.unit,
                quantity: Math.round(quantity * 100) / 100,
                price: Math.round(work.price * workMultiplier * 100) / 100,
                sum: Math.round(sum * 100) / 100,
                is_electrical: false
            });
            totalWorks += sum;
        }
    }
    
    const totalAmount = totalMaterials + totalWorks + fixedAmount;
    
    return {
        template: template,
        base_value: baseValue,
        base_param_name: template.base_param_name,
        base_param_unit: template.base_param_unit,
        coefficients: coefficients,
        coefficients_info: templateCoef,
        materials: materials,
        works: works,
        total_materials: Math.round(totalMaterials * 100) / 100,
        total_works: Math.round(totalWorks * 100) / 100,
        fixed_amount: fixedAmount,
        material_discount: materialDiscount * 100,
        work_multiplier: Math.round(workMultiplier * 10000) / 10000,
        total_amount: Math.round(totalAmount * 100) / 100,
        calculated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
}

// ============================================================================
// Отображение результатов
// ============================================================================
function renderResults(result) {
    const container = document.getElementById('results-container');
    const totalAmount = document.getElementById('total-amount');
    const totalBreakdown = document.getElementById('total-breakdown');
    const materialsTable = document.getElementById('materials-table-body');
    const worksTable = document.getElementById('works-table-body');
    const coefficientsList = document.getElementById('coefficients-list');
    const appliedCoefficients = document.getElementById('applied-coefficients');
    
    // Итоговая сумма
    totalAmount.textContent = formatNumber(result.total_amount) + ' ₽';
    totalBreakdown.textContent = `Материалы: ${formatNumber(result.total_materials)} ₽ | Работы: ${formatNumber(result.total_works)} ₽${result.fixed_amount > 0 ? ` | Наценка: ${formatNumber(result.fixed_amount)} ₽` : ''}`;
    
    // Таблица материалов
    materialsTable.innerHTML = result.materials.length > 0 ? result.materials.map(mat => `
        <tr class="${mat.is_electrical ? 'bg-orange-50' : ''}">
            <td class="py-3 px-4">${mat.name}</td>
            <td class="text-center">${formatNumber(mat.quantity)}</td>
            <td class="text-center">${mat.unit}</td>
            <td class="text-right">${formatNumber(mat.price)}</td>
            <td class="text-right font-medium">${formatNumber(mat.sum)}</td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="text-center py-4 text-slate-500">Нет материалов</td></tr>';
    
    // Таблица работ
    worksTable.innerHTML = result.works.length > 0 ? result.works.map(work => `
        <tr class="${work.is_electrical ? 'bg-orange-50' : ''}${work.is_additional ? 'bg-slate-50' : ''}">
            <td class="py-3 px-4">${work.name}</td>
            <td class="text-center">${formatNumber(work.quantity)}</td>
            <td class="text-center">${work.unit}</td>
            <td class="text-right">${formatNumber(work.price)}</td>
            <td class="text-right font-medium">${formatNumber(work.sum)}</td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="text-center py-4 text-slate-500">Нет работ</td></tr>';
    
    // Примененные коэффициенты
    const appliedCoefs = Object.entries(result.coefficients_info || {})
        .filter(([code]) => result.coefficients[code])
        .map(([code, info]) => {
            const selectedValue = result.coefficients[code];
            const option = info.options.find(o => o.value === selectedValue);
            return option ? `<span class="badge badge-blue">${info.name}: ${option.label}</span>` : '';
        })
        .filter(Boolean)
        .join('');
    
    if (appliedCoefs) {
        coefficientsList.innerHTML = appliedCoefs;
        appliedCoefficients.classList.remove('hidden');
    } else {
        appliedCoefficients.classList.add('hidden');
    }
    
    // Показываем результаты
    container.classList.remove('hidden');
    container.classList.add('success-animation');
    
    // Прокрутка к результатам
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================================
// Экспорт в PDF
// ============================================================================
async function exportPDF() {
    if (!currentCalculation) {
        showError('Сначала выполните расчет');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/generate-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                calculation_data: currentCalculation
            })
        });
        
        if (response.ok) {
            // Создаем blob и скачиваем файл
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smeta_ITA_${new Date().toISOString().slice(0,19).replace(/[:-]/g,'').replace('T','_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            const error = await response.json();
            showError(error.error || 'Ошибка экспорта в PDF');
        }
    } catch (error) {
        console.error('Error exporting PDF:', error);
        showError('Не удалось экспортировать в PDF. Проверьте подключение к интернету.');
    }
}

// ============================================================================
// Экспорт в Excel
// ============================================================================
async function exportExcel() {
    if (!currentCalculation) {
        showError('Сначала выполните расчет');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/generate-excel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                calculation_data: currentCalculation
            })
        });
        
        if (response.ok) {
            // Создаем blob и скачиваем файл
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smeta_ITA_${new Date().toISOString().slice(0,19).replace(/[:-]/g,'').replace('T','_')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
            const error = await response.json();
            showError(error.error || 'Ошибка экспорта в Excel');
        }
    } catch (error) {
        console.error('Error exporting Excel:', error);
        showError('Не удалось экспортировать в Excel. Проверьте подключение к интернету.');
    }
}

// ============================================================================
// Печать сметы
// ============================================================================
function printEstimate() {
    window.print();
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
