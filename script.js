/* ============================================================
   Nolan Ream — Portfolio
   Procedural SVG line-art (layered noise) + scroll-driven
   stuttered parallax + IntersectionObserver reveals
   ============================================================ */

(function () {
    'use strict';

    // --- Footer year ---
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // NOISE UTILITY — layered pseudo-random noise for organic
    // mountain/cloud shapes. Combines multiple frequency octaves
    // with sharp discontinuities for that rugged, irregular feel.
    // ========================================================

    // Seeded pseudo-random (deterministic so it's consistent)
    function seededRand(seed) {
        var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    }

    // Smooth interpolation between two random samples
    function smoothNoise(x, freq, seed) {
        var scaled = x * freq;
        var i = Math.floor(scaled);
        var f = scaled - i;
        // Smoothstep
        f = f * f * (3 - 2 * f);
        var a = seededRand(i + seed);
        var b = seededRand(i + 1 + seed);
        return a + (b - a) * f;
    }

    // Layered fractal noise — 5 octaves for complexity
    function fractalNoise(x, seed) {
        var val = 0;
        val += smoothNoise(x, 0.004, seed) * 1.0;     // Broad terrain
        val += smoothNoise(x, 0.012, seed + 100) * 0.5;  // Medium detail
        val += smoothNoise(x, 0.035, seed + 200) * 0.25; // Fine ridges
        val += smoothNoise(x, 0.08, seed + 300) * 0.12;  // Micro texture
        val += smoothNoise(x, 0.2, seed + 400) * 0.06;   // Grain
        return val / 1.93; // Normalize to ~0-1
    }

    // Jagged variant — adds sharp discontinuities
    function jaggedNoise(x, seed) {
        var base = fractalNoise(x, seed);
        // Add sharp ridges via abs of a higher frequency
        var ridge = Math.abs(smoothNoise(x, 0.06, seed + 500) - 0.5) * 2;
        return base * 0.7 + ridge * 0.3;
    }

    // ========================================================
    // SVG DRAWING
    // ========================================================

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var ACCENT = '#7c3aed';
    var OFF_WHITE = '#f4f4f5';

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

    // ========================================================
    // CRESCENT MOON — vertical lines forming a sharp crescent
    // ========================================================
    (function buildMoon() {
        var svg = document.querySelector('.hero__moon');
        if (!svg) return;

        var cx = 100, cy = 100, R = 88;
        var cx2 = 138, cy2 = 92, R2 = 78; // Bite offset
        var spacing = 3;

        for (var x = cx - R; x <= cx + R; x += spacing) {
            var dxO = x - cx;
            var hO = Math.sqrt(Math.max(0, R * R - dxO * dxO));
            if (hO < 1) continue;
            var yT = cy - hO, yB = cy + hO;

            // Inner circle bite
            var dxI = x - cx2;
            var disc = R2 * R2 - dxI * dxI;
            if (disc > 0) {
                var hI = Math.sqrt(disc);
                var iT = cy2 - hI, iB = cy2 + hI;

                if (iT <= yT && iB >= yB) continue; // Fully bitten

                if (iT > yT && iB < yB) {
                    // Two segments
                    drawLine(svg, x, yT, iT, OFF_WHITE, spacing * 0.65);
                    drawLine(svg, x, iB, yB, OFF_WHITE, spacing * 0.65);
                    continue;
                } else if (iT <= yT) {
                    yT = iB;
                } else if (iB >= yB) {
                    yB = iT;
                }
            }

            drawLine(svg, x, yT, yB, OFF_WHITE, spacing * 0.65);
        }
    })();

    // ========================================================
    // CLOUDS — rugged organic silhouettes via layered noise
    // ========================================================
    function buildCloud(selector, config) {
        var svg = document.querySelector(selector);
        if (!svg) return;

        var vb = svg.viewBox.baseVal;
        var W = vb.width, H = vb.height;
        var spacing = config.spacing || 3;
        var color = config.color || OFF_WHITE;
        var seed = config.seed || 0;
        var heightScale = config.heightScale || 0.85;
        var baselineOffset = config.baselineOffset || 0;

        for (var x = 0; x < W; x += spacing) {
            // Layered jagged noise produces the mountain/cloud envelope
            var n = jaggedNoise(x, seed);

            // Add occasional deep valleys for organic feel
            var valley = smoothNoise(x, 0.015, seed + 700);
            if (valley < 0.3) {
                n *= 0.3 + valley;
            }

            var lineH = n * H * heightScale;
            if (lineH < 1.5) continue;

            var yStart = H - lineH - baselineOffset;
            var yEnd = H - baselineOffset;

            // Slight random width variation for texture
            var sw = spacing * 0.55 + seededRand(x * 7 + seed) * spacing * 0.35;

            drawLine(svg, x, yStart, yEnd, color, sw);
        }
    }

    buildCloud('.hero__cloud--a', {
        spacing: 2.5,
        color: OFF_WHITE,
        seed: 42,
        heightScale: 0.82,
        baselineOffset: 0
    });

    buildCloud('.hero__cloud--b', {
        spacing: 3,
        color: ACCENT,
        seed: 137,
        heightScale: 0.75,
        baselineOffset: 10
    });

    buildCloud('.hero__cloud--c', {
        spacing: 2.8,
        color: OFF_WHITE,
        seed: 263,
        heightScale: 0.7,
        baselineOffset: 0
    });

    // ========================================================
    // SCROLL-DRIVEN CLOUD PARALLAX — stuttered steps
    // Clouds translate horizontally as user scrolls.
    // Steps quantization makes it stutter like an ASCII GIF.
    // ========================================================
    var clouds = document.querySelectorAll('.hero__cloud');
    var speeds = [0.15, -0.1, 0.08]; // px per scrollY pixel
    var stepSize = 12; // Quantize to 12px increments

    function quantize(val, step) {
        return Math.round(val / step) * step;
    }

    if (clouds.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    var y = window.scrollY;
                    for (var i = 0; i < clouds.length; i++) {
                        var rawOffset = y * (speeds[i] || 0.1);
                        var stepped = quantize(rawOffset, stepSize);
                        clouds[i].style.transform = 'translateX(' + stepped + 'px)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================================
    // INTERSECTION OBSERVER — cinematic reveals
    // ========================================================
    var revealEls = document.querySelectorAll('.reveal, .reveal-text, .reveal-card');

    if ('IntersectionObserver' in window && revealEls.length > 0) {
        var observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
        );
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

})();
