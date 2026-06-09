/* hero-cells.js — scientifically accurate cartoon cell illustrations
   Cells: IgG antibody · neutrophil · macrophage · T-cell
   All drawn on canvas, animated with requestAnimationFrame */
(function () {
  "use strict";

  // ── Colour palette (matches lab brand) ──
  const C = {
    teal:   "#22B6AF",
    purple: "#3C124D",
    green:  "#61CE70",
    tealRgb:   "34,182,175",
    purpleRgb: "60,18,77",
    greenRgb:  "97,206,112",
  };

  // ── Mount canvas ──
  const hero = document.getElementById("hero");
  if (!hero) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;";
  hero.style.position = "relative";
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, cells = [], frame = 0;
  const MOBILE = window.matchMedia("(max-width:700px)").matches;

  // ── Seeded random (for stable per-cell attributes) ──
  function srand(seed) {
    let s = seed;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  // ── Organic blob helper ──
  // Draws a smooth irregular closed shape around (0,0)
  function blob(ctx, r, nPts, irrg, phase) {
    const pts = [];
    for (let i = 0; i < nPts; i++) {
      const a = (i / nPts) * Math.PI * 2 + phase;
      const rad = r * (1 + irrg * Math.sin(i * 2.7 + phase * 1.3));
      pts.push([Math.cos(a) * rad, Math.sin(a) * rad]);
    }
    pts.push(pts[0]);
    ctx.beginPath();
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
      if (i === 0) ctx.moveTo(mx, my);
      ctx.quadraticCurveTo(x0, y0, mx, my);
    }
    ctx.closePath();
  }

  // ─────────────────────────────────────────────────
  //  NEUTROPHIL  (multi-lobed nucleus + granules)
  // ─────────────────────────────────────────────────
  function drawNeutrophil(cell) {
    const { size: s, rng, phase } = cell;
    ctx.save();

    // Cell body
    ctx.globalAlpha = 0.11;
    ctx.fillStyle = C.teal;
    blob(ctx, s, 10, 0.18, phase * 0.4);
    ctx.fill();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 1.5;
    blob(ctx, s, 10, 0.18, phase * 0.4);
    ctx.stroke();

    // Multi-lobed nucleus — 3 lobes connected by thin filaments
    const lobes = [
      { x: -s * 0.18, y: -s * 0.06, rx: s * 0.22, ry: s * 0.18, a: -0.25 },
      { x:  s * 0.2,  y: -s * 0.1,  rx: s * 0.21, ry: s * 0.17, a:  0.3  },
      { x:  s * 0.02, y:  s * 0.22, rx: s * 0.2,  ry: s * 0.16, a:  0.1  },
    ];
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = C.purple;
    for (const l of lobes) {
      ctx.beginPath();
      ctx.ellipse(l.x, l.y, l.rx, l.ry, l.a, 0, Math.PI * 2);
      ctx.fill();
    }

    // Filament connectors between lobes
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = C.purple;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    const filaments = [[0], [1]]; // lobe pair indices
    const connections = [[0,1],[1,2]];
    for (const [a, b] of connections) {
      ctx.beginPath();
      ctx.moveTo(lobes[a].x, lobes[a].y);
      ctx.lineTo(lobes[b].x, lobes[b].y);
      ctx.stroke();
    }

    // Granules (pre-computed in cell.granules)
    ctx.lineCap = "butt";
    for (const g of cell.granules) {
      ctx.globalAlpha = g.opacity;
      ctx.fillStyle = g.primary ? "#7C3AED" : C.green;
      ctx.beginPath();
      ctx.ellipse(g.x * s, g.y * s, g.rx * s, g.ry * s, g.angle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────
  //  IgG ANTIBODY  (Y-shape with visible domains)
  // ─────────────────────────────────────────────────
  function drawAntibody(cell) {
    const { size: s } = cell;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Helper: draw one immunoglobulin domain (barrel-like oval)
    function domain(cx, cy, rx, ry, angle, fill, strokeA) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.globalAlpha = 0.13;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = strokeA;
      ctx.strokeStyle = fill;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }

    // Fc region — two heavy chains (CH2 + CH3 per chain, mirrored)
    // CH3 (bottom)
    domain(-s*0.13, s*0.42, s*0.13, s*0.19, 0,    C.teal, 0.42);
    domain( s*0.13, s*0.42, s*0.13, s*0.19, 0,    C.teal, 0.42);
    // CH2 (upper Fc)
    domain(-s*0.15, s*0.12, s*0.12, s*0.18, -0.15, C.teal, 0.42);
    domain( s*0.15, s*0.12, s*0.12, s*0.18,  0.15, C.teal, 0.42);

    // Hinge region (flexible linker)
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = C.purple;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-s*0.06, -s*0.07);
    ctx.bezierCurveTo(-s*0.1, 0, -s*0.14, s*0.06, -s*0.16, s*0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo( s*0.06, -s*0.07);
    ctx.bezierCurveTo( s*0.1, 0,  s*0.14, s*0.06,  s*0.16, s*0.1);
    ctx.stroke();

    // Left Fab — CH1 + VH (heavy chain), CL + VL (light chain, slightly outside)
    // CH1
    domain(-s*0.28, -s*0.14, s*0.12, s*0.17, -0.45, C.teal, 0.42);
    // VH (tip)
    domain(-s*0.44, -s*0.36, s*0.12, s*0.17, -0.6,  C.purple, 0.45);
    // Right Fab
    domain( s*0.28, -s*0.14, s*0.12, s*0.17,  0.45, C.teal, 0.42);
    domain( s*0.44, -s*0.36, s*0.12, s*0.17,  0.6,  C.purple, 0.45);

    // CDR loops — antigen-binding site (small crescent at tips)
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = C.purple;
    ctx.lineWidth = 2;
    ctx.fillStyle = "transparent";
    // Left CDR
    ctx.beginPath();
    ctx.arc(-s*0.52, -s*0.46, s*0.09, 0.3, Math.PI - 0.3);
    ctx.stroke();
    // Right CDR
    ctx.beginPath();
    ctx.arc( s*0.52, -s*0.46, s*0.09, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // Light-chain backbone lines (thin, connecting domains)
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 4]);
    // Left light chain
    ctx.beginPath();
    ctx.moveTo(-s*0.36, -s*0.06);
    ctx.lineTo(-s*0.52, -s*0.36);
    ctx.stroke();
    // Right light chain
    ctx.beginPath();
    ctx.moveTo( s*0.36, -s*0.06);
    ctx.lineTo( s*0.52, -s*0.36);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  // ─────────────────────────────────────────────────
  //  MACROPHAGE  (large, pseudopods, kidney nucleus, phagosomes)
  // ─────────────────────────────────────────────────
  function drawMacrophage(cell) {
    const { size: s, phase } = cell;
    ctx.save();

    // Large irregular body with pseudopodial extensions
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = C.green;
    blob(ctx, s, 14, 0.38, phase * 0.3);
    ctx.fill();
    ctx.globalAlpha = 0.26;
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 2;
    blob(ctx, s, 14, 0.38, phase * 0.3);
    ctx.stroke();

    // Filopodia (thin pseudopods extending further)
    for (const fp of cell.filopodia) {
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = C.green;
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fp.x0 * s, fp.y0 * s);
      ctx.bezierCurveTo(
        fp.cx1 * s, fp.cy1 * s,
        fp.cx2 * s, fp.cy2 * s,
        fp.x1  * s, fp.y1  * s
      );
      ctx.stroke();
    }

    // Kidney-shaped nucleus
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = C.purple;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.42, s * 0.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Indentation
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = C.green;
    ctx.beginPath();
    ctx.ellipse(s * 0.18, s * 0.04, s * 0.16, s * 0.2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Phagosomes / lysosomes (circular vesicles)
    for (const ph of cell.phagosomes) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = C.teal;
      ctx.beginPath();
      ctx.arc(ph.x * s, ph.y * s, ph.r * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.32;
      ctx.strokeStyle = C.teal;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────
  //  T-CELL  (round, TCR + CD4/CD8 surface proteins)
  // ─────────────────────────────────────────────────
  function drawTCell(cell) {
    const { size: s, phase } = cell;
    ctx.save();

    // Cell body
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = C.teal;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = C.teal;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Nucleus (round)
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = C.purple;
    ctx.beginPath();
    ctx.arc(s * 0.05, 0, s * 0.52, 0, Math.PI * 2);
    ctx.fill();

    // TCR complexes on surface — Y-shaped surface proteins
    ctx.lineCap = "round";
    for (const r of cell.receptors) {
      const ax = Math.cos(r.angle + phase * 0.04) * s;
      const ay = Math.sin(r.angle + phase * 0.04) * s;
      const outX = Math.cos(r.angle + phase * 0.04) * (s + r.len * s);
      const outY = Math.sin(r.angle + phase * 0.04) * (s + r.len * s);
      const perp = r.angle + Math.PI / 2 + phase * 0.04;
      const midR = s + r.len * s * 0.55;
      const mx = Math.cos(r.angle + phase * 0.04) * midR;
      const my = Math.sin(r.angle + phase * 0.04) * midR;
      const armL = r.arm * s;

      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = r.isCD ? C.purple : C.teal;
      ctx.lineWidth = 1.5;
      // Stalk
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(outX, outY);
      ctx.stroke();
      // Arms
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + Math.cos(perp) * armL, my + Math.sin(perp) * armL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx - Math.cos(perp) * armL, my - Math.sin(perp) * armL);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────
  //  Cell factory
  // ─────────────────────────────────────────────────
  function makeCell(type, i) {
    const r = srand(i * 137 + 42);

    const baseSizes = { neutrophil: 52, antibody: 38, macrophage: 72, tcell: 40 };
    const size = baseSizes[type] * (0.85 + r() * 0.3);

    const cell = {
      type, size,
      x: r() * W, y: r() * H,
      vx: (r() - 0.5) * (type === "antibody" ? 0.28 : 0.18),
      vy: (r() - 0.5) * (type === "antibody" ? 0.22 : 0.14),
      rot: r() * Math.PI * 2,
      vrot: (r() - 0.5) * (type === "antibody" ? 0.006 : 0.003),
      phase: r() * Math.PI * 2,
      opacity: 0.65 + r() * 0.35,
      rng: r,
    };

    if (type === "neutrophil") {
      cell.granules = Array.from({ length: 14 }, (_, k) => ({
        x: (r() - 0.5) * 1.5,
        y: (r() - 0.5) * 1.5,
        rx: 0.05 + r() * 0.04,
        ry: 0.04 + r() * 0.03,
        angle: r() * Math.PI,
        primary: k % 3 === 0,
        opacity: 0.22 + r() * 0.16,
      })).filter(g => Math.hypot(g.x, g.y) < 0.78); // stay inside cell
    }

    if (type === "macrophage") {
      cell.phagosomes = Array.from({ length: 4 }, () => {
        const a = r() * Math.PI * 2, d = 0.5 + r() * 0.4;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0.09 + r() * 0.06 };
      });
      cell.filopodia = Array.from({ length: 3 }, () => {
        const a = r() * Math.PI * 2, d = 0.85;
        return {
          x0: Math.cos(a) * d, y0: Math.sin(a) * d,
          x1: Math.cos(a) * (d + 0.45 + r() * 0.3), y1: Math.sin(a) * (d + 0.45 + r() * 0.3),
          cx1: Math.cos(a + 0.4) * (d + 0.2), cy1: Math.sin(a + 0.4) * (d + 0.2),
          cx2: Math.cos(a - 0.2) * (d + 0.35), cy2: Math.sin(a - 0.2) * (d + 0.35),
        };
      });
    }

    if (type === "tcell") {
      const nRecept = 7;
      cell.receptors = Array.from({ length: nRecept }, (_, k) => ({
        angle: (k / nRecept) * Math.PI * 2 + r() * 0.4,
        len: 0.18 + r() * 0.1,
        arm: 0.15 + r() * 0.06,
        isCD: k % 3 === 0,
      }));
    }

    return cell;
  }

  // ─────────────────────────────────────────────────
  //  Init / resize
  // ─────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function initCells() {
    const types = MOBILE
      ? ["neutrophil","tcell","antibody","antibody","macrophage"]
      : ["neutrophil","neutrophil","tcell","tcell","tcell","antibody","antibody","antibody","antibody","macrophage","macrophage"];
    cells = types.map((t, i) => makeCell(t, i));
  }

  // ─────────────────────────────────────────────────
  //  Animate
  // ─────────────────────────────────────────────────
  function update() {
    frame++;
    for (const c of cells) {
      c.x   += c.vx;
      c.y   += c.vy;
      c.rot += c.vrot;
      c.phase += 0.007;
      const margin = c.size * 2;
      if (c.x >  W + margin) c.x = -margin;
      if (c.x < -margin)      c.x =  W + margin;
      if (c.y >  H + margin)  c.y = -margin;
      if (c.y < -margin)      c.y =  H + margin;
    }
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    for (const c of cells) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      switch (c.type) {
        case "neutrophil": drawNeutrophil(c); break;
        case "antibody":   drawAntibody(c);   break;
        case "macrophage": drawMacrophage(c); break;
        case "tcell":      drawTCell(c);      break;
      }
      ctx.restore();
    }
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  window.addEventListener("load", function () {
    resize();
    initCells();
    window.addEventListener("resize", function () { resize(); initCells(); });
    loop();
  });
})();
