/* ============================================================
   Nolan Ream — Terminal Portfolio
   Boot Sequence · Typewriter Engine · Scanline Vectors
   Quantized Cloud Drift · Card Focus Timeline
   ============================================================ */
(function () {
    'use strict';

    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var STEP = 8;

    // ========================================================
    // 1. BOOT SEQUENCE — fake terminal startup
    // ========================================================
    var bootScreen = document.getElementById('boot-screen');
    var bootText = document.getElementById('boot-text');
    var bootLines = [
        '[ OK ] Initializing kernel...',
        '[ OK ] Mounting filesystem: /dev/portfolio',
        '[ OK ] Loading font subsystem: Fira Code',
        '[ OK ] Scanning vector engine: scanline_v3',
        '[ OK ] Establishing network: nolanream.com',
        '[ ** ] Ready.',
        ''
    ];

    var bootIndex = 0;
    var bootContent = '';

    function bootTick() {
        if (bootIndex < bootLines.length) {
            bootContent += bootLines[bootIndex] + '\n';
            bootText.textContent = bootContent;
            bootIndex++;
            setTimeout(bootTick, 120 + Math.random() * 180);
        } else {
            setTimeout(function () {
                bootScreen.classList.add('hidden');
                setTimeout(function () { bootScreen.style.display = 'none'; }, 600);
                startTypewriters();
            }, 400);
        }
    }

    bootTick();

    // ========================================================
    // 2. TYPEWRITER ENGINE — organic randomized keystroke timing
    //    Uses IntersectionObserver to trigger when scrolled into view.
    // ========================================================
    var typeElements = document.querySelectorAll('.typewrite');
    var typedSet = new Set();

    function typeText(el) {
        var fullText = el.getAttribute('data-text');
        if (!fullText) return;
        el.textContent = '';
        var i = 0;

        function nextChar() {
            if (i < fullText.length) {
                el.textContent += fullText.charAt(i);
                i++;
                var delay = 20 + Math.random() * 60;
                // Pause longer on punctuation
                if (fullText.charAt(i - 1) === '.' || fullText.charAt(i - 1) === ',') {
                    delay += 80 + Math.random() * 120;
                }
                setTimeout(nextChar, delay);
            }
        }

        nextChar();
    }

    function startTypewriters() {
        if (!('IntersectionObserver' in window)) {
            typeElements.forEach(function (el) {
                el.textContent = el.getAttribute('data-text') || '';
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !typedSet.has(entry.target)) {
                    typedSet.add(entry.target);
                    typeText(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        typeElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ========================================================
    // 3. MOON — scanline crescent
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
                    svgLine(moonSvg, x, yTop, bTop, '#4AF626', 2);
                    svgLine(moonSvg, x, bBot, yBot, '#4AF626', 2);
                    continue;
                }
                if (bTop <= yTop) yTop = bBot;
                else if (bBot >= yBot) yBot = bTop;
            }
            if (yBot - yTop < 1) continue;
            svgLine(moonSvg, x, yTop, yBot, '#4AF626', 2);
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
    // 4. CLOUDS — scanline shapes via circle-union calculus
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');
    var cloudData = [
        { w: 260, h: 120, color: '#4AF626', speed: 0.04, scrollFactor: -0.75, baseTop: 10,
          puffs: [{cx:70,cy:60,r:38},{cx:130,cy:45,r:45},{cx:190,cy:55,r:40},{cx:50,cy:72,r:30},{cx:220,cy:65,r:32}] },
        { w: 180, h: 90, color: '#7c3aed', speed: -0.02, scrollFactor: -0.45, baseTop: 25,
          puffs: [{cx:45,cy:42,r:30},{cx:85,cy:35,r:35},{cx:125,cy:40,r:32},{cx:150,cy:52,r:25}] },
        { w: 340, h: 140, color: '#4AF626', speed: 0.06, scrollFactor: -0.95, baseTop: 45,
          puffs: [{cx:60,cy:70,r:42},{cx:120,cy:55,r:50},{cx:180,cy:48,r:48},{cx:240,cy:58,r:44},{cx:300,cy:70,r:36},{cx:40,cy:82,r:30}] },
        { w: 200, h: 100, color: '#7c3aed', speed: 0.03, scrollFactor: -0.60, baseTop: 18,
          puffs: [{cx:50,cy:55,r:32},{cx:100,cy:42,r:40},{cx:150,cy:50,r:35},{cx:175,cy:62,r:28}] },
        { w: 280, h: 130, color: '#4AF626', speed: -0.04, scrollFactor: -0.80, baseTop: 38,
          puffs: [{cx:55,cy:65,r:38},{cx:110,cy:50,r:45},{cx:170,cy:55,r:42},{cx:230,cy:62,r:38},{cx:260,cy:75,r:30}] }
    ];

    var vw = window.innerWidth;
    cloudData[0].x = -280;
    cloudData[1].x = vw + 40;
    cloudData[2].x = Math.round(vw * 0.2);
    cloudData[3].x = Math.round(vw * 0.5);
    cloudData[4].x = vw + 80;

    for (var ci = 0; ci < cloudEls.length && ci < cloudData.length; ci++) {
        var cd = cloudData[ci];
        cd.baseOpacity = ci === 0 ? 0.25 : ci === 1 ? 0.35 : ci === 2 ? 0.20 : ci === 3 ? 0.30 : 0.22;

        for (var lx = 0; lx < cd.w; lx += 3) {
            var yT = cd.h, yB = 0, hit = false;
            for (var p = 0; p < cd.puffs.length; p++) {
                var pf = cd.puffs[p];
                var ddx = lx - pf.cx;
                var disc = pf.r * pf.r - ddx * ddx;
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
    // 5. ANIMATION LOOP — drift, parallax, card focus
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

        // Clouds: drift + scroll-parallax
        for (var c = 0; c < clouds.length && c < cloudData.length; c++) {
            var cd = cloudData[c];
            cd.x += cd.speed * vwCached * 0.01;

            // Dynamic viewport-based wrapping
            if (cd.speed > 0) {
                if (cd.x > vwCached + 400) cd.x = -400;
            } else {
                if (cd.x < -vwCached - 400) cd.x = 400;
            }

            var scrollOffset = scrollY * cd.scrollFactor;
            var qX = Math.round(cd.x / STEP) * STEP;
            var qY = Math.round(scrollOffset / STEP) * STEP;

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
    // 6. INIT
    // ========================================================
    if (!reducedMotion) {
        scrollY = window.pageYOffset;
        requestAnimationFrame(tick);
    } else {
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.opacity = '1';
            cards[i].style.transform = 'scale(1)';
        }
        typeElements.forEach(function (el) {
            el.textContent = el.getAttribute('data-text') || '';
        });
    }
})();
