/* ============================================================\
   Nolan Ream — Portfolio
   Procedural Cloud Vectors · 8px Grid Quantization Engine
   · Focus Timeline Transformation
   ============================================================ */

(function () {
    'use strict';

    // Set layout time stamp variable
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var QUANTIZE = 8; // Retro frame step value grid spacing multiplier

    // Cache dynamic window measurements
    var cachedVW = window.innerWidth;
    var cachedVH = window.innerHeight;

    window.addEventListener('resize', function() {
        cachedVW = window.innerWidth;
        cachedVH = window.innerHeight;
    }, { passive: true });

    // Accessibility fallback check
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ========================================================\
    // 1. PROCEDURAL VECTOR RENDER ENGINE
    // ========================================================\
    
    // Moon Generation (Isolated scanline crescent math)
    var moonSvg = document.querySelector('.moon');
    if (moonSvg) {
        var cx = 100, cy = 100, R = 85;
        var bx = 145, by = 95, bR = 75;
        var spacing = 3;

        for (var x = cx - R; x <= cx + R; x += spacing) {
            var dx = x - cx;
            var outerH = Math.sqrt(Math.max(0, R * R - dx * dx));
            if (outerH < 1) continue;

            var yTop = cy - outerH;
            var yBot = cy + outerH;

            var dxBite = x - bx;
            var biteDisc = bR * bR - dxBite * dxBite;

            if (biteDisc > 0) {
                var innerH = Math.sqrt(biteDisc);
                var maskTop = by - innerH;
                var maskBot = by + innerH;

                if (yTop < maskBot && yBot > maskTop) {
                    if (yTop < maskTop) {
                        createSvgLine(moonSvg, x, yTop, x, maskTop, '#f4f4f5', 2);
                    }
                    if (yBot > maskBot) {
                        createSvgLine(moonSvg, x, maskBot, x, yBot, '#f4f4f5', 2);
                    }
                    continue;
                }
            }
            createSvgLine(moonSvg, x, yTop, x, yBot, '#f4f4f5', 2);
        }
    }

    // Procedural Line Builder for Cloud Definitions
    function buildCloudLines(selector, width, color) {
        var container = document.querySelector(selector + ' .lines-group');
        if (!container) return;
        
        // Populate the container with crisp line elements across its grid system width
        for (var x = 0; x <= width; x += 3) {
            var line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', 200); // Exceed height to fully cover masks
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '2');
            container.appendChild(line);
        }
    }

    // Fire generation inside definitions
    buildCloudLines('.cloud--a', 260, '#f4f4f5');
    buildCloudLines('.cloud--b', 180, '#7c3aed'); // Purple accent variant
    buildCloudLines('.cloud--c', 340, '#f4f4f5');

    function createSvgLine(parent, x1, y1, x2, y2, color, strokeW) {
        var line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeW);
        parent.appendChild(line);
    }

    // ========================================================\
    // 2. CONFIGURING STATE & RANDOM STARTING PLACEMENTS
    // ========================================================\
    var clouds = [
        document.querySelector('.cloud--a'),
        document.querySelector('.cloud--b'),
        document.querySelector('.cloud--c')
    ];

    // Seed configuration states explicitly separating structural tracks
    var cloudConfigs = [
        { speed: 0.22, top: 12, width: 260, baseOpacity: 0.35, dir: 1,  posX: -280 },               // A: Starts off-screen Left, goes Right
        { speed: -0.16, top: 38, width: 180, baseOpacity: 0.45, dir: -1, posX: cachedVW + 100 },    // B: Starts off-screen Right, goes Left
        { speed: 0.12, top: 68, width: 340, baseOpacity: 0.25, dir: 1,  posX: cachedVW * 0.25 }     // C: Starts Center-Left, goes Right
    ];

    // Align structural elements visually during pre-render setup
    for (var c = 0; c < clouds.length; c++) {
        if (clouds[c]) {
            clouds[c].style.top = cloudConfigs[c].top + 'vh';
        }
    }

    var scrollY = window.pageYOffset;
    function onScroll() {
        scrollY = window.pageYOffset;
    }

    // ========================================================\
    // 3. ANIME FRAME EXECUTION LOOP (Quantized 8px Grid)
    // ========================================================\
    var cards = document.querySelectorAll('.projects__track .card');

    function tick(timestamp) {
        var heroRatio = Math.min(scrollY / cachedVH, 1);

        // --- Handle Background Moon Tracking ---
        if (moonSvg) {
            var moonY = scrollY * 0.35;
            var moonOpacity = (1.0 - (heroRatio * 1.3));
            
            // Quantize moon tracking position coordinates
            var qMoonY = Math.round(moonY / QUANTIZE) * QUANTIZE;
            
            moonSvg.style.transform = 'translateY(' + qMoonY + 'px)';
            moonSvg.style.opacity = Math.max(0, moonOpacity).toFixed(4);
        }

        // --- Handle Cloud Processing ---
        for (var c = 0; c < clouds.length; c++) {
            if (!clouds[c]) continue;

            var cfg = cloudConfigs[c];

            // Append standard drift speed calculations
            cfg.posX += cfg.speed;

            // Clean looping safety bounds checking
            if (cfg.dir === 1 && cfg.posX > cachedVW + 40) {
                cfg.posX = -cfg.width - 40;
            } else if (cfg.dir === -1 && cfg.posX < -cfg.width - 40) {
                cfg.posX = cachedVW + 40;
            }

            // Append a quantized sinusoidal bobbing behavior
            var bob = Math.sin((timestamp / 1000) + (c * 2)) * 12;
            
            // Parallax offset logic
            var parallax = scrollY * (0.15 + (c * 0.1));

            // CRITICAL: Quantize ALL spatial positions to create an exact structural retro-stutter look
            var qX = Math.round(cfg.posX / QUANTIZE) * QUANTIZE;
            var qY = Math.round((bob - parallax) / QUANTIZE) * QUANTIZE;

            clouds[c].style.transform = 'translate3d(' + qX + 'px, ' + qY + 'px, 0)';

            // Clean handling for smooth exit fades out of viewport context
            if (heroRatio >= 0.95) {
                clouds[c].style.opacity = '0';
            } else {
                clouds[c].style.opacity = (cfg.baseOpacity * (1 - heroRatio)).toFixed(3);
            }
        }

        // --- Handle Interactive Cards Focus Viewport Timelines ---
        var viewCenter = cachedVH / 2;
        for (var i = 0; i < cards.length; i++) {
            var rect = cards[i].getBoundingClientRect();
            var cardCenter = rect.top + (rect.height / 2);
            var distance = Math.abs(cardCenter - viewCenter);
            var maxDistance = cachedVH * 0.55;
            var ratio = Math.min(distance / maxDistance, 1);

            var scale = 1.05 - (ratio * 0.17);
            var opacity = 1.0 - (ratio * 0.65);

            cards[i].style.transform = 'scale(' + scale.toFixed(4) + ')';
            cards[i].style.opacity = opacity.toFixed(4);
        }

        requestAnimationFrame(tick);
    }

    // ========================================================\
    // 4. UNIFIED ENGINE INITIALIZATION
    // ========================================================\
    if (!reducedMotion) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        requestAnimationFrame(tick);
    } else {
        // Accessibility alternative mode: present cards clearly without animations
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.opacity = '1';
            cards[i].style.transform = 'scale(1)';
        }
        if (moonSvg) moonSvg.style.opacity = '1';
    }
})();