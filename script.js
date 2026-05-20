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
    // 1b. PROCEDURAL ORGANIC CLOUDS
    //     Each cloud uses SVG <feTurbulence> + <feDisplacementMap>
    //     to generate organic, evolving shapes. No flat bottoms.
    //     Multiple overlapping soft circles create puffy forms.
    //     A morph seed parameter is animated per-frame for
    //     continuous shape evolution.
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');

    // Randomized cloud configurations
    var cloudConfigs = [];
    for (var ci = 0; ci < cloudEls.length; ci++) {
        var baseScale = 0.8 + Math.random() * 0.6; // 0.8 - 1.4
        var w = Math.round((180 + ci * 80) * baseScale);
        var h = Math.round((80 + ci * 30) * baseScale);
        var speed = (0.2 + Math.random() * 0.4) * (ci % 2 === 0 ? 1 : -1);
        var baseTop = 6 + ci * 20 + Math.random() * 8; // vh
        var phase = Math.random() * Math.PI * 2;
        var bobAmp = 3 + Math.random() * 6; // px
        var bobFreq = 0.0004 + Math.random() * 0.0003;
        var color = ci === 1 ? '#7c3aed' : '#f4f4f5';
        var baseOpacity = 0.35 + Math.random() * 0.2;

        cloudConfigs.push({
            w: w, h: h, speed: speed, baseTop: baseTop,
            phase: phase, bobAmp: bobAmp, bobFreq: bobFreq,
            color: color, baseOpacity: baseOpacity, x: Math.random() * 200 - 100,
            morphSeed: Math.random() * 100
        });

        // Set viewBox and build SVG content
        cloudEls[ci].setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        cloudEls[ci].style.top = baseTop + 'vh';
        cloudEls[ci].style.width = w + 'px';
        cloudEls[ci].style.height = h + 'px';

        // Create filter for organic turbulence displacement
        var defs = document.createElementNS(SVG_NS, 'defs');
        var filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', 'cloud-warp-' + ci);
        filter.setAttribute('x', '-20%');
        filter.setAttribute('y', '-20%');
        filter.setAttribute('width', '140%');
        filter.setAttribute('height', '140%');

        var turb = document.createElementNS(SVG_NS, 'feTurbulence');
        turb.setAttribute('type', 'fractalNoise');
        turb.setAttribute('baseFrequency', '0.015');
        turb.setAttribute('numOctaves', '3');
        turb.setAttribute('seed', Math.floor(Math.random() * 999));
        turb.setAttribute('result', 'noise');
        filter.appendChild(turb);

        var disp = document.createElementNS(SVG_NS, 'feDisplacementMap');
        disp.setAttribute('in', 'SourceGraphic');
        disp.setAttribute('in2', 'noise');
        disp.setAttribute('scale', '12');
        disp.setAttribute('xChannelSelector', 'R');
        disp.setAttribute('yChannelSelector', 'G');
        filter.appendChild(disp);

        defs.appendChild(filter);
        cloudEls[ci].appendChild(defs);

        // Draw overlapping circles to form puffy organic cloud body
        var g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('filter', 'url(#cloud-warp-' + ci + ')');

        var numPuffs = 5 + Math.floor(Math.random() * 4);
        for (var p = 0; p < numPuffs; p++) {
            var puffCx = w * (0.15 + (p / numPuffs) * 0.7) + (Math.random() - 0.5) * w * 0.1;
            var puffCy = h * (0.35 + Math.random() * 0.3);
            var puffR = h * (0.25 + Math.random() * 0.2);
            var circle = document.createElementNS(SVG_NS, 'ellipse');
            circle.setAttribute('cx', puffCx.toFixed(1));
            circle.setAttribute('cy', puffCy.toFixed(1));
            circle.setAttribute('rx', puffR.toFixed(1));
            circle.setAttribute('ry', (puffR * (0.7 + Math.random() * 0.4)).toFixed(1));
            circle.setAttribute('fill', color);
            circle.setAttribute('opacity', (0.15 + Math.random() * 0.15).toFixed(3));
            g.appendChild(circle);
        }

        // Add a larger base ellipse for volume
        var baseEllipse = document.createElementNS(SVG_NS, 'ellipse');
        baseEllipse.setAttribute('cx', (w * 0.5).toFixed(1));
        baseEllipse.setAttribute('cy', (h * 0.55).toFixed(1));
        baseEllipse.setAttribute('rx', (w * 0.4).toFixed(1));
        baseEllipse.setAttribute('ry', (h * 0.3).toFixed(1));
        baseEllipse.setAttribute('fill', color);
        baseEllipse.setAttribute('opacity', '0.1');
        g.appendChild(baseEllipse);

        cloudEls[ci].appendChild(g);
    }

    // ========================================================
    // 2. UNIFIED ANIMATION LOOP
    //    - Cloud drift with seamless viewport wrapping
    //    - Vertical sinusoidal bobbing (randomized phase)
    //    - Scroll-linked fade + parallax push
    //    - Moon fade
    //    - Card viewport-center focus
    //    No layout reads for clouds. Cached viewport dims.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var cards = document.querySelectorAll('.projects__track .card');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var cachedScrollY = 0;
    var cachedVH = window.innerHeight;
    var cachedVW = window.innerWidth;

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

        // --- Clouds: drift, bob, wrap, scroll-fade ---
        for (var c = 0; c < clouds.length && c < cloudConfigs.length; c++) {
            var cfg = cloudConfigs[c];

            // Horizontal drift
            cfg.x += cfg.speed * dt;

            // Seamless wrapping: cloud must fully exit before wrapping
            var totalWidth = cfg.w + cachedVW;
            if (cfg.speed > 0 && cfg.x > cachedVW) {
                cfg.x = -cfg.w;
            } else if (cfg.speed < 0 && cfg.x < -cfg.w) {
                cfg.x = cachedVW;
            }

            // Vertical sinusoidal bob
            var bobY = Math.sin(now * cfg.bobFreq + cfg.phase) * cfg.bobAmp;

            // Scroll parallax push (clouds drift down as user scrolls)
            var parallaxY = heroRatio * 40;

            // Combine into transform
            clouds[c].style.transform = 'translate(' + cfg.x.toFixed(1) + 'px, ' + (bobY + parallaxY).toFixed(1) + 'px)';

            // Scroll-linked opacity
            if (heroRatio >= 0.95) {
                clouds[c].style.opacity = '0';
            } else {
                clouds[c].style.opacity = (cfg.baseOpacity * (1 - heroRatio)).toFixed(4);
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
