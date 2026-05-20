/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG generator + cinematic scroll (moon fade, cloud exit)
   + reveal observer
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
        l.setAttribute('stroke', '#FAFAFA');
        l.setAttribute('stroke-width', '2');
        l.setAttribute('stroke-linecap', 'butt');
        svg.appendChild(l);
    }

    // ========================================================
    // 2. CINEMATIC SCROLL — moon fade + cloud exit
    //    Moon fades to 0 by end of hero section.
    //    Clouds slide completely off-screen as user scrolls
    //    past the hero, clearing the way for body content.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;
        var heroRatio = Math.min(y / vh, 1);

        // Moon: fade from 0.85 to 0 across the hero scroll
        if (moonSvg) {
            var moonOpacity = 0.85 * (1 - heroRatio);
            moonSvg.style.opacity = moonOpacity;
        }

        // Clouds: drift + slide off-screen as heroRatio increases
        // cloud--a moves far left, cloud--b moves far right, cloud--c moves left
        if (clouds.length >= 3) {
            var exitDistance = heroRatio * 120; // percentage of vw to translate

            clouds[0].style.transform = 'translateX(-' + exitDistance + 'vw) translateY(' + (heroRatio * -30) + 'px)';
            clouds[0].style.opacity = 0.2 * (1 - heroRatio);

            clouds[1].style.transform = 'translateX(' + exitDistance + 'vw) translateY(' + (heroRatio * -20) + 'px)';
            clouds[1].style.opacity = 0.15 * (1 - heroRatio);

            clouds[2].style.transform = 'translateX(-' + (exitDistance * 0.8) + 'vw) translateY(' + (heroRatio * -25) + 'px)';
            clouds[2].style.opacity = 0.14 * (1 - heroRatio);
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
