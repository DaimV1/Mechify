// Runs the full pre-push check sequence: typecheck, lint, test, build, then
// Playwright e2e. Same coverage as running each npm script by hand, just
// without the redundant work that costs when they're run in that order:
//   - typecheck, lint and test are independent and read-only, so they run
//     concurrently instead of one after another.
//   - `build` already runs `tsc --noEmit`; since typecheck just did that,
//     this calls `build:app` (vite build + prerender only) instead.
//   - Playwright's webServer would otherwise rebuild dist/ from scratch
//     before testing it; SKIP_BUILD=1 tells playwright.config.ts to reuse
//     the dist/ this script just built.
import { spawn } from "node:child_process";

function run(name, args, { env } = {}) {
  const start = performance.now();
  return new Promise((resolve) => {
    const child = spawn("npm", ["run", "--silent", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...env },
    });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("error", (err) => {
      resolve({ name, code: 1, output: output + String(err), seconds: (performance.now() - start) / 1000 });
    });
    child.on("close", (code) => {
      resolve({ name, code, output, seconds: (performance.now() - start) / 1000 });
    });
  });
}

function runLive(name, args, { env } = {}) {
  const start = performance.now();
  return new Promise((resolve) => {
    const child = spawn("npm", ["run", "--silent", ...args], {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("error", (err) => {
      console.error(err);
      resolve({ name, code: 1, seconds: (performance.now() - start) / 1000 });
    });
    child.on("close", (code) => {
      resolve({ name, code, seconds: (performance.now() - start) / 1000 });
    });
  });
}

function report({ name, code, output, seconds }) {
  const status = code === 0 ? "ok" : "FAILED";
  console.log(`\n— ${name}: ${status} (${seconds.toFixed(1)}s)`);
  if (code !== 0 && output) console.log(output);
}

async function main() {
  console.log("Running typecheck, lint, test in parallel…");
  const [typecheck, lint, test] = await Promise.all([
    run("typecheck", ["typecheck"]),
    run("lint", ["lint"]),
    run("test", ["test"]),
  ]);
  for (const r of [typecheck, lint, test]) report(r);
  if ([typecheck, lint, test].some((r) => r.code !== 0)) {
    console.error("\nCheck sequence failed.");
    process.exit(1);
  }

  console.log("\nRunning build…");
  const build = await runLive("build", ["build:app"]);
  if (build.code !== 0) {
    console.error(`\n— build: FAILED (${build.seconds.toFixed(1)}s)`);
    console.error("\nCheck sequence failed.");
    process.exit(1);
  }
  console.log(`\n— build: ok (${build.seconds.toFixed(1)}s)`);

  console.log("\nRunning Playwright e2e…");
  const e2e = await runLive("test:e2e", ["test:e2e"], { env: { SKIP_BUILD: "1" } });
  if (e2e.code !== 0) {
    console.error(`\n— test:e2e: FAILED (${e2e.seconds.toFixed(1)}s)`);
    console.error("\nCheck sequence failed.");
    process.exit(1);
  }
  console.log(`\n— test:e2e: ok (${e2e.seconds.toFixed(1)}s)`);

  console.log("\nAll checks passed.");
}

main();
