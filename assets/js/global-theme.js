// Apply Global Theme (Gradient & Dark Mode) & Dynamic Contrast
(function () {
    const root = document.documentElement;

    // Sync Dark Mode from theme.js selection
    const savedMode = localStorage.getItem('procodingThemeMode');
    if (savedMode === 'dark' || savedMode === 'light') {
        root.setAttribute('data-theme', savedMode);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.setAttribute('data-theme', 'light');
    }

    // Sync Handedness
    const savedHand = localStorage.getItem('procodingHandedness');
    if (savedHand === 'left' || savedHand === 'right') {
        root.setAttribute('data-handedness', savedHand);
    } else {
        root.setAttribute('data-handedness', 'right');
    }

    // Load gradient theme from localStorage
    const savedTheme = localStorage.getItem('themeSettings');
    if (savedTheme) {
        try {
            const theme = JSON.parse(savedTheme);
            if (theme.start && theme.end) {
                applyTheme(theme.start, theme.end);
            }
        } catch (e) { }
    } else {
        const savedColor = localStorage.getItem('themeColor');
        if (savedColor) {
            applyTheme(savedColor, '#764ba2');
        }
    }

    function applyTheme(start, end) {
        const gradient = `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
        root.style.setProperty('--theme-color', start);
        root.style.setProperty('--theme-bg-gradient', gradient);
        // Only set --bg-primary in light mode.
        // In dark mode, theme.css [data-theme="dark"] provides the background via CSS cascade.
        // Setting it as an inline style would override the CSS dark gradient.
        if (root.getAttribute('data-theme') !== 'dark') {
            root.style.setProperty('--bg-primary', gradient);
        } else {
            root.style.removeProperty('--bg-primary');
        }
        updateDynamicContrast(start, end);
    }

    function updateDynamicContrast(c1, c2) {
        function getBrightness(hex) {
            if (!hex || hex[0] !== '#') return 0;
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);
            return (r * 299 + g * 587 + b * 114) / 1000;
        }

        const b1 = getBrightness(c1);
        const b2 = getBrightness(c2);
        const avgBrightness = (b1 + b2) / 2;

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const isEffectiveDark = isDarkMode || avgBrightness < 100;
        const isLightBg = !isEffectiveDark && avgBrightness > 125;

        // 1. Handle Page Background Contrast
        if (isLightBg) {
            root.style.setProperty('--dynamic-text-primary', '#333333');
            root.style.setProperty('--dynamic-text-secondary', 'rgba(0, 0, 0, 0.7)');
            root.style.setProperty('--dynamic-nav-bg', 'rgba(0, 0, 0, 0.08)');
            root.style.setProperty('--dynamic-nav-border', 'rgba(0, 0, 0, 0.12)');
            root.style.setProperty('--dynamic-nav-hover', 'rgba(0, 0, 0, 0.15)');
            root.style.setProperty('--dynamic-search-bg', 'rgba(0, 0, 0, 0.05)');
            root.style.setProperty('--dynamic-search-border', 'rgba(0, 0, 0, 0.1)');
        } else {
            root.style.setProperty('--dynamic-text-primary', '#ffffff');
            root.style.setProperty('--dynamic-text-secondary', 'rgba(255, 255, 255, 0.85)');
            root.style.setProperty('--dynamic-nav-bg', 'rgba(255, 255, 255, 0.15)');
            root.style.setProperty('--dynamic-nav-border', 'rgba(255, 255, 255, 0.2)');
            root.style.setProperty('--dynamic-nav-hover', 'rgba(255, 255, 255, 0.25)');
            root.style.setProperty('--dynamic-search-bg', 'rgba(255, 255, 255, 0.15)');
            root.style.setProperty('--dynamic-search-border', 'rgba(255, 255, 255, 0.2)');
        }

        // 2. Handle Button/Card Text Contrast
        const isLightBtn = b1 > 180;
        if (isLightBtn) {
            root.style.setProperty('--dynamic-btn-text', '#333333');
            if (isLightBg || b1 > 240) {
                root.style.setProperty('--dynamic-btn-border', 'rgba(0, 0, 0, 0.2)');
                root.style.setProperty('--dynamic-btn-glow', '0 4px 15px rgba(0, 0, 0, 0.1)');
            } else {
                root.style.setProperty('--dynamic-btn-border', 'rgba(0, 0, 0, 0.1)');
                root.style.setProperty('--dynamic-btn-glow', 'none');
            }
        } else {
            root.style.setProperty('--dynamic-btn-text', '#ffffff');
            if (isEffectiveDark || b1 < 50) {
                root.style.setProperty('--dynamic-btn-border', 'rgba(255, 255, 255, 0.5)');
                root.style.setProperty('--dynamic-btn-glow', `0 4px 15px ${c1 === '#000000' ? 'rgba(255,255,255,0.1)' : c1 + '88'}`);
            } else {
                root.style.setProperty('--dynamic-btn-border', 'transparent');
                root.style.setProperty('--dynamic-btn-glow', 'none');
            }
        }

        const glassOpacity = isEffectiveDark ? '0.7' : '0.5';
        root.style.setProperty('--node-glass-opacity', glassOpacity);
        root.style.setProperty('--dynamic-contrast-text', isLightBg ? '#333333' : '#ffffff');
        root.style.setProperty('--dynamic-contrast-secondary', isLightBg ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)');
    }

    // Watch for global theme changes (data-theme attribute)
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                const isDark = root.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    // Remove inline --bg-primary so CSS dark mode gradient takes over
                    root.style.removeProperty('--bg-primary');
                } else {
                    // Restore user's gradient from localStorage
                    const themeStr = localStorage.getItem('themeSettings');
                    if (themeStr) {
                        try {
                            const t = JSON.parse(themeStr);
                            if (t.start && t.end) {
                                root.style.setProperty('--bg-primary', `linear-gradient(135deg, ${t.start} 0%, ${t.end} 100%)`);
                            }
                        } catch(e) {}
                    }
                }
                const themeStr = localStorage.getItem('themeSettings');
                if (themeStr) {
                    try {
                        const theme = JSON.parse(themeStr);
                        updateDynamicContrast(theme.start, theme.end);
                    } catch(e) {}
                }
            }
        });
    });
    themeObserver.observe(root, { attributes: true });

    // ─── NEW: STORAGE LISTENER FOR REAL-TIME SYNC ───
    // Fired on other tabs/windows when localStorage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'themeSettings') {
            try {
                const theme = JSON.parse(e.newValue);
                if (theme && theme.start && theme.end) {
                    applyTheme(theme.start, theme.end);
                }
            } catch (err) { }
        }
        if (e.key === 'procodingThemeMode') {
            const newMode = e.newValue;
            if (newMode === 'dark' || newMode === 'light') {
                root.setAttribute('data-theme', newMode);
                // The MutationObserver above will trigger updateDynamicContrast
            }
        }
        if (e.key === 'procodingHandedness') {
            const newHand = e.newValue;
            if (newHand === 'left' || newHand === 'right') {
                root.setAttribute('data-handedness', newHand);
            }
        }
    });
    // ─── BROADCAST CHANNEL: real-time sync from settings page ───
    // Fires instantly on any open tab when settings changes the theme
    try {
        const bc = new BroadcastChannel('procoding_theme');
        bc.onmessage = (e) => {
            const d = e.data;
            if (d.type === 'themeSettings' && d.start && d.end) {
                applyTheme(d.start, d.end);
            }
            if (d.type === 'themeMode') {
                root.setAttribute('data-theme', d.mode);
            }
            if (d.type === 'handedness') {
                root.setAttribute('data-handedness', d.hand);
            }
        };
    } catch(e) {}
    // ─── UNIVERSAL SAFE-AREA TOP NAV FIX ───
    // Directly reads the device's safe-area-inset-top and applies it as inline
    // padding-top to every .top-nav on the page. This bypasses ALL CSS specificity
    // conflicts from page-level landscape media queries that override theme.css.
    // This is the definitive fix for Samsung S8 / Android status bar cropping.
    function applySafeAreaFix() {
        // Use CSS custom property trick to read env() value into JS
        const testEl = document.createElement('div');
        testEl.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none;z-index:-1;';
        document.body.appendChild(testEl);
        const insetTop = testEl.getBoundingClientRect().height;
        document.body.removeChild(testEl);

        if (insetTop > 0) {
            const navs = document.querySelectorAll('.top-nav');
            navs.forEach(function(nav) {
                const currentPT = parseFloat(getComputedStyle(nav).paddingTop) || 0;
                // Only add if not already padded enough
                if (currentPT < insetTop) {
                    nav.style.setProperty('padding-top', insetTop + 'px', 'important');
                }
            });

            // Also fix body if it has no wrapper
            const hasWrapper = document.querySelector('.main-container, .landscape-scroller, .chat-container');
            if (!hasWrapper) {
                const currentBodyPT = parseFloat(getComputedStyle(document.body).paddingTop) || 0;
                if (currentBodyPT < insetTop) {
                    document.body.style.setProperty('padding-top', insetTop + 'px', 'important');
                }
            }
        }
    }

    // Run on DOM ready and again after full load (to catch dynamically injected navs)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applySafeAreaFix);
    } else {
        applySafeAreaFix();
    }
    window.addEventListener('load', applySafeAreaFix);
    // Re-apply on orientation change (landscape ↔ portrait transition)
    window.addEventListener('orientationchange', function() {
        setTimeout(applySafeAreaFix, 300);
    });
    window.addEventListener('resize', function() {
        clearTimeout(window._safeAreaTimer);
        window._safeAreaTimer = setTimeout(applySafeAreaFix, 200);
    });
})();
