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
        menu.classList.add('max-h-[700px]');
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.add('max-h-0');
        menu.classList.remove('max-h-[700px]');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
        document.body.style.overflow = 'auto';
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

window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    trackEvent('Page', 'View', window.location.pathname);
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        trackEvent('Page', 'Visible', window.location.pathname);
    }
});
