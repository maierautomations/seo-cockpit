(function () {
  "use strict";

  function setYear() {
    var el = document.getElementById("y");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initSectionReveal() {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".section-reveal").forEach(function (el) {
      if (reduceMotion) {
        el.classList.add("is-visible");
        return;
      }
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      obs.observe(el);
    });
  }

  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      header.classList.add("border-ink-800/50");
      header.classList.remove("border-transparent");
      return;
    }
    function onScroll() {
      if (window.scrollY > 12) {
        header.classList.add(
          "border-ink-800/70",
          "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]"
        );
        header.classList.remove("border-transparent");
      } else {
        header.classList.remove(
          "border-ink-800/70",
          "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]"
        );
        header.classList.add("border-transparent");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var panel = document.getElementById("mobile-nav-panel");
    if (!toggle || !panel) return;

    var sheet = panel.querySelector(".mobile-nav-sheet");
    var backdrop = panel.querySelector(".mobile-nav-backdrop");
    var links = panel.querySelectorAll('a[href]');

    function openMenu() {
      panel.classList.add("is-open");
      document.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      panel.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (panel.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    if (backdrop) backdrop.addEventListener("click", closeMenu);

    links.forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  setYear();
  initMobileNav();
  initHeaderScroll();
  if (document.querySelector(".section-reveal")) initSectionReveal();
})();
