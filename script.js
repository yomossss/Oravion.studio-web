/**
 * Oravion.studio — Official Website
 * Vanilla JS: loader, parallax, scroll reveal, card tilt, nav, form
 */

(function () {
  "use strict";

  const LOADER_DURATION = 2000; // ms before fade-out
  const LOADER_FADE = 800;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const html = document.documentElement;
  const loader = $("#loader");
  const navbar = $("#navbar");
  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const heroParallax = $("#heroParallax");
  const contactForm = $("#contactForm");
  const formFeedback = $("#formFeedback");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─── 1. Loading screen ───────────────────────────────────────────────── */
  function initLoader() {
    html.classList.add("loading");

    const finish = () => {
      loader.classList.add("is-hidden");
      html.classList.remove("loading");
      document.body.classList.add("is-ready");
    };

    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      window.setTimeout(finish, LOADER_FADE);
    }, LOADER_DURATION);
  }

  /* ─── 2. Navbar: scroll state + mobile menu + active link ─────────────── */
  function initNavbar() {
    const links = $$(".nav-link");

    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Highlight active section
    const sections = $$("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((l) => {
            l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`);
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ─── 3. Mouse parallax (hero + background orbs) ──────────────────────── */
  function initParallax() {
    if (prefersReducedMotion) return;

    const orbs = $$(".orb");
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) / cx;
        targetY = (e.clientY - cy) / cy;
      },
      { passive: true }
    );

    function tick() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      if (heroParallax) {
        const px = currentX * 28;
        const py = currentY * 22;
        heroParallax.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      }

      orbs.forEach((orb) => {
        const strength = parseFloat(orb.dataset.parallax || "0.03");
        const ox = currentX * strength * 400;
        const oy = currentY * strength * 400;
        orb.style.transform = `translate(${ox}px, ${oy}px)`;
      });

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ─── 4. Scroll-triggered fade-in ─────────────────────────────────────── */
  function initScrollReveal() {
    const items = $$("[data-reveal]");

    if (prefersReducedMotion) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 0.08, 0.4)}s`;
      observer.observe(el);
    });
  }

  /* ─── 5. Project cards — subtle 3D tilt on hover ──────────────────────── */
  function initCardTilt() {
    if (prefersReducedMotion) return;

    $$("[data-tilt]").forEach((card) => {
      const max = 8;

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotX = -y * max;
        const rotY = x * max;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ─── 6. Animated border glow angle (CSS custom property) ─────────────── */
  function initGlowBorder() {
    if (prefersReducedMotion) return;

    let angle = 0;
    const card = $(".glass-card--glow");
    if (!card) return;

    function step() {
      angle = (angle + 0.5) % 360;
      card.style.setProperty("--glow-angle", `${angle}deg`);
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  /* ─── 7. SHIFT trailer — preview + modal player ───────────────────────── */
  function initTrailer() {
    const modal = $("#trailerModal");
    const player = $("#trailerPlayer");
    const preview = $(".project-card__preview");
    if (!modal || !player) return;

    const openBtns = $$("[data-trailer-open]");
    const closeBtns = $$("[data-trailer-close]");

    const openModal = () => {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      html.classList.add("modal-open");
      player.currentTime = 0;
      player.play().catch(() => {});
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      html.classList.remove("modal-open");
      player.pause();
    };

    openBtns.forEach((btn) => btn.addEventListener("click", openModal));
    closeBtns.forEach((btn) => btn.addEventListener("click", closeModal));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    // Muted loop preview when SHIFT card is visible
    if (preview && !prefersReducedMotion) {
      const media = preview.closest(".project-card__media");

      const previewObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preview.play().catch(() => {});
            } else {
              preview.pause();
            }
          });
        },
        { threshold: 0.35 }
      );

      previewObserver.observe(preview);

      if (media) {
        media.addEventListener("mouseenter", () => preview.play().catch(() => {}));
        media.addEventListener("mouseleave", () => preview.pause());
      }
    }
  }

  /* ─── 8. Contact form (client-side validation + feedback) ─────────────── */
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const message = $("#message").value.trim();

      formFeedback.classList.remove("is-error");

      if (!name || !email || !message) {
        formFeedback.textContent = "Please fill in all fields.";
        formFeedback.classList.add("is-error");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formFeedback.textContent = "Please enter a valid email address.";
        formFeedback.classList.add("is-error");
        return;
      }

      // Production: wire to Formspree, Netlify Forms, or your API
      formFeedback.textContent = "Thank you! We'll get back to you soon.";
      contactForm.reset();

      window.setTimeout(() => {
        formFeedback.textContent = "";
      }, 5000);
    });
  }

  /* ─── Boot ────────────────────────────────────────────────────────────── */
  function init() {
    initLoader();
    initNavbar();
    initParallax();
    initScrollReveal();
    initCardTilt();
    initGlowBorder();
    initTrailer();
    initContactForm();

    // Hero content visible after loader
    window.setTimeout(() => {
      const heroContent = $(".hero__content");
      if (heroContent) heroContent.classList.add("is-visible");
    }, LOADER_DURATION + 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
