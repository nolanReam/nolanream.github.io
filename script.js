/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Dynamic Scroll Interlocking · Staggered Cards
   · Editorial Reveal Masks
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
    // 2. DYNAMIC SCROLL INTERLOCKING
    //
    //    heroRatio = window.scrollY / window.innerHeight [0..1]
    //
    //    MOON: opacity drops from 1 → 0 as heroRatio goes 0 → 1
    //    Completely invisible once user exits the hero frame.
    //
    //    CLOUDS: translate diagonally off-screen.
    //    Cloud A: translate(-50vw, 50vh)
    //    Cloud B: translate(40vw, 60vh)
    //    Cloud C: translate(-30vw, 70vh)
    //    All fade to opacity 0. Completely cleared before About.
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;
        var heroRatio = Math.min(y / vh, 1);

        // Moon: linear fade to invisible
        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // Clouds: translate diagonally off-screen + fade
        if (clouds.length >= 3) {
            // Cloud A: exits bottom-left
            clouds[0].style.transform = 'translate(' + (-50 * heroRatio) + 'vw, ' + (50 * heroRatio) + 'vh)';
            clouds[0].style.opacity = (0.35 * (1 - heroRatio)).toFixed(4);

            // Cloud B: exits bottom-right
            clouds[1].style.transform = 'translate(' + (40 * heroRatio) + 'vw, ' + (60 * heroRatio) + 'vh)';
            clouds[1].style.opacity = (0.4 * (1 - heroRatio)).toFixed(4);

            // Cloud C: exits bottom-left (deeper)
            clouds[2].style.transform = 'translate(' + (-30 * heroRatio) + 'vw, ' + (70 * heroRatio) + 'vh)';
            clouds[2].style.opacity = (0.3 * (1 - heroRatio)).toFixed(4);
        }
    }

    if (!reducedMotion) {
        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();
    }

    // ========================================================
    // 3. EDITORIAL REVEAL MASKS
    //    Elements with .reveal-mask slide up from inside
    //    their .reveal-wrap overflow:hidden container.
    //    Creates luxury curtain-reveal editorial pacing.
    // ========================================================
    var revealMaskEls = document.querySelectorAll('.reveal-mask');

    if ('IntersectionObserver' in window && revealMaskEls.length) {
        var maskObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('is-visible');
                    maskObserver.unobserve(entries[i].target);
                }
            }
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        });

        for (var i = 0; i < revealMaskEls.length; i++) {
            maskObserver.observe(revealMaskEls[i]);
        }
    } else {
        for (var i = 0; i < revealMaskEls.length; i++) {
            revealMaskEls[i].classList.add('is-visible');
        }
    }

    // ========================================================
    // 4. STAGGERED PROJECT CARD SEQUENCING
    //    .card-seq elements get staggered transition delays
    //    injected via JavaScript based on data-seq index.
    //    IntersectionObserver triggers .is-visible class.
    //    CSS handles the steps(8) frame-lock animation.
    // ========================================================
    var cardSeqEls = document.querySelectorAll('.card-seq');

    // Inject staggered transition delays
    for (var i = 0; i < cardSeqEls.length; i++) {
        var seqIndex = parseInt(cardSeqEls[i].getAttribute('data-seq'), 10) || 0;
        cardSeqEls[i].style.transitionDelay = (seqIndex * 150) + 'ms';
    }

    if ('IntersectionObserver' in window && cardSeqEls.length) {
        var cardObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('is-visible');
                    cardObserver.unobserve(entries[i].target);
                }
            }
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -5% 0px'
        });

        for (var i = 0; i < cardSeqEls.length; i++) {
            cardObserver.observe(cardSeqEls[i]);
        }
    } else {
        for (var i = 0; i < cardSeqEls.length; i++) {
            cardSeqEls[i].classList.add('is-visible');
        }
    }

})();
