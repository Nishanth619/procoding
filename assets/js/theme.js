/**
 * Pro Coding - Theme Manager
 * Handles dark/light mode toggle and persistence
 */

(function () {
    'use strict';

    const THEME_KEY = 'procodingThemeMode';
    const DARK = 'dark';
    const LIGHT = 'light';

    /**
     * Get the user's preferred theme
     * Priority: 1. Saved preference 2. System preference 3. Light (default)
     */
    function getPreferredTheme() {
        // Check saved preference
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === DARK || saved === LIGHT) {
            return saved;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK;
        }

        // Default to light
        return LIGHT;
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme) {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);

        // Critical: theme-critical.js sets --bg-primary as an inline style which
        // overrides the CSS [data-theme="dark"] rule. We must manage it manually.
        if (theme === DARK) {
            // Remove inline override so CSS dark mode gradient from theme.css takes effect
            root.style.removeProperty('--bg-primary');
        } else {
            // Restore user's saved gradient as inline style (takes priority over CSS default)
            try {
                const saved = localStorage.getItem('themeSettings');
                if (saved) {
                    const t = JSON.parse(saved);
                    if (t && t.start && t.end) {
                        root.style.setProperty('--bg-primary', `linear-gradient(135deg, ${t.start} 0%, ${t.end} 100%)`);
                    }
                }
            } catch(e) {}
        }

        // Update any toggle buttons on the page
        updateToggleButtons(theme);
    }

    /**
     * Toggle between light and dark mode
     */
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || LIGHT;
        const next = current === DARK ? LIGHT : DARK;
        applyTheme(next);
    }

    /**
     * Update toggle button states
     */
    function updateToggleButtons(theme) {
        const toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(toggle => {
            toggle.setAttribute('aria-label', theme === DARK ? 'Switch to light mode' : 'Switch to dark mode');
            toggle.setAttribute('title', theme === DARK ? 'Switch to Light Mode' : 'Switch to Dark Mode');
        });
    }

    /**
     * Create and inject toggle button into navigation
     */
    function createToggleButton() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.type = 'button';
        toggle.innerHTML = `
            <!-- Moon icon (visible in light mode) - Filled crescent -->
            <svg class="icon-moon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
            <!-- Sun icon (visible in dark mode) - Radiant sun -->
            <svg class="icon-sun" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
        `;

        // Add click animation
        toggle.addEventListener('click', function (e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: ripple-effect 0.6s ease-out;
                pointer-events: none;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
            `;

            // Add ripple animation keyframes if not already added
            if (!document.getElementById('theme-toggle-animations')) {
                const style = document.createElement('style');
                style.id = 'theme-toggle-animations';
                style.textContent = `
                    @keyframes ripple-effect {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            toggle.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            // Toggle theme
            toggleTheme();
        });

        return toggle;
    }

    /**
     * Insert toggle button into the page
     */
    function insertToggleButton() {
        // Find appropriate insertion points
        const navIcons = document.querySelector('.nav-icons');
        const navLeft = document.querySelector('.nav-left');
        const topNav = document.querySelector('.top-nav');

        const toggle = createToggleButton();

        if (navIcons) {
            // Insert as first child of nav-icons
            navIcons.insertBefore(toggle, navIcons.firstChild);
        } else if (navLeft) {
            // Append to nav-left area
            navLeft.appendChild(toggle);
        } else if (topNav) {
            // Append to top-nav
            topNav.appendChild(toggle);
        } else {
            // Create a fixed position toggle
            toggle.style.position = 'fixed';
            toggle.style.top = '20px';
            toggle.style.right = '20px';
            toggle.style.zIndex = '9999';
            document.body.appendChild(toggle);
        }
    }

    /**
     * Listen for system theme changes
     */
    function watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't set a preference
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK : LIGHT);
                }
            });
        }
    }

    /**
     * Initialize theme system
     */
    function init() {
        // Apply theme immediately (before DOM is ready for faster paint)
        const theme = getPreferredTheme();
        applyTheme(theme);

        // Wait for DOM to insert toggle button
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                insertToggleButton();
                watchSystemTheme();
            });
        } else {
            insertToggleButton();
            watchSystemTheme();
        }
    }

    // Expose toggle function globally
    window.toggleTheme = toggleTheme;
    window.setTheme = applyTheme;

    // Initialize
    init();
})();
