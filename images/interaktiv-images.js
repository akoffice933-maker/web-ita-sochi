/**
 * Изображения для страницы "Интерактивные решения"
 * Используем бесплатные фото с Unsplash.com
 * 
 * Просто вставьте эти URL в HTML код
 */

const INTERAKTIV_IMAGES = {
    // Hero изображение (главный баннер)
    hero: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1920&h=1080&fit=crop',
    
    // Интерактивные панели
    panel_school: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
    panel_office: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
    panel_closeup: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=600&fit=crop',
    
    // Киоски самообслуживания
    kiosk_floor: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
    kiosk_mall: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
    
    // Сенсорные плёнки и рамки
    touch_film: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    ir_frame: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
    
    // Оборудование
    stand: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=600&fit=crop',
    microphone: 'https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=800&h=600&fit=crop',
    webcam: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=600&fit=crop',
    
    // Монтаж и установка
    installation: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?w=800&h=600&fit=crop',
    setup: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop',
    
    // Офис и бизнес
    office_meeting: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    office_presentation: 'https://images.unsplash.com/photo-1556761175-5973b0e3c730?w=800&h=600&fit=crop',
    
    // Образование
    classroom: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop',
    student: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop'
};

// Экспорт для использования в HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = INTERAKTIV_IMAGES;
}
