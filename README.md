# Nolan Ream — Personal Portfolio

A bespoke, cinematic portfolio built around restraint, intentional typography, and lightweight creative front-end engineering. This platform features a custom minimalist design system paired with real-time math-driven visual elements.

## 🛠️ Technical Architecture

Unlike traditional portfolio templates, this site relies entirely on vanilla architecture and a custom execution engine written from scratch.

* **Procedural Vector Render Engine:** The background moon crescent and cloud layers are not images or static SVGs. They are procedurally computed and drawn line-by-line via mathematical constraints, generating a highly stylized, light-weight vertical scanline effect.
* **8px Grid Quantization Physics:** Cloud displacements and drifting animations are dynamically rounded and locked to an `8px` retro step multiplier. This mimics structural display grid alignments for an organic yet highly controlled movement profile.
* **Viewport-Center Focus Timeline:** As users navigate down the editorial grid, project cards calculate their exact geometric distance relative to the center of the screen. Cards smoothly scale up (`1.05x`) and reach full opacity only when positioned perfectly in the user's primary line of sight.
* **Performance & Accessibility First:** Built with 100% vanilla JavaScript and zero external asset dependencies. Scroll and resize tasks run via passive event listeners coupled with `requestAnimationFrame` ticks to guarantee low CPU/GPU overhead. Includes a comprehensive fallback structure respecting user `prefers-reduced-motion` settings.

## 🎨 Design System

* **Background:** Deep Pitch Black (`#000000`)
* **Accents:** Cyber Orchid Purple (`#7c3aed`)
* **Typography:** Archivo (Headers) & Space Grotesk (Body)
