/* ============================================================
   Nolan Ream — Portfolio
   Procedural SVG line-art + scroll reveals
   ============================================================ */

(function () {
    'use strict';

    // ---- Footer year ----
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // 1. Procedurally generate SVG vertical-line shapes
    //    (Crescent moon + 3 abstract clouds)
    // ========================================================

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var ACCENT = '#7c3aed';
    var OFF_WHITE = '#f4f4f5';

    // --- Moon: crescent built from vertical lines -----------
    // Outer circle radius R=90, inner circle offset to the right
    // creates a crescent. For each x column, the line starts/ends
    // where it intersects the outer circle minus the inner circle.
    (function buildMoon() {
        var svg = document.querySelector('.hero__moon');
        if (!svg) return;

        var cx = 100, cy = 100, R = 85;
        // Inner circle (the "bite") shifted right
        var cx2 = 130, cy2 = 90, R2 = 75;
        var spacing = 3.5;

        for (var x = cx - R; x <= cx + R; x += spacing) {
            // Outer circle intersection
            var dxOuter = x - cx;
            var halfH = Math.sqrt(Math.max(0, R * R - dxOuter * dxOuter));
            var yTop = cy - halfH;
            var yBot = cy + halfH;

            if (halfH < 1) continue;

            // Inner circle intersection (the "bite")
            var dxInner = x - cx2;
            var disc = R2 * R2 - dxInner * dxInner;

            if (disc > 0) {
                var halfHInner = Math.sqrt(disc);
                var iTop = cy2 - halfHInner;
                var iBot = cy2 + halfHInner;

                // If the inner circle fully covers this column, skip it
                if (iTop <= yTop && iBot >= yBot) continue;

                // If partial overlap, clip the outer range
                if (iTop > yTop && iBot < yBot) {
                    // Draw two segments (above and below the bite)
                    drawLine(svg, x, yTop, iTop, OFF_WHITE, spacing * 0.6);
                    drawLine(svg, x, iBot, yBot, OFF_WHITE, spacing * 0.6);
                    continue;
                } else if (iTop <= yTop) {
                    yTop = iBot;
                } else if (iBot >= yBot) {
                    yBot = iTop;
                }
            }

            if (yBot - yTop < 1) continue;
            drawLine(svg, x, yTop, yBot, OFF_WHITE, spacing * 0.6);
        }
    })();

    // --- Clouds: organic bumpy envelope from vertical lines ---
    function buildCloud(selector, config) {
        var svg = document.querySelector(selector);
        if (!svg) return;

        var vb = svg.viewBox.baseVal;
        var W = vb.width;
        var H = vb.height;
        var spacing = config.spacing || 4;
        var color = config.color || ACCENT;
        var bumps = config.bumps || [
            { cx: W * 0.25, r: W * 0.2, h: H * 0.7 },
            { cx: W * 0.5,  r: W * 0.25, h: H * 0.9 },
            { cx: W * 0.75, r: W * 0.2, h: H * 0.65 }
        ];

        for (var x = 0; x < W; x += spacing) {
            // Find the max height at this x from all bumps
            var maxH = 0;
            for (var b = 0; b < bumps.length; b++) {
                var bump = bumps[b];
                var dx = x - bump.cx;
                var dist = Math.abs(dx) / bump.r;
                if (dist < 1) {
                    // Smooth cosine falloff
                    var h = bump.h * (0.5 + 0.5 * Math.cos(dist * Math.PI));
                    if (h > maxH) maxH = h;
                }
            }

            if (maxH < 2) continue;

            // Vary the line width slightly for texture
            var sw = spacing * 0.55 + Math.random() * spacing * 0.2;
            var yStart = H - maxH;
            drawLine(svg, x, yStart, H, color, sw);
        }
    }

    buildCloud('.hero__cloud--a', {
        spacing: 4,
        color: OFF_WHITE,
        bumps: [
            { cx: 150, r: 130, h: 100 },
            { cx: 320, r: 160, h: 140 },
            { cx: 480, r: 120, h: 90 }
        ]
    });

    buildCloud('.hero__cloud--b', {
        spacing: 5,
        color: ACCENT,
        bumps: [
            { cx: 200, r: 180, h: 100 },
            { cx: 450, r: 200, h: 120 },
            { cx: 650, r: 150, h: 85 }
        ]
    });

    buildCloud('.hero__cloud--c', {
        spacing: 4.5,
        color: OFF_WHITE,
        bumps: [
            { cx: 100, r: 120, h: 110 },
            { cx: 300, r: 180, h: 150 },
            { cx: 520, r: 140, h: 120 },
            { cx: 650, r: 100, h: 80 }
        ]
    });

    function drawLine(svg, x, y1, y2, color, strokeWidth) {
        var line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'butt');
        svg.appendChild(line);
    }

    // ========================================================
    // 2. Cinematic scroll reveals (IntersectionObserver)
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

    // ========================================================
    // 3. Navbar border intensifies on scroll
    // ========================================================
    var navbar = document.querySelector('.navbar');
    if (navbar) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    navbar.style.borderBottomColor =
                        window.scrollY > 10
                            ? 'rgba(245, 245, 247, 0.14)'
                            : 'rgba(245, 245, 247, 0.08)';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

})();
