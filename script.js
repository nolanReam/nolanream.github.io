/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Moon/Cloud Scroll Exit
   · Viewport-Center Card Scale Animation
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
        l.setAttribute('stroke', '#f4f4f5');
        l.setAttribute('stroke-width', '2');
        l.setAttribute('stroke-linecap', 'butt');
        svg.appendChild(l);
    }

    // ========================================================
    // 2. SCROLL EVENT LISTENER
    //    Handles: moon fade, cloud exit, card focus scaling
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var cards = document.querySelectorAll('.projects__track .card');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function onScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;

        // --------------------------------------------------
        // MOON: fade from 1 to 0 as user scrolls through hero
        // heroRatio goes from 0 (top) to 1 (scrolled 1 viewport)
        // --------------------------------------------------
        var heroRatio = Math.min(y / vh, 1);

        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // --------------------------------------------------
        // CLOUDS: translate off-screen as user exits hero
        // Cloud A exits upper-left
        // Cloud B exits upper-right
        // Cloud C exits lower-left
        // --------------------------------------------------
        if (clouds.length >= 3) {
            clouds[0].style.transform = 'translateX(' + (-50 * heroRatio) + 'vw) translateY(' + (-30 * heroRatio) + 'vh)';
            clouds[0].style.opacity = (0.18 * (1 - heroRatio)).toFixed(4);

            clouds[1].style.transform = 'translateX(' + (45 * heroRatio) + 'vw) translateY(' + (-20 * heroRatio) + 'vh)';
            clouds[1].style.opacity = (0.24 * (1 - heroRatio)).toFixed(4);

            clouds[2].style.transform = 'translateX(' + (-35 * heroRatio) + 'vw) translateY(' + (40 * heroRatio) + 'vh)';
            clouds[2].style.opacity = (0.2 * (1 - heroRatio)).toFixed(4);
        }

        // --------------------------------------------------
        // CARDS: scroll-driven viewport-center focus scaling
        //
        // For each card, calculate how close its vertical
        // center is to the viewport's vertical center.
        //
        // At center: scale(1.05), opacity: 1
        // Far from center: scale(0.85), opacity: 0.2
        //
        // ratio = 0 means perfectly centered
        // ratio = 1 means maximally far from center
        // --------------------------------------------------
        var viewportCenter = vh / 2;

        for (var i = 0; i < cards.length; i++) {
            var rect = cards[i].getBoundingClientRect();
            var cardCenter = rect.top + (rect.height / 2);
            var distance = Math.abs(cardCenter - viewportCenter);
            var maxDistance = vh * 0.55;
            var ratio = Math.min(distance / maxDistance, 1);

            // scale: 1.05 at center, 0.85 at edges (range of 0.2)
            var scale = 1.05 - (ratio * 0.2);
            // opacity: 1 at center, 0.2 at edges (range of 0.8)
            var opacity = 1 - (ratio * 0.8);

            cards[i].style.transform = 'scale(' + scale.toFixed(4) + ')';
            cards[i].style.opacity = opacity.toFixed(4);
        }
    }

    // ========================================================
    // 3. BIND AND INITIALIZE
    // ========================================================
    if (!reducedMotion) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    } else {
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.transform = 'scale(1)';
            cards[i].style.opacity = '1';
        }
    }

})();
