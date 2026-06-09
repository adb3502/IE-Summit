/* Immunoengineering Summit — nav, program tabs, scroll reveal */
(function () {
  "use strict";

  // ---- Header scrolled state ----
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ----
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  // ---- Program day tabs ----
  var tabs = document.querySelectorAll(".day-tab");
  var panels = document.querySelectorAll(".day-panel");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var day = tab.getAttribute("data-day");
      tabs.forEach(function (t) { t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
      panels.forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-day") === day);
      });
    });
  });

  // ---- Scroll reveal ----
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el, i) {
      // tiny stagger for siblings
      el.style.transitionDelay = Math.min((i % 6) * 40, 200) + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---- Active nav link on scroll ----
  var sections = ["about", "speakers", "program", "posters", "venue", "contact"];
  var navLinks = {};
  document.querySelectorAll(".nav-links a[href^='#']").forEach(function (a) {
    navLinks[a.getAttribute("href").slice(1)] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.id;
        if (e.isIntersecting && navLinks[id]) {
          Object.keys(navLinks).forEach(function (k) {
            navLinks[k].style.color = k === id ? "var(--ink)" : "";
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }
})();
