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

                if (bTop <= yTop) yTop = bBot;
                else if (bBot >= yBot) yBot = bTop;
            }

            if (yBot - yTop < 1) continue;
            addLine(moonSvg, x, yTop, yBot);
        }
    }

    function addLine(svg, x, y1, y2) {
        var l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('x1', x);
        l.setAttribute('y1', y1);
        l.setAttribute('x2', x);
        l.setAttribute('y2', y2);
        l.setAttribute('stroke', '#f4f4f5');
        l.setAttribute('stroke-width', '2');
        l.setAttribute('stroke-linecap', 'butt');
        svg.appendChild(l);
    }

    // ========================================================
    // 1b. SCANLINE CLOUDS — procedural shape calculus
    //     Like the moon, clouds are drawn from vertical lines.
    //     Shape is defined by overlapping circle formulas
    //     (union of puffs). No clipPath, no defs, no dead code.
    //     Lines appended directly to clean empty SVG elements.
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');

    var cloudConfigs = [
        { w: 240, h: 100, speed: 0.5, startX: 0, baseTop: 10, color: '#f4f4f5',
          puffs: [
              { cx: 70, cy: 60, r: 38 },
              { cx: 120, cy: 45, r: 45 },
              { cx: 175, cy: 55, r: 40 },
              { cx: 50, cy: 70, r: 30 },
              { cx: 200, cy: 65, r: 32 }
          ]
        },
        { w: 160, h: 75, speed: -0.4, startX: 0, baseTop: 32, color: '#7c3aed',
          puffs: [
              { cx: 45, cy: 42, r: 30 },
              { cx: 80, cy: 35, r: 35 },
              { cx: 120, cy: 40, r: 32 },
              { cx: 140, cy: 50, r: 25 }
          ]
        },
        { w: 300, h: 120, speed: 0.35, startX: 0, baseTop: 55, color: '#f4f4f5',
          puffs: [
              { cx: 60, cy: 70, r: 42 },
              { cx: 110, cy: 55, r: 50 },
              { cx: 165, cy: 48, r: 48 },
              { cx: 220, cy: 58, r: 44 },
              { cx: 270, cy: 68, r: 36 },
              { cx: 40, cy: 80, r: 30 }
          ]
        }
    ];

    // Stagger starting positions across different sides
    var initVW = window.innerWidth;
    cloudConfigs[0].startX = -cloudConfigs[0].w;        // off-screen LEFT
    cloudConfigs[1].startX = initVW + 50;               // off-screen RIGHT
    cloudConfigs[2].startX = Math.round(initVW * 0.3);  // center-LEFT

    for (var ci = 0; ci < cloudEls.length; ci++) {
        var cfg = cloudConfigs[ci];
        if (!cfg) continue;

        cfg.x = cfg.startX;
        cfg.phase = Math.random() * Math.PI * 2;
        cfg.bobAmp = 4 + Math.random() * 5;
        cfg.bobFreq = 0.0003 + Math.random() * 0.0002;
        cfg.baseOpacity = 0.4 + Math.random() * 0.15;

        // Clear any existing content from the SVG
        cloudEls[ci].innerHTML = '';
        cloudEls[ci].setAttribute('viewBox', '0 0 ' + cfg.w + ' ' + cfg.h);
        cloudEls[ci].style.top = cfg.baseTop + 'vh';
        cloudEls[ci].style.width = cfg.w + 'px';
        cloudEls[ci].style.height = cfg.h + 'px';

        // Draw vertical scanlines using circle-union shape calculus
        var lineSpacing = 3;
        for (var lx = 0; lx < cfg.w; lx += lineSpacing) {
            var yTop = cfg.h;
            var yBot = 0;
            var hit = false;

            for (var p = 0; p < cfg.puffs.length; p++) {
                var puff = cfg.puffs[p];
                var dx = lx - puff.cx;
                var disc = puff.r * puff.r - dx * dx;
                if (disc <= 0) continue;
                var half = Math.sqrt(disc);
                var top = puff.cy - half;
                var bot = puff.cy + half;
                if (top < yTop) yTop = top;
                if (bot > yBot) yBot = bot;
                hit = true;
            }

            if (!hit || yBot - yTop < 1) continue;
            if (yTop < 0) yTop = 0;
            if (yBot > cfg.h) yBot = cfg.h;

            var line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', lx);
            line.setAttribute('y1', yTop.toFixed(1));
            line.setAttribute('x2', lx);
            line.setAttribute('y2', yBot.toFixed(1));
            line.setAttribute('stroke', cfg.color);
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-linecap', 'butt');
            cloudEls[ci].appendChild(line);
        }
    }

    // ========================================================
    // 2. UNIFIED ANIMATION LOOP
    //    - Clouds: quantized drift (8px snap = ASCII-GIF stutter)
    //    - Seamless viewport wrapping (exits fully before wrap)
    //    - Vertical bob (sinusoidal, also quantized)
    //    - Scroll-linked fade + parallax
    //    - Moon fade
    //    - Card focus timeline
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var cards = document.querySelectorAll('.projects__track .card');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var cachedScrollY = 0;
    var cachedVH = window.innerHeight;
    var cachedVW = window.innerWidth;
    var QUANTIZE = 8; // px snap grid for ASCII-GIF feel

    window.addEventListener('resize', function () {
        cachedVH = window.innerHeight;
        cachedVW = window.innerWidth;
    }, { passive: true });

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