/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Scroll-linked moon fade + cloud exit · Reveal
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
    // 2. SCROLL-LINKED ANIMATIONS
    //
    //    heroRatio = scrollY / windowHeight, clamped to [0, 1]
    //
    //    MOON: opacity drops from 1 to 0 as user scrolls through
    //    the hero section. At scrollY >= windowHeight, moon is
    //    completely invisible.
    //
    //    CLOUDS: translate downward (translateY +100vh) as user
    //    scrolls past hero, pushing them completely below the
    //    viewport. Opacity also fades to 0. By the time the
    //    About section is visible, clouds are entirely gone.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;
        var heroRatio = Math.min(y / vh, 1);

        // Moon: fade from 1 to 0 across hero scroll distance
        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // Clouds: push down and out of viewport, fade to invisible
        for (var i = 0; i < clouds.length; i++) {
            var pushDown = heroRatio * 100;
            clouds[i].style.transform = 'translateY(' + pushDown + 'vh)';
            clouds[i].style.opacity = ((i === 1 ? 0.2 : i === 2 ? 0.28 : 0.35) * (1 - heroRatio)).toFixed(4);
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
