// Critical Theme Blocker — runs synchronously before first paint to prevent flash
(function () {
    var root = document.documentElement;
    // 1. Dark/Light mode
    var mode = localStorage.getItem('procodingThemeMode');
    var isDarkMode = false;
    if (mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
        isDarkMode = true;
    } else if (mode === 'light') {
        root.setAttribute('data-theme', 'light');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.setAttribute('data-theme', 'dark');
        isDarkMode = true;
    } else {
        root.setAttribute('data-theme', 'light');
    }
    // 2. Handedness
    var hand = localStorage.getItem('procodingHandedness');
    root.setAttribute('data-handedness', (hand === 'left' || hand === 'right') ? hand : 'right');

    // 3. Gradient theme — only set --bg-primary if NOT in dark mode
    // In dark mode, theme.css [data-theme="dark"] provides the dark gradient via CSS cascade
    function applyGradient(start, end) {
        var gradient = 'linear-gradient(135deg, ' + start + ' 0%, ' + end + ' 100%)';
        root.style.setProperty('--theme-color', start);
        root.style.setProperty('--theme-bg-gradient', gradient);
        // Only override --bg-primary in light mode — dark mode gets it from CSS
        if (!isDarkMode) {
            root.style.setProperty('--bg-primary', gradient);
        }
        // Quick contrast calc
        function bright(hex) {
            if (!hex || hex[0] !== '#') return 128;
            var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return (r * 299 + g * 587 + b * 114) / 1000;
        }
        var avg = (bright(start) + bright(end)) / 2;
        var lightBg = !isDarkMode && avg > 125;
        if (lightBg) {
            root.style.setProperty('--dynamic-text-primary', '#333333');
            root.style.setProperty('--dynamic-text-secondary', 'rgba(0,0,0,0.7)');
            root.style.setProperty('--dynamic-nav-bg', 'rgba(0,0,0,0.08)');
            root.style.setProperty('--dynamic-nav-border', 'rgba(0,0,0,0.12)');
            root.style.setProperty('--dynamic-nav-hover', 'rgba(0,0,0,0.15)');
            root.style.setProperty('--dynamic-search-bg', 'rgba(0,0,0,0.05)');
            root.style.setProperty('--dynamic-search-border', 'rgba(0,0,0,0.1)');
        } else {
            root.style.setProperty('--dynamic-text-primary', '#ffffff');
            root.style.setProperty('--dynamic-text-secondary', 'rgba(255,255,255,0.85)');
            root.style.setProperty('--dynamic-nav-bg', 'rgba(255,255,255,0.15)');
            root.style.setProperty('--dynamic-nav-border', 'rgba(255,255,255,0.2)');
            root.style.setProperty('--dynamic-nav-hover', 'rgba(255,255,255,0.25)');
            root.style.setProperty('--dynamic-search-bg', 'rgba(255,255,255,0.15)');
            root.style.setProperty('--dynamic-search-border', 'rgba(255,255,255,0.2)');
        }
    }
    try {
        var saved = localStorage.getItem('themeSettings');
        if (saved) {
            var t = JSON.parse(saved);
            if (t && t.start && t.end) { applyGradient(t.start, t.end); return; }
        }
        var legacy = localStorage.getItem('themeColor');
        if (legacy) { applyGradient(legacy, '#764ba2'); }
    } catch (e) {}
})();
