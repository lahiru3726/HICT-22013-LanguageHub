/* =====================================================================
   MAIN.JS
   ---------------------------------------------------------------------
   1) Spectacles eye-tracking  — the two white "eye ball" ellipses
      inside the inlined spectacles SVG follow the mouse cursor
      anywhere on the page, like the character is looking at it.
   2) Nav "Languages" dropdown — click to open/close, closes on
      outside click.
   3) Page-enter animations    — page 1 plays its entrance once on
      load (400ms delay / 1100ms gentle ease). Pages 2-4 replay their
      entrance every time they scroll into view (mouse wheel enters
      that section), 1000ms gentle ease, using an IntersectionObserver.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -------------------------------------------------------------
     1) EYE TRACKING
     ------------------------------------------------------------- */
 /* -------------------------------------------------------------
     1) EYE TRACKING
     ------------------------------------------------------------- */
  (function initEyeTracking() {
    const svg = document.getElementById('main-spectacles-svg');
    const eyeLeft = document.getElementById('eye-white-left');
    const eyeRight = document.getElementById('eye-white-right');
    if (!svg || !eyeLeft || !eyeRight) return;

    // Pupil (dark ellipse) centers in the SVG's own 1000x1000 user
    // space — the white highlight can drift toward the cursor but
    // must stay inside this pupil, so we clamp the offset radius.
    const EYES = [
      { el: eyeLeft, cx: 319.89, cy: 499.09 },
      { el: eyeRight, cx: 675.43, cy: 500.67 }
    ];
    
    // CHANGED: Increased from 16 to 35 to give the eyes a much wider tracking range.
    const MAX_OFFSET = 20; 

    function updateEyes(clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      // Convert the mouse position from screen pixels into the SVG's
      // own 1000x1000 viewBox coordinate space.
      const scaleX = 1000 / rect.width;
      const scaleY = 1000 / rect.height;
      const localX = (clientX - rect.left) * scaleX;
      const localY = (clientY - rect.top) * scaleY;

      EYES.forEach(({ el, cx, cy }) => {
        const dx = localX - cx;
        const dy = localY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        
        // CHANGED: Changed "dist / 8" to "dist / 6" so the eye moves 
        // to its new maximum size slightly more responsively.
        const offset = Math.min(MAX_OFFSET, dist / 6);
        
        const nx = (dx / dist) * offset;
        const ny = (dy / dist) * offset;
        el.style.transform = `translate(${nx}px, ${ny}px)`;
      });
    }

    window.addEventListener('mousemove', (e) => {
      updateEyes(e.clientX, e.clientY);
    }, { passive: true });
  })();

  /* -------------------------------------------------------------
     2) LANGUAGES DROPDOWN
     ------------------------------------------------------------- */
  (function initDropdown() {
    const dropdown = document.getElementById('langDropdown');
    const toggle = document.getElementById('langToggle');
    if (!dropdown || !toggle) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdown.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  /* -------------------------------------------------------------
     3) PAGE ENTER ANIMATIONS
     ------------------------------------------------------------- */
  (function initPageAnimations() {
    const pages = document.querySelectorAll('[data-animate-page]');
    const landing = document.getElementById('page-1');

    // Every scroll/mouse-wheel entrance (pages 2-4, and page 1 on
    // any re-entry after the very first load) uses the observer.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          entry.target.classList.add('in-view');
          if (entry.target === landing && landing.classList.contains('has-loaded')) {
            landing.classList.add('replayed');
          }
        } else {
          // Reset so the animation can gently replay next time the
          // page re-enters view, matching the "mouse enters that
          // page" trigger described in the brief.
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: [0, 0.4, 0.6, 1] });

    pages.forEach((page) => observer.observe(page));

    // Page 1's very first entrance: 400ms delay, 1100ms duration,
    // fired once automatically on load (not on scroll).
    window.addEventListener('load', () => {
      setTimeout(() => {
        landing.classList.add('in-view', 'has-loaded');
      }, 50); // CSS transition-delay already applies the real 400ms
    });
  })();

});