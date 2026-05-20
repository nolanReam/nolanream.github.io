/* ============================================================
   Nolan Ream — Portfolio
   Billowing clouds parallax + moon SVG + scroll reveals
   ============================================================ */

(function () {
    'use strict';

    // Footer year
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // SVG MOON — crescent from vertical lines
    // ========================================================
    var SVG_NS = 'http://www.w3.org/2000/svg';

    function drawLine(svg, x, y1, y2, color, sw) {
        if (y2 - y1 < 0.5) return;
        var line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', sw);
        line.setAttribute('stroke-linecap', 'butt');
        svg.appendChild(line);
    }

    (function buildMoon() {
        var svg = document.querySelector('.moon');
        if (!svg) return;

        var cx = 100, cy = 100, R = 88;
        var cx2 = 140, cy2 = 90, R2 = 78;
        var spacing = 3;

        for (var x = cx - R; x <= cx + R; x += spacing) {
            var dxO = x - cx;
            var hO = Math.sqrt(Math.max(0, R * R - dxO * dxO));
            if (hO < 1) continue;
            var yT = cy - hO, yB = cy + hO;

            var dxI = x - cx2;
            var disc = R2 * R2 - dxI * dxI;
            if (disc > 0) {
                var hI = Math.sqrt(disc);
                var iT = cy2 - hI, iB = cy2 + hI;
                if (iT <= yT && iB >= yB) continue;
                if (iT > yT && iB < yB) {
                    drawLine(svg, x, yT, iT, '#f4f4f5', spacing * 0.65);
                    drawLine(svg, x, iB, yB, '#f4f4f5', spacing * 0.65);
                    continue;
                } else if (iT <= yT) { yT = iB; }
                else if (iB >= yB) { yB = iT; }
            }
            drawLine(svg, x, yT, yB, '#f4f4f5', spacing * 0.65);
        }
    })();

    // ========================================================
    // SCROLL-DRIVEN PARALLAX — clouds move at different speeds,
    // quantized to step increments for stutter effect.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var speeds = [0.12, -0.08, 0.18]; // px per scroll pixel
    var stepSize = 14;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function quantize(val, step) {
        return Math.round(val / step) * step;
    }

    // ========================================================
    // VERTICAL LINE DRAW — about section
    // ========================================================
    var lineDraw = document.querySelector('.about__line-draw');

    // ========================================================
    // INTERSECTION OBSERVER — cinematic reveals
    // ========================================================
    var revealEls = document.querySelectorAll('.reveal-group, .reveal-text, .reveal-card');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

        revealEls.forEach(function (el) { observer.observe(el); });

        // Line draw trigger
        if (lineDraw) {
            var lineObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        lineDraw.classList.add('is-drawn');
                        lineObs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            lineObs.observe(lineDraw);
        }
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
        if (lineDraw) lineDraw.classList.add('is-drawn');
    }

    // ========================================================
    // SCROLL HANDLER — parallax + stutter
    // ========================================================
    if (!reducedMotion && clouds.length) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    var y = window.scrollY;
                    for (var i = 0; i < clouds.length; i++) {
                        var raw = y * (speeds[i] || 0.1);
                        var stepped = quantize(raw, stepSize);
                        clouds[i].style.transform = 'translateX(' + stepped + 'px)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

})();
