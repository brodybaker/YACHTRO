/**
 * Performance Audit Script
 * Monitors theme performance and provides insights
 * Only runs in development mode
 */

(function() {
  'use strict';
  
  // Only run in development/preview mode
  if (!window.Shopify || !window.Shopify.designMode) {
    return;
  }

  class PerformanceAudit {
    constructor() {
      this.metrics = {};
      this.init();
    }

    init() {
      this.measurePageLoad();
      this.auditImages();
      this.auditCSS();
      this.auditJavaScript();
      this.monitorInteractions();
      
      // Report after page is fully loaded
      if (document.readyState === 'complete') {
        this.generateReport();
      } else {
        window.addEventListener('load', () => this.generateReport());
      }
    }

    measurePageLoad() {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.metrics.pageLoad = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            fullyLoaded: navigation.loadEventEnd - navigation.navigationStart,
            firstPaint: this.getFirstPaint(),
            largestContentfulPaint: this.getLCP()
          };
        }
      }
    }

    getFirstPaint() {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }

    getLCP() {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } else {
          resolve(null);
        }
      });
    }

    auditImages() {
      const images = document.querySelectorAll('img');
      const imageMetrics = {
        total: images.length,
        withoutAlt: 0,
        withoutLazyLoading: 0,
        largeImages: 0
      };

      images.forEach(img => {
        if (!img.alt) imageMetrics.withoutAlt++;
        if (!img.loading || img.loading !== 'lazy') imageMetrics.withoutLazyLoading++;
        if (img.naturalWidth > 1920 || img.naturalHeight > 1080) imageMetrics.largeImages++;
      });

      this.metrics.images = imageMetrics;
    }

    auditCSS() {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      const inlineStyles = document.querySelectorAll('[style]');
      
      this.metrics.css = {
        externalStylesheets: stylesheets.length,
        inlineStyles: inlineStyles.length,
        totalCSSFiles: stylesheets.length
      };
    }

    auditJavaScript() {
      const scripts = document.querySelectorAll('script');
      const jsMetrics = {
        total: scripts.length,
        external: 0,
        inline: 0,
        deferred: 0,
        async: 0
      };

      scripts.forEach(script => {
        if (script.src) {
          jsMetrics.external++;
          if (script.defer) jsMetrics.deferred++;
          if (script.async) jsMetrics.async++;
        } else {
          jsMetrics.inline++;
        }
      });

      this.metrics.javascript = jsMetrics;
    }

    monitorInteractions() {
      let interactionCount = 0;
      
      ['click', 'keydown', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, () => {
          interactionCount++;
        }, { passive: true });
      });

      setTimeout(() => {
        this.metrics.interactions = { count: interactionCount };
      }, 5000);
    }

    generateReport() {
      const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: this.metrics,
        recommendations: this.getRecommendations()
      };

      console.group('🚀 Theme Performance Audit Report');
      console.log('Timestamp:', report.timestamp);
      console.log('URL:', report.url);
      console.log('Metrics:', report.metrics);
      console.log('Recommendations:', report.recommendations);
      console.groupEnd();

      // Store in sessionStorage for theme editor
      sessionStorage.setItem('themePerformanceAudit', JSON.stringify(report));
    }

    getRecommendations() {
      const recommendations = [];

      if (this.metrics.images?.withoutLazyLoading > 5) {
        recommendations.push('Consider adding lazy loading to more images');
      }

      if (this.metrics.css?.inlineStyles > 10) {
        recommendations.push('Reduce inline styles by using CSS classes');
      }

      if (this.metrics.javascript?.deferred < this.metrics.javascript?.external * 0.8) {
        recommendations.push('Consider deferring more JavaScript files');
      }

      if (this.metrics.pageLoad?.fullyLoaded > 3000) {
        recommendations.push('Page load time is over 3 seconds - consider optimization');
      }

      return recommendations;
    }
  }

  // Initialize audit
  new PerformanceAudit();

})();