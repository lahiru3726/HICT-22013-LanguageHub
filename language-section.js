// ===================================
// LANGUAGE SWITCHING FUNCTIONALITY
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    const dropdownLinks = document.querySelectorAll('.dropdown-menu a[data-language]');
    const languageSections = document.querySelectorAll('.language-section');
    const dropdownBtn = document.querySelector('.dropdown-btn');

    // Set initial language to IELTS
    let currentLanguage = 'ielts';
    
    // Auto-transition settings
    const languages = ['ielts', 'japanese', 'korean', 'italy'];
    let currentIndex = 0;
    let autoSwitchInterval;
    const AUTO_SWITCH_DELAY = 2000; // 2 seconds
    let isAutoSwitching = true;

    /**
     * Switch the language section
     * @param {string} language - The language to switch to
     */
    function switchLanguage(language) {
        // Don't switch if already on the same language
        if (language === currentLanguage) return;

        currentLanguage = language;

        // Update all language sections
        languageSections.forEach(section => {
            const sectionLanguage = section.getAttribute('data-language');
            
            if (sectionLanguage === language) {
                // Show the current language section
                section.setAttribute('data-active', 'true');
                section.classList.add('fade-in');
            } else {
                // Hide other language sections
                section.setAttribute('data-active', 'false');
                section.classList.remove('fade-in');
            }
        });

        // Update dropdown button text
        updateDropdownButtonText(language);

        // Optional: Log the language change
        console.log(`Language switched to: ${language.toUpperCase()}`);
    }

    /**
     * Update dropdown button text based on selected language
     * @param {string} language - The selected language
     */
    function updateDropdownButtonText(language) {
        const languageNames = {
            'ielts': 'IELTS Exam',
            'japanese': 'Japanese',
            'korean': 'Korean',
            'italy': 'Italy'
        };

        dropdownBtn.textContent = languageNames[language] || 'Languages';
    }

    /**
     * Start automatic language switching every 2 seconds
     */
    function startAutoSwitch() {
        autoSwitchInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % languages.length;
            switchLanguage(languages[currentIndex]);
        }, AUTO_SWITCH_DELAY);
    }

    /**
     * Stop automatic language switching
     */
    function stopAutoSwitch() {
        if (autoSwitchInterval) {
            clearInterval(autoSwitchInterval);
        }
    }

    /**
     * Handle dropdown link clicks
     */
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const selectedLanguage = this.getAttribute('data-language');
            
            // Stop auto-switching when user manually selects
            stopAutoSwitch();
            isAutoSwitching = false;
            
            switchLanguage(selectedLanguage);
            
            // Update current index
            currentIndex = languages.indexOf(selectedLanguage);

            // Close the dropdown after selection (optional)
            closeDropdown();
        });
    });

    /**
     * Close the dropdown menu
     */
    function closeDropdown() {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        // Note: The dropdown closes automatically due to CSS hover state,
        // but we can add additional logic here if needed
    }

    /**
     * Handle keyboard navigation
     */
    document.addEventListener('keydown', function(e) {
        // Press ESC to close dropdown
        if (e.key === 'Escape') {
            closeDropdown();
        }

        // Optional: Add keyboard shortcuts for language switching
        // Alt + 1 for IELTS, Alt + 2 for Japanese, etc.
        if (e.altKey) {
            const languageMap = {
                '1': 'ielts',
                '2': 'japanese',
                '3': 'korean',
                '4': 'italy'
            };

            if (languageMap[e.key]) {
                e.preventDefault();
                switchLanguage(languageMap[e.key]);
            }
        }
    });

    /**
     * Optional: Add smooth scroll behavior
     */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && document.querySelector(targetId)) {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /**
     * Initialize: Set up the initial state
     */
    function initialize() {
        // Set the initial active language
        switchLanguage('ielts');
        updateDropdownButtonText('ielts');

        // Start automatic switching
        startAutoSwitch();
        isAutoSwitching = true;

        // Log initialization
        console.log('Language Section initialized with auto-transition every 2 seconds');
    }

    // Run initialization
    initialize();
});

// ===================================
// OPTIONAL: ADVANCED FEATURES
// ===================================

/**
 * Optional function to programmatically switch language
 * Can be called from anywhere in your application
 */
window.setLanguage = function(language) {
    const event = new Event('languageChange');
    event.language = language;
    
    const dropdownLink = document.querySelector(`.dropdown-menu a[data-language="${language}"]`);
    if (dropdownLink) {
        dropdownLink.click();
    }
};

/**
 * Optional function to get current language
 */
window.getCurrentLanguage = function() {
    return document.querySelector('.language-section[data-active="true"]')?.getAttribute('data-language') || 'ielts';
};

/**
 * Optional: Listen for custom language change events
 */
document.addEventListener('languageChange', function(e) {
    if (e.language) {
        console.log(`External language change triggered: ${e.language}`);
    }
});

/**
 * Resume auto-switching after user interaction
 * Optional: Uncomment to enable auto-resume after 10 seconds of inactivity
 */
/*
let resumeTimeout;
document.addEventListener('click', function() {
    if (!isAutoSwitching) {
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            startAutoSwitch();
            isAutoSwitching = true;
            console.log('Auto-switching resumed after inactivity');
        }, 10000); // Resume after 10 seconds of no clicks
    }
});
*/

// ===================================
// PERFORMANCE: Lazy load SVG content
// ===================================

/**
 * Optional: Implement lazy loading for SVG illustrations
 * Uncomment to use if you have large SVG files
 */
/*
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const svg = entry.target.querySelector('.illustration-svg');
            if (svg && !svg.src) {
                svg.src = svg.dataset.src;
            }
        }
    });
});

document.querySelectorAll('.language-illustration').forEach(el => {
    observer.observe(el);
});
*/
