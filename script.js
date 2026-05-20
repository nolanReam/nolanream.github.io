/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Parallax Moon/Cloud Exit
   · Viewport-Center Focus Timeline for Project Cards
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
    // 1b. SVG CLOUDS — same vertical scanline style as moon
    //     Fill each cloud SVG with vertical lines spanning
    //     its full viewBox height. The CSS border-radius +
    //     overflow:hidden clips them into cloud shapes that
    //     morph over time via animation.
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');
    var cloudConfigs = [
        { w: 260, h: 120, spacing: 4, color: '#f4f4f5', strokeWidth: 1.5 },
        { w: 180, h: 90, spacing: 5, color: '#7c3aed', strokeWidth: 1.5 },
        { w: 340, h: 140, spacing: 4, color: '#f4f4f5', strokeWidth: 1.5 }
    ];

    for (var ci = 0; ci < cloudEls.length; ci++) {
        var cfg = cloudConfigs[ci];
        if (!cfg) continue;
        for (var lx = 0; lx < cfg.w; lx += cfg.spacing) {
            var cl = document.createElementNS(SVG_NS, 'line');
            cl.setAttribute('x1', lx);
            cl.setAttribute('y1', 0);
            cl.setAttribute('x2', lx);
            cl.setAttribute('y2', cfg.h);
            cl.setAttribute('stroke', cfg.color);
            cl.setAttribute('stroke-width', cfg.strokeWidth);
            cl.setAttribute('stroke-linecap', 'butt');
            cloudEls[ci].appendChild(cl);
        }
    }
    //    - Moon opacity fade (deep background parallax)
    //    - Cloud exit translation (midground parallax)
    //    - Card viewport-center focus timeline (foreground)
    // ========================================================
    // ========================================================
    // 2. SCROLL EVENT LISTENER
    //    - Moon opacity fade (deep background parallax)
    //    - Cloud fade on scroll past hero
    //    - Card viewport-center focus timeline (foreground)
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var cards = document.querySelectorAll('.projects__track .card');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function onScroll() {
        var scrollY = window.scrollY;
        var vh = window.innerHeight;

        // --------------------------------------------------
        // MOON: fade from opacity 1 to 0 over first viewport
        // --------------------------------------------------
        var heroRatio = Math.min(scrollY / vh, 1);

        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // --------------------------------------------------
        // CLOUDS: hide once user scrolls past hero
        // We toggle visibility via a class rather than
        // setting inline transform (which kills CSS animation)
        // --------------------------------------------------
        if (clouds.length) {
            for (var c = 0; c < clouds.length; c++) {
                if (heroRatio >= 0.95) {
                    clouds[c].style.visibility = 'hidden';
                } else {
                    clouds[c].style.visibility = 'visible';
                    clouds[c].style.opacity = ((c === 0 ? 0.55 : c === 1 ? 0.45 : 0.5) * (1 - heroRatio)).toFixed(4);
                }
            }
        }

        // --------------------------------------------------
        // CARDS: viewport-center focus timeline
        //
        // Calculate the exact center of the viewport.
        // For each card, measure how far its center is from
        // the viewport center. Map that distance to scale
        // and opacity for a smooth cinematic focus effect.
        //
        // Centered: scale(1.05), opacity: 1
        // Out of focus: scale(0.88), opacity: 0.25
        // --------------------------------------------------
        var viewCenter = vh / 2;

        for (var i = 0; i < cards.length; i++) {
            var rect = cards[i].getBoundingClientRect();
            var cardCenter = rect.top + (rect.height / 2);
            var distance = Math.abs(cardCenter - viewCenter);
            var maxDistance = vh * 0.6;
            var ratio = Math.min(distance / maxDistance, 1);

            var scale = 1.05 - (ratio * 0.17);
            var opacity = 1.0 - (ratio * 0.75);

            cards[i].style.transform = 'scale(' + scale.toFixed(4) + ')';
            cards[i].style.opacity = opacity.toFixed(4);
        }
    }

    // ========================================================
    // 3. INITIALIZE
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
