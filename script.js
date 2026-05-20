/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Parallax Moon/Cloud Exit
   · Viewport-Center Focus Timeline for Project Cards
   ============================================================ */

(function () {
    'use strict';

    // ---- Footer year ----
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // 1. SVG MOON — vertical scanline crescent
    // ========================================================
    var SVG_NS = 'http://www.w3.org/2000/svg';
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
                var biteH = Math.sqrt(biteDisc);
                var bTop = by - biteH;
                var bBot = by + biteH;

                if (bTop <= yTop && bBot >= yBot) continue;

                if (bTop > yTop && bBot < yBot) {
                    addLine(moonSvg, x, yTop, bTop);
                    addLine(moonSvg, x, bBot, yBot);
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
    // 1b. SCANLINE CLOUDS — same line-art style as the moon
    //     Each cloud is an SVG filled with vertical lines
    //     clipped to a cloud-shaped path. Movement is
    //     quantized (snaps to 8px grid) for ASCII-GIF stutter.
    //     Clouds start on DIFFERENT sides of the screen.
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');

    // Cloud definitions: varying sizes, different start sides
    var cloudConfigs = [
        { w: 240, h: 100, spacing: 3, sw: 2, color: '#f4f4f5',
          speed: 0.5, startX: -240, baseTop: 10,
          path: 'M10,85 C25,65 45,45 75,40 C95,28 120,22 145,30 C165,18 185,30 205,42 C220,30 235,45 238,65 C242,78 235,90 220,85 Z' },
        { w: 160, h: 75, spacing: 3, sw: 2, color: '#7c3aed',
          speed: -0.4, startX: 900, baseTop: 32,
          path: 'M8,62 C18,48 35,32 55,30 C72,20 92,18 112,28 C128,18 142,28 152,42 C158,52 155,62 145,60 Z' },
        { w: 300, h: 120, spacing: 3, sw: 2, color: '#f4f4f5',
          speed: 0.35, startX: 200, baseTop: 55,
          path: 'M15,100 C30,80 55,55 85,50 C110,35 140,28 170,35 C195,22 220,32 245,48 C265,35 280,48 290,65 C298,80 292,98 275,100 Z' }
    ];

    // Initialize starting X from viewport width
    var initVW = window.innerWidth;
    cloudConfigs[0].startX = -cloudConfigs[0].w; // starts off-screen LEFT
    cloudConfigs[1].startX = initVW + 50;        // starts off-screen RIGHT
    cloudConfigs[2].startX = Math.round(initVW * 0.3); // starts CENTER-LEFT

    for (var ci = 0; ci < cloudEls.length; ci++) {
        var cfg = cloudConfigs[ci];
        if (!cfg) continue;

        cfg.x = cfg.startX;
        cfg.phase = Math.random() * Math.PI * 2;
        cfg.bobAmp = 4 + Math.random() * 5;
        cfg.bobFreq = 0.0003 + Math.random() * 0.0002;
        cfg.baseOpacity = 0.4 + Math.random() * 0.15;

        cloudEls[ci].setAttribute('viewBox', '0 0 ' + cfg.w + ' ' + cfg.h);
        cloudEls[ci].style.top = cfg.baseTop + 'vh';
        cloudEls[ci].style.width = cfg.w + 'px';
        cloudEls[ci].style.height = cfg.h + 'px';

        // clipPath defines the cloud silhouette
        var defs = document.createElementNS(SVG_NS, 'defs');
        var clipEl = document.createElementNS(SVG_NS, 'clipPath');
        clipEl.setAttribute('id', 'cclip-' + ci);
        var pathEl = document.createElementNS(SVG_NS, 'path');
        pathEl.setAttribute('d', cfg.path);
        clipEl.appendChild(pathEl);
        defs.appendChild(clipEl);
        cloudEls[ci].appendChild(defs);

        // Fill with vertical scanlines (same as moon)
        var g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('clip-path', 'url(#cclip-' + ci + ')');

        for (var lx = 0; lx < cfg.w; lx += cfg.spacing) {
            var line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', lx);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', lx);
            line.setAttribute('y2', cfg.h);
            line.setAttribute('stroke', cfg.color);
            line.setAttribute('stroke-width', cfg.sw);
            line.setAttribute('stroke-linecap', 'butt');
            g.appendChild(line);
        }

        cloudEls[ci].appendChild(g);
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
        cachedScrollY = window.scrollY;
    }

    var prevTime = performance.now();

    function tick(now) {
        var dt = Math.min((now - prevTime) / 16, 3);
        prevTime = now;

        var heroRatio = Math.min(cachedScrollY / cachedVH, 1);

        // --- Moon fade ---
        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // --- Clouds: quantized drift + bob + scroll fade ---
        for (var c = 0; c < clouds.length && c < cloudConfigs.length; c++) {
            var cfg = cloudConfigs[c];

            // Advance position (sub-pixel accumulation)
            cfg.x += cfg.speed * dt;

            // Seamless wrap: only after fully exiting viewport
            if (cfg.speed > 0 && cfg.x > cachedVW + 20) {
                cfg.x = -cfg.w - 20;
            } else if (cfg.speed < 0 && cfg.x < -cfg.w - 20) {
                cfg.x = cachedVW + 20;
            }

            // Quantize to grid for ASCII-GIF stutter
            var snapX = Math.round(cfg.x / QUANTIZE) * QUANTIZE;

            // Vertical bob (also quantized)
            var rawBob = Math.sin(now * cfg.bobFreq + cfg.phase) * cfg.bobAmp;
            var snapBob = Math.round(rawBob / QUANTIZE) * QUANTIZE;

            // Scroll parallax push
            var parallaxY = Math.round((heroRatio * 30) / QUANTIZE) * QUANTIZE;

            // Apply single transform
            clouds[c].style.transform = 'translate(' + snapX + 'px,' + (snapBob + parallaxY) + 'px)';

            // Scroll-linked opacity
            if (heroRatio >= 0.95) {
                clouds[c].style.opacity = '0';
            } else {
                clouds[c].style.opacity = (cfg.baseOpacity * (1 - heroRatio)).toFixed(3);
            }
        }

        // --- Card viewport-center focus ---
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

    // ========================================================
    // 3. INITIALIZE
    // ========================================================
    if (!reducedMotion) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        requestAnimationFrame(tick);
    } else {
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.transform = 'scale(1)';
            cards[i].style.opacity = '1';
        }
    }

})();
