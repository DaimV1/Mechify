// Original route validators migrated from Damianvink toolkit.
function validate0(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { size?: string; klass?: string; fit?: string } => ({
    size: typeof s.size === "string" && /^\d{1,2}$/.test(s.size) ? s.size : undefined,
    klass: s.klass === "8.8" || s.klass === "10.9" || s.klass === "12.9" ? s.klass : undefined,
    fit: s.fit === "fijn" || s.fit === "middel" || s.fit === "grof" ? s.fit : undefined,
  }))(s);
}
function validate1(s: Record<string, unknown>) {
  const NUM_RE = /^\d{1,6}([.,]\d{1,2})?$/;
  return ((
    s: Record<string, unknown>,
  ): { load?: string; p?: string; s?: string; dir?: string; stroke?: string } => ({
    load: typeof s.load === "string" && NUM_RE.test(s.load) ? s.load : undefined,
    p: typeof s.p === "string" && NUM_RE.test(s.p) ? s.p : undefined,
    s: typeof s.s === "string" && NUM_RE.test(s.s) ? s.s : undefined,
    dir: s.dir === "uit" || s.dir === "in" ? s.dir : undefined,
    stroke: typeof s.stroke === "string" && NUM_RE.test(s.stroke) ? s.stroke : undefined,
  }))(s);
}
function validate2(s: Record<string, unknown>) {
  const NUM_RE = /^\d{1,6}([.,]\d{1,3})?$/;
  const SECTION_IDS = new Set(["rond", "buis", "rechthoek", "vierkant", "koker"]);
  const END_IDS = new Set(["ss", "cant"]);
  return ((
    s: Record<string, unknown>,
  ): {
    section?: string;
    D?: string;
    dIn?: string;
    b?: string;
    h?: string;
    a?: string;
    t?: string;
    L?: string;
    end?: string;
    material?: string;
    P?: string;
    posA?: string;
  } => {
    const num = (v: unknown) => (typeof v === "string" && NUM_RE.test(v) ? v : undefined);
    return {
      section: typeof s.section === "string" && SECTION_IDS.has(s.section) ? s.section : undefined,
      D: num(s.D),
      dIn: num(s.dIn),
      b: num(s.b),
      h: num(s.h),
      a: num(s.a),
      t: num(s.t),
      L: num(s.L),
      end: typeof s.end === "string" && END_IDS.has(s.end) ? s.end : undefined,
      material:
        typeof s.material === "string" && /^[a-z]{1,20}$/.test(s.material) ? s.material : undefined,
      P: num(s.P),
      posA: num(s.posA),
    };
  })(s);
}
function validate3(s: Record<string, unknown>) {
  const CATEGORY_IDS = new Set([
    "lengte",
    "oppervlakte",
    "volume",
    "massa",
    "kracht",
    "druk",
    "temperatuur",
    "snelheid",
    "koppel",
    "vermogen",
    "energie",
    "hoek",
  ]);
  const ID_RE = /^[a-zA-Z0-9_-]{1,12}$/;
  return ((
    s: Record<string, unknown>,
  ): { cat?: string; from?: string; to?: string; val?: string; side?: string } => ({
    cat: typeof s.cat === "string" && CATEGORY_IDS.has(s.cat) ? s.cat : undefined,
    from: typeof s.from === "string" && ID_RE.test(s.from) ? s.from : undefined,
    to: typeof s.to === "string" && ID_RE.test(s.to) ? s.to : undefined,
    val: typeof s.val === "string" && /^-?\d{0,9}([.,]\d{1,6})?$/.test(s.val) ? s.val : undefined,
    side: s.side === "from" || s.side === "to" ? s.side : undefined,
  }))(s);
}
function validate4(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { q?: string } => ({
    q: typeof s.q === "string" && s.q.trim() ? s.q : undefined,
  }))(s);
}
function validate5(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { len?: string; linear?: string; form?: string } => ({
    len: typeof s.len === "string" && /^\d{1,4}([.,]\d{1,2})?$/.test(s.len) ? s.len : undefined,
    linear:
      typeof s.linear === "string" && ["f", "m", "c", "v"].includes(s.linear)
        ? s.linear
        : undefined,
    form: typeof s.form === "string" && ["H", "K", "L"].includes(s.form) ? s.form : undefined,
  }))(s);
}
function validate6(s: Record<string, unknown>) {
  const MATERIAL_IDS = new Set(["staal", "alu", "rvs", "hoogsterkte"]);
  const KIND_IDS = new Set(["haaks", "scherp"]);
  return ((
    s: Record<string, unknown>,
  ): { t?: string; material?: string; kind?: string; k?: string } => ({
    t: typeof s.t === "string" && /^\d{1,2}(\.\d{1,2})?$/.test(s.t) ? s.t : undefined,
    material:
      typeof s.material === "string" && MATERIAL_IDS.has(s.material) ? s.material : undefined,
    kind: typeof s.kind === "string" && KIND_IDS.has(s.kind) ? s.kind : undefined,
    k: typeof s.k === "string" && /^\d{1,2}[.,]?\d{0,2}$/.test(s.k) ? s.k : undefined,
  }))(s);
}
function validate7(s: Record<string, unknown>) {
  const NUM_RE = /^\d{1,6}([.,]\d{1,3})?$/;
  const SECTION_IDS = new Set(["rond", "buis", "rechthoek", "vierkant", "koker"]);
  const END_IDS = new Set(["hh", "fc", "ff", "fp"]);
  return ((
    s: Record<string, unknown>,
  ): {
    section?: string;
    D?: string;
    dIn?: string;
    b?: string;
    h?: string;
    a?: string;
    t?: string;
    L?: string;
    end?: string;
    material?: string;
    F?: string;
  } => {
    const num = (v: unknown) => (typeof v === "string" && NUM_RE.test(v) ? v : undefined);
    return {
      section: typeof s.section === "string" && SECTION_IDS.has(s.section) ? s.section : undefined,
      D: num(s.D),
      dIn: num(s.dIn),
      b: num(s.b),
      h: num(s.h),
      a: num(s.a),
      t: num(s.t),
      L: num(s.L),
      end: typeof s.end === "string" && END_IDS.has(s.end) ? s.end : undefined,
      material:
        typeof s.material === "string" && /^[a-z]{1,20}$/.test(s.material) ? s.material : undefined,
      F: num(s.F),
    };
  })(s);
}
function validate8(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { d?: string; rot?: string; load?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
    rot: s.rot === "binnen" || s.rot === "buiten" || s.rot === "stil" ? s.rot : undefined,
    load: s.load === "licht" || s.load === "normaal" ? s.load : undefined,
  }))(s);
}
function validate9(s: Record<string, unknown>) {
  const NUM_RE = /^-?\d{0,6}([.,]\d{1,4})?$/;
  return ((
    s: Record<string, unknown>,
  ): {
    speed?: string;
    unit?: string;
    d?: string;
    mass?: string;
    duty?: string;
    mu?: string;
    alpha?: string;
    eta?: string;
    fb?: string;
    a?: string;
    rm?: string;
  } => {
    const num = (v: unknown) => (typeof v === "string" && NUM_RE.test(v) ? v : undefined);
    return {
      speed: num(s.speed),
      unit: s.unit === "m/min" || s.unit === "m/s" ? s.unit : undefined,
      d: num(s.d),
      mass: num(s.mass),
      duty:
        s.duty === "rollenbaan" || s.duty === "band" || s.duty === "helling" || s.duty === "hijsen"
          ? s.duty
          : undefined,
      mu: num(s.mu),
      alpha: num(s.alpha),
      eta: num(s.eta),
      fb: num(s.fb),
      a: num(s.a),
      rm: num(s.rm),
    };
  })(s);
}
function validate10(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { d2?: string; kind?: string } => ({
    d2: typeof s.d2 === "string" && /^\d{1,2}(\.\d{1,2})?$/.test(s.d2) ? s.d2 : undefined,
    kind: s.kind === "radial" || s.kind === "axial" || s.kind === "hydro" ? s.kind : undefined,
  }))(s);
}
function validate11(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { d?: string; fit?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
    fit: typeof s.fit === "string" && s.fit.trim() ? s.fit : undefined,
  }))(s);
}
function validate12(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { d?: string; kind?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
    kind: s.kind === "as" || s.kind === "boring" ? s.kind : undefined,
  }))(s);
}
function validate13(s: Record<string, unknown>) {
  return ((s: Record<string, unknown>): { d?: string } => ({
    d: typeof s.d === "string" && /^\d{1,4}$/.test(s.d) ? s.d : undefined,
  }))(s);
}
export const validators: Record<string, (s: Record<string, unknown>) => Record<string, unknown>> = {
  "/toolkit/bevestigers": validate0,
  "/toolkit/cilinder": validate1,
  "/toolkit/doorbuiging-balk": validate2,
  "/toolkit/eenheden": validate3,
  "/toolkit/index": validate4,
  "/toolkit/iso-2768": validate5,
  "/toolkit/kanten": validate6,
  "/toolkit/knikberekening": validate7,
  "/toolkit/lagerpassingen": validate8,
  "/toolkit/motorspecificatie": validate9,
  "/toolkit/o-ringgroef": validate10,
  "/toolkit/passingen": validate11,
  "/toolkit/seegerring-groef": validate12,
  "/toolkit/spiebaan-toleranties": validate13,
};
