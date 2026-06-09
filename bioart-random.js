(function () {
  "use strict";

  const field = document.querySelector(".hero-bioart");
  const icons = Array.from(document.querySelectorAll(".hero-bioart .bio-img"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!field || icons.length === 0 || reduceMotion.matches) return;

  let particles = [];
  let lastTime = performance.now();

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeParticle(el, index) {
    const bounds = field.getBoundingClientRect();
    const size = el.getBoundingClientRect().width || 56;
    const laneY = parseFloat(getComputedStyle(el).top) || bounds.height * 0.5;
    const speed = rand(5, 12) / 1000;

    return {
      el,
      size,
      x: rand(-size, Math.max(bounds.width, 1)),
      y: Math.min(Math.max(laneY + rand(-50, 50), -size), bounds.height + size),
      vx: rand(-speed, speed),
      vy: rand(-speed, speed),
      maxSpeed: speed,
      angle: rand(-12, 12),
      spin: rand(-0.004, 0.004),
      scalePhase: rand(0, Math.PI * 2),
      driftPhase: index * 1.7 + rand(0, Math.PI * 2),
    };
  }

  function reset() {
    particles = icons
      .filter(el => getComputedStyle(el).display !== "none")
      .map(makeParticle);
  }

  function steerFromEdges(p, width, height) {
    const margin = Math.max(p.size * 1.7, 90);
    let ax = 0;
    let ay = 0;

    if (p.x < margin) ax += (margin - p.x) * 0.00000075;
    if (p.x > width - margin) ax -= (p.x - (width - margin)) * 0.00000075;
    if (p.y < margin) ay += (margin - p.y) * 0.00000075;
    if (p.y > height - margin) ay -= (p.y - (height - margin)) * 0.00000075;

    return { ax, ay };
  }

  function animate(now) {
    const dt = Math.min(now - lastTime, 48);
    lastTime = now;

    const bounds = field.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;

    for (const p of particles) {
      p.driftPhase += dt * 0.00018;
      p.scalePhase += dt * 0.00016;

      const randomAx = Math.sin(p.driftPhase * 1.7) * 0.000009 + rand(-0.000005, 0.000005);
      const randomAy = Math.cos(p.driftPhase * 1.3) * 0.000009 + rand(-0.000005, 0.000005);
      const edge = steerFromEdges(p, width, height);

      p.vx += (randomAx + edge.ax) * dt;
      p.vy += (randomAy + edge.ay) * dt;

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > p.maxSpeed) {
        p.vx = (p.vx / speed) * p.maxSpeed;
        p.vy = (p.vy / speed) * p.maxSpeed;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.spin * dt + Math.sin(p.driftPhase) * 0.01;

      const scale = 0.94 + Math.sin(p.scalePhase) * 0.08;
      p.el.style.left = p.x + "px";
      p.el.style.top = p.y + "px";
      p.el.style.transform = "translate(-50%, -50%) scale(" + scale.toFixed(3) + ") rotate(" + p.angle.toFixed(2) + "deg)";
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener("load", function () {
    reset();
    requestAnimationFrame(function (now) {
      lastTime = now;
      animate(now);
    });
  });
  window.addEventListener("resize", reset);
})();
