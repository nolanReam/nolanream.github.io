/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Cinematic Scroll (moon fade + cloud exit) · Reveal
   ============================================================ */

(function () {
    'use strict';

    // ---- Footer year ----
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // ========================================================
    // 1. SVG MOON — vertical scanline crescent
    //    Draws inside .moon (viewBox 0 0 200 200)
    //    Outer disc at (100,100) R=85
    //    Bite disc at (145,95) R=75
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
    // 2. CINEMATIC SCROLL LISTENER
    //
    //    heroRatio = scrollY / windowHeight, clamped 0–1
    //
    //    MOON: opacity goes from 1 → 0 as heroRatio goes 0 → 1.
    //    By the time user scrolls past the hero, moon is invisible.
    //
    //    CLOUDS: translate dramatically off-screen as heroRatio
    //    increases. Cloud A exits far left, Cloud B exits far right,
    //    Cloud C exits far left. Opacity also fades to 0.
    //    This leaves About/Skills/Projects completely clean.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;
        var heroRatio = Math.min(y / vh, 1);

        // Moon: fade completely by end of hero
        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(3);
        }

        // Clouds: push off-screen and fade out
        if (clouds.length >= 3) {
            var exit = heroRatio * 150;

            // Cloud A — exits far left
            clouds[0].style.transform = 'translateX(-' + exit + 'vw) translateY(-' + (heroRatio * 40) + 'px)';
            clouds[0].style.opacity = (0.35 * (1 - heroRatio)).toFixed(3);

            // Cloud B — exits far right
            clouds[1].style.transform = 'translateX(' + exit + 'vw) translateY(-' + (heroRatio * 25) + 'px)';
            clouds[1].style.opacity = (0.25 * (1 - heroRatio)).toFixed(3);

            // Cloud C — exits far left (slightly slower)
            clouds[2].style.transform = 'translateX(-' + (exit * 0.9) + 'vw) translateY(-' + (heroRatio * 35) + 'px)';
            clouds[2].style.opacity = (0.28 * (1 - heroRatio)).toFixed(3);
        }
    }

    if (!reducedMotion) {
        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();
    }

    // ========================================================
    // 3. INTERSECTION OBSERVER — reveal below-fold content
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
        for (var i = 0; i < revealEls.length; i++) {
            revealEls[i].classList.add('is-visible');
        }
    }

})();
