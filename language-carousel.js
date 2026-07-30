// ===================================
// LANGUAGE CAROUSEL
// ===================================

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector('[data-language-slider]');

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('.language-slide'));
  const tabs = Array.from(slider.querySelectorAll('.language-tab'));
  const actions = Array.from(slider.querySelectorAll('[data-language-action]'));
  const autoRotateDelay = 2000;
  let currentIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let autoRotateTimer = null;

  function notifyParent(language) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'language-slide-select', language: language }, '*');
    }
  }

  function syncState(index) {
    currentIndex = index;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', String(isActive));
    });
  }

  function goToSlide(index, notify = false) {
    if (!slides.length) return;

    const normalizedIndex = ((index % slides.length) + slides.length) % slides.length;
    syncState(normalizedIndex);

    if (notify) {
      notifyParent(slides[normalizedIndex].getAttribute('data-language'));
    }
  }

  function startAutoRotate() {
    stopAutoRotate();
    autoRotateTimer = window.setInterval(function() {
      goToSlide(currentIndex + 1, false);
    }, autoRotateDelay);
  }

  function stopAutoRotate() {
    if (autoRotateTimer !== null) {
      window.clearInterval(autoRotateTimer);
      autoRotateTimer = null;
    }
  }

  tabs.forEach(function(tab, index) {
    tab.addEventListener('click', function() {
      goToSlide(index, true);
      startAutoRotate();
    });
  });

  actions.forEach(function(action) {
    action.addEventListener('click', function() {
      const language = this.getAttribute('data-language-action');
      if (!language) return;
      notifyParent(language);
      const tabIndex = slides.findIndex(function(slide) {
        return slide.getAttribute('data-language') === language;
      });
      if (tabIndex !== -1) {
        goToSlide(tabIndex, true);
      }
    });
  });

  window.setLanguageSlide = function(language) {
    const index = slides.findIndex(function(slide) {
      return slide.getAttribute('data-language') === language;
    });

    if (index !== -1) {
      goToSlide(index, true);
      startAutoRotate();
    }
  };

  window.getCurrentLanguageSlide = function() {
    return slides[currentIndex]?.getAttribute('data-language') || 'ielts';
  };

  goToSlide(currentIndex, false);
  startAutoRotate();
});
