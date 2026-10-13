// Original procedural planetary-gear schematic. No external model or image assets.
export function mountAssembly(canvas, options = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let progress = Math.max(0, Math.min(100, Number(options.initialProgress ?? 65))) / 100;
  let highlight = "all";
  let frame = 0,
    introFrame = 0,
    disposed = false,
    introStarted = false,
    userControlled = false;
  let visible = true,
    pageVisible = !document.hidden,
    readyReported = false,
    contentBounds = null;
  const palette = {
    housing: ["#56636a", "#2b373d"],
    ring: ["#8b9a9f", "#46545b"],
    sun: ["#48e5d0", "#188f84"],
    planets: ["#b9c5c7", "#59686e"],
    carrier: ["#708087", "#35434a"],
    bearings: ["#9cadaf", "#435159"],
  };
  const alphaFor = (part) => (highlight === "all" || highlight === part ? 1 : 0.2);
  const project = (x, y, z) => {
    const scale = 0.88 - progress * 0.12;
    return [330 + (x - y) * 0.82 * scale, 360 + ((x + y) * 0.34 - z) * scale];
  };
  const point = (x, y, z, track = true) => {
    const p = project(x, y, z);
    if (track && contentBounds) {
      contentBounds.minX = Math.min(contentBounds.minX, p[0]);
      contentBounds.maxX = Math.max(contentBounds.maxX, p[0]);
      contentBounds.minY = Math.min(contentBounds.minY, p[1]);
      contentBounds.maxY = Math.max(contentBounds.maxY, p[1]);
    }
    return p;
  };
  const path = (points, close = true) => {
    ctx.beginPath();
    points.forEach((p, i) => {
      const q = point(...p);
      if (i) ctx.lineTo(...q);
      else ctx.moveTo(...q);
    });
    if (close) ctx.closePath();
  };
  const polygon = (points, fill, stroke = "#708087") => {
    path(points);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };
  const circlePoints = (x, y, z, r, steps = 56, phase = 0) =>
    Array.from({ length: steps }, (_, i) => {
      const a = phase + (i / steps) * Math.PI * 2;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r, z];
    });
  const toothPoints = (x, y, z, teeth, root, tip, phase = 0) =>
    Array.from({ length: teeth * 4 }, (_, i) => {
      const a = phase + (i / (teeth * 4)) * Math.PI * 2;
      const r = i % 4 === 1 || i % 4 === 2 ? tip : root;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r, z];
    });
  function wall(points, z0, z1, fill) {
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      if (a[0] + a[1] > b[0] + b[1])
        polygon(
          [
            [a[0], a[1], z0],
            [b[0], b[1], z0],
            [b[0], b[1], z1],
            [a[0], a[1], z1],
          ],
          fill,
          fill,
        );
    }
  }
  function disc(x, y, z, r, h, colors, hole = 0, part = "housing") {
    const previousAlpha = ctx.globalAlpha;
    ctx.globalAlpha = alphaFor(part);
    const pts = circlePoints(x, y, z, r);
    wall(pts, z, z + h, colors[1]);
    polygon(circlePoints(x, y, z + h, r), colors[0]);
    if (hole) polygon(circlePoints(x, y, z + h + 0.2, hole), "#111a1e", "#7f9094");
    ctx.globalAlpha = previousAlpha;
  }
  function gear(x, y, z, teeth, root, tip, h, colors, phase, part) {
    ctx.globalAlpha = alphaFor(part);
    const pts = toothPoints(x, y, z, teeth, root, tip, phase);
    wall(pts, z, z + h, colors[1]);
    polygon(toothPoints(x, y, z + h, teeth, root, tip, phase), colors[0], "#b7c5c777");
    disc(x, y, z + h + 0.2, root * 0.28, 0, ["#162126", "#162126"], 0, part);
    ctx.globalAlpha = 1;
  }
  function ringGear(z, part = "ring") {
    ctx.globalAlpha = alphaFor(part);
    const outer = circlePoints(0, 0, z, 116);
    wall(outer, z, z + 16, palette.ring[1]);
    ctx.beginPath();
    outer
      .map((p) => point(p[0], p[1], z + 16))
      .forEach((p, i) => {
        if (i) ctx.lineTo(...p);
        else ctx.moveTo(...p);
      });
    ctx.closePath();
    const inner = toothPoints(0, 0, z + 16.2, 48, 79, 86, Math.PI / 48).reverse();
    inner
      .map((p) => point(...p))
      .forEach((p, i) => {
        if (i) ctx.lineTo(...p);
        else ctx.moveTo(...p);
      });
    ctx.closePath();
    ctx.fillStyle = palette.ring[0];
    ctx.fill("evenodd");
    ctx.strokeStyle = "#b7c5c7";
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function carrier(z, part = "carrier") {
    ctx.globalAlpha = alphaFor(part);
    const centers = [0, 1, 2].map((i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
      return [Math.cos(a) * 53, Math.sin(a) * 53];
    });
    for (const [x, y] of centers) {
      const a = Math.atan2(y, x),
        perp = [-Math.sin(a) * 15, Math.cos(a) * 15];
      polygon(
        [
          [perp[0], perp[1], z],
          [x + perp[0], y + perp[1], z],
          [x - perp[0], y - perp[1], z],
          [-perp[0], -perp[1], z],
        ],
        palette.carrier[0],
      );
      disc(x, y, z, 13, 7, palette.carrier, 4, part);
    }
    disc(0, 0, z, 27, 9, palette.carrier, 11, part);
    ctx.globalAlpha = 1;
  }
  function arrow(z, label, color) {
    const c = point(0, 0, z);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c[0], c[1], 27, -2.5, 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(c[0] + 25, c[1] + 9);
    ctx.lineTo(c[0] + 18, c[1] + 2);
    ctx.lineTo(c[0] + 29, c[1]);
    ctx.fill();
    ctx.font = "bold 11px monospace";
    ctx.fillText(label, c[0] + 34, c[1] - 7);
    contentBounds.maxX = Math.max(contentBounds.maxX, c[0] + 62);
  }
  function draw() {
    if (disposed || !visible || !pageVisible) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2),
      w = Math.round(rect.width * dpr),
      h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(canvas.width / 660, 0, 0, canvas.height / 580, 0, 0);
    ctx.clearRect(0, 0, 660, 580);
    contentBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const glow = ctx.createRadialGradient(330, 300, 0, 330, 300, 290);
    glow.addColorStop(0, "#183b3d88");
    glow.addColorStop(1, "#0e141800");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 660, 580);
    ctx.strokeStyle = "#8cadb112";
    ctx.lineWidth = 0.7;
    for (let i = -320; i <= 320; i += 40) {
      ctx.beginPath();
      ctx.moveTo(...point(i, -280, -35, false));
      ctx.lineTo(...point(i, 280, -35, false));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(...point(-280, i, -35, false));
      ctx.lineTo(...point(280, i, -35, false));
      ctx.stroke();
    }
    const e = progress;
    disc(0, 0, -25, 134, 22, palette.housing, 48, "housing");
    disc(0, 0, 2 + e * 18, 58, 10, palette.bearings, 36, "bearings");
    ringGear(24 + e * 50);
    const gearZ = 30 + e * 92;
    gear(0, 0, gearZ, 18, 25, 31, 17, palette.sun, 0, "sun");
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
      gear(
        Math.cos(a) * 53,
        Math.sin(a) * 53,
        gearZ,
        15,
        20,
        25,
        17,
        palette.planets,
        -a,
        "planets",
      );
    }
    disc(0, 0, -2 + e * 74, 11, gearZ + 7 - (-2 + e * 74), ["#68d8cc", "#277d76"], 0, "sun");
    carrier(55 + e * 140);
    disc(0, 0, 64 + e * 140, 15, 34, palette.carrier, 0, "carrier");
    disc(0, 0, 96 + e * 176, 59, 11, palette.bearings, 37, "bearings");
    disc(0, 0, 115 + e * 215, 132, 18, palette.housing, 51, "housing");
    arrow(gearZ + 19, "IN", palette.sun[0]);
    arrow(77 + e * 140, "OUT", "#b9c5c7");
    canvas.dataset.fit = String(
      contentBounds.minX >= 0 &&
        contentBounds.maxX <= 660 &&
        contentBounds.minY >= 0 &&
        contentBounds.maxY <= 580,
    );
    canvas.dataset.contentBounds = [
      contentBounds.minX,
      contentBounds.minY,
      contentBounds.maxX,
      contentBounds.maxY,
    ]
      .map((v) => v.toFixed(1))
      .join(",");
    canvas.dataset.ready = "true";
    if (!readyReported) {
      readyReported = true;
      options.onReady?.();
    }
  }
  const render = () => {
    if (disposed || !visible || !pageVisible) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  };
  const cancelIntro = () => {
    userControlled = true;
    cancelAnimationFrame(introFrame);
  };
  const setProgress = (value, userInitiated = false) => {
    if (userInitiated) cancelIntro();
    progress = Math.max(0, Math.min(100, Number(value))) / 100;
    options.onProgress?.(progress * 100);
    render();
  };
  const setHighlight = (value) => {
    cancelIntro();
    highlight = value || "all";
    render();
  };
  const startIntro = () => {
    if (introStarted || userControlled || reduced?.matches) return;
    introStarted = true;
    const target = progress;
    let started;
    const tick = (time) => {
      if (disposed || userControlled || !visible || !pageVisible) return;
      started ??= time;
      const n = Math.min((time - started) / 950, 1);
      progress = target * (1 - Math.pow(1 - n, 3));
      options.onProgress?.(progress * 100);
      draw();
      if (n < 1) introFrame = requestAnimationFrame(tick);
    };
    introFrame = requestAnimationFrame(tick);
  };
  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(render) : null;
  resizeObserver?.observe(canvas);
  const resizeFallback = () => render();
  if (!resizeObserver) window.addEventListener("resize", resizeFallback, { passive: true });
  const intersectionObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          visible = Boolean(entries[0]?.isIntersecting);
          if (visible) {
            draw();
            startIntro();
          } else cancelAnimationFrame(introFrame);
        })
      : null;
  intersectionObserver?.observe(canvas);
  const visibilityChange = () => {
    pageVisible = !document.hidden;
    if (pageVisible) {
      draw();
      startIntro();
    } else cancelAnimationFrame(introFrame);
  };
  document.addEventListener("visibilitychange", visibilityChange);
  draw();
  if (!intersectionObserver) startIntro();
  const motionChange = () => {
    if (reduced?.matches) cancelAnimationFrame(introFrame);
  };
  reduced?.addEventListener?.("change", motionChange);
  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(introFrame);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (!resizeObserver) window.removeEventListener("resize", resizeFallback);
    document.removeEventListener("visibilitychange", visibilityChange);
    reduced?.removeEventListener?.("change", motionChange);
    delete canvas.dataset.ready;
    delete canvas.dataset.fit;
    delete canvas.dataset.contentBounds;
  };
  return { setProgress, setHighlight, dispose };
}
