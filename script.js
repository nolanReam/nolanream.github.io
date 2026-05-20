/* ============================================================
   Nolan Ream — Portfolio
   Moon SVG · Cinematic Scroll · Staggered Card Sequencing
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
    // 2. SCROLL-LINKED: Moon fade + Cloud exit
    //
    //    heroRatio = scrollY / windowHeight, clamped [0, 1]
    //    Moon: opacity 1 → 0 as user exits hero
    //    Clouds: translateY pushes them below viewport + fade
    // ========================================================
    var clouds = document.querySelectorAll('.cloud');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateScroll() {
        var y = window.scrollY;
        var vh = window.innerHeight;
        var heroRatio = Math.min(y / vh, 1);

        // Moon fade: 1 → 0 across hero scroll
        if (moonSvg) {
            moonSvg.style.opacity = (1 - heroRatio).toFixed(4);
        }

        // Clouds: push down out of viewport and fade
        for (var i = 0; i < clouds.length; i++) {
            var pushDown = heroRatio * 100;
            var baseOpacity = i === 0 ? 0.35 : i === 1 ? 0.25 : 0.3;
            clouds[i].style.transform = 'translateY(' + pushDown + 'vh)';
            clouds[i].style.opacity = (baseOpacity * (1 - heroRatio)).toFixed(4);
        }
    }

    if (!reducedMotion) {
        window.addEventListener('scroll', updateScroll, { passive: true });
        updateScroll();
    }

    // ========================================================
    // 3. EDITORIAL REVEAL MASK — clip-path text entrance
    //    Elements with .reveal-mask rise from behind a mask
    //    as they enter the viewport.
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
            threshold: 0.15,
            rootMargin: '0px 0px -8% 0px'
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
    //    Cards snap into view one-by-one with rhythmic delay.
    //    Uses IntersectionObserver on .card-seq elements.
    //    Each card gets a staggered timeout based on data-seq
    //    attribute (0, 1, 2) creating a cinematic frame-lock
    //    entrance with steps(8) timing in CSS.
    // ========================================================
    var cardSeqEls = document.querySelectorAll('.card-seq');
    var STAGGER_DELAY = 200; // ms between each card reveal

    if ('IntersectionObserver' in window && cardSeqEls.length) {
        var cardObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    var card = entries[i].target;
                    var seq = parseInt(card.getAttribute('data-seq'), 10) || 0;
                    cardObserver.unobserve(card);

                    (function (el, delay) {
                        setTimeout(function () {
                            el.classList.add('is-visible');
                        }, delay);
                    })(card, seq * STAGGER_DELAY);
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
