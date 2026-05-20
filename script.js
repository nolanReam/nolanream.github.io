/* ============================================================
   Nolan Ream — Portfolio
   Dead-simple: moon SVG + scroll parallax + reveal observer
   ============================================================ */

(function () {
    'use strict';

    // Footer year
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // 1. SVG MOON — crescent from vertical lines
    // ========================================================
    var SVG_NS = 'http://www.w3.org/2000/svg';

    function line(svg, x, y1, y2, color, sw) {
        if (y2 - y1 < 0.5) return;
        var l = document.createElementNS(SVG_NS, 'line');
        l.setAttribute('x1', x);
        l.setAttribute('y1', y1);
        l.setAttribute('x2', x);
        l.setAttribute('y2', y2);
        l.setAttribute('stroke', color);
        l.setAttribute('stroke-width', sw);
        svg.appendChild(l);
    }

    var moonSvg = document.querySelector('.moon');
    if (moonSvg) {
        var cx = 100, cy = 100, R = 88;
        var bx = 140, by = 90, bR = 78;
        for (var x = cx - R; x <= cx + R; x += 3) {
            var d = x - cx;
            var h = Math.sqrt(Math.max(0, R * R - d * d));
            if (h < 1) continue;
            var yT = cy - h, yB = cy + h;
            var di = x - bx;
            var disc = bR * bR - di * di;
            if (disc > 0) {
                var hi = Math.sqrt(disc);
                var iT = by - hi, iB = by + hi;
                if (iT <= yT && iB >= yB) continue;
                if (iT > yT && iB < yB) {
                    line(moonSvg, x, yT, iT, '#f4f4f5', 2);
                    line(moonSvg, x, iB, yB, '#f4f4f5', 2);
                    continue;
                }
                if (iT <= yT) yT = iB;
                else if (iB >= yB) yB = iT;
            }
            line(moonSvg, x, yT, yB, '#f4f4f5', 2);
        }
    }

    // ========================================================
    // 2. SCROLL PARALLAX — dead simple, foolproof
    //    Maps scrollY to translateX on each cloud at different
    //    speeds, quantized for stutter effect.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var speeds = [0.08, -0.05, 0.12];
    var step = 10;

    function onScroll() {
        var y = window.scrollY;
        for (var i = 0; i < clouds.length; i++) {
            var raw = y * speeds[i];
            var snapped = Math.round(raw / step) * step;
            clouds[i].style.transform = 'translateX(' + snapped + 'px)';
        }
    }

    if (clouds.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // initial position
    }

    // ========================================================
    // 3. INTERSECTION OBSERVER — reveal below-fold elements
    // ========================================================
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && els.length) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
        els.forEach(function (el) { obs.observe(el); });
    } else {
        els.forEach(function (el) { el.classList.add('is-visible'); });
    }

})();
