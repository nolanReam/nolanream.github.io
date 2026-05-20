/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG generator + scroll parallax + reveal observer
   All class names match styles.css exactly.
   ============================================================ */

(function () {
    'use strict';

    // ---- Footer year ----
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // 1. SVG MOON — vertical scanline crescent
    //    Draws inside .moon (viewBox="0 0 200 200")
    //    Outer disc centered at (100,100) R=85
    //    Bite disc shifted right to (145, 95) R=75
    //    This keeps the crescent well within the 200x200 box.
    // ========================================================
    var SVG_NS = 'http://www.w3.org/2000/svg';
    var moonSvg = document.querySelector('.moon');

    if (moonSvg) {
        var cx = 100, cy = 100, R = 85;   // Outer disc
        var bx = 145, by = 95, bR = 75;   // Bite disc (shifted right)
        var spacing = 3;

        for (var x = cx - R; x <= cx + R; x += spacing) {
            // Outer circle bounds at this x
            var dx = x - cx;
            var outerH = Math.sqrt(Math.max(0, R * R - dx * dx));
            if (outerH < 1) continue;

            var yTop = cy - outerH;
            var yBot = cy + outerH;

            // Bite circle bounds at this x
            var dxBite = x - bx;
            var biteDisc = bR * bR - dxBite * dxBite;

            if (biteDisc > 0) {
                var biteH = Math.sqrt(biteDisc);
                var bTop = by - biteH;
                var bBot = by + biteH;

                // If bite completely covers this column, skip
                if (bTop <= yTop && bBot >= yBot) continue;

                // If bite cuts through the middle, draw two segments
                if (bTop > yTop && bBot < yBot) {
                    addLine(moonSvg, x, yTop, bTop);
                    addLine(moonSvg, x, bBot, yBot);
                    continue;
                }

                // Bite clips top or bottom
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
    // 2. SCROLL PARALLAX — distinct speeds per cloud layer
    //    Quantized to 12px steps for ASCII-GIF stutter.
    //    Targets elements with class "cloud" (matches CSS).
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var speeds = [0.15, -0.1, 0.25]; // Different speeds per layer
    var STEP = 12; // Quantize to 12px jumps

    function updateClouds() {
        var scrollY = window.scrollY;
        for (var i = 0; i < clouds.length; i++) {
            var raw = scrollY * speeds[i];
            var snapped = Math.round(raw / STEP) * STEP;
            clouds[i].style.transform = 'translateX(' + snapped + 'px)';
        }
    }

    // Only run if not reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && clouds.length) {
        window.addEventListener('scroll', updateClouds, { passive: true });
        updateClouds(); // Set initial position on load
    }

    // ========================================================
    // 3. INTERSECTION OBSERVER — reveal below-fold content
    //    Targets class "reveal" (matches CSS .reveal)
    // ========================================================
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('is-visible');
                    observer.unobserve(entries[i].target);
                }
            }
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -5% 0px'
        });

        for (var i = 0; i < revealEls.length; i++) {
            observer.observe(revealEls[i]);
        }
    } else {
        // Fallback: show everything
        for (var i = 0; i < revealEls.length; i++) {
            revealEls[i].classList.add('is-visible');
        }
    }

})();
