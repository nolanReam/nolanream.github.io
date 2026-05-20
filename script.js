/* ============================================================
   Nolan Ream — Portfolio
   Light interaction layer
   ============================================================ */

(function () {
    'use strict';

    // --- Auto-update footer year ----------------------------
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- Cinematic scroll reveal ---------------------------
    const revealEls = document.querySelectorAll('.reveal, .reveal-card');

    if ('IntersectionObserver' in window && revealEls.length > 0) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
        );

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // --- Subtle navbar elevation on scroll ------------------
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    navbar.style.borderBottomColor =
                        window.scrollY > 8
                            ? 'rgba(245, 245, 247, 0.16)'
                            : 'rgba(245, 245, 247, 0.08)';
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // --- Subtle scroll-driven cloud parallax ----------------
    // Layers the CSS keyframe drift with a small Y offset based
    // on scroll position, so the night sky breathes as you move.
    const clouds = document.querySelectorAll('.cloud');
    if (clouds.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        let ticking = false;
        const speeds = [0.05, 0.08, 0.03];
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const y = window.scrollY;
                    clouds.forEach((cloud, i) => {
                        const offset = -(y * (speeds[i] || 0.05));
                        cloud.style.setProperty('--scroll-y', `${offset}px`);
                        cloud.style.translate = `0 ${offset}px`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }
})();
