/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Scroll-Linked Moon/Cloud Exit
   · Scroll-Driven Project Focus Timeline
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
    // 2. SCROLL-LINKED: Moon fade + Cloud exit
    //
    //    heroRatio = scrollY / windowHeight, clamped [0, 1]
    //    Moon: opacity 1 → 0 by end of hero
    //    Clouds: translate off-screen diagonally + fade to 0
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateHeroScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;
        var heroRatio = Math.min(y / vh, 1);

        // Moon fade
        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // Clouds exit: translate off-screen and fade
        if (clouds.length >= 3) {
            clouds[0].style.transform = 'translateX(' + (-40 * heroRatio) + 'vw) translateY(' + (-30 * heroRatio) + 'vh)';
            clouds[0].style.opacity = (0.2 * (1 - heroRatio)).toFixed(4);

            clouds[1].style.transform = 'translateX(' + (35 * heroRatio) + 'vw) translateY(' + (-20 * heroRatio) + 'vh)';
            clouds[1].style.opacity = (0.28 * (1 - heroRatio)).toFixed(4);

            clouds[2].style.transform = 'translateX(' + (-25 * heroRatio) + 'vw) translateY(' + (40 * heroRatio) + 'vh)';
            clouds[2].style.opacity = (0.22 * (1 - heroRatio)).toFixed(4);
        }
    }

    // ========================================================
    // 3. SCROLL-DRIVEN PROJECT FOCUS TIMELINE
    //
    //    For each .card in .projects__track:
    //    Calculate how close the card's vertical center is to
    //    the viewport's vertical center.
    //
    //    When a card is at viewport center:
    //      scale(1.05), opacity: 1
    //
    //    As it moves away from center:
    //      scale(0.92), opacity: 0.4
    //
    //    This creates a cinematic "take turns" focus effect.
    // ========================================================
    var cards = document.querySelectorAll('.projects__track .card');

    function updateCardFocus() {
        var vh = window.innerHeight;
        var viewportCenter = vh / 2;

        for (var i = 0; i < cards.length; i++) {
            var rect = cards[i].getBoundingClientRect();
            var cardCenter = rect.top + rect.height / 2;
            var distanceFromCenter = Math.abs(cardCenter - viewportCenter);
            var maxDistance = vh * 0.6;
            var ratio = Math.min(distanceFromCenter / maxDistance, 1);

            var scale = 1.05 - (ratio * 0.13);
            var opacity = 1 - (ratio * 0.6);

            cards[i].style.transform = 'scale(' + scale.toFixed(4) + ')';
            cards[i].style.opacity = opacity.toFixed(4);
        }
    }

    // ========================================================
    // 4. UNIFIED SCROLL LISTENER
    // ========================================================
    function onScroll() {
        updateHeroScroll();
        updateCardFocus();
    }

    if (!reducedMotion) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    } else {
        // Reduced motion: show everything static
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.transform = 'scale(1)';
            cards[i].style.opacity = '1';
        }
    }

})();
