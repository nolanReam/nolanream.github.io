/* ============================================================
   Nolan Ream — Portfolio
   Procedural Scanline Vectors · Quantized Drift · Focus Cards
   ============================================================ */
(function () {
    'use strict';

    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var STEP = 8;

    // ========================================================
    // 1. MOON — scanline crescent (circle minus bite)
    // ========================================================
    var moonSvg = document.querySelector('.moon');
    if (moonSvg) {
        var cx = 100, cy = 100, R = 85;
        var bx = 145, by = 95, bR = 75;
        for (var x = cx - R; x <= cx + R; x += 3) {
            var dx = x - cx;
            var outerH = Math.sqrt(Math.max(0, R * R - dx * dx));
            if (outerH < 1) continue;
            var yTop = cy - outerH;
            var yBot = cy + outerH;

            var dxB = x - bx;
            var bDisc = bR * bR - dxB * dxB;
            if (bDisc > 0) {
                var bH = Math.sqrt(bDisc);
                var bTop = by - bH;
                var bBot = by + bH;
                if (bTop <= yTop && bBot >= yBot) continue;
                if (bTop > yTop && bBot < yBot) {
                    svgLine(moonSvg, x, yTop, bTop, '#f4f4f5', 2);
                    svgLine(moonSvg, x, bBot, yBot, '#f4f4f5', 2);
                    continue;
                }
                if (bTop <= yTop) yTop = bBot;
                else if (bBot >= yBot) yBot = bTop;
            }
            if (yBot - yTop < 1) continue;
            svgLine(moonSvg, x, yTop, yBot, '#f4f4f5', 2);
        }
    }

    function svgLine(parent, x, y1, y2, color, sw) {
        var l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('x1', x);
        l.setAttribute('y1', y1.toFixed(1));
        l.setAttribute('x2', x);
        l.setAttribute('y2', y2.toFixed(1));
        l.setAttribute('stroke', color);
        l.setAttribute('stroke-width', sw);
        l.setAttribute('stroke-linecap', 'butt');
        parent.appendChild(l);
    }

    // ========================================================
    // 2. CLOUDS — scanline shapes via circle-union calculus
    //    Each cloud's silhouette is the union of overlapping
    //    circles. For each x, we find the combined yTop/yBot
    //    and draw a single vertical line. Same math as moon.
    //    viewBox on each SVG defines the internal coordinate
    //    space; CSS defines the rendered pixel size.
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');
    var cloudData = [
        { w: 240, h: 100, color: '#f4f4f5', speed: 0.5, baseTop: 8,
          puffs: [{cx:70,cy:60,r:38},{cx:120,cy:45,r:45},{cx:175,cy:55,r:40},{cx:50,cy:70,r:30},{cx:200,cy:65,r:32}] },
        { w: 160, h: 75, color: '#7c3aed', speed: -0.4, baseTop: 30,
          puffs: [{cx:45,cy:42,r:30},{cx:80,cy:35,r:35},{cx:120,cy:40,r:32},{cx:140,cy:50,r:25}] },
        { w: 300, h: 120, color: '#f4f4f5', speed: 0.35, baseTop: 54,
          puffs: [{cx:60,cy:70,r:42},{cx:110,cy:55,r:50},{cx:165,cy:48,r:48},{cx:220,cy:58,r:44},{cx:270,cy:68,r:36},{cx:40,cy:80,r:30}] }
    ];

    // Stagger starting X: left, right, center
    var vw = window.innerWidth;
    cloudData[0].x = -260;
    cloudData[1].x = vw + 40;
    cloudData[2].x = Math.round(vw * 0.25);

    // Render scanlines into each cloud SVG
    for (var ci = 0; ci < cloudEls.length; ci++) {
        var cd = cloudData[ci];
        if (!cd) continue;
        cd.phase = Math.random() * Math.PI * 2;
        cd.bobAmp = 4 + Math.random() * 4;
        cd.bobFreq = 0.0003 + Math.random() * 0.0002;
        cd.baseOpacity = 0.45;

        for (var lx = 0; lx < cd.w; lx += 3) {
            var yT = cd.h, yB = 0, hit = false;
            for (var p = 0; p < cd.puffs.length; p++) {
                var pf = cd.puffs[p];
                var dx = lx - pf.cx;
                var disc = pf.r * pf.r - dx * dx;
                if (disc <= 0) continue;
                var half = Math.sqrt(disc);
                var t = pf.cy - half;
                var b = pf.cy + half;
                if (t < yT) yT = t;
                if (b > yB) yB = b;
                hit = true;
            }
            if (!hit || yB - yT < 1) continue;
            if (yT < 0) yT = 0;
            if (yB > cd.h) yB = cd.h;
            svgLine(cloudEls[ci], lx, yT, yB, cd.color, 2);
        }
    }

    // ========================================================
    // 3. ANIMATION LOOP
    //    - Moon: opacity fade on scroll
    //    - Clouds: quantized translate3d drift + scroll fade
    //    - Cards: viewport-center scale focus
    //    All positions use translate3d for GPU compositing.
    //    No layout reads for clouds. Cards use getBoundingClientRect.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var cards = document.querySelectorAll('.projects__track .card');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scrollY = 0;
    var vh = window.innerHeight;
    var vwCached = window.innerWidth;

    window.addEventListener('resize', function () {
        vh = window.innerHeight;
        vwCached = window.innerWidth;
    }, { passive: true });

    window.addEventListener('scroll', function () {
        scrollY = window.pageYOffset;
    }, { passive: true });

    function tick(ts) {
        var heroRatio = Math.min(scrollY / vh, 1);

        // Moon fade
        if (moonSvg) {
            moonSvg.style.opacity = Math.max(0, 1 - heroRatio * 1.2).toFixed(3);
        }

        // Clouds: drift + bob + fade
        for (var c = 0; c < clouds.length && c < cloudData.length; c++) {
            var cd = cloudData[c];
            cd.x += cd.speed;

            // Seamless wrap (only after fully off-screen)
            if (cd.speed > 0 && cd.x > vwCached + cd.w) cd.x = -cd.w;
            else if (cd.speed < 0 && cd.x < -cd.w) cd.x = vwCached;

            var bob = Math.sin(ts * cd.bobFreq + cd.phase) * cd.bobAmp;
            var qX = Math.round(cd.x / STEP) * STEP;
            var qY = Math.round(bob / STEP) * STEP;

            clouds[c].style.transform = 'translate3d(' + qX + 'px,' + qY + 'px,0)';

            if (heroRatio >= 0.95) {
                clouds[c].style.opacity = '0';
            } else {
                clouds[c].style.opacity = (cd.baseOpacity * (1 - heroRatio)).toFixed(3);
            }
        }

        // Cards: viewport-center focus
        var mid = vh / 2;
        for (var i = 0; i < cards.length; i++) {
            var r = cards[i].getBoundingClientRect();
            var center = r.top + r.height / 2;
            var dist = Math.abs(center - mid);
            var ratio = Math.min(dist / (vh * 0.5), 1);
            var s = 1.05 - ratio * 0.17;
            var o = 1.0 - ratio * 0.65;
            cards[i].style.transform = 'scale(' + s.toFixed(4) + ')';
            cards[i].style.opacity = o.toFixed(3);
        }

        requestAnimationFrame(tick);
    }

    // ========================================================
    // 4. INIT
    // ========================================================
    if (!reducedMotion) {
        scrollY = window.pageYOffset;
        requestAnimationFrame(tick);
    } else {
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.opacity = '1';
            cards[i].style.transform = 'scale(1)';
        }
    }
})();
