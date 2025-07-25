/**
 * Theme Utility Functions
 * Centralized utilities to reduce code duplication
 */

class ThemeUtils {
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} Debounced function
   */
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  /**
   * Format price with currency
   * @param {number} price - Price in cents
   * @param {string} currency - Currency code
   * @returns {string} Formatted price
   */
  static formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price / 100);
  }

  /**
   * Safe DOM query selector
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (optional)
   * @returns {Element|null} Found element or null
   */
  static $(selector, context = document) {
    return context.querySelector(selector);
  }

  /**
   * Safe DOM query selector all
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (optional)
   * @returns {NodeList} Found elements
   */
  static $$(selector, context = document) {
    return context.querySelectorAll(selector);
  }

  /**
   * Add event listener with automatic cleanup
   * @param {Element} element - Target element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {object} options - Event options
   */
  static addEvent(element, event, handler, options = {}) {
    if (!element) return;
    
    element.addEventListener(event, handler, options);
    
    // Store cleanup function for later use
    if (!element._themeCleanup) {
      element._themeCleanup = [];
    }
    element._themeCleanup.push(() => {
      element.removeEventListener(event, handler, options);
    });
  }

  /**
   * Clean up all event listeners for an element
   * @param {Element} element - Target element
   */
  static cleanup(element) {
    if (element && element._themeCleanup) {
      element._themeCleanup.forEach(cleanup => cleanup());
      element._themeCleanup = [];
    }
  }

  /**
   * Animate element with CSS classes
   * @param {Element} element - Target element
   * @param {string} animationClass - Animation CSS class
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} Animation promise
   */
  static animate(element, animationClass, duration = 300) {
    return new Promise((resolve) => {
      element.classList.add(animationClass);
      
      setTimeout(() => {
        element.classList.remove(animationClass);
        resolve();
      }, duration);
    });
  }

  /**
   * Lazy load images
   * @param {string} selector - Image selector
   */
  static lazyLoadImages(selector = 'img[data-src]') {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      this.$$(selector).forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      this.$$(selector).forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }

  /**
   * Show/hide loading state
   * @param {Element} element - Target element
   * @param {boolean} show - Show or hide loading
   */
  static toggleLoading(element, show = true) {
    if (!element) return;
    
    if (show) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
    } else {
      element.classList.remove('loading');
      element.removeAttribute('aria-busy');
    }
  }

  /**
   * Handle fetch errors gracefully
   * @param {Response} response - Fetch response
   * @returns {Response} Response if ok, throws error if not
   */
  static handleFetchResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }
}

// Initialize lazy loading when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ThemeUtils.lazyLoadImages();
  });
} else {
  ThemeUtils.lazyLoadImages();
}

// Export for use in other scripts
window.ThemeUtils = ThemeUtils;