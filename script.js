/* ===========================================================
   Nolan Ream — Portfolio
   Light interaction layer
   =========================================================== */

(function () {
    'use strict';

    // --- Auto-update footer year ----------------------------
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- Scroll-reveal for sections marked .reveal ----------
    const revealEls = document.querySelectorAll('.reveal');

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
        // Fallback: just show everything
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
                            ? 'rgba(245, 245, 247, 0.14)'
                            : 'rgba(245, 245, 247, 0.08)';
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }
})();
