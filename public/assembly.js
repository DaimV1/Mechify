// Original procedural mechanical schematic. No external model or image assets.
export function mountAssembly(canvas, options = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let progress = Math.max(0, Math.min(100, Number(options.initialProgress ?? 65))) / 100;
  let frame = 0,
    introFrame = 0,
    disposed = false,
    introStarted = false,
    userControlled = false;
  let visible = true,
    readyReported = false;
  let contentBounds = null;
  const project = (x, y, z) => {
    const scale = 0.9 - progress * 0.15;
    return [330 + (x - y) * 0.83 * scale, 326 + ((x + y) * 0.34 - z) * scale];
  };
  const geometryProject = (x, y, z) => {
    const point = project(x, y, z);
    if (contentBounds) {
      contentBounds.minX = Math.min(contentBounds.minX, point[0]);
      contentBounds.maxX = Math.max(contentBounds.maxX, point[0]);
      contentBounds.minY = Math.min(contentBounds.minY, point[1]);
      contentBounds.maxY = Math.max(contentBounds.maxY, point[1]);
    }
    return point;
  };
  function polygon(points, fill, stroke = "#687176") {
    ctx.beginPath();
    points.forEach((point, index) => {
      const p = geometryProject(...point);
      if (index) ctx.lineTo(...p);
      else ctx.moveTo(...p);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
  function block(x, y, z, w, d, h, colors = ["#747d81", "#343d43", "#aab2b5"]) {
    polygon(
      [
        [x, y, z],
        [x + w, y, z],
        [x + w, y, z + h],
        [x, y, z + h],
      ],
      colors[0],
    );
    polygon(
      [
        [x + w, y, z],
        [x + w, y + d, z],
        [x + w, y + d, z + h],
        [x + w, y, z + h],
      ],
      colors[1],
    );
    polygon(
      [
        [x, y, z + h],
        [x + w, y, z + h],
        [x + w, y + d, z + h],
        [x, y + d, z + h],
      ],
      colors[2],
    );
  }
  function disc(x, y, z, r, h, top = "#bbc4c6", side = "#566268", hole = 0) {
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2,
        b = ((i + 1) / steps) * Math.PI * 2;
      if (Math.sin(a) + Math.cos(a) > 0)
        polygon(
          [
            [x + Math.cos(a) * r, y + Math.sin(a) * r, z],
            [x + Math.cos(b) * r, y + Math.sin(b) * r, z],
            [x + Math.cos(b) * r, y + Math.sin(b) * r, z + h],
            [x + Math.cos(a) * r, y + Math.sin(a) * r, z + h],
          ],
          side,
          side,
        );
    }
    polygon(
      Array.from({ length: steps }, (_, i) => [
        x + Math.cos((i / steps) * Math.PI * 2) * r,
        y + Math.sin((i / steps) * Math.PI * 2) * r,
        z + h,
      ]),
      top,
    );
    if (hole)
      polygon(
        Array.from({ length: steps }, (_, i) => [
          x + Math.cos((i / steps) * Math.PI * 2) * hole,
          y + Math.sin((i / steps) * Math.PI * 2) * hole,
          z + h + 0.2,
        ]),
        "#151c20",
        "#849599",
      );
  }
  function draw() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2),
      width = Math.round(rect.width * dpr),
      height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(canvas.width / 660, 0, 0, canvas.height / 580, 0, 0);
    ctx.clearRect(0, 0, 660, 580);
    contentBounds = {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };
    const glow = ctx.createRadialGradient(335, 305, 0, 335, 305, 280);
    glow.addColorStop(0, "#18353a66");
    glow.addColorStop(1, "#0e141800");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 660, 580);
    ctx.strokeStyle = "#8cadb112";
    ctx.lineWidth = 0.7;
    for (let i = -350; i < 400; i += 40) {
      ctx.beginPath();
      ctx.moveTo(...project(i, -310, -48));
      ctx.lineTo(...project(i, 320, -48));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(...project(-310, i, -48));
      ctx.lineTo(...project(320, i, -48));
      ctx.stroke();
    }
    ctx.strokeStyle = "#55cabe55";
    ctx.setLineDash([4, 7]);
    ctx.beginPath();
    ctx.moveTo(...project(0, 0, -32));
    ctx.lineTo(...project(0, 0, 350));
    ctx.stroke();
    ctx.setLineDash([]);
    // 04 mounting plate.
    block(-126, -100, -20, 252, 200, 20, ["#606b70", "#333e45", "#9fa9ae"]);
    block(-119, -93, 0, 238, 186, 3, ["#566169", "#3a454b", "#aeb6b9"]);
    for (const x of [-105, 105])
      for (const y of [-80, 80]) {
        disc(x, y, 3, 9, 0, "#273238", "#444", 5);
        disc(x, y, 3.3, 4, 0, "#10191d", "#111");
      }
    // 01 drive input.
    block(-57, -57, 6 + progress * 5, 114, 114, 63, ["#37464f", "#1c2830", "#52606a"]);
    for (let j = 0; j < 7; j++)
      block(-62, -62, 9 + j * 8 + progress * 5, 124, 124, 3, ["#58656d", "#24343b", "#718087"]);
    disc(0, 0, 71 + progress * 6, 57, 12, "#89969d", "#3f4d56", 15);
    disc(0, 0, 83 + progress * 6, 14, 35, "#d3dddd", "#879499");
    // 02 coupling on the common conceptual torque axis.
    const z1 = 105 + progress * 58;
    disc(0, 0, z1, 57, 21, "#adc0c0", "#527475", 19);
    disc(0, 0, z1 + 21, 43, 4, "#47dcca", "#178d83", 19);
    for (let j = 0; j < 8; j++) {
      const a = (j * Math.PI) / 4;
      disc(Math.cos(a) * 47, Math.sin(a) * 47, z1 + 25, 3, 0, "#172e32", "#172e32");
    }
    // 03 generic support concept.
    const z2 = 139 + progress * 100;
    disc(0, 0, z2, 69, 17, "#a1aeb3", "#4a575f", 29);
    disc(0, 0, z2 + 17, 56, 3, "#d0d8d9", "#909a9e", 30);
    const z3 = 164 + progress * 142;
    block(-62, -62, z3, 124, 124, 13, ["#64737d", "#384750", "#b3bec1"]);
    disc(0, 0, z3 + 13, 42, 3, "#7f949a", "#71868a", 27);
    for (const x of [-46, 46])
      for (const y of [-46, 46]) {
        disc(x, y, z3 + 13, 6, 1, "#23343c", "#223", 3);
        disc(x, y, z3 + 26 + progress * 16, 3, 12, "#97a7ad", "#68797f");
        disc(x, y, z3 + 38 + progress * 16, 7, 5, "#c3cdcf", "#69797d", 3);
      }
    // Neutral torque marker on the shared axis; no load or capacity is implied.
    const torque = geometryProject(0, 0, z1 + 14);
    ctx.strokeStyle = "#48e5d0";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(torque[0], torque[1], 21, -2.5, 0.2);
    ctx.stroke();
    ctx.fillStyle = "#48e5d0";
    ctx.font = "11px monospace";
    ctx.fillText("T", torque[0] + 25, torque[1] - 8);
    contentBounds.maxX = Math.max(contentBounds.maxX, torque[0] + 36);
    contentBounds.minY = Math.min(contentBounds.minY, torque[1] - 30);
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
      .map((value) => value.toFixed(1))
      .join(",");
    canvas.dataset.ready = "true";
    if (!readyReported) {
      readyReported = true;
      options.onReady?.();
    }
  }
  const render = () => {
    if (disposed || !visible) return;
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
  const startIntro = () => {
    if (introStarted || userControlled || reduced?.matches) return;
    introStarted = true;
    const target = progress;
    let started;
    const tick = (time) => {
      if (disposed || userControlled) return;
      started ??= time;
      const n = Math.min((time - started) / 900, 1);
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
          }
        })
      : null;
  intersectionObserver?.observe(canvas);
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
    reduced?.removeEventListener?.("change", motionChange);
    delete canvas.dataset.ready;
    delete canvas.dataset.fit;
    delete canvas.dataset.contentBounds;
  };
  return { setProgress, dispose };
}
