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
    // 1b. SVG CLOUDS — identical technique to moon
    //     Each cloud SVG gets a <clipPath> with a cloud-shaped
    //     path, then vertical scanlines are drawn and clipped.
    //     No CSS blur, no border-radius, no overflow:hidden.
    //     Pure SVG geometry, same as the crescent moon.
    // ========================================================
    var cloudEls = document.querySelectorAll('.cloud');
    var cloudDefs = [
        {
            w: 260, h: 120, spacing: 3, color: 'rgba(244,244,245,0.7)', sw: 2,
            path: 'M20,100 C30,85 50,60 80,55 C100,40 120,30 140,35 C160,25 180,40 195,50 C210,35 230,50 245,65 C255,75 260,90 250,100 Z'
        },
        {
            w: 180, h: 90, spacing: 3, color: 'rgba(124,58,237,0.7)', sw: 2,
            path: 'M15,75 C25,60 40,45 60,42 C75,30 95,25 110,35 C125,25 140,35 155,48 C165,40 175,55 172,70 C178,80 170,85 160,75 Z'
        },
        {
            w: 340, h: 140, spacing: 3, color: 'rgba(244,244,245,0.7)', sw: 2,
            path: 'M25,120 C35,100 60,75 90,70 C110,55 140,40 170,45 C200,30 225,40 250,55 C270,40 295,50 310,65 C325,55 335,70 330,90 C338,105 330,120 320,120 Z'
        }
    ];

    for (var ci = 0; ci < cloudEls.length; ci++) {
        var def = cloudDefs[ci];
        if (!def) continue;

        var defs = document.createElementNS(SVG_NS, 'defs');
        var clipPath = document.createElementNS(SVG_NS, 'clipPath');
        clipPath.setAttribute('id', 'cloud-clip-' + ci);
        var pathEl = document.createElementNS(SVG_NS, 'path');
        pathEl.setAttribute('d', def.path);
        clipPath.appendChild(pathEl);
        defs.appendChild(clipPath);
        cloudEls[ci].appendChild(defs);

        var g = document.createElementNS(SVG_NS, 'g');
        g.setAttribute('clip-path', 'url(#cloud-clip-' + ci + ')');

        for (var lx = 0; lx < def.w; lx += def.spacing) {
            var cl = document.createElementNS(SVG_NS, 'line');
            cl.setAttribute('x1', lx);
            cl.setAttribute('y1', 0);
            cl.setAttribute('x2', lx);
            cl.setAttribute('y2', def.h);
            cl.setAttribute('stroke', def.color);
            cl.setAttribute('stroke-width', def.sw);
            cl.setAttribute('stroke-linecap', 'butt');
            cl.setAttribute('shape-rendering', 'crispEdges');
            g.appendChild(cl);
        }

        cloudEls[ci].appendChild(g);
    }
    // ========================================================
    // 2. SCROLL EVENT LISTENER
    //    - Moon opacity fade (deep background parallax)
    //    - Cloud drift via left property (no transform = no blur)
    //    - Cloud fade on scroll past hero
    //    - Card viewport-center focus timeline (foreground)
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var cards = document.querySelectorAll('.projects__track .card');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cloud drift state — moves via left/right property
    var cloudPositions = [0, 0, 0];
    var cloudSpeeds = [0.3, -0.25, 0.2]; // px per frame
    var lastTime = performance.now();

    function driftClouds(now) {
        var dt = (now - lastTime) / 16; // normalize to ~60fps
        lastTime = now;
        for (var c = 0; c < clouds.length && c < cloudSpeeds.length; c++) {
            cloudPositions[c] += cloudSpeeds[c] * dt;
            // Reset drift when it goes too far
            if (Math.abs(cloudPositions[c]) > 400) {
                cloudPositions[c] = 0;
            }
            if (c === 1) {
                // cloud--b uses 'right', so we don't set left
                clouds[c].style.right = (10 - cloudPositions[c] * 0.1) + 'vw';
            } else {
                clouds[c].style.left = 'calc(' + (c === 0 ? '8vw' : '20vw') + ' + ' + cloudPositions[c] + 'px)';
            }
        }
    }

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
        // CLOUDS: fade out as user scrolls past hero
        // --------------------------------------------------
        if (clouds.length) {
            for (var c = 0; c < clouds.length; c++) {
                if (heroRatio >= 0.95) {
                    clouds[c].style.visibility = 'hidden';
                } else {
                    clouds[c].style.visibility = 'visible';
                    clouds[c].style.opacity = ((c === 0 ? 0.5 : c === 1 ? 0.4 : 0.45) * (1 - heroRatio)).toFixed(4);
                }
            }
        }

        // --------------------------------------------------
        // CARDS: viewport-center focus timeline
        // Tighter focus zone (vh * 0.4) so cards pop faster
        // --------------------------------------------------
        var viewCenter = vh / 2;

        for (var i = 0; i < cards.length; i++) {
            var rect = cards[i].getBoundingClientRect();
            var cardCenter = rect.top + (rect.height / 2);
            var distance = Math.abs(cardCenter - viewCenter);
            var maxDistance = vh * 0.55;
            var ratio = Math.min(distance / maxDistance, 1);

            var scale = 1.05 - (ratio * 0.17);
            var opacity = 1.0 - (ratio * 0.65);

            cards[i].style.transform = 'scale(' + scale.toFixed(4) + ')';
            cards[i].style.opacity = opacity.toFixed(4);
        }
    }

    // Animation loop for cloud drift (no transform, uses left/right)
    function animationLoop(now) {
        driftClouds(now);
        requestAnimationFrame(animationLoop);
    }

    // ========================================================
    // 3. INITIALIZE
    // ========================================================
    if (!reducedMotion) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        requestAnimationFrame(animationLoop);
    } else {
        for (var i = 0; i < cards.length; i++) {
            cards[i].style.transform = 'scale(1)';
            cards[i].style.opacity = '1';
        }
    }

})();
