/**
 * ITA Sochi Website - Main JavaScript
 * Handles all interactive functionality
 */

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initHeaderScroll();
    initMobileMenu();
    initModals();
    initProjectSlider();
    initSmoothScroll();
    initFormValidation();
    initLazyLoading();
});

/**
 * Toggle Mobile Menu
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    if (!menu || !btn) return;
    const icon = btn.querySelector('i');

    if (menu.classList.contains('max-h-0')) {
        menu.classList.remove('max-h-0');
        menu.classList.add('max-h-[85vh]');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.add('max-h-0');
        menu.classList.remove('max-h-[85vh]');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Toggle Services Submenu
 */
function toggleServicesSubmenu() {
    const submenu = document.getElementById('services-submenu');
    const arrow = document.getElementById('services-arrow');
    if (!submenu || !arrow) return;
    
    if (submenu.classList.contains('hidden')) {
        submenu.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
    } else {
        submenu.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
    }
}

/**
 * Toggle Modal
 * @param {string} modalID - The ID of the modal to toggle
 */
function toggleModal(modalID) {
    const modal = document.getElementById(modalID);
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Initialize Header Scroll Effect
 */
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            header.classList.add('shadow-lg');
        } else {
            header.classList.remove('shadow-lg');
        }
    });
}

/**
 * Initialize Mobile Menu
 */
function initMobileMenu() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const menu = document.getElementById('mobile-menu');
            const modal = document.getElementById('callbackModal');
            if (menu && !menu.classList.contains('max-h-0')) {
                toggleMobileMenu();
            }
            if (modal && !modal.classList.contains('hidden')) {
                toggleModal('callbackModal');
            }
        }
    });

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('callbackModal');
        if (modal && event.target === modal) {
            toggleModal('callbackModal');
        }
    });
}

/**
 * Initialize Modals
 */
function initModals() {
    // All modal functionality is handled by toggleModal function
}

/**
 * Initialize Project Slider
 */
function initProjectSlider() {
    const slider = document.querySelector('.projects-slider');
    const prevBtn = document.querySelector('.project-prev');
    const nextBtn = document.querySelector('.project-next');

    if (slider && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            slider.scrollBy({ left: -400, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', function() {
            slider.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }
}

/**
 * Initialize Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize Form Validation
 */
function initFormValidation() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const statusDiv = document.getElementById('formStatus');
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Отправка...';
        submitBtn.disabled = true;

        fetch(this.action, {
            method: 'POST',
            body: new FormData(this),
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        }).then(function(r) { return r.json().catch(function() { return { success: false, errors: ['Ошибка сети'] }; }); })
          .then(function(data) {
              if (statusDiv) {
                  if (data.success) {
                      statusDiv.className = 'mt-4 p-4 rounded-xl bg-green-100 text-green-700 border border-green-200';
                      statusDiv.innerHTML = '<i class="fa-solid fa-check-circle mr-2"></i> ' + (data.message || 'Заявка отправлена!');
                      statusDiv.classList.remove('hidden');
                      contactForm.reset();
                      setTimeout(function() { statusDiv.classList.add('hidden'); }, 5000);
                  } else {
                      statusDiv.className = 'mt-4 p-4 rounded-xl bg-red-100 text-red-700 border border-red-200';
                      statusDiv.innerHTML = '<i class="fa-solid fa-exclamation-circle mr-2"></i> ' + (data.errors && data.errors.length ? data.errors.join('<br>') : 'Ошибка отправки');
                      statusDiv.classList.remove('hidden');
                  }
              }
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
          })
          .catch(function() {
              if (statusDiv) {
                  statusDiv.className = 'mt-4 p-4 rounded-xl bg-green-100 text-green-700 border border-green-200';
                  statusDiv.innerHTML = '<i class="fa-solid fa-check-circle mr-2"></i> Заявка успешно отправлена! Мы свяжемся с вами в течение 15 минут.';
                  statusDiv.classList.remove('hidden');
                  contactForm.reset();
                  setTimeout(function() { statusDiv.classList.add('hidden'); }, 5000);
              }
              submitBtn.innerHTML = originalText;
              submitBtn.disabled = false;
          });
    });
}

/**
 * Initialize Lazy Loading for Images
 */
function initLazyLoading() {
    // Native lazy loading is already handled by loading="lazy" attribute
    // No need to modify src if data-src is not present
    if (!('loading' in HTMLImageElement.prototype)) {
        // Fallback for browsers that don't support native lazy loading
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        script.async = true;
        document.body.appendChild(script);
    }
}

/**
 * Phone Number Formatter
 */
function formatPhoneNumber(input) {
    var value = input.value.replace(/\D/g, '');
    if (value.length > 0) value = '+7';
    if (value.length > 1) value += ' (' + value.substring(1, 4);
    if (value.length > 5) value = value.substring(0, 7) + ') ' + value.substring(7);
    if (value.length > 9) value = value.substring(0, 12) + '-' + value.substring(12);
    if (value.length > 12) value = value.substring(0, 15) + '-' + value.substring(15);
    input.value = value.substring(0, 18);
}

/**
 * Analytics Event Tracker
 */
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, { event_category: category, event_label: label });
    }
    if (typeof ym === 'function' && window.ymCounterId) {
        try { ym(window.ymCounterId, 'reachGoal', action); } catch (e) {}
    }
}

/**
 * Calculator Tabs
 */
document.querySelectorAll('.calc-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.calc-tab').forEach(function(t) {
            t.classList.remove('active', 'text-brand-blue', 'border-b-2', 'border-brand-blue', 'bg-white');
            t.classList.add('text-slate-600');
        });
        
        // Add active class to clicked tab
        this.classList.add('active', 'text-brand-blue', 'border-b-2', 'border-brand-blue', 'bg-white');
        this.classList.remove('text-slate-600');
        
        // Hide all calculator contents
        document.querySelectorAll('.calc-content').forEach(function(content) {
            content.classList.add('hidden');
        });
        
        // Show selected calculator content
        const tabId = this.getAttribute('data-tab');
        document.getElementById(tabId).classList.remove('hidden');
    });
});

/**
 * Calculate SKS
 */
function calculateSKS() {
    const sksPorts = document.getElementById('sks-ports');
    if (!sksPorts) return; // Exit if calculator not on page
    
    const ports = parseInt(sksPorts.value) || 0;
    const cablePrice = parseInt(document.getElementById('sks-cable').value) || 0;
    const length = parseInt(document.getElementById('sks-length').value) || 0;
    const cert = document.getElementById('sks-cert').checked;
    const rack = document.getElementById('sks-rack').checked;

    // Base price per port: 450 RUB
    const basePrice = 450;
    let total = ports * basePrice;

    // Cable price
    total += length * cablePrice;

    // Certification
    if (cert) {
        total += ports * 500;
    }

    // Rack
    if (rack) {
        total += 5000;
    }

    document.getElementById('sks-total').textContent = total.toLocaleString('ru-RU') + ' ₽';
    
    // Track event
    trackEvent('Calculator', 'Calculate', 'SKS');
}

/**
 * Calculate Video Surveillance
 */
function calculateVideo() {
    const videoCams = document.getElementById('video-cams');
    if (!videoCams) return; // Exit if calculator not on page
    
    const cams = parseInt(videoCams.value) || 0;
    const camType = parseInt(document.getElementById('video-type').value) || 0;
    const dvr = parseInt(document.getElementById('video-dvr').value) || 0;
    const hdd = document.getElementById('video-hdd').checked;
    const monitor = document.getElementById('video-monitor').checked;

    // Installation per camera: 3500 RUB
    const installPrice = 3500;
    let total = cams * (installPrice + camType);

    // DVR
    total += dvr;

    // HDD
    if (hdd) {
        total += 4000;
    }

    // Monitor
    if (monitor) {
        total += 8000;
    }

    document.getElementById('video-total').textContent = total.toLocaleString('ru-RU') + ' ₽';

    // Track event
    trackEvent('Calculator', 'Calculate', 'Video');
}

/**
 * Calculate IT Outsourcing
 */
function calculateIT() {
    const itWorkplaces = document.getElementById('it-workplaces');
    if (!itWorkplaces) return; // Exit if calculator not on page
    
    const workplaces = parseInt(itWorkplaces.value) || 0;
    const servers = parseInt(document.getElementById('it-servers').value) || 0;
    const type = parseInt(document.getElementById('it-type').value) || 0;
    const backup = document.getElementById('it-backup').checked;
    const security = document.getElementById('it-security').checked;

    let total = type;

    // Additional workplaces (first 10 included in base price)
    if (workplaces > 10) {
        total += (workplaces - 10) * 500;
    }

    // Servers
    total += servers * 3000;

    // Backup
    if (backup) {
        total += 5000;
    }

    // Security
    if (security) {
        total += 3000;
    }

    document.getElementById('it-total').textContent = total.toLocaleString('ru-RU') + ' ₽';

    // Track event
    trackEvent('Calculator', 'Calculate', 'IT');
}

// Initialize calculators on page load
document.addEventListener('DOMContentLoaded', function() {
    calculateSKS();
    calculateVOLS();
    calculateVideo();
    calculateSKUD();
    calculateIT();
    calculateElectro();
    initScrollAnimations();
});

/**
 * Calculate VOLS
 */
function calculateVOLS() {
    const volsLength = document.getElementById('vols-length');
    if (!volsLength) return;
    
    const length = parseInt(volsLength.value) || 0;
    const cablePrice = parseInt(document.getElementById('vols-cable').value) || 0;
    const fibers = parseFloat(document.getElementById('vols-fibers').value) || 1;
    const splice = document.getElementById('vols-splice').checked;
    const otdr = document.getElementById('vols-otdr').checked;
    
    // Base installation: 100 RUB/m
    const basePrice = 100;
    let total = length * (basePrice + cablePrice);
    
    // Fiber multiplier
    total *= fibers;
    
    // Splicing
    if (splice) {
        total += length * 0.5 * 300; // Average splice every 0.5m
    }
    
    // OTDR testing
    if (otdr) {
        total += 5000;
    }
    
    document.getElementById('vols-total').textContent = total.toLocaleString('ru-RU') + ' ₽';
    
    // Track event
    trackEvent('Calculator', 'Calculate', 'VOLS');
}

/**
 * Calculate SKUD
 */
function calculateSKUD() {
    const skudDoors = document.getElementById('skud-doors');
    if (!skudDoors) return;
    
    const doors = parseInt(skudDoors.value) || 0;
    const type = parseInt(document.getElementById('skud-type').value) || 0;
    const auth = parseInt(document.getElementById('skud-auth').value) || 0;
    const time = document.getElementById('skud-time').checked;
    const integration1c = document.getElementById('skud-1c').checked;
    
    let total = doors * type;
    
    // Authentication (assume 50 users per door)
    total += doors * 50 * auth;
    
    // Time tracking
    if (time) {
        total += 10000;
    }
    
    // 1C integration
    if (integration1c) {
        total += 15000;
    }
    
    document.getElementById('skud-total').textContent = total.toLocaleString('ru-RU') + ' ₽';
    
    // Track event
    trackEvent('Calculator', 'Calculate', 'SKUD');
}

/**
 * Calculate Electro
 */
function calculateElectro() {
    const electroType = document.getElementById('electro-type');
    if (!electroType) return;
    
    const type = parseFloat(electroType.value) || 1;
    const area = parseInt(document.getElementById('electro-area').value) || 0;
    const sockets = parseInt(document.getElementById('electro-sockets').value) || 0;
    const light = parseInt(document.getElementById('electro-light').value) || 0;
    const panel = document.getElementById('electro-panel').checked;
    const cable = document.getElementById('electro-cable').checked;
    
    // Base price per m²: 800 RUB
    const basePrice = 800;
    let total = area * basePrice * type;
    
    // Sockets: 500 RUB each
    total += sockets * 500;
    
    // Light points: 700 RUB each
    total += light * 700;
    
    // Electrical panel
    if (panel) {
        total += 15000;
    }
    
    // Cable replacement: 500 RUB per m (assume 3m per m²)
    if (cable) {
        total += area * 3 * 500;
    }
    
    document.getElementById('electro-total').textContent = total.toLocaleString('ru-RU') + ' ₽';
    
    // Track event
    trackEvent('Calculator', 'Calculate', 'Electro');
}

/**
 * Initialize Scroll Animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Observe all scroll reveal elements
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-blur').forEach(function(el) {
        observer.observe(el);
    });
}

window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    trackEvent('Page', 'View', window.location.pathname);
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        trackEvent('Page', 'Visible', window.location.pathname);
    }
});
